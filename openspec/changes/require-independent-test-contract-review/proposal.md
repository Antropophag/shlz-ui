## Why

The current spec-driven TDD gate separates test design from production implementation and proves a deterministic RED, but a mistaken requirements mapping or weak test contract can still authorize production work without an independent review of that contract. The harness needs a fail-closed approval seam before RED and implementation authorization, while preserving the later two-axis code review as a distinct concern.

## What Changes

- Add an independent test-contract review transition after test design and before RED.
- Require the reviewer to attest requirement/scenario coverage, authoritative expected results, behavioral oracle strength, fixture/control validity, and production-surface independence.
- Bind approval to the immutable test-design and requirements identities; any relevant drift invalidates approval and returns the slice to review or test design as appropriate.
- Require a reviewer runtime distinct from both the test designer and production implementer, and reject self-review or implementation-context input.
- Compose the new gate with existing RED/GREEN, requirements re-entry, worker claims, later Standards/Spec review, failure-invariant proof, and delivery checks.
- Dogfood the gate with a representative harness scenario that rejects a plausible but incomplete test contract before production authorization.
- Preserve legacy plans and ordinary TDD; the new transition applies only to enforced spec-driven TDD slices.

## Capabilities

### New Capabilities

- `harness/independent-test-contract-review`: Defines the pre-implementation independent review contract, lifecycle, evidence binding, and composition with existing gates.

### Modified Capabilities

None. The repository currently retains the related `harness/spec-driven-tdd` contract in an unarchived historical change rather than a living `openspec/specs/` capability, so this change adds a self-contained capability without rewriting that historical delta.

## Impact

- Affects the public harness CLI and the `specDrivenTdd` execution-state machine in `tools/lib/harness/`.
- Adds focused harness tests and representative fixtures; updates agent-facing execution and validation documentation.
- No production UI, package API, dependency, deployment, permission, or `shlz-design-source/` changes.
- Existing plan/state files without the new review requirement remain readable; newly synthesized enforced slices use the reviewed lifecycle.
- Primary risks are ceremonial self-attestation, stale approvals, reviewer context leakage, and accidental duplication of final code review; the design must make each mechanically distinguishable.

## Non-Goals

- Automatically infer semantic test quality from source text or coverage percentages.
- Replace the independent test designer, deterministic oracle challenge, RED/GREEN proof, final Standards/Spec code review, or change-specific failure-path proof.
- Introduce a general-purpose approval framework or require this lifecycle for direct/inapplicable work.
