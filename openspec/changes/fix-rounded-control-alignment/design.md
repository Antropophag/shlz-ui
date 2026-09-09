## Context

The two browser audits established A1–A13 on the published Showcase. See proposal.md and the rounded-control-layout delta for scope. Source SVGs and originals inside the Basic Elements archive remain read-only. Existing APIs and native interaction remain the foundation; the defects are local CSS/cascade/composition failures.

## Goals / Non-Goals

**Goals:** reproduce each audited failure through its real browser seam; correct the responsible layer; verify the result in the original composition and at shared primitive boundaries.

**Non-Goals:** global optical recentering of Fira/Avatar glyphs, new variants, unrelated contrast or lifecycle changes, source regeneration, framework adapters, and merging the PR.

## Decisions

1. **Source facts versus content policy.** Switch dimensions, tab heights, Badge typography, 82×27 Advanced actions, 30px History labels and source minima are facts. Letting localized labels grow in width or reflow within a growing shell is repository-owned content policy. Fixed pixel widths are retained as minima where a loaded font's advance cannot fit the original export. This avoids shrinking typography or clipping content just to keep an incidental width.
2. **Paint, not only boxes, for Switch.** Evaluate source-sized thumb positioning without separate native-content rounding. Select the smallest CSS rendering change that passes integer/quarter-phase paint comparison at DPR1/2. Preserve checked movement and focus/disabled states. Reject a global half-pixel translation or integer diameter replacement: neither preserves source geometry across phases.
3. **Correct ownership.** Field owns supported text/action metrics; compact Tabs own their parent minimum height; Notification owns message/action reflow; Showcase owns label selectors and specimen grid placement. Do not solve consumer grid stretch by changing every library Badge into a fixed-width element.
4. **Profile inheritance is explicit.** Only text-bearing native Field/Comment Feed controls receive family/metric rules. Preserve icon-only affordances, semantics, and event ownership. Set text metrics from the applicable source/established component context rather than adopting a global browser reset.
5. **Regressions use approved public seams.** The user approved the audits and implementation of their thirteen findings. Tests target rendered library HTML, existing Showcase diagnostic/consumer compositions, native interactions, and painted pixels. Begin each coherent seam with a failing browser assertion, then implement and re-run. Keep a symmetric known-bad adapter from the immutable baseline for final harness proof; source expectations come from the normative delta, not candidate computed values.
6. **Execution sizing and decomposition.** This is one coherent material M/L visual correction across eight owning CSS surfaces, with no architecture/state-machine change. Execute inline in bounded slices: Switch; Field; Tabs/Badge; Notification; Empty/History; Comment typography; evidence/integration. Independent Standards and Spec reviewers provide the physically separate review boundary. No packet graph or generic test framework is needed. Ten outcome-level tasks keep the change reviewable.
7. **Evidence and scope ledger.** Store compact source/occurrence findings in component audit manifests and one cross-component visual audit record. Distinguish inert diagnostics from executable fixtures and real consumers. Maintain thirteen stable defect IDs; do not promote other components or optical candidates to VERIFIED. Reuse existing runtime/accessibility/state suites for unchanged behavior, with focused new native and geometry checks.

## Risks / Trade-offs

- Native input rasterization differs by browser and pixel phase → compare contrast-aware painted masks, run Chromium fractional probes and relevant cross-browser native smoke; keep explicit limitations.
- Natural label width changes source-exact historical screenshot widths → preserve source minima, document content-driven adaptation, inspect focused source/actual pairs and snapshot updates.
- Reflow can change Notification action placement → verify short/narrow and long/intermediate cases, focus reachability, native events, and the existing notification consumer suite.
- Existing snapshot baselines may contain the defects → update only after source assertions and focused image inspection; never bless broad unrelated differences.
- Changes to shared Field/choice styles can reach unaffected controls → include existing form/choice source and runtime suites; keep unsupported combinations diagnostic.

## Migration Plan

No markup or API migration is required for existing public consumers. Existing diagnostic and Showcase markup may gain bounded specimen wrappers/IDs where needed for isolated measurement. Deliver as one unmerged PR. Rollback is the scoped CSS, fixture, and evidence diff; sources and dependencies remain unchanged.
