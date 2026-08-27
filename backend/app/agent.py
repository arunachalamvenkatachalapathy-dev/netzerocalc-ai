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
_get_project_context_decl = types.FunctionDeclaration(
    name="get_project_context",
    description=(
        "Gets all BOM mapping audits for a project, including hotspot analysis and CBAM benchmark comparisons. "
        "Call this when the user wants to analyze the current entities or know about the project footprint. "
        "Returns all necessary information in one single call to save time."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "project_id": types.Schema(type="STRING"),
        },
        required=["project_id"]
    )
)

_map_bom_line_decl = types.FunctionDeclaration(
    name="map_bom_line",
    description=(
        "Maps a single raw BOM line to an LCI process, calculates its footprint, and automatically compares it to CBAM if applicable. "
        "Use this when the user asks to map or analyze a specific new material."
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

_override_decl = types.FunctionDeclaration(
    name="override_match",
    description=(
        "Switches an existing audit row to a different candidate process "
        "the user has chosen, and recomputes its tCO2e. Only call this when "
        "the user explicitly picks an alternative."
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
    _get_project_context_decl, _map_bom_line_decl, _override_decl,
])


def get_agent_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return genai.Client()
    return genai.Client(api_key=api_key)


def _execute_tool(name: str, args: dict, db: Session) -> dict:
    """Dispatches a model-requested tool call to the real backend logic."""
    try:
        if name.startswith("default_api:"):
            name = name.replace("default_api:", "", 1)
            
        if name == "get_project_context":
            rows = list_project_audits(args["project_id"], db, None)
            
            results = []
            for r in rows:
                item = {
                    "id": r.id, 
                    "raw_bom_input": r.raw_bom_input, 
                    "matched_process_name": r.matched_process_name,
                    "result_tco2e": r.result_tco2e, 
                    "audit_risk_level": r.audit_risk_level
                }
                
                if r.result_tco2e is not None and r.converted_quantity is not None and r.converted_quantity > 0:
                    sector_guess = None
                    low_input = r.raw_bom_input.lower()
                    if "aluminium" in low_input: sector_guess = "Aluminium"
                    elif "steel" in low_input or "iron" in low_input: sector_guess = "Iron & Steel"
                    elif "cement" in low_input: sector_guess = "Cement"
                    
                    if sector_guess:
                        cbam = compare_to_cbam_benchmark(
                            sector=sector_guess,
                            computed_emission_factor_kg_co2e_per_unit=r.matched_emission_factor or 0,
                            quantity_tonnes=r.converted_quantity,
                            product_hint=r.raw_bom_input
                        )
                        if cbam.get("covered"):
                            item["cbam_comparison"] = cbam
                
                results.append(item)
            return {"project_audits_overview": results}
            
        elif name == "map_bom_line":
            payload = BomLineMatch(**args)
            audit = perform_bom_match(payload, db)
            result = {
                "audit_id": audit.id,
                "matched_process_name": audit.matched_process_name,
                "result_tco2e": audit.result_tco2e,
                "matched_emission_factor": audit.matched_emission_factor,
                "audit_risk_level": audit.audit_risk_level,
                "audit_reasoning": audit.audit_reasoning,
            }
            if audit.result_tco2e is not None and audit.converted_quantity is not None and audit.converted_quantity > 0:
                sector_guess = None
                low_input = audit.raw_bom_input.lower()
                if "aluminium" in low_input: sector_guess = "Aluminium"
                elif "steel" in low_input or "iron" in low_input: sector_guess = "Iron & Steel"
                elif "cement" in low_input: sector_guess = "Cement"
                
                if sector_guess:
                    cbam = compare_to_cbam_benchmark(
                        sector=sector_guess,
                        computed_emission_factor_kg_co2e_per_unit=audit.matched_emission_factor or 0,
                        quantity_tonnes=audit.converted_quantity,
                        product_hint=audit.raw_bom_input
                    )
                    if cbam.get("covered"):
                        result["cbam_comparison"] = cbam
            
            return result
            
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


def run_agent_turn(client: genai.Client, chat_history: list, user_message: str, db: Session, project_id: str = None) -> dict:
    """
    Executes a single turn of the agent chat loop using the given history and user message.
    Returns {"answer": str, "tool_calls": [...]}
    """
    
    formatted_history = []
    for msg in chat_history:
        role = msg.get("role", "user")
        
        # Handle frontend format (content as string) vs old backend format (parts array)
        if "parts" in msg:
            parts = [types.Part.from_text(text=p.get("text", "")) for p in msg["parts"] if p.get("text")]
        else:
            parts = [types.Part.from_text(text=msg.get("content", ""))]
            
        formatted_history.append(types.Content(role=role, parts=parts))

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[TOOLS],
        temperature=0.2
    )

    if project_id:
        user_message = f"[System Context: The user is currently working on project_id '{project_id}'. Pass this ID to any tools that require it.]\n\n{user_message}"

    formatted_history.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

    tool_trace = []
    max_hops = 3
    final_text = ""
    
    for _ in range(max_hops):
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=formatted_history,
            config=config
        )
        
        if response.function_calls:
            # Bypass proxy corruption: Do not append the corrupted functionCall.
            # Instead, simulate a text interaction.
            formatted_history.append(types.Content(role="model", parts=[types.Part.from_text(text="Let me retrieve that information.")]))
            
            text_parts = []
            for fc in response.function_calls:
                args = fc.args
                if hasattr(args, "__dict__"):
                    args = args.__dict__
                    
                result = _execute_tool(fc.name, args, db)
                tool_trace.append({"tool": fc.name, "args": args, "result": result})
                
                text_parts.append(f"System: Tool '{fc.name}' executed with result:\n{result}")
                
            formatted_history.append(types.Content(role="user", parts=[types.Part.from_text(text="\n\n".join(text_parts))]))
        else:
            # It's a text response, append normally
            if response.candidates and response.candidates[0].content:
                formatted_history.append(response.candidates[0].content)
                if response.candidates[0].content.parts:
                    final_text = "".join(p.text for p in response.candidates[0].content.parts if p.text)
            break

    return {"answer": final_text, "tool_calls": tool_trace}
