# NetZeroCalc

Open-source tool that maps a manufacturing Bill of Materials (BOM) to Life Cycle Inventory (LCI) emission factors, scores the data quality, and exports a product carbon footprint (PCF) in BRSR Core and openLCA formats.

**Live demo:** https://netzerocalc-ai.vercel.app/

> Screening-level tool. Results are estimates for learning, prototyping and early benchmarking. They are not third-party verified and are not a substitute for ISO 14044 / ISO 14064-3 assurance or a practitioner-reviewed disclosure.

## What it does

```
BOM CSV  ->  LCI matching  ->  DQR pedigree score  ->  What-if scenarios  ->  Export
(item, qty, unit)  (DEFRA / CEA / CBAM)  (5 indicators)                (BRSR Core, openLCA, PDF, CSV/JSON)
```

1. **Import** a BOM from CSV, Excel or Google Sheets.
2. **Match** each line to a background LCI process. Each match shows its source, vintage and geography so you can accept or change it.
3. **Score data quality** with the 5-indicator pedigree matrix (reliability, completeness, temporal, geographical, technological).
4. **Simulate** reduction levers such as recycled aluminium or green electricity and see the footprint change.
5. **Export** to a BRSR Core product-footprint template, openLCA JSON-LD, a PDF declaration, or CSV/JSON.

## Try it in 60 seconds

1. Open the live demo and start a new project.
2. Import [`samples/demo-bom.csv`](samples/demo-bom.csv). It has four lines: aluminium ingot, polypropylene housing, grid electricity, road freight.
3. Open the matching view and review the suggested factors.
4. Open the DQR dashboard and check the pedigree scores.
5. Export the BRSR Core file.

## Modules

The BOM-to-LCI flow above is the core of the project. The repo also contains these modules, built later and with less polish:

| Module | What it covers |
| :--- | :--- |
| GHG ledger | Scope 1 / 2 / 3 inventory by facility and period |
| SBTi trajectory | Target pathway tracking |
| Carbon cost simulator | Cost of emissions under carbon price scenarios |
| CBAM | EU CBAM default benchmark values for iron, steel, aluminium, cement, hydrogen, fertilisers |
| CSRD | Double materiality assessment, Omnibus / CSDDD view |
| EU regulation navigator | Directory of EU ESG regulations |
| VSME | Voluntary SME sustainability reporting |
| CEO insights | Briefing notes for decision makers |

## Emission factor sources

Factors come from public datasets bundled in `src/data/`:

- UK Government GHG Conversion Factors (DEFRA)
- India Central Electricity Authority grid factors and India GHG factors
- EU CBAM default values (Implementing Regulations (EU) 2021/447 and 2024/873)

The data is static. There is no automatic update path, so check the vintage on each factor before relying on it. See [docs/EMISSION_FACTOR_GOVERNANCE.md](docs/EMISSION_FACTOR_GOVERNANCE.md) for the registry design. Licensed databases (ecoinvent, GaBi) are not included.

## Tech stack

- Frontend: React 19, Vite, Tailwind CSS, Recharts, FortuneSheet, `@react-pdf/renderer`
- Parsing and export: PapaParse, SheetJS, custom BRSR Core and openLCA serialisers
- Backend: FastAPI (`backend/`), SQLite by default
- Auth and storage: Firebase Auth and Firestore (rules in `firestore.rules`)

## Run locally

```bash
git clone https://github.com/arunachalamvenkatachalapathy-dev/netzerocalc-ai.git
cd netzerocalc-ai
cp .env.example .env     # fill in the values you need
npm install
npm run dev              # http://localhost:5173
```

Backend (optional):

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Known limitations

- **Backend migration to Supabase is in progress.** The old Cloud Run backend is offline, so the live demo runs client-side with data in your browser's local storage. There are no accounts, no sync between devices, and the AI copilot does not work there until the migration lands.
- **Tests are not yet run in CI.** Test files are in `tests/ghg` and need Bun. There is no CI check for them yet.
- **The backend is not hardened for real client data.** Several endpoints lack authentication and CORS is open. Treat it as a demo until that is fixed.
- **Emission factors are static** and some modules use simplified methods. This is a screening tool, not an assured reporting system.
- The deploy setup is cluttered (several hosting configs live in the repo).

## Documentation

- [Cloud Run and Firebase deployment](docs/CLOUD_RUN_FIREBASE_DEPLOYMENT.md)
- [Emission factor governance](docs/EMISSION_FACTOR_GOVERNANCE.md)
- [Roadmap](docs/ROADMAP.md)

## Disclaimer

Independent project. Not affiliated with or endorsed by the European Commission, SEBI, ISO or the GHG Protocol. Outputs must be reviewed by a qualified practitioner before use in any regulatory filing.

## License

[MIT](LICENSE). Author: [Arunachalam Venkatachalapathy](https://github.com/arunachalamvenkatachalapathy-dev)
