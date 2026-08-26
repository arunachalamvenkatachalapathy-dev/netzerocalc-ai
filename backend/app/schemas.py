from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProjectCreate(BaseModel):
    project_name: str
    description: str | None = None
    default_target_geography: str = "US"
    default_target_year: int = 2024


class BomLineMatch(BaseModel):
    project_id: str
    raw_bom_input: str
    quantity: float
    unit: str
    required_unit: str = "kg"
    target_geography: str = "US"
    target_year: int = 2024
    database_source: str = "USLCI"
    system_model: str = "Cut-off"
    scenario: str | None = None  # 'baseline' | 'project' | None


class GhgProjectCreate(BaseModel):
    title: str
    proponent: str | None = None
    start_date: str | None = None
    crediting_period: str | None = None
    description: str | None = None
    ghg_boundary: str | None = None
    baseline_scenario_narrative: str | None = None
    quantification_approach: str | None = None
    additionality_justification: str | None = None
    monitoring_plan: str | None = None
    qaqc_procedure: str | None = None


class ReviewRequest(BaseModel):
    user_id: str
    notes: str | None = None


class RejectRequest(BaseModel):
    user_id: str
    notes: str


class OverrideRequest(BaseModel):
    user_id: str = "practitioner-1"
    process_id: str
    notes: str | None = "Selected candidate match alternative from UI picker"


class AiChatRequest(BaseModel):
    question: str
    rows: list[dict] = Field(default_factory=list)
    api_url: str | None = None
    model: str | None = None
    api_key: str | None = None


class AgentChatRequest(BaseModel):
    project_id: str
    question: str
    history: list[dict] = []

class BatchMatchRequest(BaseModel):
    lines: list[BomLineMatch]

