# Deployment Files — Placement Instructions

Five files, five exact destinations. Paste each into Antigravity's file
editor at the path shown, or drag-and-drop through its file browser into
the matching folder — either works the same.

| File (attached) | Exact destination path in repo | Notes |
|---|---|---|
| `render.yaml` | `render.yaml` (repo root, same level as `docker-compose.yml`) | Render auto-detects this file when you create a Blueprint pointing at your repo |
| `netlify.toml` | `netlify.toml` (repo root) | Netlify auto-detects this on deploy |
| `_redirects` | `frontend/public/_redirects` | **The `public/` folder doesn't exist yet in `frontend/` — create it.** Vite copies everything in `public/` into the build output automatically. |
| `frontend.env.example` | `frontend/.env.example` | Rename on paste — drop the `frontend.` prefix, it's just there so the two example files don't collide in this file listing |
| `backend.env.production.example` | `backend/.env.production.example` | Same — rename on paste, drop the `backend.` prefix |

After placing all five, your repo structure additions look like:
```
e-credits/
├── render.yaml                          <- new
├── netlify.toml                         <- new
├── .env.example                         <- already existed, unchanged
├── backend/
│   ├── .env.production.example          <- new
│   └── ...
└── frontend/
    ├── public/                          <- new folder
    │   └── _redirects                   <- new
    ├── .env.example                     <- new
    └── ...
```

---

## What to do after placing the files

### 1. Commit and push
```bash
git add render.yaml netlify.toml frontend/public/_redirects frontend/.env.example backend/.env.production.example
git commit -m "Add Netlify + Render deployment config"
git push origin main
```

### 2. Create the Render Blueprint (backend + database, both from render.yaml)
1. Go to Render → **New → Blueprint**
2. Connect the `e-credits` repo
3. Render reads `render.yaml` automatically and shows you the database +
   web service it's about to create — confirm and deploy
4. Once live, open the **Shell** tab on the web service and run:
   ```bash
   python3 seed.py
   python3 seed_india_ghg.py
   ```
5. Copy the service's URL (e.g. `https://e-credits-api.onrender.com`)

### 3. Deploy the frontend on Netlify
1. Go to Netlify → **Add new site → Import an existing project → GitHub**
2. Select `e-credits` — Netlify reads `netlify.toml` automatically, no
   manual build settings needed
3. Add one environment variable before deploying: `VITE_API_URL` = the
   Render URL from step 2.5
4. Deploy — copy the resulting Netlify URL

### 4. Close the loop
Back in Render, edit the `CORS_ORIGINS` environment variable to your real
Netlify URL (the `render.yaml` default is `localhost` only, since it can't
know your Netlify URL before that site exists). Save — Render redeploys
automatically.

### 5. Verify for real
Use the checklist in `DEPLOYMENT-SETUP.md` (Part 3) — specifically the
refresh-and-confirm-persistence step, since that's the one that actually
proves the backend and Postgres are wired correctly rather than just that
the page renders.
