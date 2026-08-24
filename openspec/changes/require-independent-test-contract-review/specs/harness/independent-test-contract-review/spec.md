## Purpose

Prevents an erroneous requirements interpretation or weak acceptance-test design from authorizing production implementation by requiring an independently attested, requirements-bound review first.

## ADDED Requirements

### Requirement: Independent approval precedes executable authorization

Every enforced spec-driven TDD slice SHALL enter a pending-review state after test design. RED execution and production implementation authorization MUST remain unavailable until a physically distinct reviewer approves the exact test contract; review rejection MUST preserve findings and return the slice to test design without creating approval evidence.

<!-- failure-invariant: unreviewed-contract-cannot-authorize-production concern=state-machine -->

#### Scenario: Approved contract unlocks RED

- **WHEN** a guarded reviewer distinct from the test designer approves the current test-contract identity
- **THEN** the harness records immutable approval evidence and permits that contract to proceed to deterministic RED

#### Scenario: Design attempts to proceed without review

- **WHEN** RED or an implementation claim is attempted while the slice is pending review or has a rejected review
- **THEN** the harness rejects the transition without creating RED or implementation authorization state

### Requirement: Review evaluates a bounded test-contract checklist

An approval SHALL account for every current-change scenario and attest: the requirements and authority mapping is correct; the acceptance command observes the declared behavioral seam; assertions would fail for the reviewed wrong-behavior control; fixtures and deterministic controls do not encode the production answer; and the declared acceptance inputs exclude production implementation. Each attestation MUST carry scenario-specific evidence references. The harness SHALL validate completeness, identities, and bounded values but MUST leave semantic truth to the independent reviewer and later Spec review.

#### Scenario: Plausible but incomplete test design is rejected

- **WHEN** a contract maps all scenarios syntactically but its review omits a scenario, relies on an incorrect authority, or accepts a wrong-behavior control
- **THEN** the harness refuses approval and the contract cannot authorize production code

#### Scenario: Machine-verifiable approval is complete

- **WHEN** approval covers every declared review dimension and every current scenario with non-empty evidence references bound to the current design
- **THEN** the harness accepts the review attestation without claiming to infer semantic quality from source text or coverage counts

### Requirement: Reviewer independence is machine enforced

The reviewer SHALL be a completed guarded worker declared by the slice and SHALL have a runtime identity different from the test designer, RED runner, and production implementer. The review handoff MUST declare its inputs and MUST exclude proposed or existing production implementation surfaces and implementation-worker handoffs. The harness MUST also derive and validate the reviewer's effective context from the review packet's context sources, dependency handoffs, and issued worker brief rather than trusting the handoff declaration alone. Prohibited effective context MUST prevent the brief from being issued or MUST invalidate approval fail-closed. Reusing a runtime or including prohibited implementation context SHALL invalidate the review.

#### Scenario: Designer self-approves

- **WHEN** the review handoff uses the test designer runtime or a worker other than the slice's completed review worker
- **THEN** the harness rejects the approval

#### Scenario: Review receives implementation context

- **WHEN** the review declares an input matching the production surface or an implementation handoff, or the packet context sources, dependency handoffs, or issued worker brief contain either
- **THEN** the harness rejects the approval as non-independent

#### Scenario: Benign declaration cannot hide effective implementation context

- **WHEN** the review handoff declares only permitted inputs but the public worker execution path would deliver a production surface or implementation-worker handoff
- **THEN** the harness fails closed before delivery or approval and does not record reviewed state

### Requirement: Approval is tamper-evident and re-entry aware

Review evidence SHALL bind the requirements revision, execution baseline, slice contract, test-design digest, acceptance and fixture digests, deterministic controls, oracle challenge, reviewer runtime, verdict, checklist, and scenario evidence. Any change to those identities before RED SHALL invalidate approval and require review of the new test design. Requirements re-entry affecting the slice SHALL require fresh test design and fresh independent review; an explicitly retained slice MAY retain approval only when every bound identity and reviewer attestation remains digest-identical.

<!-- failure-invariant: stale-test-contract-approval-is-rejected concern=persistence -->

#### Scenario: Test contract changes after approval

- **WHEN** an acceptance file, fixture, scenario mapping, authority, command, control, or oracle identity differs from the approved evidence
- **THEN** RED is rejected and the slice returns to the appropriate pre-authorization state

#### Scenario: Requirements revision affects the slice

- **WHEN** requirements re-entry classifies the slice as affected
- **THEN** prior test-contract approval is invalidated together with its test-design evidence

### Requirement: Pre-implementation review and final code review remain distinct

The pre-implementation reviewer SHALL judge the proposed executable test contract without production implementation context. The later independent Spec review SHALL verify the implemented candidate against the approved contract and may detect defects in either code or the earlier review; Standards review SHALL continue to inspect deterministic isolation and harness integrity. Failure-invariant proof, GREEN evidence, route conformance, and delivery checks SHALL remain independently required when applicable.

#### Scenario: Approved test contract reaches final review

- **WHEN** an approved contract proves RED and the implementation reaches GREEN
- **THEN** final Standards and Spec reviews still run against the candidate head with the current approval and TDD evidence bound into review and delivery

#### Scenario: Final review finds a test-contract flaw

- **WHEN** later Spec review finds that the approved test contract misinterpreted a requirement
- **THEN** the finding blocks delivery and triggers requirements or test-design re-entry rather than being waived by the earlier approval

### Requirement: Representative scenario proves the gate rejects weak authorization

The repository SHALL include an executable representative scenario using the public harness seam in which an apparently well-formed test design omits or contradicts a current scenario. The known-bad path MUST fail before RED and implementation authorization while the corrected independently approved contract passes the same lifecycle transition.

#### Scenario: Known-bad review contract is discriminated

- **WHEN** the representative scenario runs against incomplete review evidence and complete review evidence
- **THEN** only the complete, independently attested evidence reaches the reviewed state and the known-bad path remains unable to authorize production implementation
