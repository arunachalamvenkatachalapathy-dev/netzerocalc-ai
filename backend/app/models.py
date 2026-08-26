import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(50), default="analyst")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    default_target_geography: Mapped[str | None] = mapped_column(String(20))
    default_target_year: Mapped[int | None] = mapped_column(Integer)
    created_by_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class LciProcess(Base):
    __tablename__ = "lci_processes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    process_uuid: Mapped[str] = mapped_column(String(255), nullable=False)
    database_source: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    database_version: Mapped[str | None] = mapped_column(String(50))
    process_name: Mapped[str] = mapped_column(Text, nullable=False)
    reference_product: Mapped[str] = mapped_column(Text, nullable=False)
    reference_unit: Mapped[str] = mapped_column(String(20), nullable=False)
    geography: Mapped[str] = mapped_column(String(20), nullable=False)
    system_model: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    sector_isic: Mapped[str | None] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    superseded_by_uuid: Mapped[str | None] = mapped_column(String(255))
    embedding: Mapped[list[float]] = mapped_column(JSON, default=list)
    embedding_model: Mapped[str] = mapped_column(String(100), default="local-hash-v1")
    # These three fields close a real gap: without them, this table can match
    # a BOM line to a process description but has no way to compute an actual
    # kgCO2e number. emission_factor is nullable because most existing seed
    # rows (USLCI/ELCD/etc) don't have a verified numeric factor yet -- null
    # here is honest, not a bug.
    emission_factor: Mapped[float | None] = mapped_column(Float)
    emission_factor_source: Mapped[str | None] = mapped_column(Text)
    data_quality_status: Mapped[str | None] = mapped_column(String(20))
    factor_status: Mapped[str | None] = mapped_column(String(20))
    factor_source: Mapped[str | None] = mapped_column(Text)
    # one of: clean, uplifted, proxy, placeholder -- carries provenance
    # forward into every match instead of hiding it once selected
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class GhgProject(Base):
    __tablename__ = "ghg_projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    proponent: Mapped[str | None] = mapped_column(Text)
    start_date: Mapped[str | None] = mapped_column(String(50))
    crediting_period: Mapped[str | None] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)
    ghg_boundary: Mapped[str | None] = mapped_column(Text)
    baseline_scenario_narrative: Mapped[str | None] = mapped_column(Text)
    quantification_approach: Mapped[str | None] = mapped_column(Text)
    additionality_justification: Mapped[str | None] = mapped_column(Text)
    monitoring_plan: Mapped[str | None] = mapped_column(Text)
    qaqc_procedure: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class BomMappingAudit(Base):
    __tablename__ = "bom_mapping_audits"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    scenario: Mapped[str | None] = mapped_column(String(20), nullable=True) # 'baseline' | 'project' | None
    raw_bom_input: Mapped[str] = mapped_column(Text, nullable=False)
    raw_bom_quantity: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    raw_bom_unit: Mapped[str] = mapped_column(String(20), nullable=False)
    converted_quantity: Mapped[float | None] = mapped_column(Numeric(12, 4))
    converted_unit: Mapped[str | None] = mapped_column(String(20))
    unit_conversion_factor: Mapped[float | None] = mapped_column(Numeric(14, 8))
    target_geography: Mapped[str] = mapped_column(String(20), nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    matched_process_id: Mapped[str | None] = mapped_column(String, ForeignKey("lci_processes.id"))
    matched_process_uuid: Mapped[str | None] = mapped_column(String(255))
    matched_process_name: Mapped[str | None] = mapped_column(Text)
    vector_similarity_score: Mapped[float | None] = mapped_column(Float)
    # Snapshotted at match/override time, not looked up live from LciProcess --
    # if the source factor is later re-edited, this audit row still reflects
    # what was actually used for this specific number, which matters for
    # reproducibility.
    matched_emission_factor: Mapped[float | None] = mapped_column(Float)
    matched_data_quality_status: Mapped[str | None] = mapped_column(String(20))
    result_tco2e: Mapped[float | None] = mapped_column(Float)
    # Up to 5 alternative candidates from the same match, so a reviewer can
    # see and pick a different one instead of only ever seeing the auto-pick.
    candidate_options: Mapped[list[dict]] = mapped_column(JSON, default=list)
    embedding_model_used: Mapped[str | None] = mapped_column(String(100))
    requires_process_chaining: Mapped[bool] = mapped_column(Boolean, default=False)
    secondary_chained_process_id: Mapped[str | None] = mapped_column(String, ForeignKey("lci_processes.id"))
    secondary_chained_quantity: Mapped[float | None] = mapped_column(Numeric(12, 4))
    dqr_technological_score: Mapped[int | None] = mapped_column(Integer)
    dqr_geographical_score: Mapped[int | None] = mapped_column(Integer)
    dqr_temporal_score: Mapped[int | None] = mapped_column(Integer)
    proxy_substitutions: Mapped[list[dict]] = mapped_column(JSON, default=list)
    audit_risk_level: Mapped[str | None] = mapped_column(String(20), index=True)
    audit_reasoning: Mapped[str | None] = mapped_column(Text)
    mandatory_data_gap_warning: Mapped[str | None] = mapped_column(Text)
    is_human_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    reviewed_by_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"))
    human_override_process_id: Mapped[str | None] = mapped_column(String, ForeignKey("lci_processes.id"))
    human_review_notes: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    matched_process = relationship("LciProcess", foreign_keys=[matched_process_id])

