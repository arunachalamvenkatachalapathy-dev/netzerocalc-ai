import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ghg", tags=["Corporate GHG Engine"])

# -------------------------------------------------------------
# EMISSION FACTOR LIBRARY (DEFRA 2024, CEA India 2024, EPA 2023)
# -------------------------------------------------------------
EF_LIBRARY = {
    "stationary": {
        "natural_gas": {"label": "Natural Gas", "value": 0.18316, "unit": "kgCO2e/kWh_gross", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "diesel": {"label": "Diesel (Gas Oil)", "value": 2.68787, "unit": "kgCO2e/L", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "fuel_oil": {"label": "Fuel Oil (Heavy)", "value": 3.17000, "unit": "kgCO2e/L", "source": "EPA 2023", "version": "2023.1", "tier": 2},
        "lpg": {"label": "LPG", "value": 1.55537, "unit": "kgCO2e/L", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "coal": {"label": "Coal (Industrial)", "value": 2.42000, "unit": "kgCO2e/kg", "source": "IPCC AR6", "version": "2021.1", "tier": 3},
    },
    "mobile_fuel": {
        "petrol": {"label": "Petrol / Gasoline", "value": 2.31495, "unit": "kgCO2e/L", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "diesel": {"label": "On-Road Diesel", "value": 2.68787, "unit": "kgCO2e/L", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cng": {"label": "CNG", "value": 0.44602, "unit": "kgCO2e/kg", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
    },
    "mobile_distance": {
        "car_avg": {"label": "Average Car", "value": 0.16800, "unit": "kgCO2e/km", "source": "DEFRA 2024", "version": "2024.1", "tier": 3},
        "van": {"label": "Van (<3.5t)", "value": 0.25100, "unit": "kgCO2e/km", "source": "DEFRA 2024", "version": "2024.1", "tier": 3},
        "hgv": {"label": "HGV (>17t)", "value": 0.84200, "unit": "kgCO2e/km", "source": "DEFRA 2024", "version": "2024.1", "tier": 3},
    },
    "grid_location": {
        "IN": {"label": "India (CEA Grid Baseline v19)", "value": 0.71600, "unit": "kgCO2e/kWh", "source": "CEA India 2024", "version": "19.0", "tier": 2},
        "US": {"label": "United States (eGRID 2023)", "value": 0.36700, "unit": "kgCO2e/kWh", "source": "EPA eGRID 2023", "version": "2023.1", "tier": 2},
        "EU": {"label": "European Union (EEA EU-27)", "value": 0.23000, "unit": "kgCO2e/kWh", "source": "EEA 2023", "version": "2023.1", "tier": 2},
        "UK": {"label": "United Kingdom (DEFRA)", "value": 0.20700, "unit": "kgCO2e/kWh", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "DK": {"label": "Denmark (Energinet)", "value": 0.13500, "unit": "kgCO2e/kWh", "source": "Energinet 2023", "version": "2023.1", "tier": 2},
        "CN": {"label": "China National Grid", "value": 0.58100, "unit": "kgCO2e/kWh", "source": "IEA 2023", "version": "2023.1", "tier": 3},
        "global": {"label": "Global World Average", "value": 0.43600, "unit": "kgCO2e/kWh", "source": "IEA 2023", "version": "2023.1", "tier": 3},
    },
    "residual_mix": {
        "EU": {"label": "EU Residual Mix (AIB)", "value": 0.40000, "unit": "kgCO2e/kWh", "source": "AIB 2023", "version": "2023.1", "tier": 2},
        "US": {"label": "US Green-e Residual", "value": 0.45000, "unit": "kgCO2e/kWh", "source": "Green-e 2023", "version": "2023.1", "tier": 2},
        "global": {"label": "Global Conservative Proxy", "value": 0.50000, "unit": "kgCO2e/kWh", "source": "IEA Proxy", "version": "2023.1", "tier": 3},
    },
    "scope3_activity": {
        "cat1": {"label": "1. Purchased Goods & Services", "value": 0.42000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat2": {"label": "2. Capital Goods", "value": 0.38000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat3": {"label": "3. Fuel & Energy Activities", "value": 0.04500, "unit": "kgCO2e/kWh", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat4": {"label": "4. Upstream Transport", "value": 0.000113, "unit": "kgCO2e/tonne-km", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat5": {"label": "5. Waste Generated", "value": 21.30000, "unit": "kgCO2e/tonne", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat6": {"label": "6. Business Travel", "value": 0.15800, "unit": "kgCO2e/passenger-km", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat7": {"label": "7. Employee Commuting", "value": 0.17100, "unit": "kgCO2e/km", "source": "DEFRA 2024", "version": "2024.1", "tier": 3},
        "cat8": {"label": "8. Upstream Leased Assets", "value": 0.18316, "unit": "kgCO2e/kWh", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat9": {"label": "9. Downstream Transport", "value": 0.000113, "unit": "kgCO2e/tonne-km", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat10": {"label": "10. Processing Sold Products", "value": 0.05000, "unit": "kgCO2e/unit", "source": "Ecoinvent 3.9", "version": "3.9", "tier": 3},
        "cat11": {"label": "11. Use of Sold Products", "value": 0.36700, "unit": "kgCO2e/kWh", "source": "eGRID 2023", "version": "2023.1", "tier": 3},
        "cat12": {"label": "12. End-of-Life Treatment", "value": 21.30000, "unit": "kgCO2e/tonne", "source": "DEFRA 2024", "version": "2024.1", "tier": 3},
        "cat13": {"label": "13. Downstream Leased Assets", "value": 0.18316, "unit": "kgCO2e/kWh", "source": "DEFRA 2024", "version": "2024.1", "tier": 2},
        "cat14": {"label": "14. Franchises", "value": 0.43600, "unit": "kgCO2e/$", "source": "Proxy", "version": "1.0", "tier": 3},
        "cat15": {"label": "15. Investments", "value": 0.30000, "unit": "kgCO2e/$", "source": "PCAF", "version": "2023.1", "tier": 3},
    },
    "scope3_spend": {
        "cat1": {"label": "1. Purchased Goods & Services", "value": 0.42000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat2": {"label": "2. Capital Goods", "value": 0.38000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat3": {"label": "3. Fuel & Energy Activities", "value": 0.05000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat4": {"label": "4. Upstream Transport", "value": 0.20000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat5": {"label": "5. Waste Generated", "value": 0.15000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat6": {"label": "6. Business Travel", "value": 0.25000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat7": {"label": "7. Employee Commuting", "value": 0.10000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat8": {"label": "8. Upstream Leased Assets", "value": 0.30000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat9": {"label": "9. Downstream Transport", "value": 0.20000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat10": {"label": "10. Processing Sold Products", "value": 0.28000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat11": {"label": "11. Use of Sold Products", "value": 0.33000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat12": {"label": "12. End-of-Life Treatment", "value": 0.15000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat13": {"label": "13. Downstream Leased Assets", "value": 0.30000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat14": {"label": "14. Franchises", "value": 0.43600, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
        "cat15": {"label": "15. Investments", "value": 0.30000, "unit": "kgCO2e/$", "source": "USEEIO v2.1", "version": "2023.1", "tier": 3},
    }
}

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class FacilityItem(BaseModel):
    id: str
    name: str
    region: Optional[str] = None
    grid_region: Optional[str] = "global"

class StationaryItem(BaseModel):
    id: Optional[str] = None
    facility: Optional[str] = None
    fuel: str
    qty: float = Field(default=0.0, ge=0)
    unit: Optional[str] = "kWh_gross"

class MobileItem(BaseModel):
    id: Optional[str] = None
    facility: Optional[str] = None
    method: str = "fuel"  # 'fuel' or 'distance'
    fueltype: str
    qty: float = Field(default=0.0, ge=0)
    unit: Optional[str] = "L"

class Scope2LbItem(BaseModel):
    id: Optional[str] = None
    facility: Optional[str] = None
    region: str = "IN"
    kwh: float = Field(default=0.0, ge=0)
    year: Optional[int] = 2024

class Scope2MbItem(BaseModel):
    id: Optional[str] = None
    facility: Optional[str] = None
    instrument: str = "residual"  # 'eac', 'rec', 'ppa', 'supplier', 'residual'
    kwh: float = Field(default=0.0, ge=0)
    efOverride: Optional[float] = 0.0

class Scope3Item(BaseModel):
    id: Optional[str] = None
    cat: str
    method: str = "spend_based"  # 'spend_based' or 'activity_based'
    value: float = Field(default=0.0, ge=0)
    unit: Optional[str] = "$"

class GhgCalculationRequest(BaseModel):
    stationary: List[StationaryItem] = []
    mobile: List[MobileItem] = []
    s2lb: List[Scope2LbItem] = []
    s2mb: List[Scope2MbItem] = []
    s3: List[Scope3Item] = []
    facilities: List[FacilityItem] = []

# -------------------------------------------------------------
# API ROUTES
# -------------------------------------------------------------
@router.get("/factors")
def get_factor_library():
    """Return the authoritative corporate GHG factor library"""
    return EF_LIBRARY

@router.post("/calculate")
def calculate_corporate_emissions(payload: GhgCalculationRequest):
    """
    Calculate Scope 1, Scope 2 (Location-Based and Market-Based), and Scope 3 emissions
    with complete audit formula lineage and facility spatial attribution.
    """
    fac_map = {f.id: f.name for f in payload.facilities}
    lineage = []

    # 1. Scope 1 Stationary
    s1_stationary_kg = 0.0
    for r in payload.stationary:
        ef = EF_LIBRARY["stationary"].get(r.fuel, EF_LIBRARY["stationary"]["natural_gas"])
        co2e_kg = r.qty * ef["value"]
        s1_stationary_kg += co2e_kg
        fac_name = fac_map.get(r.facility, r.facility or "Company-wide")
        lineage.append({
            "scope": "1",
            "category": "stationary_combustion",
            "method": "activity_based",
            "facility_id": r.facility,
            "facility_name": fac_name,
            "activity_value": r.qty,
            "activity_unit": r.unit or ef["unit"],
            "ef_value": ef["value"],
            "ef_unit": ef["unit"],
            "ef_source": ef["source"],
            "ef_version": ef["version"],
            "ef_tier": ef["tier"],
            "co2e_kg": round(co2e_kg, 4),
            "co2e_tonnes": round(co2e_kg / 1000.0, 4),
            "formula_applied": f"{r.qty} {r.unit} × {ef['value']} {ef['unit']} = {round(co2e_kg, 3)} kgCO2e"
        })

    # 2. Scope 1 Mobile
    s1_mobile_kg = 0.0
    for r in payload.mobile:
        is_fuel = r.method == "fuel"
        if is_fuel:
            ef = EF_LIBRARY["mobile_fuel"].get(r.fueltype, EF_LIBRARY["mobile_fuel"]["diesel"])
        else:
            ef = EF_LIBRARY["mobile_distance"].get(r.fueltype, EF_LIBRARY["mobile_distance"]["car_avg"])
        co2e_kg = r.qty * ef["value"]
        s1_mobile_kg += co2e_kg
        fac_name = fac_map.get(r.facility, r.facility or "Company-wide")
        lineage.append({
            "scope": "1",
            "category": "mobile_combustion",
            "method": "activity_based (fuel)" if is_fuel else "activity_based (distance Tier 3)",
            "facility_id": r.facility,
            "facility_name": fac_name,
            "activity_value": r.qty,
            "activity_unit": r.unit or ("L" if is_fuel else "km"),
            "ef_value": ef["value"],
            "ef_unit": ef["unit"],
            "ef_source": ef["source"],
            "ef_version": ef["version"],
            "ef_tier": ef["tier"],
            "co2e_kg": round(co2e_kg, 4),
            "co2e_tonnes": round(co2e_kg / 1000.0, 4),
            "formula_applied": f"{r.qty} {r.unit} × {ef['value']} {ef['unit']} = {round(co2e_kg, 3)} kgCO2e"
        })

    scope1_total_kg = s1_stationary_kg + s1_mobile_kg

    # 3. Scope 2 Location-Based
    scope2lb_kg = 0.0
    for r in payload.s2lb:
        ef = EF_LIBRARY["grid_location"].get(r.region, EF_LIBRARY["grid_location"]["global"])
        co2e_kg = r.kwh * ef["value"]
        scope2lb_kg += co2e_kg
        fac_name = fac_map.get(r.facility, r.facility or "Company-wide")
        lineage.append({
            "scope": "2",
            "category": "location_based",
            "method": "grid_average",
            "facility_id": r.facility,
            "facility_name": fac_name,
            "activity_value": r.kwh,
            "activity_unit": "kWh",
            "ef_value": ef["value"],
            "ef_unit": ef["unit"],
            "ef_source": ef["source"],
            "ef_version": ef["version"],
            "ef_tier": ef["tier"],
            "co2e_kg": round(co2e_kg, 4),
            "co2e_tonnes": round(co2e_kg / 1000.0, 4),
            "formula_applied": f"{r.kwh} kWh × {ef['value']} {ef['unit']} = {round(co2e_kg, 3)} kgCO2e"
        })

    # 4. Scope 2 Market-Based
    scope2mb_kg = 0.0
    for r in payload.s2mb:
        instrument = r.instrument.lower()
        if instrument in ["eac", "rec"]:
            ef_val = r.efOverride or 0.0
            ef_obj = {"value": ef_val, "unit": "kgCO2e/kWh", "source": "EAC/REC Attested", "version": "2024", "tier": 1}
        elif instrument == "ppa":
            ef_val = r.efOverride or 0.0
            ef_obj = {"value": ef_val, "unit": "kgCO2e/kWh", "source": "Contractual PPA", "version": "2024", "tier": 1}
        elif instrument == "supplier":
            ef_val = r.efOverride or 0.0
            ef_obj = {"value": ef_val, "unit": "kgCO2e/kWh", "source": "Supplier Tariff Disclosure", "version": "2024", "tier": 1}
        else:
            ef_obj = EF_LIBRARY["residual_mix"]["EU"]
            ef_val = ef_obj["value"]

        co2e_kg = r.kwh * ef_val
        scope2mb_kg += co2e_kg
        fac_name = fac_map.get(r.facility, r.facility or "Company-wide")
        lineage.append({
            "scope": "2",
            "category": "market_based",
            "method": f"contractual_{instrument}",
            "facility_id": r.facility,
            "facility_name": fac_name,
            "activity_value": r.kwh,
            "activity_unit": "kWh",
            "ef_value": ef_obj["value"],
            "ef_unit": ef_obj["unit"],
            "ef_source": ef_obj["source"],
            "ef_version": ef_obj["version"],
            "ef_tier": ef_obj["tier"],
            "co2e_kg": round(co2e_kg, 4),
            "co2e_tonnes": round(co2e_kg / 1000.0, 4),
            "formula_applied": f"{r.kwh} kWh × {ef_obj['value']} {ef_obj['unit']} = {round(co2e_kg, 3)} kgCO2e"
        })

    # 5. Scope 3 Categories 1–15
    scope3_kg = 0.0
    for r in payload.s3:
        is_spend = r.method == "spend_based"
        lib_key = "scope3_spend" if is_spend else "scope3_activity"
        ef = EF_LIBRARY[lib_key].get(r.cat, EF_LIBRARY[lib_key]["cat1"])
        co2e_kg = r.value * ef["value"]
        scope3_kg += co2e_kg
        lineage.append({
            "scope": "3",
            "category": r.cat,
            "method": "spend_based" if is_spend else "activity_based",
            "facility_id": None,
            "facility_name": "Value Chain",
            "activity_value": r.value,
            "activity_unit": r.unit or ("$" if is_spend else "units"),
            "ef_value": ef["value"],
            "ef_unit": ef["unit"],
            "ef_source": ef["source"],
            "ef_version": ef["version"],
            "ef_tier": ef["tier"],
            "co2e_kg": round(co2e_kg, 4),
            "co2e_tonnes": round(co2e_kg / 1000.0, 4),
            "formula_applied": f"{r.value} {r.unit} × {ef['value']} {ef['unit']} = {round(co2e_kg, 3)} kgCO2e"
        })

    # Facility Breakdown
    facility_breakdown = {}
    for item in lineage:
        if item["scope"] == "3":
            continue
        fname = item["facility_name"]
        if fname not in facility_breakdown:
            facility_breakdown[fname] = {"s1": 0.0, "s2lb": 0.0, "s2mb": 0.0, "total_lb": 0.0, "total_mb": 0.0}
        
        t = item["co2e_tonnes"]
        if item["scope"] == "1":
            facility_breakdown[fname]["s1"] += t
        elif item["scope"] == "2" and item["category"] == "location_based":
            facility_breakdown[fname]["s2lb"] += t
        elif item["scope"] == "2" and item["category"] == "market_based":
            facility_breakdown[fname]["s2mb"] += t
        
        facility_breakdown[fname]["total_lb"] = facility_breakdown[fname]["s1"] + facility_breakdown[fname]["s2lb"]
        facility_breakdown[fname]["total_mb"] = facility_breakdown[fname]["s1"] + facility_breakdown[fname]["s2mb"]

    total_lb_kg = scope1_total_kg + scope2lb_kg + scope3_kg
    total_mb_kg = scope1_total_kg + scope2mb_kg + scope3_kg

    return {
        "results_kg": {
            "scope1": round(scope1_total_kg, 3),
            "scope2lb": round(scope2lb_kg, 3),
            "scope2mb": round(scope2mb_kg, 3),
            "scope3": round(scope3_kg, 3),
            "totalLb": round(total_lb_kg, 3),
            "totalMb": round(total_mb_kg, 3)
        },
        "results_tonnes": {
            "scope1": round(scope1_total_kg / 1000.0, 4),
            "scope2lb": round(scope2lb_kg / 1000.0, 4),
            "scope2mb": round(scope2mb_kg / 1000.0, 4),
            "scope3": round(scope3_kg / 1000.0, 4),
            "totalLb": round(total_lb_kg / 1000.0, 4),
            "totalMb": round(total_mb_kg / 1000.0, 4)
        },
        "lineage": lineage,
        "facility_breakdown": facility_breakdown
    }
