## Context

See `proposal.md` for motivation and `specs/harness/contract-derived-tdd-routing/spec.md` for behavior. The existing TDD module deeply owns slice design, independent test-contract review, RED/GREEN evidence, re-entry, final review, and delivery, but its interface begins only after a caller elects to provide `assessment.specDrivenTdd`. The Wave 9 plan is therefore structurally valid while bypassing the lifecycle.

## Goals / Non-Goals

**Goals:**

- Put obligation derivation at the plan-construction seam, before lifecycle state exists.
- Make the OpenSpec delta—not planner prose or packet naming—the authority for scenario semantics.
- Reuse the existing TDD lifecycle unchanged after eligibility and coverage are established.
- Keep the classification vocabulary small, explicit, digest-bound, and independently fixture-testable.
- Select validation from semantic impact and executable surfaces rather than pathname labels.
- Reuse expensive validation only while every input capable of changing its meaning remains digest-identical.

**Non-Goals:**

- Infer semantics from natural-language keywords or SHALL/MUST wording.
- Auto-generate acceptance commands, fixtures, packets, or oracle controls.
- Require formal spec-driven TDD for evidence-only changes or retrofit historical persisted plans.
- Weaken the independent test-contract review, RED/GREEN, failure-invariant, or delivery gates.

## Decisions

### Classify scenarios in the normative delta contract

Each `#### Scenario` carries one adjacent HTML comment: `implementation-semantics: material-behavior|material-state|source-only|absence-only|documentation-only`. A repository-owned parser walks every delta spec for the selected change, derives a stable scenario identity from capability path plus requirement/scenario headings, rejects malformed or duplicate declarations, and hashes the normalized classification.

Alternative: add a planner-owned assessment field. Rejected because it reproduces the bypass. Alternative: infer semantics from English. Rejected because keyword heuristics cannot reliably distinguish an absence assertion about runtime behavior from source-only inventory evidence.

### Derive obligation before constructing the plan

The public `harness plan` command resolves the selected change from the already requirements-bound `openSpecChange`, parses its delta specs, and passes the immutable classification to plan construction. `createPlan` requires exact, single enforced-slice coverage for every `material-behavior` and `material-state` identity. It persists only a compact change/digest/required-scenario binding; existing lifecycle details remain in `specDrivenTdd`.

Alternative: infer from packet `implementationSurface` or `implementationOutcomes`. Rejected because those are planner-authored operational descriptions and cannot serve as normative authority. Alternative: synthesize full TDD slices automatically. Rejected because commands, deterministic controls, production surfaces, and independent seams require deliberate design even though the obligation itself does not.

### Preserve read compatibility, enforce new creation

`validatePlan` continues to accept historical plans without the new binding. The `plan` creation path for requirements-gated OpenSpec work always resolves current delta semantics and emits the binding or fails. This distinguishes reading durable history from authorizing a new execution episode.

### Use Wave 9 as an immutable regression fixture

Copy the originally emitted Wave 9 plan and the minimal relevant contract text into `docs/exec-plans/fixtures/`. A behavior probe demonstrates that the old shape fails because material behavior/state identities are uncovered. Adjacent fixtures exercise valid enforced coverage and source-only, absence-only, and documentation-only changes without formal TDD.

### Route validation from impact, not file kind

Validation policy declares semantic impact signals and executable surfaces for each target. The harness combines the episode diff with current change contracts and configured target inputs. A change classified as harness/spec/docs-only selects no Playwright target only when it also has no browser/product executable impact. Conversely, a contract or documentation edit that changes a browser contract, showcase fixture, Playwright oracle, or other browser-relevant executable surface selects the appropriate browser target even if no product source file changed.

Path patterns remain conservative evidence for locating surfaces, not the authority for impact classification. Unknown or contradictory impact fails closed to an explicit escalation target rather than silently skipping browser validation.

### Fingerprint the validation-input closure

A reusable result is keyed by the target plus the complete configured validation-input closure: relevant changed/product source, the target's test suite and oracle inputs, runner/browser configuration, validation policy, and dependency/lock inputs when they can affect execution. The closure is resolved from repository state, not only from files changed in the current diff. Any closure change produces a new fingerprint and invalidates prior success. An unchanged closure reuses the existing pass instead of rerunning an expensive target; an explicit reason cannot override a mismatched closure or manufacture reuse.

## Risks / Trade-offs

- **[Contract annotation overhead]** → One closed declaration per scenario makes semantics reviewable and eliminates hidden planner state.
- **[Misclassification by contract author]** → Strict vocabulary, explicit review surface, digest binding, and regression fixtures make the decision visible; no deterministic machine can truthfully infer arbitrary prose semantics.
- **[Existing active changes lack declarations]** → Persisted plans remain readable; only a new planning attempt uses the new contract, and diagnostics identify every missing scenario.
- **[Duplicate human-readable headings]** → Stable identities include capability, requirement, and scenario headings and duplicate identities fail closed.
- **[Semantic impact ambiguity]** → Closed impact signals plus executable-surface intersection fail closed; directory names alone never decide browser coverage.
- **[Large fingerprints]** → Hash a deterministic target-specific closure, not the entire repository, while including every configured meaning-changing input.

## Migration Plan

Land parser, plan enforcement, fixtures, tests, and operator documentation together. Existing plan/state JSON remains readable. Rollback removes the creation-time derivation and new binding without rewriting historical artifacts. No package or source migration is required.
