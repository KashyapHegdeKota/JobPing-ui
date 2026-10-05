# Profile preference screen

Status: complete on `codex/figma-profile`.

This page follows the observed alert preference direction: a pale canvas, white
rounded cards, navy copy, mint and emerald accents, a two-column preference
form, and a clearly labeled decorative preview panel. The existing Firebase
auth flow, notification settings PUT, verification actions, recap timing,
BYOK secret clearing, ownership checks, and error states remain intact.

The preview panel only describes the existing alert and 8 PM recap behavior.
It does not add client controls or imply API support for additional filters.
The authenticated recap route uses the same surface tokens and groups new and
reposted occurrences independently.

The root `BACKLOG.md` remains owned by the integration agent; no backend or
schema backlog item was changed for this presentation-only work.
