# Trackers UI redesign

This page is a UI-only preview of the local tracker subsystem. The backend exposes
trackers through the `python -m app.cli trackers` commands and stores state under
`private/trackers`; it does not currently provide a browser API. The page therefore
uses explicitly labelled sample cards and keeps creation/detail controls inactive.

## Implementation units

1. Editorial page shell and responsive canvas.
2. Personal watchlists heading and hierarchy.
3. Truthful local-CLI availability notice.
4. Workspace header and preview count.
5. Sample tracker card data model and responsive grid.
6. Status/tag treatment with accessible icon labels.
7. Inactive action affordances preserving placeholder behavior.
8. Local CLI guidance footer and component regression tests.
