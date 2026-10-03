# Inventory history deployment

Status: reviewed feature branch, NOT deployed to the live database or production app.

## Apply in this order

1. Existing migrations `20261002000000_projects.sql` and `20261002010000_api_tokens.sql` are prerequisites and are already live. Do not blindly rerun their non-idempotent policy/trigger creation.
2. Apply `supabase/migrations/20261003000000_inventory_history.sql` once to project `gxzrfngjypmijvfhtjiv`, in a transaction. It creates a private history table, own-user SELECT policy and a database trigger. No prior project data is modified or backfilled.
3. Verify on a throwaway project: add, quantity edit, approval, deletion, unchanged save, metadata-only save. Confirm exact snapshots and changed fields; other users cannot read rows; authenticated users cannot insert/update/delete history.
4. Merge/deploy frontend only after step 3. Navigation: Tools & Registry > Inventory History. Signed-in history comes from the database. Guests keep browser-only history.
5. Deploy updated `supabase/functions/api/index.ts` with the existing JWT gateway configuration (`verify_jwt=false`; the function checks personal tokens itself). The new write uses the project's `updated_at` as a compare-and-swap guard. Retain current self-serve own-data read/write token policy.
6. Live test browser and API writes, stale-save refusal, history refresh/pagination, desktop/mobile layout; revoke all test tokens and delete only test projects.

## Local validation completed

- 60 unit tests, 780 assertions, no failures. Six new history tests cover adds, edits, zero/false values, deletions, no-op saves, period separation and guest persistence.
- Production frontend build succeeds; existing large optional-chunk warning remains.
- Exact SQL migration tested on local PostgreSQL-compatible PGlite: add/edit/delete trigger snapshots; qty-only changed fields; no metadata-only event; cross-user RLS; authenticated history deletion denied; API/service attribution.
- Desktop and 390px mobile history screenshots inspected. Fixed mobile header overflow and hidden copilot accessibility.

Live SQL execution is blocked: Supabase web SQL input corrupted the pasted script. Nothing was executed. No Supabase access token or database password exists in the current vault. Use an authorized CLI/Management API/database route with a securely supplied credential; never commit it or paste it into chat.

## Limits and safety

- Tracking starts when the trigger is installed. No fabricated pre-release history.
- Full before/after item snapshots are kept for each saved cloud change. Browser edits within the autosave debounce may be combined into one saved event; this is saved-version history, not keystroke logging.
- API/service entries name the project owner account, not the individual holding a token. Database administrators can alter history: this is not a certified tamper-proof audit system.
- Deleted-project history is retained in the table, but the UI selects existing projects only. Deleting an auth account removes its history by cascade.
- History refresh is manual; realtime sync remains out of scope.
- Browser saves are serialized and match the last loaded `updated_at`. A stale save stops and shows a warning; local edits remain in browser storage. Copy unsaved edits before reloading. There is no automatic conflict merge or restore button.
- UI creation/loading of history should not precede migration. A missing table produces a visible error rather than a fake empty history.
