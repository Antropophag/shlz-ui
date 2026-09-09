# Attachment composition evidence

Baseline discovery: origin/main 58efc3a; task branch fix/consistent-attachment-cards. Planning starts from current main. The harness requires a clean pushed PR head after planning commits; the implementation baseline will bind that planning-only PR head.

## Inventory before implementation

- Composer: 6 classified roots (4 executable fixtures, 1 content stress, 1 live Data Workspace consumer), 0 diagnostics.
- File Upload: 6 classified roots (4 showcase fixtures, 1 plain HTML fixture, 1 live Data Workspace consumer), 0 diagnostics.
- File Row: 18 classified roots (11 executable fixtures, 5 content stress, 2 live consumers), 24 inert diagnostic rows. Dynamic non-workspace uploads currently render filename-only list items; those are affected legacy substitutes and will become classified dynamic File Rows.
- Existing Comment Feed and History use full icon/content File Row markup; Composer's six nested rows omit icons. File Upload's two existing nested rows use emoji. Plain HTML contains only an empty upload surface and does not use File Row; its presentation is outside the named showcase-card correction and its native selection contract remains unchanged.

## Source and state contract

See the approved design and spec for SVG geometry and the 229px composition decision. Preserve File Row 55px height/38px visual/12px radius. Verify default, disabled, read-only and invalid Composer plus File Upload empty/populated/selection/drop/removal/error/focus. Browser coverage must include long localized names, unknown extensions, multiple files, 220px containment, desktop and 200% root text.

Validation and completion results will be appended after execution; existing manifest pass labels are historical, not new evidence.

## Observed implementation evidence

- Initial browser regression rejected the old Composer layout (missing visual, growing width and primary metadata); the corrected named-example test passes with exact Comment Feed geometry and PDF asset.
- Focused attachment tests pass for static examples, three selected files, literal markup-like names, uppercase PDF, unknown suffix, PNG consumer replacement, Enter/Space removal, retained names and 220px containment at 200% root text.
- Shared occurrence guard observes 18 initial File Rows and 24 inert diagnostics; after selecting three files it observes 21 classified rows, then 20 after removing the middle file. No duplicate or unclassified rows.
- Source integrity: original Documents.svg SHA-256 matches the existing authority record. Read-only crops from Documents.svg and Комментарии.svg inspected; the intended difference is the repository's existing 229px composition width and accessible metadata color.
- First focused run: 20 existing/new browser checks passed; one new test incorrectly assumed external SVG URLs and was corrected to compare decoded SVG content, since Vite inlines small assets. No implementation regression caused that failure.
- Changed snapshots: two Composer compositions and File Upload states, plus four new focused attachment crops. The source/standalone File Row styles and Comment Feed implementation remain byte-unchanged.
- Eleven focused source/contract/manifest Node tests passed. ESLint and Stylelint passed on changed implementation and tests.

Final confirmation, independent review and candidate-bound delivery checks are recorded separately after the implementation commit. This correction does not certify unrelated components or extend upload transport/queue behavior.
