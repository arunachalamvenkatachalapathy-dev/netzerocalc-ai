from dataclasses import dataclass


@dataclass(frozen=True)
class UnitConversion:
    quantity: float
    unit: str
    factor: float


ALIASES = {
    "kilogram": "kg",
    "kilograms": "kg",
    "kgs": "kg",
    "pound": "lb",
    "pounds": "lb",
    "gram": "g",
    "grams": "g",
    "metric ton": "t",
    "tonne": "t",
    "tonnes": "t",
    "kwh": "kWh",
    "mj": "MJ",
    "kj": "kJ",
    "kilometer": "km",
    "kilometers": "km",
    "mile": "mi",
    "miles": "mi",
    "tonne-km": "tkm",
    "ton-km": "tkm",
    "ton-mile": "ton-mile",
    # --- added for India_GHG_Factors source ---
    "liter": "L",
    "liters": "L",
    "litre": "L",
    "litres": "L",
    "l": "L",
    "cubic meter": "m3",
    "cubic meters": "m3",
    "cubic metre": "m3",
    "cubic metres": "m3",
    "m³": "m3",
    "scm": "m3",
    "passenger-km": "p-km",
    "pkm": "p-km",
    "p_km": "p-km",
    "nights": "night",
    "units": "unit",
    "franchises": "franchise",
    "units sold": "unit sold",
    "inr invested": "INR invested",
    "tco2e reported": "tCO2e reported",
}

TO_BASE = {
    "kg": ("mass", 1.0),
    "lb": ("mass", 0.45359237),
    "g": ("mass", 0.001),
    "t": ("mass", 1000.0),
    "oz": ("mass", 0.028349523125),
    "kWh": ("energy", 3.6),
    "MJ": ("energy", 1.0),
    "kJ": ("energy", 0.001),
    "km": ("distance", 1.0),
    "mi": ("distance", 1.609344),
    "tkm": ("transport", 1.0),
    "ton-mile": ("transport", 1.459972),
    "unit": ("count-unit", 1.0),
    # --- added for India_GHG_Factors source ---
    "L": ("volume", 1.0),
    "m3": ("volume", 1000.0),  # 1 m3 = 1000 L; scm treated as equivalent to m3
    "p-km": ("pax-distance", 1.0),
    "INR": ("spend-inr", 1.0),
    "night": ("count-night", 1.0),
    "franchise": ("count-franchise", 1.0),
    "unit sold": ("count-unitsold", 1.0),
    "INR invested": ("spend-invested", 1.0),
    "tCO2e reported": ("count-tco2e", 1.0),
}


def normalize_unit(unit: str) -> str:
    cleaned = unit.strip()
    return ALIASES.get(cleaned.lower(), cleaned)


def convert_unit(quantity: float, source_unit: str, target_unit: str) -> UnitConversion:
    source = normalize_unit(source_unit)
    target = normalize_unit(target_unit)
    if source not in TO_BASE:
        raise ValueError(f"Unrecognized source unit: {source_unit}")
    if target not in TO_BASE:
        raise ValueError(f"Unrecognized target unit: {target_unit}")
    source_dim, source_factor = TO_BASE[source]
    target_dim, target_factor = TO_BASE[target]
    if source_dim != target_dim:
        raise ValueError(f"Cannot auto-convert {source} to {target}; dimensions differ")
    factor = source_factor / target_factor
    return UnitConversion(quantity=quantity * factor, unit=target, factor=factor)

