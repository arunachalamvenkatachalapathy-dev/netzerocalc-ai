import os
from datetime import datetime, timedelta, timezone
from io import BytesIO

import httpx
import jwt
import pandas as pd
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .matching import EMBEDDING_MODEL, dqr_disambiguate, retrieve_candidates
from .models import BomMappingAudit, LciProcess, Project, User, now_utc
from .schemas import AiChatRequest, BomLineMatch, LoginRequest, OverrideRequest, ProjectCreate, RejectRequest, ReviewRequest, UserCreate
from .units import convert_unit

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BOM-to-LCI Semantic Mapping Tool")
allowed_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,file://").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-change-me")
DEFAULT_AI_URL = os.getenv("AI_CHAT_URL", "http://localhost:11434/v1/chat/completions")
DEFAULT_AI_MODEL = os.getenv("AI_CHAT_MODEL", "llama3.1")
DEFAULT_AI_KEY = os.getenv("AI_CHAT_API_KEY", "ollama")


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
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))
    except Exception as exc:
        raise HTTPException(400, f"Unable to parse BOM file: {exc}") from exc
    df.columns = [str(column).strip().lower() for column in df.columns]
    description_col = next((col for col in ["description", "item", "material", "raw_bom_input"] if col in df.columns), None)
    quantity_col = next((col for col in ["quantity", "qty", "amount"] if col in df.columns), None)
    unit_col = next((col for col in ["unit", "uom"] if col in df.columns), None)
    if not all([description_col, quantity_col, unit_col]):
        raise HTTPException(400, "BOM must include description/material, quantity, and unit columns")
    parsed = []
    for _, row in df.iterrows():
        try:
            quantity = float(row[quantity_col])
        except Exception:
            continue
        description = str(row[description_col]).strip()
        unit = str(row[unit_col]).strip()
        if description and unit:
            parsed.append({"raw_bom_input": description, "quantity": quantity, "unit": unit})
    if not parsed:
        raise HTTPException(400, "BOM did not contain any valid rows")
    return parsed


@app.post("/bom/match")
def match_bom_line(payload: BomLineMatch, db: Session = Depends(get_db)):
    if not db.get(Project, payload.project_id):
        raise HTTPException(404, "Project not found")
    try:
        converted = convert_unit(payload.quantity, payload.unit, payload.required_unit)
    except ValueError as exc:
        audit = BomMappingAudit(project_id=payload.project_id, raw_bom_input=payload.raw_bom_input, raw_bom_quantity=payload.quantity, raw_bom_unit=payload.unit, target_geography=payload.target_geography, target_year=payload.target_year, audit_risk_level="HIGH", audit_reasoning=str(exc), mandatory_data_gap_warning="Manual unit resolution required.", embedding_model_used=EMBEDDING_MODEL)
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit
    processes = db.query(LciProcess).all()
    candidates = retrieve_candidates(processes, payload.raw_bom_input, converted.unit, payload.database_source, payload.system_model, payload.target_geography)
    result = dqr_disambiguate(payload.raw_bom_input, payload.target_geography, payload.target_year, candidates)
    selected = result["selected_primary_candidate"]
    matched = candidates[0]["process"] if selected else None

    # Compute the actual footprint number -- this is the core gap fix: without
    # emission_factor on the matched process, this stayed null forever and the
    # tool could describe a match but never produce a number.
    result_tco2e = None
    if matched is not None and matched.emission_factor is not None:
        result_tco2e = (converted.quantity * matched.emission_factor) / 1000

    # Expose every candidate (not just the auto-pick) so a reviewer can choose
    # a different one instead of only ever seeing what the scorer preferred.
    candidate_options = [
        {
            "process_id": c["process"].id,
            "process_uuid": c["process"].process_uuid,
            "process_name": c["process"].process_name,
            "similarity_score": c["similarity_score"],
            "emission_factor": c["process"].emission_factor,
            "data_quality_status": c["process"].data_quality_status,
            "reference_unit": c["process"].reference_unit,
        }
        for c in candidates
    ]

    audit = BomMappingAudit(
        project_id=payload.project_id,
        raw_bom_input=payload.raw_bom_input,
        raw_bom_quantity=payload.quantity,
        raw_bom_unit=payload.unit,
        converted_quantity=converted.quantity,
        converted_unit=converted.unit,
        unit_conversion_factor=converted.factor,
        target_geography=payload.target_geography,
        target_year=payload.target_year,
        matched_process_id=matched.id if matched else None,
        matched_process_uuid=selected["process_uuid"] if selected else None,
        matched_process_name=selected["process_name"] if selected else None,
        vector_similarity_score=selected["vector_similarity_score"] if selected else None,
        matched_emission_factor=matched.emission_factor if matched else None,
        matched_data_quality_status=matched.data_quality_status if matched else None,
        result_tco2e=result_tco2e,
        candidate_options=candidate_options,
        embedding_model_used=EMBEDDING_MODEL,
        requires_process_chaining=result["requires_process_chaining"],
        dqr_technological_score=result["dqr_scores"]["technological_representativeness_score"],
        dqr_geographical_score=result["dqr_scores"]["geographical_representativeness_score"],
        dqr_temporal_score=result["dqr_scores"]["temporal_representativeness_score"],
        proxy_substitutions=result["proxy_substitutions"],
        audit_risk_level=result["audit_risk_level"],
        audit_reasoning=result["audit_reasoning"],
        mandatory_data_gap_warning=result["mandatory_data_gap_warning"],
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


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
    audit = db.get(BomMappingAudit, audit_id)
    if not audit:
        raise HTTPException(404, "Audit not found")
    if not payload.notes.strip():
        raise HTTPException(400, "Override notes are required")
    process = db.get(LciProcess, payload.process_id)
    if not process:
        raise HTTPException(404, "Override process not found")
    audit.human_override_process_id = process.id
    audit.matched_process_id = process.id
    audit.matched_process_uuid = process.process_uuid
    audit.matched_process_name = process.process_name
    # Recompute the actual number for the newly-selected process -- a prior
    # version of this endpoint updated the label but left result_tco2e (and
    # the provenance snapshot) pointing at the OLD match, which would have
    # silently shown the wrong number next to the new process name.
    audit.matched_emission_factor = process.emission_factor
    audit.matched_data_quality_status = process.data_quality_status
    if audit.converted_quantity is not None and process.emission_factor is not None:
        audit.result_tco2e = (float(audit.converted_quantity) * process.emission_factor) / 1000
    else:
        audit.result_tco2e = None
    audit.is_human_approved = True
    audit.reviewed_by_user_id = payload.user_id if db.get(User, payload.user_id) else None
    audit.human_review_notes = payload.notes
    audit.reviewed_at = now_utc()
    db.commit()
    db.refresh(audit)
    return audit


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


@app.post("/ai/chat")
async def ai_chat(payload: AiChatRequest):
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
