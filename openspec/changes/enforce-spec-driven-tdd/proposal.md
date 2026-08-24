## Why

The current execution harness can prove an implementation against tests, but it does not prove that acceptance or contract tests were independently designed from the current OpenSpec requirements, failed for the intended reason on the immutable implementation baseline, and remained unchanged while production code moved to green. PR #34 demonstrated that nominal red/green evidence is insufficient when the two sides use asymmetric oracles or timing-dependent probes.

## What Changes

- Add an opt-in spec-driven TDD lifecycle for changes whose observable behavior can be exercised through a deterministic repository-owned test seam.
- Require a test-design worker, physically and methodologically independent from the implementation worker, to derive executable acceptance or contract tests from the synthesized current-change OpenSpec delta.
- Bind the test-design handoff to requirements, test sources, commands, fixtures, immutable baseline, expected failure signatures, and oracle-quality attestations.
- Require the same deterministic command and oracle to demonstrate a meaningful RED on the immutable baseline before an implementation packet can be claimed or launched, then require unchanged acceptance-test identity through GREEN.
- Integrate the TDD state with worker claims, requirements pause/resume, change-specific failure-invariant review, independent two-axis review, and delivery guards.
- Add representative fixtures covering valid red-to-green flow, weak/asymmetric oracles, nondeterministic probes, acceptance-test tampering, inapplicable changes, and requirements revision re-entry.
- Keep ordinary unit-level TDD available without this heavier gate; direct changes and changes lacking a safe deterministic acceptance seam remain outside the enforced lifecycle.
- Do not modify generated OpenSpec skills, product UI, or `shlz-design-source/`, and do not merge the delivery PR.

## Capabilities

### New Capabilities

- `harness/spec-driven-tdd`: Eligibility, independent test design, immutable-baseline RED proof, GREEN authorization, re-entry, review integration, and delivery enforcement for spec-driven TDD changes.

### Modified Capabilities

- None.

## Impact

The change affects the repository-owned harness CLI and state validation in `tools/harness.mjs` and `tools/lib/harness/`, harness fixtures/tests, adaptive execution and validation documentation, and operational execution-plan schemas. It adds new guarded workflow state without changing published design-system packages. Compatibility is preserved for historical plans and changes that do not opt into the new lifecycle; enforced plans fail closed when required TDD evidence is absent or stale.
