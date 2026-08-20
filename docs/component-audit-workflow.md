# UI component completion gate

This is the required, repeatable workflow before a UI component may be reported
as fixed, complete, production-ready, review-ready, or a finished side quest.

1. **Baseline:** record branch/head, diff scope, CI, review threads, and existing
   failures.
2. **Occurrences:** inventory the repository and classify executable fixtures,
   live consumers, inert diagnostics, and legacy/native substitutes in
   `docs/component-audits/<component>.json`.
3. **Source:** inspect the authoritative original SVG. Classify claims as
   `source-fact`, `derived-pattern`, `repository-decision`, or `assumption`.
4. **Contract:** record applicable sizes, states, content stress, keyboard,
   focus, events, and unsupported modes. Default/closed is never a proxy for the
   whole component.
5. **Implementation:** review styles, public API, lifecycle, accessibility, and
   every executable occurrence.
6. **Consumer:** when a real application consumer exists, exercise at least one
   in browser integration coverage. Data Workspace is a consumer, not gallery.
7. **Evidence:** collect each applicable evidence level below.
8. **Verify:** run relevant unit, lint, build, browser, and visual checks and
   inspect focused snapshot changes.
9. **Report:** give exact observed counts, scope, limitations, blockers, CI,
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
