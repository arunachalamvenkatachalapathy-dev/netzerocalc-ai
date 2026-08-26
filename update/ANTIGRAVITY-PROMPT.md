# Antigravity Prompt — India GHG Factors Integration

## Files to attach/upload alongside this prompt

Your repo already has everything else Antigravity needs (it can read your local
clone directly). These two files do NOT exist in the repo — attach them:

1. **GHG_Calculator_RECTIFIED_v6.xlsx** — the source data (60 emission factors,
   provenance-tagged: clean / uplifted / proxy / placeholder)
2. **e-credits-ghg-review.html** — a working standalone prototype demonstrating
   the candidate-picker UX pattern (click an alternative match instead of only
   seeing the auto-picked one). Reference only — Antigravity should port the
   *pattern* into the real React frontend, not copy this file's code directly
   (it's vanilla JS; your frontend is React).

Do not attach or describe any other emission-factor database (ecoinvent,
USLCI, EXIOBASE) — those aren't being touched by this task.

---

## The prompt (paste this into Antigravity)

```
I'm working on the e-credits BOM-to-LCI carbon accounting app (FastAPI backend
in backend/app/, React frontend in frontend/src/main.jsx). I need you to
integrate a new verified emission-factor dataset and fix a real schema gap
that's been blocking it from producing actual numbers. Read the whole repo
structure first, then do the following in order.

## 1. Schema fix (backend/app/models.py)

LciProcess currently has no field to store a numeric emission factor -- it's
purely descriptive metadata (process_name, reference_unit, geography, etc.)
with no way to compute an actual kgCO2e result. Add:

  emission_factor: Mapped[float | None] = mapped_column(Float)
  emission_factor_source: Mapped[str | None] = mapped_column(Text)
  data_quality_status: Mapped[str | None] = mapped_column(String(20))
    # one of: clean, uplifted, proxy, placeholder -- carries provenance
    # forward instead of hiding it once a match is made

This applies to every source (USLCI/ELCD/etc too), not just the new one --
right now NO source in this app can output a number, only a matched
description. Existing seed rows can leave these fields null; that's honest,
since they don't have real factors either.

## 2. Seed the India_GHG_Factors source (new file: backend/seed_india_ghg.py)

Parse the attached GHG_Calculator_RECTIFIED_v6.xlsx, specifically the
DB_Master sheet (columns: Lookup Key, Emission Factor, Source / Notes).
For each of the 60 rows, create an LciProcess with:
  - database_source = "India_GHG_Factors"
  - database_version = "v6"
  - process_uuid = the Lookup Key (e.g. "Diesel_Fuel")
  - process_name = pull the actual line-item label from the GHG_Master_Calculator
    sheet (find the row whose VLOOKUP formula references this key, read that
    row's column A for the label and column C for the unit) -- do NOT invent
    labels, extract them directly from the sheet
  - reference_unit = the extracted unit (e.g. "Liters", "kWh", "kg")
  - geography = "IN"
  - system_model = "Direct Factor" (these are point emission factors, not full
    background LCI processes with a system-model boundary)
  - emission_factor = the Emission Factor column value
  - emission_factor_source = the Source / Notes column text, verbatim
  - data_quality_status = derive from the Source/Notes text: "placeholder" if
    it contains "PLACEHOLDER", "uplifted" if it contains "uplift" or "EPA GHG
    Equivalencies", "proxy" if it contains "Cross-validated" or "RECONCILED",
    else "clean"
  - embedding = embed_text() over "{process_name} {description}" same as
    existing seed rows, using the app's existing EMBEDDING_MODEL
  - description = the Source/Notes text

Run this idempotently (skip if India_GHG_Factors rows already exist), same
pattern as the existing seed.py.

## 3. Extend unit support (backend/app/units.py)

The existing TO_BASE dict is missing units this dataset uses. Add:
  - "L" / "Liters" / "liter" / "litre" -> volume dimension, base factor 1.0
  - "m3" / "scm" / "cubic meter" -> volume dimension, base factor 1000.0
    (1 m3 = 1000 L; treat scm as equivalent to m3 for this purpose)
  - "p-km" / "passenger-km" -> new "pax-distance" dimension, factor 1.0
  - "INR" -> new "spend" dimension, factor 1.0 (self-only, no conversion)
  - "night" / "Nights" -> new "count" dimension addition, factor 1.0
  - "franchise" / "Franchises", "unit sold" / "Units Sold", "INR invested" /
    "INR Invested", "tCO2e reported" / "tCO2e Reported" -> each its own
    trivial self-only dimension, factor 1.0
Add corresponding lowercase aliases in ALIASES so "Liters", "liters", "L" all
normalize consistently. Do not change the existing mass/energy/distance
dimensions or their factors.

## 4. Expose match alternatives, not just the auto-pick (backend/app/main.py, matching.py)

matching.py's retrieve_candidates() already returns the top 5 candidates --
confirm this. In main.py's /bom/match endpoint, the response currently only
surfaces the single selected_primary_candidate. Change the response to also
include the full candidate list (process id, name, similarity score,
data_quality_status) so the frontend can render alternatives as clickable
options, matching the review philosophy already built into this app (the
/bom/audits/{id}/override endpoint already supports switching to a different
process_id -- this just makes the alternatives visible in the first place
instead of hidden).

Also update /bom/export and /bom/audits/{project_id} to include a computed
result field: (converted_quantity * matched_process.emission_factor) / 1000,
null if the matched process has no emission_factor set. Label it
result_tco2e in the response.

## 5. Frontend: candidate picker + provenance display (frontend/src/main.jsx)

In the Review step's table, for each BOM line:
  - Show up to 5 candidate chips (label + similarity %) below the matched
    process name, clickable -- clicking one calls the existing
    /bom/audits/{id}/override endpoint with that process_id, and resets
    is_human_approved to false (any change requires fresh sign-off, don't
    let a switched match silently inherit a prior approval)
  - Show a data_quality_status badge next to the matched factor (clean /
    uplifted / proxy / placeholder) with distinct colors -- placeholder
    should read as a visible warning, not blend in
  - Show the computed result_tco2e number, not just the process description
  - If data_quality_status is "placeholder" and quantity > 0, show an
    inline warning that the result is not valid pending real data

Add "India_GHG_Factors" as a selectable option in the database_source
dropdown (GET /metadata/options already lists database_sources -- add it
there too, backend/app/main.py).

## 6. Do not touch

- The BYOL / ecoinvent architecture (no shared ecoinvent index, ever)
- The existing USLCI/ELCD/Agribalyse/EXIOBASE seed rows or their (currently
  null) emission_factor fields -- don't fabricate numbers for those
- Auth, projects, or any other endpoint not listed above

## 7. Verify before you're done

- Run the seed script, confirm 60 India_GHG_Factors rows are created with
  no null process_name or reference_unit
- Run the backend, hit /bom/match with a test BOM line (e.g. "Diesel
  generator fuel", 1000, "Liters", database_source=India_GHG_Factors),
  confirm the response includes a non-null result_tco2e and a candidates
  array with more than one entry
- Confirm a placeholder-factor match returns result_tco2e = 0 AND a visible
  data_quality_status of "placeholder" in the same response -- these must
  both be present together, never just the silent zero
```

---

## After Antigravity finishes

Ask it to show you the diff before committing anything, specifically check:
1. Did it actually extract the 60 labels/units from the xlsx, or did it guess? (Ask it to print the extracted list — a guessed list is the exact mistake I made and had to fix earlier in this build.)
2. Does a placeholder-factor row actually show the warning in the UI, or just a silent `0`?
3. Did it touch anything outside the files listed in section 6?
