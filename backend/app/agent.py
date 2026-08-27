"""
agent.py

Replaces the single-shot /ai/chat behaviour with a real multi-hop,
tool-calling agent. The model NEVER computes a carbon number itself --
every number in its answer comes from a tool return value. This is the
whole point: bom_service.py / cbam_tools.py stay authoritative, Gemini only
orchestrates, explains, and recommends.

Requires: google-genai. This file has been migrated to use the Free Gemini API
instead of Vertex AI to eliminate GCP billing costs for the LLM.
"""

import json
import os
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from .bom_service import list_project_audits, perform_bom_match, perform_override
from .cbam_tools import compare_to_cbam_benchmark
from .schemas import BomLineMatch, OverrideRequest

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

_match_bom_line_decl = types.FunctionDeclaration(
    name="match_bom_line",
    description=(
        "Runs a single BOM line through the real semantic matching and DQR "
        "engine and persists the result. Returns the matched process, the "
        "computed tCO2e figure, the DQR risk level, and up to 5 alternative "
        "candidates. Use this when the user gives you a new material/"
        "quantity to assess."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "project_id": types.Schema(type="STRING"),
            "raw_bom_input": types.Schema(type="STRING", description="Material/line description, e.g. 'Primary aluminium ingot'"),
            "quantity": types.Schema(type="NUMBER"),
            "unit": types.Schema(type="STRING"),
            "required_unit": types.Schema(type="STRING"),
            "database_source": types.Schema(type="STRING"),
            "system_model": types.Schema(type="STRING"),
            "target_geography": types.Schema(type="STRING"),
            "target_year": types.Schema(type="INTEGER"),
        },
        required=["project_id", "raw_bom_input", "quantity", "unit", "required_unit",
                     "database_source", "system_model", "target_geography", "target_year"]
    )
)

_list_audits_decl = types.FunctionDeclaration(
    name="list_project_audits",
    description=(
        "Lists all real BOM mapping audit rows for a project, sorted "
        "HIGH-risk first. Use this to find hotspots or answer 'what's in "
        "this project' -- never invent line items."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "project_id": types.Schema(type="STRING"),
            "audit_risk_level": types.Schema(type="STRING", enum=["HIGH", "MEDIUM", "LOW"]),
        },
        required=["project_id"]
    )
)

_cbam_compare_decl = types.FunctionDeclaration(
    name="compare_to_cbam_benchmark",
    description=(
        "Compares an ALREADY-COMPUTED emission factor (from match_bom_line "
        "or an existing audit row) against real EU CBAM benchmark values "
        "for Aluminium, Iron & Steel, Cement, Fertilisers, or Hydrogen. "
        "Does not compute a new footprint -- only compares one you already "
        "have."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "sector": types.Schema(type="STRING", enum=["Aluminium", "Iron & Steel", "Cement", "Fertilisers", "Hydrogen"]),
            "computed_emission_factor_kg_co2e_per_unit": types.Schema(type="NUMBER"),
            "quantity_tonnes": types.Schema(type="NUMBER"),
            "product_hint": types.Schema(type="STRING"),
        },
        required=["sector", "computed_emission_factor_kg_co2e_per_unit", "quantity_tonnes"]
    )
)

_override_decl = types.FunctionDeclaration(
    name="override_match",
    description=(
        "Switches an existing audit row to a different candidate process "
        "the user has chosen, and recomputes its tCO2e. Only call this when "
        "the user explicitly picks an alternative -- never on your own "
        "initiative."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "audit_id": types.Schema(type="STRING"),
            "process_id": types.Schema(type="STRING"),
            "user_id": types.Schema(type="STRING"),
            "notes": types.Schema(type="STRING", description="Required: reason for the override"),
        },
        required=["audit_id", "process_id", "user_id", "notes"]
    )
)

TOOLS = types.Tool(function_declarations=[
    _match_bom_line_decl, _list_audits_decl, _cbam_compare_decl, _override_decl,
])


def get_agent_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return genai.Client()
    return genai.Client(api_key=api_key)


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
    except Exception as exc:
        return {"error": str(exc)}


def run_agent_turn(client: genai.Client, chat_history: list, user_message: str, db: Session, max_hops: int = 6) -> dict:
    """
    Runs one user turn through the agent, executing tool calls in a loop
    until the model returns a final text answer or max_hops is hit.
    Returns {"answer": str, "tool_calls": [...]}
    """
    
    formatted_history = []
    for msg in chat_history:
        role = msg.get("role", "user")
        parts = [types.Part.from_text(text=p.get("text", "")) for p in msg.get("parts", [])]
        formatted_history.append(types.Content(role=role, parts=parts))

    chat = client.chats.create(
        model="gemini-3.6-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=[TOOLS],
            temperature=0.2,
        ),
        history=formatted_history
    )
    
    response = chat.send_message(user_message)
    tool_trace = []

    for _ in range(max_hops):
        if response.function_calls:
            parts = []
            for fc in response.function_calls:
                args = fc.args
                # Ensure args is a dictionary (sometimes it's a structural type)
                if hasattr(args, "model_dump"):
                    args = args.model_dump()
                elif hasattr(args, "__dict__"):
                    args = args.__dict__
                    
                result = _execute_tool(fc.name, args, db)
                tool_trace.append({"tool": fc.name, "args": args, "result": result})
                
                part = types.Part.from_function_response(
                    name=fc.name,
                    response=result
                )
                if hasattr(fc, 'id') and fc.id:
                    part.function_response.id = fc.id
                parts.append(part)
            response = chat.send_message(parts)
        else:
            break

    final_text = ""
    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        final_text = "".join(p.text for p in response.candidates[0].content.parts if p.text)
        
    return {"answer": final_text, "tool_calls": tool_trace}
