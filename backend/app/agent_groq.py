"""
agent.py

Replaces the single-shot /ai/chat behaviour with a real multi-hop,
tool-calling agent. The model NEVER computes a carbon number itself --
every number in its answer comes from a tool return value. This is the
whole point: bom_service.py / cbam_tools.py stay authoritative, LLM only
orchestrates, explains, and recommends.

Migrated to Groq (LLaMA 3) to eliminate rate limit constraints.
"""

import json
import os
from groq import Groq

from sqlalchemy.orm import Session

from .bom_service import list_project_audits, perform_bom_match, perform_override
from .cbam_tools import compare_to_cbam_benchmark
from .schemas import BomLineMatch, OverrideRequest

SYSTEM_INSTRUCTION = """
You are the NetZeroCalc AI copilot, embedded in a BOM-to-LCI carbon
footprint and CBAM compliance tool.

HARD RULE: Every carbon number, emission factor, or CBAM benchmark value you state must come either from a tool result in this conversation OR from the provided [Screen & UI Context] (which reflects live values currently displayed on the user's screen). If a number is neither in a tool result nor in the screen context, call the appropriate tool -- do not estimate or recall one from training data. If no tool can answer the question, say so plainly.

Your job is to orchestrate the available tools and interpret the live screen context to answer questions about a project's carbon footprint, flag CBAM exposure using real benchmark data, and explain audit risk -- always citing which BOM line, screen card, or audit row a number came from.

This is decision-support only. Always make clear that a human practitioner must review and sign off before any figure is used in a regulated CBAM declaration or Scope 1-3 filing.
"""

TOOLS = [{
    "function_declarations": [
        {
            "name": "get_project_context",
            "description": "Gets all BOM mapping audits for a project, including hotspot analysis and CBAM benchmark comparisons. Call this when the user wants to analyze the current entities or know about the project footprint. Returns all necessary information in one single call to save time.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "project_id": {"type": "STRING"}
                },
                "required": ["project_id"]
            }
        },
        {
            "name": "map_bom_line",
            "description": "Maps a single raw BOM line to an LCI process, calculates its footprint, and automatically compares it to CBAM if applicable. Use this when the user asks to map or analyze a specific new material.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "project_id": {"type": "STRING"},
                    "raw_bom_input": {"type": "STRING", "description": "Material/line description, e.g. 'Primary aluminium ingot'"},
                    "quantity": {"type": "NUMBER"},
                    "unit": {"type": "STRING"},
                    "required_unit": {"type": "STRING"},
                    "database_source": {"type": "STRING"},
                    "system_model": {"type": "STRING"},
                    "target_geography": {"type": "STRING"},
                    "target_year": {"type": "INTEGER"}
                },
                "required": ["project_id", "raw_bom_input", "quantity", "unit", "required_unit", "database_source", "system_model", "target_geography", "target_year"]
            }
        },
        {
            "name": "override_match",
            "description": "Switches an existing audit row to a different candidate process the user has chosen, and recomputes its tCO2e. Only call this when the user explicitly picks an alternative.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "audit_id": {"type": "STRING"},
                    "process_id": {"type": "STRING"},
                    "user_id": {"type": "STRING"},
                    "notes": {"type": "STRING", "description": "Required: reason for the override"}
                },
                "required": ["audit_id", "process_id", "user_id", "notes"]
            }
        }
    ]
}]

def get_agent_client() -> genai.Client:
    api_key = os.environ.get('GEMINI_API_KEY')
    return genai.Client(api_key=api_key)

def _execute_tool(name: str, args: dict, db: Session) -> dict:
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
    except Exception as exc:
        return {"error": str(exc)}


def run_agent_turn_groq(client: Groq, chat_history: list, user_message: str, db: Session, project_id: str = None, screen_context: dict = None) -> dict:
    messages = []
    
    for msg in chat_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if not content and "parts" in msg:
            content = "".join([p.get("text", "") for p in msg["parts"]])
        
        # genai expects "user" or "model"
        if role == "assistant": role = "model"
        messages.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))

    context_parts = []
    if project_id:
        context_parts.append(f"[System Context: The user is currently working on project_id '{project_id}'. Pass this ID to any tools that require it.]")
    if screen_context:
        context_parts.append(f"[Screen & UI Context: The following live metrics are currently displayed on the user's screen:\n{json.dumps(screen_context, indent=2)}\nYou may cite these screen metrics directly when answering user questions about displayed totals or UI values.]")

    if context_parts:
        joined_context = "\n\n".join(context_parts)
        user_message = f"{joined_context}\n\n{user_message}"

    tool_trace = []
    max_hops = 3
    final_text = ""
    
    chat = client.chats.create(
        model="gemma-4-26b-a4b-it",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=TOOLS,
            temperature=0.2,
        ),
        history=messages
    )

    current_prompt = user_message

    for _ in range(max_hops):
        response = chat.send_message(current_prompt)
        

        
        if response.function_calls:
            # Need to send back function responses
            function_responses = []
            for tc in response.function_calls:
                func_name = tc.name
                func_args = tc.args
                
                result = _execute_tool(func_name, func_args, db)
                tool_trace.append({"tool": func_name, "args": func_args, "result": result})
                
                function_responses.append(
                    types.Part(
                        function_response=types.FunctionResponse(
                            name=tc.name,
                            id=tc.id,
                            response=json.loads(json.dumps(result, default=str))
                        )
                    )
                )
            
            # The next prompt to the chat is the function response parts!
            current_prompt = function_responses
        else:
            final_text = response.text
            break

    return {"answer": final_text, "tool_calls": tool_trace}
