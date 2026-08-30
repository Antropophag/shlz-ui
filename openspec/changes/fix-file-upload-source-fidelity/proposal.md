## Why

The shipped File Upload preserves its behavior but visually contradicts the authoritative `Documents.svg`: it replaces the centered 467×102 drop surface with a two-column composition, an invented pill action, and Showcase cards compressed to 240px. The source-backed presentation and its executable evidence must be corrected before downstream consumers rely on the current markup and styling.

## What Changes

- **BREAKING** Replace the separate title/instructions/pill-trigger composition with one associated label that owns the complete source-backed drop surface, cloud-upload icon, and centered instruction.
- Preserve native file selection, file-only drop enhancement, normalized events, disabled/error behavior, consumer-owned queue state, and File Row composition.
- Restore the 467×102 default specimen geometry while keeping a fluid maximum and an explicit narrow/text-scale fallback.
- Replace the four-column Showcase matrix with independently readable source/state specimens and retain one real Data Workspace consumer.
- Update documentation, audit contracts, occurrence classifications, source assertions, focused visual evidence, and regression snapshots without modifying `shlz-design-source/`.

## Capabilities

### New Capabilities

- `forms/file-upload`: Establish the current File Upload behavior together with the corrected source-backed visible-trigger composition and responsive contract as a living specification.

### Modified Capabilities

None. The previous File Upload delta has not been synchronized into `openspec/specs/`; this change establishes the complete living capability rather than pretending an absent main spec is modified.

## Impact

The change affects File Upload markup examples and fixtures, `@shlz/styles` presentation, Showcase layout, component documentation, audit manifests, source/structural tests, Playwright assertions, and visual snapshots. The behavior package and event contract remain compatible. Consumers using the documented child title/instructions/pill structure must migrate to the full-surface label structure; the root, native input, files list, error state, controller, and event interfaces remain available.
