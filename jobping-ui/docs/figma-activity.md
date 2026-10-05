# Activity analytics visual refresh

## Scope

The `/activity` and `/admin/analytics` views share the `AnalyticsDashboard` component. This refresh follows the approved browser-reference direction: a pale canvas, white bordered cards, navy headings, mint highlights, generous spacing, and no glow effects.

All request paths, Firebase authorization, period controls, result-key race protection, private user scoping, admin-only aggregates, metric labels, and analytics caveats remain unchanged. Daily activity keeps a data-derived visualization alongside its accessible UTC table.

## Work status

- Started on `codex/figma-activity` from baseline `18b5270`.
- Eight focused commits are required before handoff; each visual section is committed independently.
- Figma calls are intentionally skipped under the approved browser-reference approximation.

## Completion notes

- Implemented the shared dashboard in eight focused commits on `codex/figma-activity`.
- The daily chart is derived directly from the API trend and is paired with a captioned table so the visualization does not replace accessible data.
- Focused test and lint commands were attempted, but this isolated checkout has no installed dependencies and `npm ci` stalled before completing. Run `npm ci`, `npm run test`, `npm run lint`, and `npm run build` before merging.
