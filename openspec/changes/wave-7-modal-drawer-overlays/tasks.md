## 1. Baseline, authority, and census

- [x] 1.1 Record implementation baseline SHA, working-tree scope, CI/check status, open review threads, and pre-existing failures; verify the Wave 7 report distinguishes baseline issues from introduced regressions.
- [x] 1.2 Re-inspect `Modal.svg` and `Drawer.svg` read-only and harden source tests for the exact five-Modal/one-Drawer census, names, dimensions, zero variant properties, geometry/effects, extraction warnings, and lossless generated references; verify focused source tests pass and source hashes remain unchanged.
- [x] 1.3 Perform a fresh repository and built-Showcase census for Modal and Drawer markup, behavior, diagnostics, native/legacy substitutes, content-stress fixtures, and consumers; verify every occurrence is classified and report exact observed counts without using counts as permanent acceptance thresholds.
- [x] 1.4 Reconcile census results with `project-inventory.json`, including any currently inconsistent fixture/live-consumer/local-alternative categories; verify JSON/schema checks pass and each family remains independently `INVENTORIED` or `FINDINGS` until its gate passes.

## 2. Audit contracts and occurrence guards

- [x] 2.1 Create `docs/component-audits/modal.json` with authoritative/reference sources, implementation/docs, supported source material states, content stress, source claims, findings/limitations, occurrences, all evidence levels, strict interaction ledgers, and manual-walk fields; verify manifest-contract tests accept it without generic or automatic pass claims.
- [x] 2.2 Create `docs/component-audits/drawer.json` with modal-only/right-side boundaries, source-versus-decision classifications, Data Workspace consumer, supported states, content stress, findings/limitations, occurrences, all evidence levels, strict interaction ledgers, and manual-walk fields; verify manifest-contract tests accept it.
- [x] 2.3 Add stable unique Modal/Drawer audit IDs to every executable fixture, content-stress fixture, and live consumer while keeping inert diagnostics within explicit boundaries; verify built DOM contains no missing, duplicate, or unclassified occurrence.
- [x] 2.4 Connect focused Wave 7 browser coverage to the shared occurrence guard for each component; verify adding an unclassified overlay root or legacy/native substitute makes the guard fail.

## 3. Focused executable contract tests

- [x] 3.1 Add/reshape Modal browser tests for accessible naming, explicit `autofocus`, native no-autofocus fallback, Tab/Shift+Tab containment, background inertness, every close/return-value path, eligible opener restoration, disconnected/disabled/aria-disabled opener handling, and reopen from a different trigger; verify real browser outcomes pass.
- [x] 3.2 Add/reshape Modal backdrop and scroll tests for default non-dismissal, opt-in outside-to-outside pointer dismissal, interior-to-exterior drag rejection, stale gesture reset, viewport bounding, independently scrolling body, and stable header/footer; verify long and narrow content behavior without document overflow mutation.
- [x] 3.3 Add/reshape Drawer tests for right-side modal geometry, accessible naming/focus containment/restoration, default and opt-in dismissal, Escape, native return values, 420 px desktop width, sub-420 px fit, body-owned overflow, stable regions, and absence of library scroll lock; verify in supported browser runs.
- [x] 3.4 Add real-interaction/computed-style ledgers that execute every declared Modal and Drawer material state, including Modal Basic/Info/Success/Warning/Error, focus-visible controls, Drawer dismissible/non-dismissible, long content, and narrow layout; verify ledger names exactly equal manifest `materialStates` and active text contrast guards pass or source-backed deviations are recorded.
- [x] 3.5 Add lifecycle tests for repeated enhancement, one owner per element, multiple instance isolation, trigger/ARIA isolation, fresh opener/return/backdrop state on reopen, idempotent destroy, destroy-while-open, stale callbacks, and post-destroy triggers; verify failures reproduce before any necessary implementation correction.

## 4. Bounded implementation corrections

- [x] 4.1 Correct Modal behavior/style/markup only where focused tests expose a spec violation, preserving existing public names and source-backed geometry; verify Modal-focused unit/browser/visual tests pass with no invented API or material variant.
- [x] 4.2 Correct Drawer behavior/style/markup only where focused tests expose a spec violation, retaining right-side modal-only support and no placement/modality API; verify Drawer-focused unit/browser/visual tests pass.
- [x] 4.3 If shared lifecycle corrections are required, keep them in the private native-dialog composition and prove both consumers need identical behavior; verify repository scans expose no public `OverlayController`, `ModalManager`, portal, focus trap, inert polyfill, z-index stack, or document scroll-lock implementation.
- [x] 4.4 Make enhancement ownership and teardown stale-state-safe without duplicating application state; verify repeated enhancement, close/reopen cycles, multi-instance tests, package declarations, and plain ESM consumption pass.

## 5. Wave 6 and nested-overlay composition

- [x] 5.1 Exercise Dropdown, Tooltip, and Popover separately inside a real open Modal and supported Drawer composition for visibility, collision bounds, interaction, focus ownership, and outside-interaction containment; verify each retains its Wave 6 semantics and no nested interaction triggers modal backdrop dismissal.
- [x] 5.2 Verify topmost Escape precedence: first Escape closes exactly one nested floating surface, second Escape closes the containing Modal/Drawer, and reopen/teardown do not leave stale Escape owners.
- [x] 5.3 Run Wave 6 source, focused placement, accessibility, strict interaction-evidence, occurrence-guard, plain-HTML, idempotence, and teardown regressions; verify no manifest, state ledger, or assertion is weakened to accommodate Wave 7.
- [x] 5.4 Census for unsupported Modal-in-Modal, Drawer-in-Modal, Modal-in-Drawer, concurrent modal, nested-popover-tree, and portal cases; verify each is absent or explicitly recorded as a finding/non-goal rather than silently accepted.

## 6. Consumers, documentation, and visual evidence

- [x] 6.1 Exercise Modal and Drawer through standalone CSS plus direct browser ESM in the plain-HTML fixture, including open, Escape/close, focus restoration, and teardown; verify no framework or bundler runtime is required.
- [x] 6.2 Exercise the Data Workspace Drawer as an application-owned live consumer, including open/focus, controls/state retention, apply/cancel/close, scrolling/narrow layout, and focus restoration; verify consumer state remains application-owned.
- [x] 6.3 Update Modal, Drawer, behavior-layer, ADR/report documentation only where the audited contract or findings require it, clearly labeling source facts, derived patterns, repository decisions, assumptions, supported states, and non-goals; verify documentation/source structural checks pass.
- [x] 6.4 Capture and inspect component-focused source-state, real-open, focus-visible, long-content, narrow Drawer, and nested-floating snapshots/computed geometry; verify every changed image has source or documented-decision provenance and no broad page screenshot substitutes for component fidelity.
- [x] 6.5 Perform and record separate manual interaction walks for Modal and Drawer covering pointer open/close/backdrop/drag, Tab/Shift+Tab/focus-visible, Escape precedence, form/explicit actions, long/narrow content, disabled/stale opener, repeated open, nested Wave 6 surfaces, and Data Workspace where applicable.

## 7. Final verification and audit disposition

- [x] 7.1 Run formatting/lint/type checks, package builds/exports, source integrity, audit manifest/occurrence tests, focused unit/structural tests, supported-browser runtime/accessibility suites, focused visual suites, responsive/content-stress suites, plain-HTML, Data Workspace, and Wave 6 regressions; record exact commands/results and do not hide browser failures behind aggregate success.
- [x] 7.2 Review the implementation diff against all three Wave 7 specs, authoritative SVGs, repository conventions, and bounded non-goals; resolve every scope-local finding and record severity/evidence/disposition plus linked follow-up for any qualifying pre-existing cross-component deviation.
- [x] 7.3 Update each component's manifest evidence and project audit status independently only after its complete gate passes; verify no completion statement for Modal is inferred from Drawer or vice versa.
- [x] 7.4 Produce the Wave 7 audit report with baseline/final SHA and diff scope, exact occurrence counts/classification, material states executed, evidence-level results, snapshot disposition, limitations/blockers, CI and review-thread state, and unresolved follow-ups; verify no component is called complete/review-ready unless its gate passes.
- [x] 7.5 Run `npm run check:openspec` and `openspec validate wave-7-modal-drawer-overlays --strict`; verify both complete successfully before requesting sync/archive or implementation review.
