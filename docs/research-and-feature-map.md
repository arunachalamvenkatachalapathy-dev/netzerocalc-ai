# Research And Feature Map

## Similar Products Reviewed

- One Click LCA: AI BOM import, Excel import, manual mapping, class assignment, ignored rows, source row traceability, comments/audit trail, quantity/unit normalization, assembly splitting, and review-before-import workflows.
- SimaPro Cloud/Synergy: Excel import, import feedback, comments/tags, data mappings with producing process and geography details, library navigation, locked/finalized model restrictions, and model/process input forms.
- Ecochain Mobius: product footprint workflows for non-expert users, scenario comparison, hotspot identification, geography-aware modeling, and LCI database access.
- CarbonCloud: supplier data capture, product/activity data inputs, automated mapping, supplier collaboration, ingredient/product database, hotspots, and reduction-opportunity workflows.
- openLCA Nexus: dataset discovery using filters such as product, sector/category, location/geography, price/license, and year of validity.

## Essential Inputs Added

- Manual BOM entry: description, quantity, unit, material class, supplier/source, life-cycle module, notes/assumptions.
- File import: CSV in the standalone preview; CSV/XLSX in the FastAPI app.
- Assistant file upload: CSV, TXT, JSON, Markdown for context-aware review help.
- Dataset selectors: source database, geography, system model, required matching unit.
- Review controls: approve, override with notes, remove/reject, row expansion.
- DQR controls and display: technological, geographical, temporal scores plus risk level.
- Audit evidence: reasoning, data-gap warning, proxy substitutions, review notes.
- Export gate: export only after all rows are approved, overridden, or removed.

## Dataset Strategy

- USLCI: open/public U.S. materials, fuels, transport, chemicals, plastics, glass, paper, and related processes.
- ELCD: free/training-compatible background data in common LCA workflows.
- Agribalyse Core: free agrifood core release with ecoinvent background removed.
- EXIOBASE: MRIO/scope-3 screening; commercial use needs license review.
- openLCA Nexus: discovery repository for free and paid datasets.
- ecoinvent: BYOL private tenant import only; no shared hosted index.

## Production Dependencies

- Backend: FastAPI, SQLAlchemy, pandas, openpyxl, passlib, PyJWT, httpx.
- Frontend: React, Vite, Tailwind-ready CSS structure, lucide-react.
- Database path: SQLite for local/demo; PostgreSQL + pgvector schema included for production.
- Deployment: Dockerfiles and docker-compose included.

