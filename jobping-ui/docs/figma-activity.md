# Activity analytics visual refresh

## Scope

The `/activity` and `/admin/analytics` views share the `AnalyticsDashboard` component. This refresh follows the approved browser-reference direction: a pale canvas, white bordered cards, navy headings, mint highlights, generous spacing, and no glow effects.

All request paths, Firebase authorization, period controls, result-key race protection, private user scoping, admin-only aggregates, metric labels, and analytics caveats remain unchanged. Daily activity keeps a data-derived visualization alongside its accessible UTC table.

## Work status

- Started on `codex/figma-activity` from baseline `18b5270`.
- Eight focused commits are required before handoff; each visual section is committed independently.
- Figma calls are intentionally skipped under the approved browser-reference approximation.
