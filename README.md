# NetZeroCalc: Open-Source BOM-to-LCI Mapper for Product Carbon Footprints

> ⚠️ **Educational Prototype Notice**: This is an open-source learning and rapid-prototyping workbench for **Bill of Materials (BOM) to Life Cycle Inventory (LCI)** mapping methodology. Computational outputs represent preliminary screening estimates and require qualified practitioner review before use in regulated corporate disclosures. It does not constitute a third-party assurance statement or formal verification under ISO 14044 or ISO 14064-3.

---

## 🎯 What It Does

**NetZeroCalc** maps manufacturing **Bill of Materials (BOM)** line items to standardized **Life Cycle Inventory (LCI)** background processes using transparent semantic matching, data quality scoring, and open factor citations.

It is purpose-built for:
- **ESG & Environmental Engineering Students** learning practical LCA and Product Carbon Footprint (PCF) accounting workflows.
- **Sustainability Practitioners & Interns** assembling rapid cradle-to-gate PCF prototypes without complex proprietary software setup.
- **Manufacturing SMEs & Product Teams** benchmarking product footprints against standard open datasets before investing in enterprise-scale LCA software.

---

## 🔄 End-to-End Workflow

```
[ Upload BOM CSV ] ──> [ Semantic LCI Matcher ] ──> [ DQR Pedigree Rating ] ──> [ Multi-Standard Export ]
 (Item, Qty, Unit)       (DEFRA, CEA, EU CBAM)        (1-5 Pedigree Score)        (CSV, JSON, BRSR, openLCA)
```

1. **Import Activity Data:** Upload manufacturing Bill of Materials (CSV/Excel/Google Sheets) containing component descriptions, physical quantities, and units.
2. **Review Semantic Matches:** Inspect auto-suggested background LCI processes with transparent factor citations, version dates, and geographic boundaries.
3. **Data Quality Rating (DQR):** Evaluate each mapping using the 5-indicator **Pedigree Matrix** (Reliability, Completeness, Temporal, Geographical, and Technological representativeness).
4. **Decarbonization Simulation:** Model material substitution levers (e.g. recycled aluminium, green electricity, bio-based polymers) with real-time delta tracking.
5. **Multi-Format Export:** Export verified mappings to:
   - **BRSR Core PCF Template** (SEBI Principle 6 Product Footprint schema)
   - **openLCA JSON-LD Bridge** (ILCD-compliant exchange package for openLCA import)
   - **Native PDF Declaration** (5-page vector audit summary via `@react-pdf/renderer`)
   - **Structured JSON & CSV** ledger archives

---

## ⚖️ Tool Comparison vs. Commercial LCA Platforms

| Dimension | NetZeroCalc (This Tool) | openLCA | Ecochain | Sphera / GaBi |
| :--- | :---: | :---: | :---: | :---: |
| **Primary Focus** | Rapid BOM-to-LCI Prototyping | Full-Suite LCIA Research | Corporate PCF Portfolios | Enterprise Supply Chain LCA |
| **Licensing / Cost** | **Free & Open-Source (MIT)** | Free (Open Source Desktop) | Commercial SaaS ($$$) | Commercial Enterprise ($$$$) |
| **Platform** | **Modern Web / Cloud Native** | Desktop (Java / Eclipse RCP) | Web SaaS | Desktop / Cloud Hybrid |
| **BOM Semantic Mapping** | ✅ **Built-in Interactive Sheet** | ❌ (Manual Process Building) | ✅ Semi-Automated | ✅ Automated |
| **Pedigree DQR Scoring** | ✅ **Interactive Matrix** | ✅ Yes | ✅ Yes | ✅ Yes |
| **BRSR Core PCF Schema** | ✅ **Direct SEBI Export** | ❌ (Custom Modeling Needed) | ❌ | ❌ |
| **openLCA JSON-LD Export**| ✅ **Native Export Bridge** | ✅ Native Host | ❌ | ❌ |
| **Third-Party Assured** | ❌ *(Screening Prototype)* | ❌ *(User Responsibility)* | ✅ Commercial Certification | ✅ Commercial Certification |

---

## 📊 Open Emission Factor Databases & Citations

NetZeroCalc ships with verified open-access reference datasets and supports Bring-Your-Own-License (BYOL) database integration:

* **UK Government GHG Conversion Factors (DEFRA 2024):** Open government dataset for transport, fuel combustion, and general material lifecycle benchmarks.
* **India Central Electricity Authority (CEA v19/v20) & India GHG Factors v6:** Location-based regional grid mix factors for Indian manufacturing facilities.
* **EU CBAM Benchmark Values:** Official default values established under **Commission Implementing Regulation (EU) 2021/447** and **Implementing Regulation (EU) 2024/873** for iron, steel, aluminium, cement, hydrogen, and fertilizers.
* **BYOL Enterprise LCA Databases:** Clean schema support for private, licensed database instances (e.g. *ecoinvent v3.x*, *GaBi/Sphera*, *USLCI*).

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Tailwind CSS, Lucide Icons, FortuneSheet Canvas Spreadsheet, Recharts Visualization.
* **PDF Vector Engine:** `@react-pdf/renderer` (Generates 100% searchable vector PDFs with zero canvas rasterization).
* **Data Bridges:** PapaParse (CSV), SheetJS/XLSX (Spreadsheet parsing), Custom ILCD/openLCA JSON-LD serialier, BRSR Core PCF generator.
* **Optional Cloud Backend:** Supabase / FastAPI for optional persistent project collaboration.

---

## 🚀 Quick Start (Local Setup)

```bash
# Clone repository
git clone https://github.com/arunachalamvenkatachalapathy-dev/e-credits.git
cd e-credits

# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📜 Regulatory & Disclaimer Notice

*This software is an independent educational tool designed for methodology learning and prototyping. It is not affiliated with, certified by, or endorsed by the European Commission, SEBI, ISO, or the GHG Protocol. Outputs must be verified by a qualified LCA practitioner before use in regulatory filings.*

**Author:** [Arunachalam Venkatachalapathy](https://github.com/arunachalamvenkatachalapathy-dev)  
**License:** [MIT License](LICENSE)
## Authenticated Cloud Run deployment

NetZeroCalc supports Firebase email/password authentication and stores workspaces in user-isolated Firestore paths. The AI Copilot calls Gemini server-side; its key is supplied to Cloud Run through Google Cloud Secret Manager and is never shipped to the browser. See [docs/CLOUD_RUN_FIREBASE_DEPLOYMENT.md](docs/CLOUD_RUN_FIREBASE_DEPLOYMENT.md) for the deployment and verification runbook.
