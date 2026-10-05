# Referrals UI handoff

## Start

The `/referrals` route had two dark zinc cards. Copying the hardcoded sample URL was the only working action; Apply had no state or backend contract. This work owns only `src/app/referrals/page.tsx`, the route CSS module, this note, and route tests.

## End

The route now uses a scoped light canvas and white card treatment with navy headings/actions, mint and blue icon tiles, responsive stacked controls, focus states, and generous spacing. Copy behavior remains intact with cleanup for its temporary status. The hardcoded URL and disabled Apply controls are labeled as unconnected interface placeholders. No shared shell, global styles, backend, hooks, or libraries were changed.

Change units: page structure; link card styling; copy interaction/accessibility; apply placeholder clarity; responsive controls; scoped design tokens; route regression tests; handoff documentation.
