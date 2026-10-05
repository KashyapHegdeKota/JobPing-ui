# JobPing UI backlog

## In progress

No implementation items in progress.

## Completed

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
