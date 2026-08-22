## Context

See `proposal.md` for motivation and the three delta specs for normative behavior. The raw authorities are `Modal.svg` and `Drawer.svg`; both are static isolated sheets, so they establish visual structure but not modality, focus, dismissal, scrolling, or nesting. Derived `design-source-index/components.json` is useful for executable census but cannot overrule raw SVG.

The repository already ships separate Modal and Drawer CSS/controllers, a small `internal/native-dialog` composition, Showcase/plain-HTML fixtures, a Data Workspace Drawer consumer, broad Playwright coverage, and ADR 0007. These are implementation/evidence to audit, not automatic authority. Modal and Drawer are currently `INVENTORIED`, have no component-specific manifests or occurrence guard, and their existing controller enhancement is not demonstrably idempotent. Wave 6 Dropdown, Tooltip, and Popover are `VERIFIED` and form a compatibility boundary.

Repository census at proposal time:

- source: five Modal standalone components — 572×196 Basic (Legacy), 416×165 Info, 416×165 Success, 417×165 Warning, 416×165 Error — and one 420×900 standalone Drawer; no variant/property definitions;
- Modal executable surfaces: two Showcase dialogs plus one plain-HTML dialog; source/fidelity diagnostics exist separately;
- Drawer executable surfaces: one Showcase dialog, one Data Workspace live consumer, and one plain-HTML dialog; source/fidelity diagnostics exist separately;
- current project-inventory observed counts are historical measurements and contain inconsistent occurrence categorization, so implementation must recensus built DOM and repository files rather than copying those numbers into acceptance thresholds.

## Goals / Non-Goals

**Goals:**

- Establish independently auditable Modal and Drawer contracts with traceable source facts, repository decisions, unknowns, exact current occurrences, and strict material-state ledgers.
- Preserve a native-first, framework-neutral public surface while proving focus, dismissal, scroll, nesting, lifecycle, and real-consumer behavior.
- Make the Modal/Drawer/Wave 6 semantic seam and Escape precedence executable.
- Permit only the smallest shared internal lifecycle seam justified by identical behavior.

**Non-Goals:**

- A public or generic `Overlay`, `OverlayController`, stack/portal/z-index manager, focus-trap framework, inert or dialog polyfill.
- Non-modal Drawer, left/top/bottom placement, arbitrary modal nesting/concurrency, nested popover trees, animation/motion APIs, or application workflow state.
- Inventing source variants, renaming the five Modal source components, or treating the 417 px Warning specimen as proof of a new size.
- Redesigning or weakening Wave 6 floating surfaces to make overlay tests pass.

## Decisions

### 1. Audit the existing implementation against authority instead of treating it as a greenfield design

Implementation begins with source and repository census, manifests, and focused failing assertions. Existing CSS, controller APIs, ADR, docs, snapshots, and tests are retained only where they satisfy the new contract. This avoids both needless churn and circularly defining the contract from current code.

Alternative: declare the current implementation canonical. Rejected because audit status is only `INVENTORIED`, occurrence classification is incomplete, and current structural/browser tests do not prove the full completion gate.

### 2. Keep Modal and Drawer separate; share only proven native-dialog lifecycle mechanics

Both public families remain separate in markup, exports, styles, docs, manifests, and specs. Their common internal seam may own trigger resolution, native open/close, ARIA trigger synchronization, opt-in backdrop gesture, eligible focus restoration, idempotent ownership, and teardown. Geometry, supported content states, body regions, and component naming remain component-local.

No generic overlay framework is justified: Wave 6 surfaces differ in semantics, focus, dismissal, and positioning, while native dialog already owns modal top-layer mechanics. If making the existing helper safe requires a controller registry, keep it private and keyed by the enhanced dialog; do not expose a stack or base class.

Alternative: public Overlay base/controller. Rejected for lack of a shared external contract and because it would erase meaningful family boundaries.

### 3. Drawer is modal-only and right-side-only for Wave 7

`Drawer.svg` proves neither edge nor modality. The existing Data Workspace supplementary filter task and accepted native-dialog ADR provide repository evidence for one bounded modal use case. Wave 7 records right attachment, attached-edge radii, backdrop, and narrow full-width layout as repository decisions. Non-modal behavior is not a boolean variant on the same contract: it changes focus containment, background interaction, Escape, outside interaction, and scroll ownership and therefore needs a future proposal.

Alternative: expose modal/non-modal and all edges now. Rejected as speculative API.

### 4. Native dialog owns modal mechanics; consumers own meaningful initial focus

The modal contract uses the platform dialog lifecycle and top layer. Consumers use native `autofocus` where a specific safe target is required; otherwise browser initial-focus behavior applies. The library does not choose a destructive/default action, implement a focus loop, make the document inert, or add document scroll lock. On close, the library restores the current cycle's opener only when connected and operable.

Tests must cover no-autofocus fallback as well as explicit autofocus, Tab/Shift+Tab containment, background inertness, opener removal/disablement, all close paths, and reopening from another trigger.

Alternative: library focus selector/API or custom trap. Rejected because no source/consumer requirement proves it and native behavior covers the supported browser policy.

### 5. Escape precedence is compositional, not a new global stack

Wave 6 surfaces already maintain active-instance/Escape ownership. Within a native dialog, their handlers must close the nested floating surface and prevent that key from canceling the dialog. The next Escape reaches native dialog cancel. Browser tests exercise each Dropdown/Tooltip/Popover composition in real open state, including reopen and teardown. No global overlay registry is introduced unless a failing executable case proves the local/native composition cannot meet the spec; such a discovery requires revising this change before adding infrastructure.

Arbitrary nested/concurrent modal dialogs remain unsupported and must be detected/classified rather than silently covered by this precedence model.

### 6. Backdrop gesture and scrolling stay locally owned

Backdrop dismissal defaults off. Opt-in dismissal requires pointer down and up on backdrop geometry outside the direct surface; resetting gesture state on completion, close, reopen, cancellation, and destroy prevents stale drag state. Nested surface interaction is inside the containing dialog and cannot count as backdrop.

Only `.shlz-modal__body` / `.shlz-drawer__body` scroll under overflow; stable header/footer geometry is verified. Native modality blocks background interaction; no library mutation of `documentElement`/`body` overflow is permitted. Modal remains viewport-bounded; Drawer is 420 px on supporting viewports and fits narrower viewports.

### 7. Completion evidence uses component manifests and strict executable ledgers

Create `modal.json` and `drawer.json` per the manifest contract. Recensus repository files and built DOM; classify executable fixtures, content-stress fixtures, live consumers, inert diagnostics, and legacy/native substitutes. Add stable audit IDs to every executable root and connect one focused Wave 7 Playwright spec to the shared occurrence guard. Counts in the final report are observations, not fixed acceptance thresholds.

Material-state assertions are recorded only after real browser interaction/computed-style checks succeed. Focused screenshots cannot substitute for runtime or accessibility. At least one plain-HTML path per family and the Data Workspace Drawer must execute. Run Wave 6 focused and guard suites whenever shared/nested behavior is touched.

## Risks / Trade-offs

- **[Existing public behavior fails the stricter contract]** → Prefer a backward-compatible fix; record any unavoidable public change explicitly and revise proposal/specs before implementation.
- **[Browser-native focus details differ across supported engines]** → Assert contract outcomes rather than incidental focus order; execute the repository-supported browser matrix and document platform limitations.
- **[Escape event ordering closes both layers]** → Reproduce with real nested states and keep coordination local to the nested controller/native cancel boundary; do not introduce a global manager without demonstrated need and design revision.
- **[Repeated enhancement currently duplicates owners]** → Add private element ownership/idempotence and tests for repeated enhancement, destroy, reopen, and multiple instances without changing public API unless necessary.
- **[Historical inventory counts/category labels are inconsistent]** → Perform a fresh built-DOM/repository census, update manifests/inventory with exact classifications, and report before/after evidence.
- **[Source status names could be mistaken for a public semantic API]** → Preserve source names only as supported visual material states; do not add API variants unless existing public markup is proven and documented.
- **[Snapshot changes hide regressions]** → Inspect component-focused diffs; source-backed changes require provenance, repository-decision changes require rationale, and unexplained changes block completion.

## Migration Plan

1. Establish baseline SHA, clean/dirty scope, existing CI failures, review threads, current built-DOM census, and source hashes without modifying source.
2. Add manifests/guards and focused contract tests; let failures expose gaps in existing implementation and fixtures.
3. Make the smallest compatible implementation/documentation corrections in a separately approved apply phase.
4. Validate source, unit/structural, package/build/lint, focused browser/accessibility/visual/content-stress, plain-HTML, Data Workspace, and Wave 6 regression suites.
5. Update audit inventory/status only after each component independently passes its gate; a finding in one family does not determine the other.

Rollback consists of reverting implementation and evidence changes together while leaving Modal/Drawer at their prior non-verified audit status. No data migration or external dependency is introduced.

## Open Questions

- The supported browser matrix may reveal engine-specific native-dialog focus behavior; such limitations can be documented if the normative containment/restoration outcomes still hold.
- Exact refreshed occurrence counts are intentionally deferred to implementation-time built-DOM census because repository counts are observations, not contract constants.
