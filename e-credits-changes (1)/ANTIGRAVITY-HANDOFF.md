# Antigravity Handoff — India GHG Factors Integration

**Read this whole document before touching anything.** This reflects work that
is ALREADY DONE and verified — Antigravity's job here is to place files
correctly, verify them, and finish the remaining gaps listed in Section 3.
This is NOT a "build this from scratch" prompt. Rebuilding what's already
done risks reintroducing bugs that were specifically found and fixed (see
Section 2).

---

## SECTION 1: File placement

Copy each file from the attached `e-credits-changes.zip` to the exact path
below in the repo. Every path is relative to the repo root.

| File in the zip | Destination path in repo |
|---|---|
| `backend/app/models.py` | `backend/app/models.py` (overwrite) |
| `backend/app/units.py` | `backend/app/units.py` (overwrite) |
| `backend/app/matching.py` | `backend/app/matching.py` (overwrite) |
| `backend/app/main.py` | `backend/app/main.py` (overwrite) |
| `backend/seed_india_ghg.py` | `backend/seed_india_ghg.py` (new file) |
| `backend/data/GHG_Calculator_RECTIFIED_v6.xlsx` | `backend/data/GHG_Calculator_RECTIFIED_v6.xlsx` (new file, create the `data/` folder if it doesn't exist) |
| `frontend/src/main.jsx` | `frontend/src/main.jsx` (overwrite) |
| `frontend/src/styles.css` | `frontend/src/styles.css` (overwrite) |

After placing files, run:
```bash
cd backend
pip install -r requirements.txt
rm -f bom_lci.db
python3 seed_india_ghg.py
```
Expected output: `Seeded 60 India_GHG_Factors rows.` followed by a provenance
breakdown (`{'uplifted': 14, 'clean': 39, 'proxy': 1, 'placeholder': 6}`). If
the counts differ, something about the source xlsx or extraction logic
changed — stop and investigate rather than proceeding.

---

## SECTION 2: What's already done and verified (do not redo or "improve" without reason)

Each item below was actually tested, not just written. Details on how, so
Antigravity can re-verify rather than take it on faith:

1. **`LciProcess` schema** now has `emission_factor`, `emission_factor_source`,
   `data_quality_status`. Previously this table could match a BOM line to a
   process description but had no field to store an actual kgCO2e number —
   confirmed via code inspection that `/bom/export` returned no numeric field
   at all before this fix.

2. **`seed_india_ghg.py`** extracts labels/units directly from the
   `GHG_Master_Calculator` sheet's actual formula cells, not hardcoded from
   memory. A bug was found and fixed here: loading the workbook with
   `data_only=True` caused formula cells to return their cached computed
   value instead of the formula text, so the `=VLOOKUP(...)` string match
   silently failed for all 60 keys. Fixed by loading with `data_only=False`.
   Verified: re-running after the fix produced zero extraction warnings and
   correct label/unit pairs, spot-checked against the source sheet.

3. **`units.py`** extended with volume (`L`, `m3`), passenger-distance
   (`p-km`), spend (`INR`), and several count-like trivial units. A bug was
   found and fixed: count-like units (`unit`, `night`, `franchise`, etc.)
   were initially grouped under one shared `"count"` dimension, which would
   have let the converter treat a hotel-night and a generic unit as
   interchangeable. Fixed by giving each its own distinct dimension string.
   Verified via direct calls to `convert_unit()` confirming cross-dimension
   conversions correctly raise `ValueError`.

4. **Unit normalization mismatch, found via live testing, not by inspection**:
   `convert_unit()` returns normalized short forms (e.g. `"L"`), but the
   first version of the seed script stored the raw extracted text (`"Liters"`)
   as `reference_unit`. This meant `retrieve_candidates()`'s exact-match
   filter (`process.reference_unit != unit`) never matched anything — zero
   BOM lines could be matched against this source at all. Fixed by calling
   `normalize_unit()` before storing. Verified via a live `/bom/match` call
   that returned 5 real candidates after the fix (returned 0 before).

5. **Placeholder risk classification bug, found via live testing**:
   `dqr_disambiguate()` in `matching.py` had no awareness of
   `data_quality_status`. A placeholder factor (a real `0.0` because no
   verified data exists yet) was rating `LOW` risk purely because geography/
   temporal/token-overlap scores looked fine — indistinguishable from a
   verified real zero. Fixed by forcing `HIGH` risk whenever
   `data_quality_status == "placeholder"`, with a warning message. Verified:
   a live match against a Category-11 placeholder factor now returns
   `audit_risk_level: "HIGH"` with an explicit warning; a live match against
   a clean/uplifted factor still correctly returns `LOW` (confirms the fix
   didn't over-flag good data).

6. **Override endpoint bug, found via live testing**: `/bom/audits/{id}/override`
   updated `matched_process_name` when switching to a different candidate,
   but left `result_tco2e` pointing at the OLD match's number — switching to
   a better candidate would have silently kept showing the wrong figure next
   to the new name. Fixed by recomputing `result_tco2e` and re-snapshotting
   `matched_emission_factor` / `matched_data_quality_status` inside the
   override handler. Verified via a live call: overriding from an
   auto-picked proxy match to the correct direct-combustion match changed
   the displayed result from `0.5835` to the correct `2.6558`.

7. **Frontend was fully disconnected from the backend.** `main.jsx` had an
   `API` constant defined but never referenced anywhere in the 747-line
   file — the entire review table ran on four hardcoded mock rows that
   looked identical to real data. This included a fabricated fallback
   multiplier (`item.co2e_kg_per_unit || 1.5`) in the total-footprint
   calculation, meaning the dashboard could show a nonzero "total footprint"
   even with zero real matched data. Fixed:
   - `addManualRow` now calls real `POST /bom/match`
   - `approveRow` now calls real `POST /bom/audits/{id}/approve`
   - new `overrideRow` calls real `POST /bom/audits/{id}/override`
   - a `useEffect` on mount creates a real project and fetches real audits
   - the total-footprint stat now sums real `result_tco2e` values, so
     unmatched/placeholder rows correctly contribute `0`, not a fabricated
     number
   - candidate chips render from real `candidate_options` returned by the
     match endpoint, clickable to override
   - a `data_quality_status` badge (clean/uplifted/proxy/placeholder) shows
     next to every matched process name
   Verified: `npm run build` succeeds with zero errors. Every field the
   frontend reads (`row.result_tco2e`, `row.candidate_options`,
   `row.matched_data_quality_status`, `c.process_id`, `c.similarity_score`,
   etc.) was cross-checked against a real live API response over actual
   HTTP (not just the in-process test client) — confirmed zero mismatches.

8. **CORS** confirmed working for the frontend's dev origin
   (`http://localhost:5173`) via a live `OPTIONS` preflight request.

---

## SECTION 3: What's genuinely NOT done — this is the real remaining work

Be honest with the user about these; do not claim them as complete.

1. **No browser click-through verification was ever performed.** Everything
   above was verified via `TestClient`, live `curl`/HTTP calls, and a
   successful `npm run build` — nobody has actually opened this in a browser
   and clicked the candidate chips, watched the approve button, etc. This
   should be the FIRST thing done after placing files: run both servers,
   open the app, manually add a BOM line against `India_GHG_Factors`, and
   confirm the UI behaves as the code implies it should.

2. **No real auth is wired into the review actions.** `main.jsx` uses a
   placeholder constant `DEMO_USER_ID = "frontend-demo-user"` for all
   approve/override calls. The backend tolerates this gracefully (stores
   `null` for an unrecognized `user_id` rather than erroring), but there's
   no login UI calling `/auth/login` or `/auth/register` anywhere in the
   frontend. If real multi-user review tracking matters, this needs a login
   screen and token handling (the backend already issues JWTs via
   `token_for()` in `main.py` — that part exists and is unused by the
   frontend).

3. **No BOM CSV upload flow is wired to the backend either.** The backend's
   `POST /bom/upload` endpoint parses a CSV/Excel file into rows, but nothing
   in `main.jsx` calls it — only the single manual-entry form
   (`addManualRow`) is wired. A real bulk-upload flow would need to: call
   `/bom/upload` to get parsed rows, then loop calling `/bom/match` for each
   row (or batch it), showing progress.

4. **The embedding/matching quality is weak and this is a pre-existing
   limitation, not something either of us fixed.** `matching.py`'s
   `embed_text()` uses a simple hash-based bag-of-words approach
   (`EMBEDDING_MODEL = "local-hash-v1"`), not real semantic embeddings.
   Demonstrated live: querying "Diesel generator fuel" ranked "Well-to-Tank:
   Diesel" above "Diesel Generator (DG Sets)" despite the latter being the
   obviously better match. The candidate-picker UI (Section 2, item 7)
   exists specifically to let a human correct this, but the underlying
   match quality itself was not improved. If this matters, the real fix is
   swapping in a real embedding model (e.g. calling an actual embeddings
   API) — out of scope for this pass, flagging it explicitly rather than
   leaving it undiscovered.

5. **The "ecoinvent BYOL private import" option in the frontend dropdown
   doesn't match the backend's actual expected source string** (frontend
   shows `"ecoinvent BYOL private"`, backend's `/metadata/options` lists
   `"ecoinvent BYOL private import"`). This is a PRE-EXISTING mismatch,
   noticed but not fixed during this pass since it wasn't part of the scope
   (India_GHG_Factors integration). Worth a one-line fix if picked up.

---

## SECTION 4: Hard guardrails — do not do these things

- **Do not fabricate emission factor data for USLCI, ELCD, EXIOBASE, or
  ecoinvent.** Those sources remain seeded with descriptive metadata only
  (no `emission_factor` value) exactly as before. Generating plausible-
  looking numbers for them would reintroduce the exact problem this whole
  project has been trying to eliminate — confident-looking but unverified
  data.
- **Do not touch the ecoinvent BYOL architecture.** No shared ecoinvent
  index, ever — this is a licensing constraint, not a preference.
- **Do not "simplify" the `data_quality_status` handling** (e.g. removing
  the placeholder-forces-HIGH-risk logic) to make risk scores look better.
  That logic exists specifically to prevent a real, previously-shipped bug
  from recurring.
- **Do not regenerate `seed_india_ghg.py`'s label/unit extraction from
  memory or hardcoded guesses.** It must keep reading directly from the
  xlsx's formula cells — this was a real, previously-made mistake
  (17/60 labels were wrong when first attempted from memory) and the whole
  point of the current script is that it can't drift out of sync with the
  source file.

---

## SECTION 5: Verification checklist before considering this "done"

- [ ] `python3 seed_india_ghg.py` prints exactly 60 rows seeded, provenance
      breakdown `{'uplifted': 14, 'clean': 39, 'proxy': 1, 'placeholder': 6}`
- [ ] Backend starts with `uvicorn app.main:app --reload` with no errors
- [ ] `curl http://localhost:8000/health` returns `{"status":"ok",...}`
- [ ] Frontend starts with `npm run dev`, loads without console errors
- [ ] In the browser: select "India GHG Factors" as the source, add a manual
      BOM line ("Diesel generator fuel", 1000, "Liters"), confirm a real
      `tCO2e` number appears (not blank, not zero unless genuinely expected)
- [ ] Expand the matched row, confirm multiple candidate chips appear and
      are clickable
- [ ] Click a different candidate, confirm the number and provenance badge
      update to match the new selection
- [ ] Try a line that should hit a placeholder category (e.g. something
      matching "end of life" or "franchise"), confirm it shows `HIGH` risk
      and a visible placeholder warning, not a silent `0`
