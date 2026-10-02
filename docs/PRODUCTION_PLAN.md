# NetZeroCalc production plan

Method: every finding from the app review gets an ID, a decision, a fix, and a check. A change is done only when the build passes, the check passes on the live site, and the commit is small enough to review. Cut decisions compare each feature to how production carbon tools handle the same job (Watershed, Persefoni, Sphera LCA, openLCA, Climatiq): they do one core job deeply and keep reference material out of the product UI.

Core job we keep: BOM -> emission factor match -> data quality score -> footprint -> export.

## Phase A - Safe foundations (reversible, no behaviour change)
| ID | Finding | Fix | Check |
|----|---------|-----|-------|
| A1 | Tests not in CI, lockfile out of sync | Single lockfile (bun or npm), `test` script, CI job running unit tests + build | CI green on main |
| A2 | Stray Excel files shipped to every visitor | Remove 3 xlsx from `public/` | Not in `dist/`, not served |
| A3 | Tailwind from CDN | Install tailwind as a build dependency, purge CSS | No request to cdn.tailwindcss.com, no unstyled flash |
| A4 | Three deploy targets | Keep Vercel as the one target; GitHub Pages workflow replaced by CI-only workflow; Pages link in Google consent screen updated to the Vercel URL | One deploy config in repo |
| A5 | Dead docs | Remove or rewrite docs that mention Cloud Run, Firebase, FastAPI | grep finds none |

## Phase B - Performance
| ID | Finding | Fix | Check |
|----|---------|-----|-------|
| B1 | 3.5 MB main + 3.0 MB sheet chunk | Lazy-load each tab, FortuneSheet, @react-pdf, xlsx; manual vendor chunks | First load JS under 500 KB gzip-independent size; Lighthouse performance reported |
| B2 | Google Fonts / render blocking | Preconnect, display swap | Lighthouse |

## Phase C - Truthfulness (copy and UI)
| ID | Finding | Fix | Check |
|----|---------|-----|-------|
| C1 | Guest mode says "Cloud sync: Supabase" | Show "Saved in this browser" for guests; hide Sign out, show "Sign in to sync" | Click-through in guest and signed-in |
| C2 | Hard-coded "Prepared by: Arunachalam V" and default user name | Use the signed-in user's name or a blank editable field | Declaration shows signed-in name |
| C3 | Fake declaration serial | Derive from content hash + date, label "reference ID", or drop | No random serial |
| C4 | "verified" x64, "audit-ready", "certified", "authoritative", "comprehensive" | Replace each with a factual statement: source, publisher, vintage. Keep "verified" only where code actually validates something | grep audit list reviewed line by line |
| C5 | Emission factors without sources | Add source, year, geography, URL per factor in the registry UI; factors without a source are marked "unsourced - illustrative" | Registry shows source column |
| C6 | Dead API/MCP tab ("API is live") | Remove the tab, polling, and dead URL. Real MCP excluded from scope | No requests to the dead URL |
| C7 | Name and positioning mismatch | One sentence everywhere: BOM-to-LCI carbon footprint mapper (screening tool) | title, README, landing, header agree |

## Phase D - Scope decisions (compared to real products)
| Feature | Real-product comparison | Decision |
|---|---|---|
| Executive CEO Insights | Static briefs; dashboards in Watershed/Persefoni are data-driven, not authored text | Cut |
| Omnibus and CSDDD readiness, CSRD double materiality (325 datapoints), EU ESG Navigator (60 directives), Regulations tracker | Reference content that lives in docs or a separate regulatory product, not inside a calculator | Cut from the nav; keep one compact "Regulation reference" page if it links to primary sources |
| VSME | Narrow reporting template; no depth here | Cut |
| Carbon cost / shadow pricing | Small and useful when tied to inventory | Fold into What-If as one panel |
| SBTi and net-zero trajectory | Real tools offer targets, but this one is static | Hide under "Experimental" until it uses real inventory |
| ISO 14064-2 scenario engine | Same as What-If | Merge into What-If |
| EU CBAM | Real, tied to BOM, matches the core job | Keep |
| DQR / pedigree, LCI factor search, EF registry, BOM workbench, PCF export, GHG ledger | Core | Keep |
| Header standard and country dropdowns | Settings in real tools | Move to Settings |

Nothing is deleted from git history. Cuts are separate commits so any one can be reverted.

## Phase E - Product quality
| ID | Finding | Fix | Check |
|----|---------|-----|-------|
| E1 | One source of truth in demo | Load the same demo dataset into Workbench and Master Sheet, or label sample data clearly | Both tabs show the same total |
| E2 | Empty states are zeros | Each empty view says what to do next (import BOM, load sample) | Screenshot per view |
| E3 | alert()/confirm()/console.log | Inline toasts and dialogs | grep finds none |
| E4 | Accessibility | Labels, roles, focus order, contrast, keyboard use | axe scan clean on main flows |
| E5 | Mobile | Responsive header/nav, collapse sheet to read-only on narrow screens | Screenshots at 390px |
| E6 | Header overload | See D; leave org, period, account | Screenshot |

## Phase F - Evidence
| ID | Item | Check |
|----|------|-------|
| F1 | README: screenshots of full flow and a short clip | Files exist, render in README |
| F2 | Limitations section rewritten to current state | Matches app |
| F3 | Google sign-in end-to-end check | Needs his phone code once |

Order: A, C (cheap, high trust), B, D, E, F. One commit per ID. Report after each phase.
Out of scope for now: real MCP server (waiting on owner decision), anything that costs money.
