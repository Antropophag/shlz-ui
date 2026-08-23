## Purpose

Ensures executable review proves the failure behavior promised by the current OpenSpec change, not only a repository-wide baseline checklist.

## ADDED Requirements

### Requirement: Applicable review derives invariants from the current change

For a material review with a `state-machine`, `persistence`, or `subprocess` concern, the harness SHALL require a change-specific invariant manifest in addition to the baseline invariant set. Every declared invariant MUST have a unique stable identity, one applicable concern, and a source reference to a Requirement and Scenario in a delta spec under the current OpenSpec change. The harness SHALL reject missing, duplicate, out-of-change, nonexistent, or concern-incompatible source references.

<!-- failure-invariant: marked-contracts-require-manifest concern=state-machine -->

#### Scenario: Current delta contains material failure contracts

- **WHEN** review is initialized for an OpenSpec change whose delta scenarios define applicable failure, recovery, concurrency, cleanup, timeout, or ordering behavior
- **THEN** review remains incomplete until a manifest derives executable invariants from those scenarios

<!-- failure-invariant: manifest-sources-are-grounded concern=persistence -->

#### Scenario: Manifest points outside the current change

- **WHEN** a declared invariant cites prose, a different change, or a Requirement/Scenario pair absent from the current change's delta specs
- **THEN** the harness rejects the manifest as ungrounded

<!-- failure-invariant: marked-contract-coverage-is-complete concern=persistence -->

#### Scenario: Applicable scenario is omitted

- **WHEN** a current delta scenario marked for executable failure review has no corresponding change-specific invariant
- **THEN** the harness reports the uncovered contract source and keeps review incomplete

### Requirement: Executable proof discriminates every required invariant

The harness SHALL require each baseline and change-specific invariant to fail on the declared known-bad revision and pass on the reviewed head. Proof identity and digest binding MUST include the current OpenSpec change and normalized manifest so a proof cannot be reused after contract or invariant changes.

<!-- failure-invariant: change-specific-results-discriminate concern=state-machine -->

#### Scenario: Baseline passes but change-specific invariant does not discriminate

- **WHEN** every baseline invariant passes but a required change-specific invariant passes on the known-bad revision, fails on the reviewed head, or is absent
- **THEN** the harness rejects the proof and prevents two-axis review completion

<!-- failure-invariant: contract-edits-stale-proof concern=persistence -->

#### Scenario: Contracts change after proof

- **WHEN** the normalized manifest or its cited delta spec content changes after proof recording
- **THEN** the recorded proof is stale and review requires a new executable proof

### Requirement: PR 33 findings act as regression evidence

The repository SHALL keep a regression inventory for the seven actionable and one nitpick CodeRabbit findings on PR #33. Its executable fixture MUST demonstrate that contract-derived invariants reject the pre-remediation revision for review-state serialization, failed-proof invalidation, pass/finding provenance, and bounded subprocess execution. Language/tool configuration, test-quality, cleanup lint, and CI-environment portability findings MUST be classified separately and SHALL remain covered by their existing validation layers rather than fabricated as runtime failure invariants.

#### Scenario: Pre-remediation PR 33 revision is reviewed

- **WHEN** the regression fixture evaluates PR #33 commit `55c3eb38cd66c0dea1d9fe7f3419e19e8ca56133`
- **THEN** each of the four applicable contract-derived invariants fails and identifies the CodeRabbit finding it would have caught before external review

#### Scenario: Remediated PR 33 revision is reviewed

- **WHEN** the same fixture evaluates immutable known-good PR #33 commit `32c2cdfdd213d4b5c0a7d27258ee13c49af02304`
- **THEN** all four applicable contract-derived invariants pass through executed failure behavior

#### Scenario: Static lint finding is classified

- **WHEN** the fixture accounts for the `structuredClone` `no-undef` finding
- **THEN** it records that the existing lint gate, not the change-specific failure-proof mechanism, is responsible for catching it

### Requirement: Proportional review remains compatible

Reviews without applicable material failure concerns SHALL retain the existing review-state and two-axis completion behavior without requiring an OpenSpec change or change-specific manifest.

#### Scenario: Non-applicable review

- **WHEN** review is initialized with no failure-path concerns
- **THEN** it can complete through the existing Standards and Spec review path without a change-specific invariant manifest
