"""
cbam_tools.py

Compares a BOM line's ALREADY-COMPUTED emission factor (from bom_service.py /
LciProcess.emission_factor) against EU CBAM benchmark values. This module
does no LCA calculation of its own -- it only looks up and compares numbers
that bom_service.py already produced deterministically.

Data source: backend/data/cbam_benchmarks.json -- an exact, programmatic
port of src/data/cbamBenchmarks.js (13 rows, all 5 CBAM-covered sectors:
Aluminium, Iron & Steel, Cement, Fertilisers, Hydrogen). This file is the
SAME data the frontend's CbamView.jsx renders. Keep it that way: if the
frontend dataset is ever updated, re-run the conversion rather than editing
this JSON by hand, or the two will drift and the agent's answers will
disagree with what the UI shows.
"""

import json
from pathlib import Path
from difflib import SequenceMatcher

_BENCHMARKS_PATH = Path(__file__).resolve().parent.parent / "data" / "cbam_benchmarks.json"

with open(_BENCHMARKS_PATH, "r", encoding="utf-8") as f:
    CBAM_BENCHMARKS: list[dict] = json.load(f)


def _best_product_match(sector: str, product_hint: str | None) -> dict | None:
    """
    Find the CBAM benchmark row for a sector, optionally narrowed by a
    product name hint (fuzzy string match on productName / productionRoute).
    Returns None if the sector isn't covered at all -- callers must treat
    that as 'no CBAM exposure data available', never estimate one.
    """
    sector_rows = [r for r in CBAM_BENCHMARKS if r["sector"].lower() == sector.lower()]
    if not sector_rows:
        return None
    if not product_hint:
        return sector_rows[0]

    def score(row):
        a = SequenceMatcher(None, product_hint.lower(), row["productName"].lower()).ratio()
        b = SequenceMatcher(None, product_hint.lower(), row["productionRoute"].lower()).ratio()
        return max(a, b)

    return max(sector_rows, key=score)


def compare_to_cbam_benchmark(
    sector: str,
    computed_emission_factor_kg_co2e_per_unit: float,
    quantity_tonnes: float,
    product_hint: str | None = None,
) -> dict:
    """
    AGENT TOOL. Compares a real, already-computed emission factor against
    the matching CBAM benchmark row.

    Args:
        sector: one of CBAM_SECTORS in the ported JSON -- "Aluminium",
            "Iron & Steel", "Cement", "Fertilisers", "Hydrogen".
        computed_emission_factor_kg_co2e_per_unit: the matched_emission_factor
            already produced by bom_service.perform_bom_match -- this
            function does not compute it, only compares it.
        quantity_tonnes: converted quantity in tonnes, for the euro-exposure
            estimate.
        product_hint: optional raw_bom_input text, used only to pick the
            closest specific CBAM product row within the sector.

    Returns a dict with grounded, sourced numbers -- every field traces back
    to either the caller's own computed factor or a specific ported
    regulation row. If the sector isn't covered, returns
    {"covered": False, ...} rather than a fabricated comparison.
    """
    row = _best_product_match(sector, product_hint)
    if row is None:
        return {
            "covered": False,
            "reason": f"'{sector}' is not in the ported CBAM benchmark set "
                      f"(covered sectors: Aluminium, Iron & Steel, Cement, "
                      f"Fertilisers, Hydrogen).",
        }

    # Benchmarks are tCO2e/tonne.
    # Note: 1 kgCO2e/kg is mathematically equal to 1 tCO2e/tonne (1000 kgCO2e / 1000 kg = 1 tCO2e/tonne).
    computed_t_per_t = float(computed_emission_factor_kg_co2e_per_unit)

    gap_vs_eu_default = row["euDefaultBenchmark"] - computed_t_per_t
    gap_vs_best_in_class = computed_t_per_t - row["euEtsBestInClass"]

    return {
        "covered": True,
        "matched_cbam_product": row["productName"],
        "cn_code": row["cnCode"],
        "production_route": row["productionRoute"],
        "your_computed_tco2e_per_tonne": round(computed_t_per_t, 4),
        "eu_default_benchmark_tco2e_per_tonne": row["euDefaultBenchmark"],
        "eu_ets_best_in_class_tco2e_per_tonne": row["euEtsBestInClass"],
        "eu_direct_ets_benchmark_tco2e_per_tonne": row["directBenchmark"],
        "verified_data_advantage_tco2e_per_tonne": round(gap_vs_eu_default, 4),
        # Positive = your verified number is better than the EU penalty default,
        # i.e. reporting your real number (instead of letting the importer
        "gap_to_best_in_class_tco2e_per_tonne": round(gap_vs_best_in_class, 4),
        "total_estimated_tco2e": round(computed_t_per_t * float(quantity_tonnes), 3),
        "regulation_reference": row["regulationRef"],
        "notes": row["notes"],
    }


def calculate_cbam_tax_financial_liability(
    quantity_tonnes: float,
    emission_factor_tco2e_per_tonne: float,
    sector: str = "Aluminium",
    eu_ets_carbon_price_eur: float = 85.00,
    carbon_price_paid_abroad_eur: float = 0.00,
    phase_in_year: int = 2026
) -> dict:
    """
    AGENT TOOL. Calculates the estimated EU CBAM financial certificate liability in EUR (€).
    Uses official EU Regulation 2023/956 phase-in free allowance rules.
    """
    total_embedded_tco2e = float(quantity_tonnes) * float(emission_factor_tco2e_per_tonne)
    
    free_allowance_rates = {
        2026: 0.975,
        2027: 0.950,
        2028: 0.900,
        2029: 0.775,
        2030: 0.515,
        2031: 0.390,
        2032: 0.265,
        2033: 0.140,
        2034: 0.000
    }
    
    free_rate = free_allowance_rates.get(phase_in_year, 0.975 if phase_in_year <= 2026 else 0.0)
    payable_ratio = 1.0 - free_rate
    
    net_taxable_tco2e = max(0.0, total_embedded_tco2e * payable_ratio)
    gross_liability_eur = net_taxable_tco2e * float(eu_ets_carbon_price_eur)
    abroad_credit_eur = float(quantity_tonnes) * float(carbon_price_paid_abroad_eur)
    final_cbam_tax_eur = max(0.0, gross_liability_eur - abroad_credit_eur)
    full_tax_post_2034_eur = total_embedded_tco2e * float(eu_ets_carbon_price_eur)
    
    return {
        "sector": sector,
        "quantity_tonnes": round(quantity_tonnes, 2),
        "emission_factor_tco2e_per_tonne": round(emission_factor_tco2e_per_tonne, 4),
        "total_embedded_tco2e": round(total_embedded_tco2e, 3),
        "phase_in_year": phase_in_year,
        "free_allowance_percentage": f"{free_rate * 100:.1f}%",
        "taxable_cbam_tco2e": round(net_taxable_tco2e, 3),
        "eu_ets_carbon_price_eur_per_tonne": float(eu_ets_carbon_price_eur),
        "estimated_cbam_tax_2026_phase_in_eur": round(final_cbam_tax_eur, 2),
        "estimated_cbam_tax_full_post2034_eur": round(full_tax_post_2034_eur, 2),
        "currency": "EUR (€)",
        "regulation_reference": "EU CBAM Regulation 2023/956 & EU ETS Directive 2003/87/EC"
    }
