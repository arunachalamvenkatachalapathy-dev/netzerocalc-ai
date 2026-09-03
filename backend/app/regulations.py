import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/regulations", tags=["Regulations"])

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "regulations_2026.json"

def load_regulations() -> List[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[dict])
def get_regulations(
    status: Optional[str] = Query(None, description="Filter by statusCode (e.g. in-force, upcoming, developing, not-in-force)"),
    region: Optional[str] = Query(None, description="Filter by region (e.g. Europe, Asia Pacific, North America)"),
    search: Optional[str] = Query(None, description="Full text search query")
):
    items = load_regulations()
    if status and status.lower() != "all":
        items = [r for r in items if r.get("statusCode", "").lower() == status.lower()]
    if region and region.lower() != "all regions":
        items = [r for r in items if r.get("region", "").lower() == region.lower()]
    if search:
        q = search.lower().strip()
        items = [
            r for r in items
            if q in r.get("country", "").lower()
            or q in r.get("regulation", "").lower()
            or q in r.get("shortForm", "").lower()
            or q in r.get("authority", "").lower()
            or q in r.get("sourceName", "").lower()
        ]
    return items

@router.get("/stats")
def get_regulation_stats():
    items = load_regulations()
    total = len(items)
    in_force = len([r for r in items if r.get("statusCode") == "in-force"])
    upcoming = len([r for r in items if r.get("statusCode") == "upcoming"])
    developing = len([r for r in items if r.get("statusCode") == "developing"])
    not_in_force = len([r for r in items if r.get("statusCode") == "not-in-force"])
    return {
        "total": total,
        "inForce": in_force,
        "upcoming": upcoming,
        "developing": developing,
        "notInForce": not_in_force
    }

@router.get("/{regulation_id}")
def get_regulation_by_id(regulation_id: str):
    items = load_regulations()
    for r in items:
        if r.get("id") == regulation_id:
            return r
    raise HTTPException(status_code=404, detail="Regulation not found")
