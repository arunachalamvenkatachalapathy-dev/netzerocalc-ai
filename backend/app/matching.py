import hashlib
import math
import re
from collections import Counter

from .models import LciProcess

EMBEDDING_MODEL = "local-hash-v1"
VECTOR_SIZE = 128


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def embed_text(text: str) -> list[float]:
    vector = [0.0] * VECTOR_SIZE
    for token, count in Counter(tokenize(text)).items():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:2], "big") % VECTOR_SIZE
        sign = 1 if digest[2] % 2 == 0 else -1
        vector[index] += sign * count
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def geography_tier(candidate_geo: str, target_geo: str) -> int:
    if candidate_geo == target_geo:
        return 0
    if candidate_geo in {"RER", "GLO", "RoW"}:
        return 1
    return 2


def retrieve_candidates(processes: list[LciProcess], query: str, unit: str, source: str, system_model: str, target_geo: str) -> list[dict]:
    query_embedding = embed_text(query)
    candidates = []
    for process in processes:
        if not process.is_active:
            continue
        if process.database_source != source or process.system_model != system_model:
            continue
        if process.reference_unit != unit or process.embedding_model != EMBEDDING_MODEL:
            continue
        score = cosine_similarity(query_embedding, process.embedding or [])
        candidates.append({"process": process, "similarity_score": round(score, 4), "geography_tier": geography_tier(process.geography, target_geo)})
    return sorted(candidates, key=lambda item: (item["geography_tier"], -item["similarity_score"]))[:5]


def dqr_disambiguate(raw_bom: str, target_geo: str, target_year: int, candidates: list[dict]) -> dict:
    if not candidates:
        return {
            "selected_primary_candidate": None,
            "requires_process_chaining": False,
            "secondary_chained_candidate_needed": None,
            "dqr_scores": {"technological_representativeness_score": 5, "geographical_representativeness_score": 5, "temporal_representativeness_score": 5},
            "proxy_substitutions": [],
            "audit_risk_level": "HIGH",
            "audit_reasoning": "No active candidate matched the required source, system model, unit, and embedding model filters.",
            "mandatory_data_gap_warning": "Manual dataset selection is required before this BOM line can be approved.",
        }
    top = candidates[0]["process"]
    raw_tokens = set(tokenize(raw_bom))
    process_tokens = set(tokenize(f"{top.process_name} {top.reference_product} {top.description or ''}"))
    overlap = len(raw_tokens & process_tokens) / max(1, len(raw_tokens))
    transformed_terms = {"sheet", "molded", "extruded", "cast", "machined", "rolled", "formed"}
    requires_chaining = bool(raw_tokens & transformed_terms and not process_tokens & transformed_terms)
    tech_score = 1 if overlap >= 0.7 else 2 if overlap >= 0.45 else 4
    geo_score = 1 if top.geography == target_geo else 3 if top.geography in {"RER", "GLO", "RoW"} else 5
    temporal_score = 2 if target_year >= 2020 else 3 if target_year >= 2015 else 4
    proxy_subs = []
    if top.geography != target_geo:
        proxy_subs.append({"dimension": "geography", "requested": target_geo, "used": top.geography})
    # A placeholder factor (no real data behind it, value is 0.0 by convention)
    # must never rate as LOW risk just because geography/temporal/token-overlap
    # scores look fine -- a zero result from missing data is not the same as
    # a verified zero, and treating them the same is exactly the failure mode
    # this whole review pipeline exists to prevent.
    provenance_status = getattr(top, "data_quality_status", None)
    if provenance_status == "placeholder":
        risk = "HIGH"
    elif requires_chaining or geo_score >= 4 or tech_score >= 4:
        risk = "HIGH"
    elif provenance_status == "proxy" or geo_score == 3 or temporal_score >= 3:
        risk = "MEDIUM"
    else:
        risk = "LOW"
    warning = "Transformation/forming process may need to be chained." if requires_chaining else None
    if provenance_status == "placeholder":
        warning = (warning + " " if warning else "") + "Matched factor is a PLACEHOLDER (no real data yet) -- result is not valid for reporting."
    return {
        "selected_primary_candidate": {"process_name": top.process_name, "process_uuid": top.process_uuid, "vector_similarity_score": candidates[0]["similarity_score"]},
        "requires_process_chaining": requires_chaining,
        "secondary_chained_candidate_needed": "forming or manufacturing process" if requires_chaining else None,
        "dqr_scores": {"technological_representativeness_score": tech_score, "geographical_representativeness_score": geo_score, "temporal_representativeness_score": temporal_score},
        "proxy_substitutions": proxy_subs,
        "audit_risk_level": risk,
        "audit_reasoning": f"Selected '{top.process_name}' from {top.database_source} with geography {top.geography}. DQR reflects token overlap, geography fallback, and target year {target_year}; human review is required before reporting.",
        "mandatory_data_gap_warning": warning,
    }

