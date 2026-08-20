# Wave 2 — Form Controls audit report

Baseline: `316c5ae9b77090c3bec61ad326bcf4510224c8c0` (merged PR #15). Audit branch: `audit/wave2-form-controls`. The baseline working tree and `shlz-design-source/` were clean; no open PR existed. Existing pagination and Select fidelity worktrees were inspected but not imported.

## Input

- Observed DOM: 56 styled inputs: 50 inert diagnostics, five executable Showcase/live compositions outside Data Workspace, and one Data Workspace consumer.
- Authority: `Input Number.svg`; 21 retained nodes, 222px width, 40/32px controls, 20/16px radii and 12px inset. Broken exported properties mean Advanced semantics remain unsupported diagnostics.
- Ownership: browser owns value, form submission, editing, focus and native events; SHLZ owns the visual field composition; consumer owns validation, readonly policy and application state.
- Evidence: source tests, occurrence guard, exactly one `input` and one `change` event for one edit/commit, event-free programmatic assignment, Data Workspace search, narrow Fira containment and focused state snapshot.
- Findings/fixes: the prior inventory omitted live overlay/composition consumers and had only incidental browser evidence (P3, closed by re-inventory and focused coverage). No production CSS/API fix was required.
- Status: `VERIFIED`.

## Textarea

- Observed DOM: 38 styled textareas: 26 inert diagnostics and 12 executable fixtures; no Data Workspace/application-owned consumer.
- Authority: `Textarea.svg`; complete structured 5 state × 2 filled × 2 counter matrix, 395px width, approximately 58px control, 8px radius and 12×8px inset.
- Ownership: browser owns multiline value, focus and editing; SHLZ owns visual composition; consumer owns counter, maxlength, validation, messages and any auto-grow policy.
- Evidence: source matrix test, occurrence guard, multiline runtime, a real fixture-owned `aria-invalid`/`aria-describedby` relationship, long-text wrapping and focused state snapshot. Counter updates remain explicitly consumer-owned and are not claimed as library runtime.
- Findings/fixes: old evidence had runtime, focused visual and relationship gaps (P2, closed). The previous test created its own ARIA relationship and therefore could not prove the fixture; the fixture now owns the relationship before test execution. No production CSS/API fix was required.
- Status: `VERIFIED`.

## Checkbox

- Observed DOM: 27 styled checkboxes: 15 inert diagnostics, eight executable Showcase/live roots and four Data Workspace roots.
- Authority: `Checkbox.svg`; 20/16px controls, 6/4px radii, checked/mixed/disabled paints and marks.
- Ownership: native checkbox owns form presence/value, checked, indeterminate property, label activation, Space and events; SHLZ owns appearance; consumers own selection policy.
- Evidence: source geometry tests, occurrence guard, exactly two `input` and two `change` events for pointer plus Space, event-free programmatic assignment, mixed and disabled-no-event state, Data Workspace row/select-all/clear behavior and focused snapshot.
- Findings/fixes: previous tests proved static geometry and incidental state only, not event count or real Data Workspace lifecycle (P2, closed). No production CSS/API fix was required.
- Status: `VERIFIED`.

## Radio

- Observed DOM: 13 styled radios: 11 inert diagnostics and two executable grouped options; no Data Workspace consumer.
- Authority: `Radio.svg`; 20px outer circle, 10px dot and source paints. Duplicate/broken source names are resolved by primary SVG geometry/paint, not by invented properties.
- Ownership: browser owns same-name exclusion, tab stop, Arrow navigation, checked and events; SHLZ owns appearance; consumer owns fieldset/group layout and validation.
- Evidence: source tests, occurrence guard, Tab entry, Arrow navigation, Space selection, native exclusion, exactly two `input` and two `change` events, event-free programmatic assignment and focused group snapshot.
- Findings/fixes: old single-control state smoke did not prove group behavior (P2, closed). No production CSS/API fix was required.
- Status: `VERIFIED`.

## Switch

- Observed DOM: 16 styled switch inputs: 13 inert diagnostics and three executable fixtures; no Data Workspace consumer.
- Authority: `Switch.svg`; 38×20 and 24×14 tracks, 16px and 11.2px thumbs, on/off and disabled states.
- Ownership: native checkbox with `role=switch` owns focus, checked, Space and events; SHLZ owns static appearance; consumer owns persistence/failure handling.
- Evidence: complete source matrix tests, occurrence guard, semantic name/role, Space and pointer behavior, exactly two `input` and two `change` events, event-free programmatic assignment, disabled no-focus/no-toggle/no-event behavior and focused two-size snapshot.
- Findings/fixes: old checked-state smoke did not prove accessible role/name or keyboard/programmatic lifecycle (P2, closed). No production CSS/API fix was required.
- Status: `VERIFIED`.

## Cross-control disposition

The Wave 2 changes add audit metadata, manifests, focused runtime/accessibility/visual tests and snapshots. They do not change `field.css`, `choice.css`, `@shlz/behaviors`, tokens or public APIs. Select is not re-audited; its existing manifest and contract remain unchanged and its full focused/browser regression is blocking. New snapshots exist because no component-local visual evidence previously existed; they capture current source-attested states rather than accepting a production visual change.

The old structural/source assertions remain useful for traceability but were insufficient for browser ownership, event counts, group keyboard behavior, consumer lifecycle, focused visual fidelity and responsive content stress. The initial page-wide narrow assertion was also rejected because unrelated Showcase overflow cannot prove a component-local regression.
