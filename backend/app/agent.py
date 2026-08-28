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

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_project_context",
            "description": "Gets all BOM mapping audits for a project, including hotspot analysis and CBAM benchmark comparisons. Call this when the user wants to analyze the current entities or know about the project footprint. Returns all necessary information in one single call to save time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "string"}
                },
                "required": ["project_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "map_bom_line",
            "description": "Maps a single raw BOM line to an LCI process, calculates its footprint, and automatically compares it to CBAM if applicable. Use this when the user asks to map or analyze a specific new material.",
            "parameters": {
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
                    "target_year": {"type": "integer"}
                },
                "required": ["project_id", "raw_bom_input", "quantity", "unit", "required_unit", "database_source", "system_model", "target_geography", "target_year"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "override_match",
            "description": "Switches an existing audit row to a different candidate process the user has chosen, and recomputes its tCO2e. Only call this when the user explicitly picks an alternative.",
            "parameters": {
                "type": "object",
                "properties": {
                    "audit_id": {"type": "string"},
                    "process_id": {"type": "string"},
                    "user_id": {"type": "string"},
                    "notes": {"type": "string", "description": "Required: reason for the override"}
                },
                "required": ["audit_id", "process_id", "user_id", "notes"]
            }
        }
    }
]

import itertools
_key_iterator = None

def get_agent_client() -> Groq:
    global _key_iterator
    
    # Check for multiple keys
    keys_str = os.environ.get("GROQ_API_KEYS")
    if keys_str:
        keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        if keys:
            if _key_iterator is None:
                _key_iterator = itertools.cycle(keys)
            return Groq(api_key=next(_key_iterator))
            
    # Fallback to single key
    api_key = os.environ.get("GROQ_API_KEY")
    return Groq(api_key=api_key)

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


def run_agent_turn(client: Groq, chat_history: list, user_message: str, db: Session, project_id: str = None) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_INSTRUCTION}
    ]
    
    for msg in chat_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        # old messages might be empty if we converted incorrectly earlier, so fallback
        if not content and "parts" in msg:
            content = "".join([p.get("text", "") for p in msg["parts"]])
        
        # Groq expects role to be "user" or "assistant"
        if role == "model": role = "assistant"
        messages.append({"role": role, "content": content})

    if project_id:
        user_message = f"[System Context: The user is currently working on project_id '{project_id}'. Pass this ID to any tools that require it.]\n\n{user_message}"

    messages.append({"role": "user", "content": user_message})

    tool_trace = []
    max_hops = 3
    final_text = ""
    
    for _ in range(max_hops):
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.2,
            max_tokens=2000
        )
        
        response_message = response.choices[0].message
        
        if response_message.tool_calls:
            # Convert object to dict for Groq
            msg_dict = {"role": "assistant", "content": response_message.content or "", "tool_calls": []}
            for tc in response_message.tool_calls:
                msg_dict["tool_calls"].append({
                    "id": tc.id,
                    "type": tc.type,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                })
            messages.append(msg_dict)
            
            for tool_call in response_message.tool_calls:
                func_name = tool_call.function.name
                func_args = json.loads(tool_call.function.arguments)
                
                result = _execute_tool(func_name, func_args, db)
                tool_trace.append({"tool": func_name, "args": func_args, "result": result})
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": func_name,
                    "content": json.dumps(result)
                })
        else:
            final_text = response_message.content
            break

    return {"answer": final_text, "tool_calls": tool_trace}
