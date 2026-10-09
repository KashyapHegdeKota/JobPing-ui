# JobPing UI backlog

## In progress

No in-progress items.

## Completed

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
