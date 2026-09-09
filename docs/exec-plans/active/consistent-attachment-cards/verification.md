# Attachment composition evidence

Baseline discovery: origin/main 58efc3a; task branch fix/consistent-attachment-cards. Planning starts from current main. The harness requires a clean pushed PR head after planning commits; the implementation baseline will bind that planning-only PR head.

## Inventory before implementation

- Composer: 6 classified roots (4 executable fixtures, 1 content stress, 1 live Data Workspace consumer), 0 diagnostics.
- File Upload: 6 classified roots (4 showcase fixtures, 1 plain HTML fixture, 1 live Data Workspace consumer), 0 diagnostics.
- File Row: 18 classified roots (11 executable fixtures, 5 content stress, 2 live consumers), 24 inert diagnostic rows. Dynamic non-workspace uploads currently render filename-only list items; those are affected legacy substitutes and will become classified dynamic File Rows.
- Existing Comment Feed and History use full icon/content File Row markup; Composer's six nested rows omit icons. File Upload's two existing nested rows use emoji. Plain HTML renders its own filename list and does not use File Row; its presentation is outside the named showcase-card correction and its native selection contract remains unchanged.

## Source and state contract

See the approved design and spec for SVG geometry and the 229px composition decision. Preserve File Row 55px height/38px visual/12px radius. Verify default, disabled, read-only and invalid Composer plus File Upload empty/populated/selection/drop/removal/error/focus. Browser coverage must include long localized names, unknown extensions, multiple files, 220px containment, desktop and 200% root text.

Validation and completion results will be appended after execution; existing manifest pass labels are historical, not new evidence.
