## 1. Contract and Lifecycle

- [x] 1.1 Add failing focused tests for plan validation, review-state transitions, complete approval, rejection, stale evidence, and reviewer independence; verify the new tests fail against the pre-change harness behavior.
- [x] 1.2 Extend the versioned spec-driven TDD plan/state contract with a guarded review packet and explicit pending-review/reviewed lifecycle; verify focused harness tests pass while legacy version 1 plans remain readable.

## 2. Public Harness Integration

- [x] 2.1 Add the `tdd-review-record` public CLI transition with digest-bound checklist and scenario evidence validation; verify incomplete, self-reviewed, implementation-informed, and stale handoffs fail closed.
- [x] 2.2 Compose approval with RED, worker readiness/claims, requirements re-entry, final review binding, and delivery; verify no pre-review path can create RED or implementation authorization.

## 3. Representative Evidence and Documentation

- [x] 3.1 Add an executable representative scenario that rejects a plausible incomplete test contract and accepts the corrected independently reviewed contract through the same public seam; verify known-bad discrimination is deterministic.
- [x] 3.2 Update agent-facing execution, validation, and harness command documentation with the distinct pre-implementation review lifecycle; verify documentation and CLI usage agree.

## 4. Validation and Delivery

- [x] 4.1 Run strict OpenSpec, focused harness, aggregate repository, formatting, and diff checks; record exact results and limitations.
- [x] 4.2 Prove the marked state-machine and persistence failure invariants against the immutable baseline and reviewed head, then run independent Standards and Spec reviews and resolve every blocking finding.
- [x] 4.3 Run route conformance and guarded delivery checks, push the task branch, open a PR targeting `main`, and verify the PR remains open and unmerged.
