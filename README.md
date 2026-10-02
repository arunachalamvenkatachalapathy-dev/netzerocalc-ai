# NetZeroCalc

**Open-source carbon footprint calculator for products and companies.** Map a bill of materials (BOM) to life cycle inventory (LCI) emission factors, track Scope 1, 2 and 3 greenhouse gas (GHG) emissions, score data quality, and export a product carbon footprint (PCF) or a GHG declaration. Global emission factor sets (IPCC, DEFRA, US EPA, industry bodies) with deep India coverage (CEA grid, India GHG Program).

**Live demo:** https://netzerocalc-ai.vercel.app/ (also on [GitHub Pages](https://arunachalamvenkatachalapathy-dev.github.io/netzerocalc-ai/))

> Early alpha, screening-level. Results are estimates for learning, prototyping and early benchmarking. They are not third-party verified and do not replace ISO 14044 / ISO 14064-3 assurance or a practitioner review.

Keywords: carbon footprint calculator, GHG Protocol, Scope 1 2 3, PCF, LCA, LCI, emission factors, CBAM, BRSR Core, ISO 14064, openLCA, DEFRA, IPCC, India, open source.

## Screenshots

Sample BOM loaded in the guest workspace (the "Load Sample Demo" button).

![Dashboard with Scope 1, 2 and 3 totals](https://gxzrfngjypmijvfhtjiv.supabase.co/storage/v1/object/public/readme-assets/3-dashboard.png)

![BOM workbench with matched emission factors](https://gxzrfngjypmijvfhtjiv.supabase.co/storage/v1/object/public/readme-assets/4-workbench.png)

## What it does

```
BOM  ->  LCI matching  ->  data quality score  ->  What-if scenarios  ->  Export
(item, qty, unit)  (global + India factors)  (pedigree matrix)        (PDF, openLCA, BRSR Core, CSV/JSON)
```

1. **Import** a BOM from CSV, Excel or Google Sheets, or type items in.
2. **Match** each line to an emission factor. Every factor shows its publisher, year and source link. Factors that are not traced to a specific published table are marked **Illustrative**.
3. **Score data quality** with the 5-indicator pedigree matrix (reliability, completeness, temporal, geographical, technological).
4. **Simulate** reduction levers such as recycled aluminium or green electricity and see the footprint change.
5. **Export** a 3-page PDF declaration, openLCA JSON-LD, a BRSR Core product-footprint file, or CSV/JSON.

## Try it in 60 seconds

1. Open the live demo and choose "Try it without an account" (data stays in your browser).
2. In the BOM Workbench, click "Load sample data", or import [`samples/demo-bom.csv`](samples/demo-bom.csv).
3. Open LCI Factor Search to see each factor's source.
4. Open the DQR dashboard, then PCF Declaration to preview the PDF.

## Modules

| Module | What it covers |
| :--- | :--- |
| BOM Workbench | Line items, factor matching, scope split, totals |
| LCI factor search | Searchable global and India factors with source and year |
| DQR dashboard | Pedigree-matrix data quality scoring |
| What-If simulator | Reduction scenarios against the baseline |
| PCF declaration | PDF declaration, openLCA and BRSR Core export |
| GHG master sheet | Spreadsheet-style Scope 1 / 2 / 3 inventory |
| GHG ledger | Inventory by facility and reporting period, factor registry with overrides |
| CBAM | EU CBAM default benchmark values (iron, steel, aluminium, cement, hydrogen, fertilisers) |
| Carbon cost | Cost of emissions under carbon price scenarios |
| Regulations reference | A reference list of reporting rules by jurisdiction, with links to official sources |

## Emission factor sources

Factors live in `src/data/`. Each entry carries a publisher, year and link; the status is either published or illustrative.

- UK Government GHG Conversion Factors (DEFRA / DESNZ)
- India Central Electricity Authority grid data and the India GHG Program
- US EPA eGRID and GHG Emission Factors Hub
- IPCC AR6 and 2006 Guidelines
- Industry bodies for materials (International Aluminium Institute, World Steel Association, PlasticsEurope, and others)
- EU CBAM default values (Implementing Regulations (EU) 2021/447 and 2024/873)

The data is static, with no automatic update path. Check the year and status on each factor before relying on it, and replace illustrative values with supplier or verified data for anything that matters. See [docs/EMISSION_FACTOR_GOVERNANCE.md](docs/EMISSION_FACTOR_GOVERNANCE.md).

## Tech stack

- Frontend: React 19, Vite, Tailwind CSS (compiled), Recharts, FortuneSheet, `@react-pdf/renderer`. Tabs and heavy libraries load on demand.
- Parsing and export: PapaParse, SheetJS, custom BRSR Core and openLCA serialisers.
- Backend: Supabase (Postgres with row level security, Auth with email and Google sign-in, one Edge Function for the AI copilot). Schema in `supabase/migrations/`, function in `supabase/functions/ai-chat/`.
- Tests: Bun test suite in `tests/ghg`, run in CI on every push.

## Run locally

```bash
git clone https://github.com/arunachalamvenkatachalapathy-dev/netzerocalc-ai.git
cd netzerocalc-ai
cp .env.example .env     # only needed for accounts and cloud sync
bun install              # or npm install
bun run dev              # http://localhost:5173
bun test                 # run the test suite
```

The app works without any backend: use "Try it without an account" and data stays in your browser. To use accounts, cloud sync and the AI copilot, create a Supabase project, apply `supabase/migrations/`, deploy `supabase/functions/ai-chat`, and set the keys in `.env`.

## API and MCP

Signed-in users can create a personal token in the app (Tools & Registry > API & MCP). The token only sees your own projects. An MCP server (Streamable HTTP) and a small REST API run as a Supabase Edge Function (`supabase/functions/api`).

MCP tools: `list_projects`, `get_project_summary`, `search_emission_factors`, `add_bom_items`. Lines added through the API are marked unapproved and high risk until you review them in the app.

```json
{ "mcpServers": { "netzerocalc": { "type": "http", "url": "https://gxzrfngjypmijvfhtjiv.supabase.co/functions/v1/api/mcp", "headers": { "Authorization": "Bearer YOUR_TOKEN" } } } }
```

REST: `GET /functions/v1/api/factors?q=diesel&region=IN`, `GET /functions/v1/api/projects`, `GET /functions/v1/api/projects/{id}/summary`. The factor library inside the function is a snapshot and must be regenerated when `src/data/globalLciDatabase.js` changes.

## Known limitations

- **Screening tool.** Some calculations are simplified. It is not an assured reporting system.
- **Static factors.** No automatic updates. Several material factors are rounded industry averages marked Illustrative.
- **Guest mode** keeps data in your browser only. Signed-in data syncs to Supabase with row level security (your own rows only).
- **API and MCP are early alpha.** Four tools (list projects, project summary, factor search, add BOM lines). No report generation or PDF export over the API yet, and tokens have no scopes or expiry. See [API and MCP](#api-and-mcp).
- **Alpha.** Expect rough edges and changes between versions.

## Documentation

- [Emission factor governance](docs/EMISSION_FACTOR_GOVERNANCE.md)
- [Roadmap](docs/ROADMAP.md)
- [Production plan](docs/PRODUCTION_PLAN.md)
- [Privacy](PRIVACY.md)

## Disclaimer

Independent project. Not affiliated with or endorsed by the European Commission, SEBI, ISO, the GHG Protocol or any data publisher named above. Outputs must be reviewed by a qualified practitioner before use in any regulatory filing.

## License

[MIT](LICENSE). Author: [Arunachalam Venkatachalapathy](https://github.com/arunachalamvenkatachalapathy-dev)
