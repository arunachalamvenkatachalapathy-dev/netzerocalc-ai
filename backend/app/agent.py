"""
agent.py

Replaces the single-shot /ai/chat behaviour with a real multi-hop,
tool-calling agent. The model NEVER computes a carbon number itself --
every number in its answer comes from a tool return value. This is the
whole point: bom_service.py / cbam_tools.py stay authoritative, Gemini only
orchestrates, explains, and recommends.

Requires: google-cloud-aiplatform. Verify the exact import paths below
against your installed SDK version before relying on them -- Vertex AI's
GenAI SDK surface has moved more than once; treat this as the shape of the
integration, confirm the imports match what `pip show google-cloud-aiplatform`
actually gives you.
"""

import json
import os

import vertexai
from vertexai.generative_models import (
    FunctionDeclaration,
    GenerativeModel,
    Part,
    Tool,
)
from sqlalchemy.orm import Session

from .bom_service import list_project_audits, perform_bom_match, perform_override
from .cbam_tools import compare_to_cbam_benchmark
from .schemas import BomLineMatch, OverrideRequest

_initialized = False
_project_id = None
_location = None


def _ensure_init():
    """
    Reads GCP_PROJECT_ID lazily, only when the agent is actually invoked --
    not at module import time. Previously this crashed the ENTIRE app
    (every route, not just /agent/chat) if the env var wasn't set, because
    it ran the instant main.py imported this file.
    """
    global _initialized, _project_id, _location
    if not _initialized:
        _project_id = os.environ["GCP_PROJECT_ID"]
        _location = os.environ.get("GCP_LOCATION", "asia-south1")
        vertexai.init(project=_project_id, location=_location)
        _initialized = True


SYSTEM_INSTRUCTION = """
You are the NetZeroCalc AI copilot, embedded in a BOM-to-LCI carbon
footprint and CBAM compliance tool.

HARD RULE: you must never state a tCO2e figure, an emission factor, or a
CBAM benchmark value unless it came from a tool result in this
conversation. If you don't have a tool result for a number, call the
appropriate tool -- do not estimate, round, or recall one from training
data. If no tool can answer the question, say so plainly.

Your job is to orchestrate the available tools to answer questions about a
project's carbon footprint, flag CBAM exposure using real benchmark data,
and explain audit risk -- always citing which BOM line / audit row a
number came from. Every answer involving a number must be traceable to a
specific tool call you made in this turn.

This is decision-support only. Always make clear that a human practitioner
must review and sign off before any figure is used in a regulated
CBAM declaration or Scope 1-3 filing.
"""

# --- Tool declarations -------------------------------------------------

_match_bom_line_decl = FunctionDeclaration(
    name="match_bom_line",
    description=(
        "Runs a single BOM line through the real semantic matching and DQR "
        "engine and persists the result. Returns the matched process, the "
        "computed tCO2e figure, the DQR risk level, and up to 5 alternative "
        "candidates. Use this when the user gives you a new material/"
        "quantity to assess."
    ),
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "string"},
            "raw_bom_input": {"type": "string", "description": "Material/line description, e.g. 'Primary aluminium ingot'"},
            "quantity": {"type": "number"},
            "unit": {"type": "string"},
            "required_unit": {"type": "string"},
            "database_source": {"type": "string"},
            "system_model": {"type": "string"},
            "target_geography": {"type": "string"},
            "target_year": {"type": "integer"},
        },
        "required": ["project_id", "raw_bom_input", "quantity", "unit", "required_unit",
                     "database_source", "system_model", "target_geography", "target_year"],
    },
)

_list_audits_decl = FunctionDeclaration(
    name="list_project_audits",
    description=(
        "Lists all real BOM mapping audit rows for a project, sorted "
        "HIGH-risk first. Use this to find hotspots or answer 'what's in "
        "this project' -- never invent line items."
    ),
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "string"},
            "audit_risk_level": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
        },
        "required": ["project_id"],
    },
)

_cbam_compare_decl = FunctionDeclaration(
    name="compare_to_cbam_benchmark",
    description=(
        "Compares an ALREADY-COMPUTED emission factor (from match_bom_line "
        "or an existing audit row) against real EU CBAM benchmark values "
        "for Aluminium, Iron & Steel, Cement, Fertilisers, or Hydrogen. "
        "Does not compute a new footprint -- only compares one you already "
        "have."
    ),
    parameters={
        "type": "object",
        "properties": {
            "sector": {"type": "string", "enum": ["Aluminium", "Iron & Steel", "Cement", "Fertilisers", "Hydrogen"]},
            "computed_emission_factor_kg_co2e_per_unit": {"type": "number"},
            "quantity_tonnes": {"type": "number"},
            "product_hint": {"type": "string"},
        },
        "required": ["sector", "computed_emission_factor_kg_co2e_per_unit", "quantity_tonnes"],
    },
)

_override_decl = FunctionDeclaration(
    name="override_match",
    description=(
        "Switches an existing audit row to a different candidate process "
        "the user has chosen, and recomputes its tCO2e. Only call this when "
        "the user explicitly picks an alternative -- never on your own "
        "initiative."
    ),
    parameters={
        "type": "object",
        "properties": {
            "audit_id": {"type": "string"},
            "process_id": {"type": "string"},
            "user_id": {"type": "string"},
            "notes": {"type": "string", "description": "Required: reason for the override"},
        },
        "required": ["audit_id", "process_id", "user_id", "notes"],
    },
)

TOOLS = Tool(function_declarations=[
    _match_bom_line_decl, _list_audits_decl, _cbam_compare_decl, _override_decl,
])


def get_agent_model() -> GenerativeModel:
    _ensure_init()
    return GenerativeModel(
        model_name="gemini-2.5-pro",
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[TOOLS],
    )


def _execute_tool(name: str, args: dict, db: Session) -> dict:
    """Dispatches a model-requested tool call to the real backend logic."""
    try:
        if name == "match_bom_line":
            payload = BomLineMatch(**args)
            audit = perform_bom_match(payload, db)
            return {
                "audit_id": audit.id,
                "matched_process_name": audit.matched_process_name,
                "result_tco2e": audit.result_tco2e,
                "matched_emission_factor": audit.matched_emission_factor,
                "audit_risk_level": audit.audit_risk_level,
                "audit_reasoning": audit.audit_reasoning,
                "candidate_options": audit.candidate_options,
            }
        elif name == "list_project_audits":
            rows = list_project_audits(args["project_id"], db, args.get("audit_risk_level"))
            return {"audits": [
                {"id": r.id, "raw_bom_input": r.raw_bom_input, "matched_process_name": r.matched_process_name,
                 "result_tco2e": r.result_tco2e, "audit_risk_level": r.audit_risk_level}
                for r in rows
            ]}
        elif name == "compare_to_cbam_benchmark":
            return compare_to_cbam_benchmark(**args)
        elif name == "override_match":
            payload = OverrideRequest(process_id=args["process_id"], user_id=args["user_id"], notes=args["notes"])
            audit = perform_override(args["audit_id"], payload, db)
            return {"audit_id": audit.id, "matched_process_name": audit.matched_process_name,
                    "result_tco2e": audit.result_tco2e}
        else:
            return {"error": f"Unknown tool: {name}"}
    except ValueError as exc:
        return {"error": str(exc)}


def run_agent_turn(model: GenerativeModel, chat_history: list, user_message: str, db: Session, max_hops: int = 6) -> dict:
    """
    Runs one user turn through the agent, executing tool calls in a loop
    (multi-hop) until the model returns a final text answer or max_hops is
    hit. Returns {"answer": str, "tool_calls": [...]} -- tool_calls is
    surfaced to the frontend so the "Sources" panel can show exactly which
    real backend calls produced the numbers in the answer.
    """
    chat = model.start_chat(history=chat_history)
    response = chat.send_message(user_message)
    tool_trace = []

    for _ in range(max_hops):
        candidate = response.candidates[0]
        function_calls = [p.function_call for p in candidate.content.parts if p.function_call]
        if not function_calls:
            break
        parts = []
        for fc in function_calls:
            args = dict(fc.args)
            result = _execute_tool(fc.name, args, db)
            tool_trace.append({"tool": fc.name, "args": args, "result": result})
            parts.append(Part.from_function_response(name=fc.name, response={"content": json.dumps(result)}))
        response = chat.send_message(parts)

    final_text = "".join(p.text for p in response.candidates[0].content.parts if p.text)
    return {"answer": final_text, "tool_calls": tool_trace, "history": chat.history}
