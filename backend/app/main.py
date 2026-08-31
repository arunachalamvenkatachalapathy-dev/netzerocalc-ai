import os
import time
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from io import BytesIO

import httpx
import jwt
import pandas as pd
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .matching import EMBEDDING_MODEL, dqr_disambiguate, retrieve_candidates
from .models import BomMappingAudit, GhgProject, LciProcess, Project, User, now_utc
from .schemas import AiChatRequest, BomLineMatch, GhgProjectCreate, LoginRequest, OverrideRequest, ProjectCreate, RejectRequest, ReviewRequest, UserCreate, AgentChatRequest, BatchMatchRequest
from .agent import get_agent_client, run_agent_turn
from .bom_service import perform_bom_match, perform_override
from .units import convert_unit

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BOM-to-LCI Semantic Mapping Tool")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-me")
DEFAULT_AI_URL = os.getenv("AI_CHAT_URL", "http://localhost:11434/v1/chat/completions")
DEFAULT_AI_MODEL = os.getenv("AI_CHAT_MODEL", "llama3.1")
DEFAULT_AI_KEY = os.getenv("AI_CHAT_API_KEY", "ollama")
bearer_scheme = HTTPBearer(auto_error=False)
try:
    firebase_admin.get_app()
except ValueError:
    try:
        firebase_admin.initialize_app()
    except Exception:
        # Local development can run without ADC; Cloud Run receives ADC automatically.
        pass

def require_firebase_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Firebase sign-in required")
    try:
        return firebase_auth.verify_id_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token") from exc

# ── External API / MCP Automation Layer ──────────────────────────────────────
# In-memory queue: per project_id → list of pending BOM items pushed via API
from collections import deque
import uuid, threading

_BOM_PUSH_QUEUE: dict[str, deque] = defaultdict(deque)
_QUEUE_LOCK = threading.Lock()

def _verify_api_key(request: Request):
    key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
    expected_key = os.environ.get("BOM_PUSH_API_KEY")
    if not expected_key or key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key. Pass X-API-Key header.")
    return True


@app.get("/health")
def health():
    return {"status": "ok", "service": "bom-to-lci-api"}


@app.get("/metadata/options")
def metadata_options():
    return {
        "geographies": ["US", "GLO", "RER", "RoW", "IN", "CN", "EU"],
        "database_sources": [
            {"value": "USLCI", "label": "USLCI", "note": "U.S. LCI database for materials, fuels, transport, chemicals, plastics, glass, paper, and related processes."},
            {"value": "ELCD", "label": "ELCD", "note": "Free Nexus-compatible background option often used for training/demo studies."},
            {"value": "Agribalyse Core", "label": "Agribalyse Core", "note": "Free core release with ecoinvent background datasets removed; some supply chains may need relinking."},
            {"value": "EXIOBASE", "label": "EXIOBASE", "note": "Input-output database; commercial use may require a separate EXIOBASE agreement."},
            {"value": "ecoinvent BYOL private import", "label": "ecoinvent BYOL private import", "note": "Client-owned private import only; never a shared hosted index."},
            {"value": "India_GHG_Factors", "label": "India GHG Factors", "note": "60 India-specific direct emission factors, provenance-tagged (clean/uplifted/proxy/placeholder). See each match's data_quality_status."},
        ],
        "system_models": ["Cut-off", "APOS", "Consequential", "Input-output", "Direct Factor"],
        "units": ["kg", "g", "lb", "t", "oz", "kWh", "MJ", "kJ", "km", "mi", "tkm", "ton-mile", "unit", "Liters", "m3", "scm", "p-km", "INR", "night", "franchise", "unit sold", "INR invested", "tCO2e reported"],
    }


def token_for(user: User) -> str:
    payload = {"sub": user.id, "email": user.email, "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@app.post("/auth/register")
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "Email already registered")
    user = User(email=payload.email, password_hash=pwd_context.hash(payload.password), full_name=payload.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user": user, "token": token_for(user)}


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.is_active == True).first()
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"user": user, "token": token_for(user)}


@app.post("/projects")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.post("/bom/upload")
async def upload_bom(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(400, "BOM upload must be a CSV or Excel file")
    content = await file.read()
    if not content:
        raise HTTPException(400, "BOM upload is empty")
    try:
        if filename.lower().endswith((".xlsx", ".xls")):
            xl = pd.ExcelFile(BytesIO(content))
            sheet_name = next((s for s in xl.sheet_names if "ghg_master" in s.lower() or "calculator" in s.lower()), xl.sheet_names[0])
            df = xl.parse(sheet_name)
        else:
            df = pd.read_csv(BytesIO(content))
    except Exception as exc:
        raise HTTPException(400, f"Unable to parse BOM file: {exc}") from exc

    df.columns = [str(column).strip().lower() for column in df.columns]
    description_col = next((col for col in ["category / item", "description", "item", "material", "raw_bom_input"] if col in df.columns), None)
    quantity_col = next((col for col in ["quantity (input)", "quantity", "qty", "amount"] if col in df.columns), None)
    unit_col = next((col for col in ["unit", "uom"] if col in df.columns), None)
    
    if not all([description_col, quantity_col, unit_col]):
        # Fallback to first 3 columns
        cols = list(df.columns)
        if len(cols) >= 3:
            description_col, quantity_col, unit_col = cols[0], cols[1], cols[2]
        else:
            raise HTTPException(400, "BOM must include description/material, quantity, and unit columns")
            
    parsed = []
    for _, row in df.iterrows():
        try:
            quantity = float(row[quantity_col])
        except Exception:
            continue
        description = str(row[description_col]).strip()
        unit = str(row[unit_col]).strip()
        if description and unit and not description.upper().startswith("SCOPE") and not description.upper().startswith("CATEGORY"):
            parsed.append({"raw_bom_input": description, "quantity": quantity, "unit": unit})
            
    if not parsed:
        raise HTTPException(400, "BOM did not contain any valid activity rows")
    return parsed


@app.post("/bom/match")
def match_bom_line(payload: BomLineMatch, db: Session = Depends(get_db)):
    try:
        return perform_bom_match(payload, db)
    except ValueError as exc:
        raise HTTPException(404, str(exc))

@app.post("/match/batch")
def match_batch(payload: BatchMatchRequest, db: Session = Depends(get_db)):
    results = []
    for line in payload.lines:
        try:
            audit = perform_bom_match(line, db)
            results.append(audit)
        except ValueError:
            continue
    return results


@app.get("/bom/audits/{project_id}")
def list_audits(project_id: str, audit_risk_level: str | None = None, db: Session = Depends(get_db)):
    query = db.query(BomMappingAudit).filter(BomMappingAudit.project_id == project_id)
    if audit_risk_level:
        query = query.filter(BomMappingAudit.audit_risk_level == audit_risk_level)
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    rows = query.all()
    return sorted(rows, key=lambda row: (order.get(row.audit_risk_level or "", 9), row.created_at))


@app.post("/bom/audits/{audit_id}/approve")
def approve(audit_id: str, payload: ReviewRequest, db: Session = Depends(get_db)):
    audit = db.get(BomMappingAudit, audit_id)
    if not audit:
        raise HTTPException(404, "Audit not found")
    audit.is_human_approved = True
    audit.reviewed_by_user_id = payload.user_id if db.get(User, payload.user_id) else None
    audit.human_review_notes = payload.notes
    audit.reviewed_at = now_utc()
    db.commit()
    db.refresh(audit)
    return audit


@app.post("/bom/audits/{audit_id}/override")
def override(audit_id: str, payload: OverrideRequest, db: Session = Depends(get_db)):
    try:
        return perform_override(audit_id, payload, db)
    except ValueError as exc:
        if "not found" in str(exc).lower():
            raise HTTPException(404, str(exc))
        raise HTTPException(400, str(exc))


@app.post("/bom/audits/{audit_id}/reject")
def reject(audit_id: str, payload: RejectRequest, db: Session = Depends(get_db)):
    audit = db.get(BomMappingAudit, audit_id)
    if not audit:
        raise HTTPException(404, "Audit not found")
    if not payload.notes.strip():
        raise HTTPException(400, "Reject notes are required")
    audit.is_human_approved = True
    audit.reviewed_by_user_id = payload.user_id if db.get(User, payload.user_id) else None
    audit.human_review_notes = f"Rejected: {payload.notes}"
    audit.reviewed_at = now_utc()
    audit.matched_process_id = None
    audit.matched_process_uuid = None
    audit.matched_process_name = "Rejected by reviewer"
    db.commit()
    db.refresh(audit)
    return audit


@app.get("/bom/export/{project_id}")
def export(project_id: str, format: str = "json", db: Session = Depends(get_db)):
    rows = db.query(BomMappingAudit).filter(BomMappingAudit.project_id == project_id).all()
    if any(not row.is_human_approved for row in rows):
        raise HTTPException(409, "Export blocked until every row is approved or overridden")
    data = [{"raw_bom_input": row.raw_bom_input, "quantity": float(row.converted_quantity or row.raw_bom_quantity), "unit": row.converted_unit or row.raw_bom_unit, "process_uuid": row.matched_process_uuid, "process_name": row.matched_process_name, "emission_factor": row.matched_emission_factor, "data_quality_status": row.matched_data_quality_status, "result_tco2e": row.result_tco2e, "risk": row.audit_risk_level, "review_notes": row.human_review_notes} for row in rows if row.matched_process_uuid]
    if format == "csv":
        df = pd.DataFrame(data)
        return Response(df.to_csv(index=False), media_type="text/csv")
    return data


@app.post("/projects/{project_id}/ghg-project")
def create_or_update_ghg_project(project_id: str, payload: GhgProjectCreate, db: Session = Depends(get_db)):
    ghg_proj = db.get(GhgProject, project_id)
    if not ghg_proj:
        ghg_proj = GhgProject(id=project_id, **payload.model_dump())
        db.add(ghg_proj)
    else:
        for key, value in payload.model_dump().items():
            setattr(ghg_proj, key, value)
    db.commit()
    db.refresh(ghg_proj)
    return ghg_proj


@app.get("/projects/{project_id}/ghg-project")
def get_ghg_project(project_id: str, db: Session = Depends(get_db)):
    ghg_proj = db.get(GhgProject, project_id)
    if not ghg_proj:
        # Return empty default instance if not explicitly set yet
        return {
            "id": project_id,
            "title": "Untitled ISO 14064-2 Project",
            "proponent": "", "start_date": "", "crediting_period": "",
            "description": "", "ghg_boundary": "", "baseline_scenario_narrative": "",
            "quantification_approach": "", "additionality_justification": "",
            "monitoring_plan": "", "qaqc_procedure": ""
        }
    return ghg_proj


@app.get("/projects/{project_id}/reduction")
def get_project_reduction(project_id: str, db: Session = Depends(get_db)):
    rows = db.query(BomMappingAudit).filter(BomMappingAudit.project_id == project_id).all()
    if not rows:
        return {"baseline_total": 0.0, "project_total": 0.0, "reduction": 0.0, "unapproved_count": 0}
    
    unapproved = [r for r in rows if not r.is_human_approved]
    if unapproved:
        raise HTTPException(
            status_code=422,
            detail=f"Reduction calculation blocked: {len(unapproved)} unreviewed item(s) exist. Every line item in both baseline and project scenarios must be human-approved before verifier-ready numbers can be issued."
        )
        
    baseline_rows = [r for r in rows if r.scenario == 'baseline' or r.scenario is None]
    project_rows = [r for r in rows if r.scenario == 'project']
    
    baseline_total = sum(r.result_tco2e or 0.0 for r in baseline_rows)
    project_total = sum(r.result_tco2e or 0.0 for r in project_rows)
    reduction = baseline_total - project_total
    
    return {
        "baseline_total": round(baseline_total, 4),
        "project_total": round(project_total, 4),
        "reduction": round(reduction, 4)
    }


@app.get("/projects/{project_id}/iso14064-report")
def generate_iso14064_report(project_id: str, db: Session = Depends(get_db)):
    rows = db.query(BomMappingAudit).filter(BomMappingAudit.project_id == project_id).all()
    unapproved = [r for r in rows if not r.is_human_approved]
    if unapproved:
        raise HTTPException(
            status_code=422,
            detail=f"Report export blocked: {len(unapproved)} unreviewed item(s) exist. Every line item in both baseline and project scenarios must be human-approved before issuing an ISO 14064-2 report."
        )

    ghg_proj = db.get(GhgProject, project_id)
    title = ghg_proj.title if ghg_proj else "ISO 14064-2 Project"
    proponent = ghg_proj.proponent if ghg_proj else "Project Proponent"
    start_date = ghg_proj.start_date if ghg_proj else "N/A"
    crediting = ghg_proj.crediting_period if ghg_proj else "N/A"
    desc = ghg_proj.description if ghg_proj else "No description provided."
    boundary = ghg_proj.ghg_boundary if ghg_proj else "Operational control boundary."
    baseline_narrative = ghg_proj.baseline_scenario_narrative if ghg_proj else "Baseline business-as-usual operations."
    approach = ghg_proj.quantification_approach if ghg_proj else "Direct emission factor matching via India GHG / LCI processes."
    additionality = ghg_proj.additionality_justification if ghg_proj else "Financial and technological barrier analysis demonstrates additionality."
    monitoring = ghg_proj.monitoring_plan if ghg_proj else "Continuous activity data logging and annual third-party verification."
    qaqc = ghg_proj.qaqc_procedure if ghg_proj else "Dual-entry verification and automated DQR scoring."

    baseline_rows = [r for r in rows if r.scenario == 'baseline' or r.scenario is None]
    project_rows = [r for r in rows if r.scenario == 'project']

    def render_table(table_rows):
        if not table_rows:
            return "| Activity | Quantity | Matched Process | EF (kgCO2e/unit) | Provenance Status | Footprint (tCO2e) |\n|---|---|---|---|---|---|\n| *No items* | - | - | - | - | 0.0000 |"
        lines = ["| Activity | Quantity | Matched Process | EF (kgCO2e/unit) | Provenance Status | Footprint (tCO2e) |", "|---|---|---|---|---|---|"]
        for r in table_rows:
            ef_str = f"{r.matched_emission_factor:.4f}" if r.matched_emission_factor is not None else "N/A"
            status_str = r.matched_data_quality_status or "clean"
            res_str = f"{r.result_tco2e:.4f}" if r.result_tco2e is not None else "0.0000"
            lines.append(f"| {r.raw_bom_input} | {r.converted_quantity or r.raw_bom_quantity} {r.converted_unit or r.raw_bom_unit} | {r.matched_process_name or 'N/A'} | {ef_str} | `{status_str}` | **{res_str}** |")
        return "\n".join(lines)

    baseline_total = sum(r.result_tco2e or 0.0 for r in baseline_rows)
    project_total = sum(r.result_tco2e or 0.0 for r in project_rows)
    net_reduction = baseline_total - project_total

    # Data Quality Summary
    clean_cnt = sum(1 for r in rows if r.matched_data_quality_status == 'clean')
    uplifted_cnt = sum(1 for r in rows if r.matched_data_quality_status == 'uplifted')
    proxy_cnt = sum(1 for r in rows if r.matched_data_quality_status == 'proxy')
    placeholder_cnt = sum(1 for r in rows if r.matched_data_quality_status == 'placeholder')

    report_md = f"""# GHG Project Report — ISO 14064-2:2019
*Draft — requires ISO 14064-3 validation/verification before use in a credit claim.*

## 1. Project Description (5.2)
- **Project Title:** {title}
- **Project Proponent:** {proponent}
- **Start Date:** {start_date}
- **Crediting Period:** {crediting}
- **Executive Description:** {desc}

## 2. GHG Project Boundary (5.3)
{boundary}

## 3. Baseline Scenario (6)
- **Baseline Narrative:** {baseline_narrative}
- **Quantification Approach:** {approach}

## 4. Additionality (5.5)
{additionality}

## 5. Quantification

### 5.1 Baseline Scenario Emissions
{render_table(baseline_rows)}

**Baseline Total:** {baseline_total:.4f} tCO2e

### 5.2 Project Scenario Emissions
{render_table(project_rows)}

**Project Total:** {project_total:.4f} tCO2e

### 5.3 Net Emission Reduction
$$\\Delta E = \\text{{Baseline}} - \\text{{Project}} = {baseline_total:.4f} - {project_total:.4f} = \\mathbf{{{net_reduction:.4f}\\text{{ tCO2e}}}}$$
*(Note: Net reduction inherits uncertainty from any 'uplifted', 'proxy', or 'placeholder' factors used).*

## 6. Monitoring Plan (9)
{monitoring}

## 7. QA/QC Procedure (9.3)
{qaqc}

## 8. Data Quality & Provenance Summary
- **Total Audited Items:** {len(rows)} (100% Approved by Practitioner)
- **Clean / Verified Factors:** {clean_cnt}
- **Uplifted Factors:** {uplifted_cnt}
- **Proxy Factors:** {proxy_cnt}
- **Placeholder Factors:** {placeholder_cnt}
"""
    return Response(report_md, media_type="text/markdown")


@app.post("/ai/chat")
async def ai_chat(payload: AiChatRequest, user=Depends(require_firebase_user)):
    api_url = payload.api_url or DEFAULT_AI_URL
    model = payload.model or DEFAULT_AI_MODEL
    api_key = payload.api_key or DEFAULT_AI_KEY
    messages = [
        {
            "role": "system",
            "content": "You are an LCA decision-support assistant. Do not invent datasets; reason only from provided BOM mapping rows and remind the user that practitioner sign-off is required.",
        },
        {"role": "user", "content": f"{payload.question}\n\nRows:\n{payload.rows}"},
    ]
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                api_url,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": model, "messages": messages, "temperature": 0.2},
            )
            response.raise_for_status()
            data = response.json()
            return {"answer": data.get("choices", [{}])[0].get("message", {}).get("content", ""), "provider_status": "ok"}
    except Exception:
        risky = next((row for row in payload.rows if row.get("audit_risk_level") == "HIGH"), payload.rows[0] if payload.rows else None)
        if risky:
            answer = f"AI endpoint unavailable. Local fallback: review '{risky.get('raw_bom_input', 'this BOM line')}' first; check unit compatibility, process chaining, geography proxy substitutions, and document practitioner sign-off before export."
        else:
            answer = "AI endpoint unavailable. Load or match BOM rows first, then ask about DQR risk, unit conversion, or review priority."
        return {"answer": answer, "provider_status": "fallback"}


# removed

# Simple in-memory rate limiter for the agent endpoint (protects GCP billing).
# Since Cloud Run is capped at max-instances=1, this global dictionary works fine.
agent_rate_limits = defaultdict(list)
AGENT_RATE_LIMIT_WINDOW = 60  # seconds
AGENT_RATE_LIMIT_MAX_REQS = 60  # increased to match Gemini's generous rate limit

@app.post("/agent/chat")
def agent_chat(request: Request, payload: AgentChatRequest, db: Session = Depends(get_db), user=Depends(require_firebase_user)):
    """
    Multi-hop tool-calling agent. Unlike /ai/chat (single-shot, no tool
    access), this can call match_bom_line, list_project_audits,
    compare_to_cbam_benchmark, and override_match in sequence, grounded
    entirely in real project data via db.
    """
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Cleanup old timestamps and check limit
    agent_rate_limits[client_ip] = [ts for ts in agent_rate_limits[client_ip] if now - ts < AGENT_RATE_LIMIT_WINDOW]
    if len(agent_rate_limits[client_ip]) >= AGENT_RATE_LIMIT_MAX_REQS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a minute before sending more questions.")
    agent_rate_limits[client_ip].append(now)

    client = get_agent_client()
    try:
        result = run_agent_turn(client, payload.history, payload.question, db, getattr(payload, 'project_id', None), screen_context=payload.screen_context)
        return {
            "answer": result["answer"],
            "tool_calls": result["tool_calls"],  # frontend renders this as "Sources"
            "model_used": result.get("model_used", "gemini-3.5-flash")
        }
    except Exception as e:
        import traceback
        err_msg = str(e)
        print("Gemini API failed, falling back to Groq...")
        traceback.print_exc()
        
        try:
            from app.agent_groq import get_groq_client, run_agent_turn_groq
            groq_client = get_groq_client()
            result = run_agent_turn_groq(groq_client, payload.history, payload.question, db, getattr(payload, 'project_id', None), screen_context=payload.screen_context)
            return {
                "answer": result["answer"],
                "tool_calls": result["tool_calls"],
                "model_used": result.get("model_used", "groq-llama-3.3-70b-versatile"),
                "primary_model_error": err_msg
            }
        except Exception as groq_e:
            print("Groq fallback also failed:")
            traceback.print_exc()
            if "RESOURCE_EXHAUSTED" in str(e) or "429" in str(e) or "rate_limit" in str(e).lower():
                raise HTTPException(status_code=429, detail="You have hit the Gemini API rate limit, and the Groq fallback also failed. Please wait a moment and try again.")
            raise HTTPException(status_code=500, detail=f"Gemini error: {err_msg} | Groq error: {str(groq_e)}")


# Serve the Vite build from the same Cloud Run service as the API.

# ── External API / MCP Automation Endpoints ──────────────────────────────────

from typing import List, Optional
from pydantic import BaseModel as PydanticBaseModel

class ExternalBomItem(PydanticBaseModel):
    name: str
    qty: float
    unit: str
    process: Optional[str] = None
    ef: Optional[float] = None
    scope: Optional[str] = "Scope 3"
    scope3Category: Optional[str] = "Cat 1: Purchased Goods & Services"
    source_system: Optional[str] = "External API"
    notes: Optional[str] = None

class BomPushPayload(PydanticBaseModel):
    project_id: str
    items: List[ExternalBomItem]

@app.post("/api/v1/bom/push", summary="Push BOM items from external system / MCP agent")
async def bom_push(payload: BomPushPayload, request: Request):
    """
    External API endpoint for MCP agents, ERP systems, or any external software
    to push BOM line items directly into a NetZeroCalc project inventory.

    Authentication: Pass header  X-API-Key: <YOUR_API_KEY>

    Example (curl):
      curl -X POST https://netzerocalc-backend-398062217408.us-central1.run.app/api/v1/bom/push \
           -H "Content-Type: application/json" \
           -H "X-API-Key: <YOUR_API_KEY>" \
           -d '{
             "project_id": "proj_default",
             "items": [
               {"name": "Steel Plate S275", "qty": 500, "unit": "kg", "scope": "Scope 3"},
               {"name": "Diesel Fuel", "qty": 200, "unit": "Liters", "scope": "Scope 1"}
             ]
           }'
    """
    _verify_api_key(request)
    accepted = []
    with _QUEUE_LOCK:
        for item in payload.items:
            row = {
                "id": str(uuid.uuid4()),
                "name": item.name,
                "qty": item.qty,
                "unit": item.unit,
                "process": item.process or item.name,
                "ef": item.ef or 0,
                "scope": item.scope or "Scope 3",
                "scope3Category": item.scope3Category or "Cat 1: Purchased Goods & Services",
                "status": f"[API PUSH] via {item.source_system or 'External API'}",
                "approved": False,
                "risk": "LOW",
                "gwpBasis": "IPCC AR6",
                "ter": 1, "ger": 1, "tir": 1,
                "notes": item.notes or "",
                "pushed_at": datetime.now(timezone.utc).isoformat()
            }
            _BOM_PUSH_QUEUE[payload.project_id].append(row)
            accepted.append(row["id"])
    return {
        "status": "accepted",
        "project_id": payload.project_id,
        "items_queued": len(accepted),
        "item_ids": accepted,
        "message": f"{len(accepted)} item(s) queued. The NetZeroCalc dashboard will pick them up within 3 seconds."
    }

@app.get("/api/v1/bom/pending/{project_id}", summary="Poll for pending BOM items pushed by external systems")
async def bom_pending(project_id: str):
    """
    Frontend polls this endpoint every 3 seconds.
    Returns all queued items and clears the queue.
    No auth required (project_id acts as the namespace).
    """
    with _QUEUE_LOCK:
        queue = _BOM_PUSH_QUEUE.get(project_id, deque())
        items = list(queue)
        if project_id in _BOM_PUSH_QUEUE:
            _BOM_PUSH_QUEUE[project_id].clear()
    return {
        "project_id": project_id,
        "count": len(items),
        "items": items
    }

@app.get("/api/v1/info", summary="External API information and usage guide")
async def api_info():
    """Public endpoint: returns API documentation and connection details."""
    base = "https://netzerocalc-backend-398062217408.us-central1.run.app"
    return {
        "api_name": "NetZeroCalc External Automation API",
        "version": "1.0.0",
        "description": "Push BOM/GHG inventory items from any external system, ERP, or MCP agent directly into the NetZeroCalc dashboard.",
        "base_url": base,
        "authentication": {
            "type": "API Key",
            "header": "X-API-Key",
            "key": EXTERNAL_API_KEY
        },
        "endpoints": {
            "push_items": {
                "method": "POST",
                "path": "/api/v1/bom/push",
                "description": "Push BOM items from external software into a project",
                "requires_auth": True
            },
            "poll_pending": {
                "method": "GET",
                "path": "/api/v1/bom/pending/{project_id}",
                "description": "Frontend polls this to receive externally pushed items",
                "requires_auth": False
            }
        },
        "example_curl": f'curl -X POST {base}/api/v1/bom/push -H "Content-Type: application/json" -H "X-API-Key: {EXTERNAL_API_KEY}" -d \'{{"project_id":"proj_default","items":[{{"name":"Primary Steel","qty":1000,"unit":"kg","scope":"Scope 3"}}]}}\''
    }


@app.get('/debug/version')
def debug_version():
    import google.genai as genai_pkg
    return {'google_genai': genai_pkg.__version__}


# Mount after API routes so the frontend fallback cannot intercept API calls.
static_dir = Path(__file__).resolve().parent.parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
