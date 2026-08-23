## Why

Notification and Snackbar already have source-derived styles and partial Showcase evidence, but both remain `INVENTORIED`: neither has a component manifest, repository-wide occurrence guard, independently complete evidence ladder, responsive/content-stress proof, or a precise split between Notification semantics and Snackbar's static countdown presentation. Wave 8 establishes executable, source-traceable contracts before either family can be reported `VERIFIED`.

## What Changes

- Re-attest Notification against the raw `Notification.svg` and its exact three Type variants: Default, Error, and With button, all 384×58.
- Re-attest Snackbar against the `components/Snackbar` source set inside raw `UI Kit – Basic elements.zip` and its exact six Number variants 5 through 0, correcting the repository's current archive provenance error.
- Preserve one framework-neutral feedback primitive while defining independently auditable Notification and Snackbar contracts, occurrences, supported states, content stress, accessibility ownership, and limitations.
- Keep placement, urgency selection, live-region policy, queueing, timing, pause, persistence, countdown synchronization, dismissal, and focus recovery consumer-owned; no timer, toast manager, controller, or library event is inferred from static SVGs.
- Add exact source-integrity checks, component manifests and occurrence guards, executable Showcase fixtures, focused real-browser accessibility/runtime/visual assertions, responsive/content-stress evidence, and independent audit statuses and reporting.
- Preserve existing public class names and CSS-only foundation unless a source-backed defect requires a narrowly compatible correction.

Non-goals are a toast queue or placement container, timer/animation/countdown lifecycle, auto-dismiss or hover/focus pause, framework adapter, new status/urgency API, library event, cross-engine certification beyond the available harness, and any change under `shlz-design-source/`.

## Capabilities

### New Capabilities

- `messaging/notification`: Source-backed Notification structure, semantics, application-owned lifecycle boundary, supported states, occurrences, content stress, and audit acceptance.
- `messaging/snackbar`: Source-backed Snackbar countdown presentation, semantic and lifecycle unknowns, occurrences, content stress, and independently complete audit acceptance.

### Modified Capabilities

None. The repository has no living OpenSpec capability for either feedback family.

## Impact

Implementation may touch Notification styles, Showcase and plain-HTML fixtures, component documentation, source provenance references, project inventory and new component manifests, structural/source tests, focused Playwright coverage, and snapshots. Existing consumers remain compatible because current selectors and the application-owned integration boundary are preserved. The primary risk is accidentally promoting static countdown frames or current Showcase behavior into a library-owned lifecycle; the specs and executable evidence explicitly guard that seam.
