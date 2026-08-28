"""
bom_service.py

Extracted from the inline body of `/bom/match` and `/bom/audits/{id}/override`
in main.py. Both the HTTP routes AND the agent tool layer (agent.py) call
these same functions — the calculation logic exists in exactly one place,
so the agent can never drift out of sync with what the UI shows.

Nothing about the actual matching/DQR/unit-conversion logic is changed here.
This file is a refactor, not a rewrite: it moves code, it doesn't alter what
the code does.
"""

from sqlalchemy.orm import Session

from .matching import EMBEDDING_MODEL, dqr_disambiguate, retrieve_candidates
from .models import BomMappingAudit, LciProcess, Project, User, now_utc
from .schemas import BomLineMatch, OverrideRequest
from .units import convert_unit


def perform_bom_match(payload: BomLineMatch, db: Session) -> BomMappingAudit:
    """
    Same logic that was inline in the /bom/match route. Returns a persisted
    BomMappingAudit row. Raises ValueError if the project doesn't exist
    (callers translate this to whatever error shape they need — HTTPException
    for the route, a tool-error string for the agent).
    """
    if not db.get(Project, payload.project_id):
        raise ValueError(f"Project not found: {payload.project_id}")

    try:
        converted = convert_unit(payload.quantity, payload.unit, payload.required_unit)
    except ValueError as exc:
        audit = BomMappingAudit(
            project_id=payload.project_id,
            raw_bom_input=payload.raw_bom_input,
            raw_bom_quantity=payload.quantity,
            raw_bom_unit=payload.unit,
            target_geography=payload.target_geography,
            target_year=payload.target_year,
            audit_risk_level="HIGH",
            audit_reasoning=str(exc),
            mandatory_data_gap_warning="Manual unit resolution required.",
            embedding_model_used=EMBEDDING_MODEL,
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    processes = db.query(LciProcess).all()
    candidates = retrieve_candidates(
        processes, payload.raw_bom_input, converted.unit,
        payload.database_source, payload.system_model, payload.target_geography,
    )
    result = dqr_disambiguate(payload.raw_bom_input, payload.target_geography, payload.target_year, candidates)
    selected = result["selected_primary_candidate"]
    matched = candidates[0]["process"] if selected else None

    result_tco2e = None
    if matched is not None and matched.emission_factor is not None:
        result_tco2e = (float(converted.quantity) * matched.emission_factor) / 1000

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


def perform_override(audit_id: str, payload: OverrideRequest, db: Session) -> BomMappingAudit:
    """Same logic that was inline in the /bom/audits/{id}/override route."""
    audit = db.get(BomMappingAudit, audit_id)
    if not audit:
        raise ValueError(f"Audit not found: {audit_id}")
    if not payload.notes.strip():
        raise ValueError("Override notes are required")
    process = db.get(LciProcess, payload.process_id)
    if not process:
        raise ValueError(f"Override process not found: {payload.process_id}")

    audit.human_override_process_id = process.id
    audit.matched_process_id = process.id
    audit.matched_process_uuid = process.process_uuid
    audit.matched_process_name = process.process_name
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


def list_project_audits(project_id: str, db: Session, audit_risk_level: str | None = None) -> list[BomMappingAudit]:
    """Same logic that was inline in the /bom/audits/{project_id} route."""
    query = db.query(BomMappingAudit).filter(BomMappingAudit.project_id == project_id)
    if audit_risk_level:
        query = query.filter(BomMappingAudit.audit_risk_level == audit_risk_level)
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    rows = query.all()
    return sorted(rows, key=lambda row: (order.get(row.audit_risk_level or "", 9), row.created_at))
