# JobPing UI backlog

## In progress

### UI-REVAMP-001 Polish search/filter controls, screening buckets, and responsive layouts

- Polished the live and screened feed workspace layout (`LiveFeedPage`, `jobs-page.module.css`, `screening.module.css`), fixing viewport height overflow when the feed mode switcher is enabled and eliminating the nested 60dvh mobile scroll trap.
- Revamped `FilterBar`, `Combobox`, and `DiscoveryControls` with grouped category pills, tactile checkbox toggle pills, grouped pay inputs, dark-mode-aware popover tokens, and mobile-safe popover bounds.
- Aligned `ScreenedFeed` header/card widths, inline search toolbar, bucket tabs, pagination bar, `BeforeApplying` dialog sections/CTAs, `ScreeningProfile` 2-column grid alignment on `/profile`, and `JobCard` screening status callouts; opened [PR #30](https://github.com/KashyapHegdeKota/JobPing-ui/pull/30).
- Preserved all existing API, analytics, authentication, and test contracts.

### UI-CHECK-001 Sponsorship and pay checks before applying

- Resumed and updated on October 18, 2026. Added `summarizeH1bHistory` (`src/lib/jobDetails.ts`) and surfaced deterministic `"Filed X H-1B petitions, last filed YYYY"` badges and multi-year per-entity breakdowns on job cards (`JobEvidence.tsx`) and in the pre-application check modal (`BeforeApplying.tsx`), while keeping role-level screening conservative.
- Implemented private requirements, server-counted match/review/excluded feed and read-only pre-application dialog behind `NEXT_PUBLIC_SCREENING_ENABLED`, and preserved `company.immigration_records` in `parseScreenedPage` so screened job cards display official DOL/USCIS employer history. No deployment or account settings changed.
- Coordinated with sibling DISCOVERY-CHECK-001; notification settings remain independent.
- Validation: unit tests (`JobEvidence.test.tsx`, `Screening.test.tsx`), ESLint, and standalone TypeScript checks pass. Staged rollout behind `NEXT_PUBLIC_SCREENING_ENABLED` remains an operator step. See sibling `docs/evidence-implementation-handoff.md`.

## Completed

### UI-CHECK-001 Sponsorship and pay checks before applying

- Completed and live October 14, 2026. [UI PR #27](https://github.com/KashyapHegdeKota/JobPing-ui/pull/27)
  merged as `cb4966a`; backend [PR #45](https://github.com/KashyapHegdeKota/JobPing/pull/45)
  migrated/deployed first and the independent renderer/evidence worker are healthy.
- Saved Production `NEXT_PUBLIC_SCREENING_ENABLED=true` after backend acceptance.
  Uncached Vercel deployment `ETxS2SKEY996emR41YH57oL1Vbwo` is Ready on jobping.website.
  Private requirements, server-counted Matches/Needs review/Does not meet requirements,
  cached/source-backed pre-application checks and manual employer continuation are live.
- All 150 tests, lint, standalone types and enabled production build pass. GitHub
  CI/security and Vercel checks pass. Live signed-in profile/feed/buckets/dialog and
  desktop/390px mobile review pass with no horizontal overflow or browser warnings/errors.
  Existing remember-me restored the account; no requirements or notification settings
  were changed for verification. Backend live API/auth/CORS/WebSocket/SSE pass.
- Evidence backfill runs in the background. Unsupported/unknown/conditional/conflicting
  employer terms require review. Advertised maximum pay reaching a target does not
  guarantee the offer. Set your own requirements in Profile; they remain private and
  independent of email preferences. See the sibling `docs/pre-application-evidence.md`
  for production pins, coverage, worker lifecycle and rollback.

### UI-AUTH-002 Remember returning signed-in users

- Completed locally: Google sign-in, email sign-in and sign-up explicitly persist
  sessions before authentication. Sessions survive browser restarts and multi-day
  returns; Firebase owns token refresh with no automatic two-day logout.
- Homepage recognizes restored users with account/feed links. Homepage and
  workspace wait for restoration before offering login and close stale dialogs
  after cross-tab sign-in. Explicit sign-out and auth throttling remain intact.
- Validation: 146 tests pass, including a real Firebase SDK session restored three
  days later with mocked HTTP, token refresh and sign-out/restart verification.
  Persistence ordering/failure, returning-user/guest and observer-cleanup
  regressions pass; full lint, standalone types, production build and diff checks pass.
- Windows fork-worker startup timed out; the successful full run used one thread
  worker. No provider/backend settings, account preferences or deployments changed.
  Production frontend rollout verified October 13; sibling item AUTH-REMEMBER-001.
  UI PR #26 is merged as `49c0296`; Vercel Production deployment `7051619660`
  succeeded and jobping.website responds HTTP 200. No screening flag was activated.
- Coordinated backend default suite passes (954 passed, 30 opt-in skips); full
  Ruff/Black and both repositories' diff checks pass.
- Published from isolated `codex/remember-login` checkouts in [frontend PR #26](https://github.com/KashyapHegdeKota/JobPing-ui/pull/26)
  and [backend backlog PR #44](https://github.com/KashyapHegdeKota/JobPing/pull/44).
  UI PR #26 is merged; CI/security/Vercel checks pass and production rollout succeeded.
  Original working-tree edits, including paused screening work, are preserved locally.

### UI-ABUSE-001 Handle authentication and refresh throttling

- Completed: generic provider-safe login errors, in-flight guards, Firebase throttle cooldowns, reload-persistent HTTP cooldowns before token requests, data-preserving retry controls and shared reference caching. Filter changes retain the live socket; reconnects use jitter and reset after stability.
- Validation: all 130 frontend tests, lint, standalone type checking and production build pass. Regressions cover private account changes, duplicate actions, no automatic credential retries, preserved jobs/preferences/analytics, request coalescing and owned timer/socket cleanup.
- Published 20 focused implementation/documentation commits to `codex/request-abuse-protection` and draft PR #25; coordinated backend is draft PR #41. Hosting/provider settings and production deployment were not changed. See `docs/request-protection.md` and sibling activation docs; UI CI and security checks passed on implementation revision `af0928c`.

### UI-PUBLISH-001 Publish production rollout records

- Published the outstanding launch/date validation records for GitHub review. Frontend functional revision `25e545e` is already deployed on jobping.website; this follow-up changes documentation only.
- Production email delivery is enabled and the user confirmed the connection test arrived in Gmail. Conversation threading belongs to the sibling backend and requires a later backend rollout; no frontend behavior or email preference changes are needed.
- Validation: frontend PR #23 passed UI CI/Vercel preview and was merged. Vercel's first production attempt failed while retrieving Git metadata; a retry successfully deployed main `4aedeec` to jobping.website (Ready, deployment `BH7fDqoverRTnrKMhmjYA6zAtGyY`). Backend threading remains a separate GitHub-only release.

### UI-DATES-001 Preserve day-only posting labels

- Calendar dates and historical UTC-midnight posting markers show Posted today/yesterday/day counts without fabricated hour precision or local-time day shifts. Semantic dates and tooltips disclose unavailable posting times; precise posted/discovered timestamps retain minute/hour labels.
- Published revision `25e545e` to main; Vercel production deployment `BojGQ12vsw4RboSA8EeR6H45gjPJ` is Ready and assigned to jobping.website. Live RTX Software Engineering Co-op (Spring/Summer 2027) shows Posted today. The sibling backend filled 33 missing Waymo publication dates, correcting feed ordering while preserving discovery history.
- Validation: 107 tests, lint, standalone types and production build pass; 17 date/card cases also pass under America/Phoenix. Live feed connected with 4,089 roles and no warning/error console logs; screenshots in sibling backend's ignored `private/deployment`.

### UI-LIVE-001 Connect production frontend to Oracle backend

- Set Vercel Production/Preview `NEXT_PUBLIC_API_URL=https://api.jobping.website` and rebuilt the existing production main revision `278e2ae` without changing frontend code.
- Deployment `BcG8zHFL89RLmNmL7pnwXbnH447i` is Ready and assigned to jobping.website. Live browser verification shows 4,084 roles and LIVE FEED CONNECTED, with no browser warnings/errors.
- Backend HTTPS, CORS, public API, WebSocket/SSE, Firebase Admin access, polling and database backups verified in the sibling deployment task. Production email delivery subsequently passed the controlled provider/inbox check and is enabled.

### UI-DETAILS-001 International-student evidence and advertised pay

- Completed: role CPT/OPT/STEM OPT and sponsorship badges, separately dated employer history, employer-posted compensation and accessible source disclosures. Explicit unknown/negative/conflicting states are preserved. The user's salary request supersedes the earlier card omission.
- Shareable student/history/pay filters query the full backend feed across pages. Filter changes reset pagination and ignore stale responses; HTTP/live metadata is validated before display. Original currencies and periods remain separate; no estimates or annualized internship pay.
- Validation: 105 tests, lint, type checking and production build pass. Controlled desktop/390px phone review confirms evidence disclosure, server filter requests, zero horizontal overflow and no page errors.
- Delivered in 11 frontend commits, alongside 15 backend commits. Deploy after the backend migration/API; existing rows remain unknown until sources repoll and official company history is imported. Employer-only history imports require a feed reload. See `docs/discovery-evidence.md`.

### UI-DEPLOY-001 Repair merged Vercel build and favicon

- Completed: repaired the live-event test setup and added required closed-state fixture data after merge `9ed6f3c`; production type checking remains enabled.
- Closed cards show Applications closed and suppress the View role link, with a regression assertion against the current label. No backend or live-feed logic changed.
- Replaced the Next.js favicon with the existing mint briefcase artwork, packaged as an ICO with its original 128px PNG intact.
- Validation: all 95 tests across 17 files, lint, standalone type checking and production build pass. Repair and favicon changes are committed separately for publication on the existing deployment branch.

### UI-CARDS-001 Show reference job card details

- Completed: company initial/name, prominent title, role-type pill, supplied location/work arrangement, semantic relative date, local bookmark and external View role action match the screenshot layout.
- Salary omitted per user request. No backend/API changes; posted and discovery date provenance retained, with minute/hour precision for recent roles.
- Bookmarks persist only on this device, synchronize duplicate cards and browser tabs, and report unavailable storage without claiming success.
- Validation: all 81 frontend tests, lint, type checking and production build pass. Live desktop/390px phone cards and bookmark save/remove verified; compact feed spacing corrected to display full cards.

### UI-AUTH-001 Enter the feed after landing authentication

- Completed: successful Google sign-in, email sign-in and email sign-up from the landing dialog navigate to `/jobs`; dismissals and failed popups do not redirect.
- Firebase authentication calls and errors are preserved. Workspace sign-in retains its existing behavior.
- Final validation: all 74 tests across 17 files, lint, type checking and production build pass. Auth success/failure and public/workspace route coverage added; no live Google credentials used during automated checks.
- Delivered 70 focused frontend commits on `codex/figma-ui-revamp`; sibling email presentation changes are committed separately.

### UI-LANDING-001 Implement supplied landing HTML

- Completed: supplied animated SVG, DM Sans typography, responsive landing layout and navigation implemented at `/`; live feed moved to `/jobs` as requested.
- Account actions reuse existing Firebase handlers, recap opens preferences, and feed analytics preserve the backend's established page identity.
- Sample feature copy reflects supported job-type/season preferences and 8 PM recaps. Illustrative alert explicitly labeled; unavailable legal/contact preview buttons replaced with real feed/preferences links.
- Validation: 66 frontend tests, lint, type checking and production build pass; desktop and 390px phone review plus login and mobile feed navigation pass. Follow-up seven landing/feed tests pass after navigation lint repair.

### UI-FIGMA-001 Refresh the five existing pages from Figma

- Source: `rftcPEPuoVLi0z61387bRE`, selected node `9:50`.
- User approved browser-reference approximation after the Figma Starter MCP quota blocked exact context and asset access.
- Five GPT-5.6 Luna page agents own jobs, trackers, referrals, profile and activity in isolated worktrees; root owns the shared shell, review and integration.
- Preserve backend code, API clients, data hooks, auth, filtering, pagination, notification settings and analytics contracts.
- Match the navy/mint/pale canvas design across existing routes, retaining authenticated recaps and admin analytics.
- Deliver focused modular commits, then run frontend tests, lint, type checking, production build and desktop/mobile visual review.
- Existing trackers and referrals contain placeholders; do not imply new persistent functionality.
- Completed: all five page contributions reviewed and integrated, shared shell/auth dialog rebuilt, responsive and dark themes reviewed.
- Validation: 62 tests, lint, type checking and production build pass. Authenticated preference/admin states are covered with mocked tests; live signed-in verification remains an operator check.
- Email brand icon added for the sibling backend's supplied HTML design refresh.

## Follow-up

- Compare exact Figma measurements and original assets once MCP access is restored. Current fidelity is intentionally approximate.

## Repository workflow

Read this backlog and `AGENTS.md` before implementation. The sibling backend's agent guide and backlog provide the system contracts; this task changes frontend presentation only.
