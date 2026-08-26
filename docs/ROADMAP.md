# NetZeroCalc: Technical Roadmap (3-Month Evolution)

This document outlines the planned engineering milestones to advance NetZeroCalc from `v0.1.0-alpha` (BOM-to-LCI prototype) to a comprehensive, open-source PCF and supply chain decarbonization platform.

---

## 🗓️ Month 1: Semantic LCI Mapping & Matching Intelligence

- [x] **v0.1.0-alpha Release**: Core BOM workbench, DQR Pedigree Matrix, BRSR Core export, openLCA JSON-LD bridge.
- [ ] **Fuzzy String & Levenshtein Matching**: Auto-suggest top 3 background LCI processes for any uploaded BOM item based on token similarity and material class keywords.
- [ ] **UNSPSC / HS Code Classification**: Map Bill of Materials items to standard commodity codes (HS 6-digit & UNSPSC) for automated Scope 3 Category 1 spend-based and hybrid activity matching.
- [ ] **Expanded Open Database Connectors**: Add direct API integrations with the US EPA Supply Chain GHG Emission Factors and Climate Trace industrial assets.

---

## 🗓️ Month 2: Multi-Criteria Life Cycle Impact Assessment (LCIA)

- [ ] **Midpoint Impact Categories**: Expand beyond Global Warming Potential (GWP100) to include:
  - Water Consumption / Water Depletion ($m^3$)
  - Cumulative Energy Demand (CED - Renewable vs Non-Renewable MJ)
  - Abiotic Resource Depletion (ADP elements/fossil kg Sb eq)
- [ ] **Chemical & Material Synonyms Dictionary**: Integrate PubChem / CAS Registry number lookups to automatically resolve proprietary plastic resins and alloys to fundamental LCA processes.
- [ ] **Enhanced Pedigree Uncertainty Propagation**: Implement Monte Carlo simulation to compute 95% confidence intervals on product carbon footprints based on DQR pedigree vectors.

---

## 🗓️ Month 3: Enterprise BYOL & Supply Chain Portal

- [ ] **Bring-Your-Own-License (BYOL) ecoinvent Parser**: Secure client-side parser to ingest official ecoinvent 3.10+ EcoSpold2 / JSON-LD datasets without storing proprietary data in cloud storage.
- [ ] **Supplier Primary Data Request Generator**: Automatically generate standardized Excel / Web forms to request Tier 1 supplier emission factor disclosures for high-uncertainty BOM items ($DQR > 3.5$).
- [ ] **Automated EPD (Environmental Product Declaration) Formatting**: Pre-fill ISO 14025 / EN 15804 compliant EPD background report templates.
- [ ] **Multi-BOM Comparative LCA**: Side-by-side product iteration comparisons (e.g. Design Iteration A vs Design Iteration B) with cradle-to-gate impact deltas.

---

*Contributions, feedback, and issue discussions are welcomed on [GitHub](https://github.com/arunachalamvenkatachalapathy-dev/e-credits).*
