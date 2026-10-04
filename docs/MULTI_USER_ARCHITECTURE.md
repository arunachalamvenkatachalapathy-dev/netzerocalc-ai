# Multi-user / roles: next architecture step

Status: design only. No shared-access policy, membership, invitation or production database migration is enabled by this document.

## Current boundary
The current `projects` primary key is `(user_id, id)` and row-level policies allow each authenticated account to read/write/delete its own projects only. The browser save path uses `updated_at` compare-and-swap. API tokens are scoped to their owner. This is a personal workspace model, not team authorization.

## Proposed first release
- Workspace owner: controls membership and ownership, edits inventory, reviews rows, locks periods and exports.
- Editor: edits unlocked inventory and reporting notes; cannot grant access, delete the workspace or approve their own changes.
- Reviewer: reads evidence, records review decisions and locks a reviewed version; cannot silently rewrite activity values.
- Viewer: reads the authorized workspace and exports; no edits or access grants.
- No public links by default. No assurance claim from an internal reviewer role.

## Data and permission changes
Create separate workspaces and membership tables, with explicit workspace foreign keys on projects. Preserve existing owner-only data during migration; create one private workspace per current owner and do not add other members. Avoid using JSON fields or the UI as the permission source. Enforce roles in database policies and validated backend functions, with deny-by-default access for unknown roles and inactive members.

Invitations must bind to a verified account or one-use expiring invitation. Only owners invite/revoke; invitations need user-authorized recipient/audience before sending. Revocation must block the next read/write, not only hide buttons. Workspace ownership transfer needs an explicit recipient and acceptance; keep the original owner until accepted.

Existing personal API tokens must remain personal. Shared-workspace token access requires a new scoped grant with explicit workspace/action restrictions; do not widen existing tokens. Service-role keys must never reach the browser. Factor-source and third-party data audience restrictions remain attached to evidence.

## Required audit and concurrency model
Use an append-only, server-authored event log bound to authenticated subject and workspace. Record saved-version IDs and before/after hashes, not invented keystroke history. Distinguish token subject from unknown human operating a token. Use server monotonic revision numbers for saves, period locks and reviews. A stale writer must receive a conflict response and keep recoverable local work. Define review invalidation when quantities, factors, boundaries or evidence change. Resolve same-account and cross-account in-flight saves before shipping roles.

## Test gate before production
Use disposable test accounts and a staging database. Test the owner/editor/reviewer/viewer matrix, outsider access, guessed IDs, forged role fields, revoked membership, expired/replayed invitations, concurrent saves, lock races, export access, token scope, and owner transfer. Verify permission enforcement directly at database/API layers, not only through the UI. Test migration, rollback, backups and retained private ownership. Do not use production user data as a fixture or run migrations through a web SQL editor.

## Delivery sequence
1. Complete live personal cloud save/reload/conflict verification.
2. Create staging migrations and automated access tests without touching production.
3. Add membership UI and safe invitation drafts behind an off-by-default flag.
4. Independent permission review and disposable-account end-to-end tests.
5. Migrate only after a tested execution/rollback route and owner approval for any changed audience.

No paid plan is assumed. Confirm actual provider limits before provisioning. If a required capability costs money, stop for approval. No production deadline is claimed until the staging migration and security tests pass.
