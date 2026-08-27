# UI component completion gate

For substantial component work, execution may split this gate across component-specific and integration evidence, but it MUST preserve every applicable step/evidence level and independent component status. Use the ladder in `docs/validation-workflow.md`; focused validation narrows repeated work, never certifies a component by itself.

This is the required, repeatable workflow before a UI component may be reported
as fixed, complete, production-ready, review-ready, or a finished side quest.

1. **Project inventory:** locate the family in
   `docs/component-audits/project-inventory.json`, including its independent
   implementation and audit statuses. Add newly discovered families first.
2. **Baseline:** record branch/head, diff scope, CI, review threads, and existing
   failures.
3. **Component manifest:** create or update the component-specific contract
   described in `docs/component-audits/manifest-contract.md`.
4. **Occurrences:** inventory the repository and classify executable fixtures,
   live consumers, inert diagnostics, and legacy/native substitutes in
   `docs/component-audits/<component>.json`.
5. **Occurrence guard:** add stable audit IDs to this component's executable
   roots and connect its focused browser spec to the shared guard.
6. **Source:** inspect the authoritative original SVG. Classify claims as
   `source-fact`, `derived-pattern`, `repository-decision`, or `assumption`.
7. **Contract:** record applicable sizes, states, content stress, keyboard,
   focus, events, and unsupported modes. Default/closed is never a proxy for the
   whole component.
8. **Implementation:** review styles, public API, lifecycle, accessibility, and
   every executable occurrence.
9. **Consumer:** when a real application consumer exists, exercise at least one
   in browser integration coverage. Data Workspace is a consumer, not gallery.
10. **Evidence:** collect each applicable evidence level below.
11. **Verify:** run relevant unit, lint, build, browser, and visual checks and
    inspect focused snapshot changes.
12. **Report:** give exact observed counts, scope, limitations, blockers, CI,
    review-thread state, and a component-specific completion status.

## Evidence hierarchy

Evidence levels prove different claims and cannot substitute for each other:

- `source-integrity`: authoritative evidence is unchanged and traceable;
- `structural-contract`: exports, markup, documentation, and composition exist;
- `runtime-browser`: behavior and emitted events execute in a browser;
- `accessibility`: semantics, keyboard order, focus, and disabled behavior;
- `focused-visual`: a component/state snapshot or exact computed geometry;
- `consumer-integration`: application-owned state and lifecycle composition;
- `responsive-content-stress`: narrow layouts and realistic long/empty/error
  content where supported.

Mark a level `not-applicable` only with a reason. Structural regexes never prove
runtime behavior, and a broad page screenshot never proves component fidelity.
Browser or visual failures are blocking CI evidence and must not be hidden by a
green aggregate workflow.

### Interaction evidence model

Interactive audits must classify evidence independently:

- `static-visual`: source matrices, screenshots, diagnostic `--visual-*`
  classes, and computed styles produced by an artificially forced state;
- `real-interaction-visual`: a browser creates the native state and reads its
  computed, source-backed paint or geometry while that state is active;
- `runtime-behavior`: events, navigation, focus movement, selection,
  controller lifecycle, and other behavioral outcomes.

None of these types proves another. In particular, a fake-state fixture is
never runtime or real-interaction evidence. A material interactive-state claim
passes only when one executable flow selects a named variant, creates the real
browser state, reads the relevant computed properties in that state, and
compares them with the source-backed or explicitly documented contract.
Selector presence, a separate click test, and a forced visual class cannot be
combined to substitute for that flow. Unsupported or source-unknown states
remain explicit and never receive an automatic pass.

Manifests record this compactly in `interactionEvidence`: three typed evidence
arrays, the claimed material states, and the focused executable browser spec.
The spec must confirm every declared material state. Stable fake-state helpers
also require source-relevant computed equivalence with the corresponding real
state; a mismatch is a finding and the helper must be fixed or retired as that
state's representation.

For active text-bearing states, browser coverage includes an emergency
foreground/background contrast guard (4.5:1 for normal text, 3:1 for large
text). Disabled/inactive states are reported but do not fail this guard. Exact
source fidelity remains the primary contract: a source-backed contrast failure
is recorded as a finding/deviation and is never silently recolored.

Before `VERIFIED`, perform and record a short manual interaction state walk:
pointer hover/down, Tab/focus-visible, Enter/Space where applicable, disabled,
and narrow/content stress on the surfaces the family actually supports. This
smoke is additional evidence, never a replacement for automation.

`VERIFIED` is revocable current evidence, not a permanent certificate. A new
regression moves the affected family to `FINDINGS`; severity and executable
evidence are recorded, and only the source-backed fix plus regression coverage
may restore `VERIFIED`.

`INVENTORIED` is discovery state, not quality approval. Historical labels such
as `done`, `source-migrated`, or `production-ready` never imply `VERIFIED`.
Only the complete component gate may set `VERIFIED`.

## Pre-existing cross-component deviations

A finding may be accepted as non-blocking for a scoped component PR only when
all of the following are true:

- it existed before the PR and the PR neither introduced nor worsened it;
- resolving it requires changing an authoritative source or shared
  cross-component contract outside the PR scope;
- its severity, scope, evidence, and explicit disposition are recorded in the
  component audit manifest;
- a linked follow-up tracks the shared-contract decision and implementation;
- the final report distinguishes the accepted deviation from PR blockers.

Regressions, scope-local fixes, untracked findings, and findings without an
explicit acceptance remain blockers. Acceptance for one component PR does not
silently accept the deviation for other work.

## Manifest and occurrence guard

Each audited component has a small JSON manifest under
`docs/component-audits/`. Executable roots carry a stable
`data-component-audit-id` listed in the manifest. The browser guard discovers
all roots and legacy/native substitutes, then fails on missing, duplicate, or
unclassified occurrences. It derives counts from the current DOM; counts are
reported evidence, not permanent acceptance criteria.

Inert diagnostics are allowed only inside the manifest's explicit diagnostic
boundary. A legitimate new fixture or consumer must receive an audit ID and a
manifest classification in the same change.
