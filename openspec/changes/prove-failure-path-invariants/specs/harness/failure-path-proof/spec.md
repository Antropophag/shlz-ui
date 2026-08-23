## Purpose

Prevents material stateful and external-boundary changes from passing independent review without executable evidence for their recovery and failure-path guarantees.

## ADDED Requirements

### Requirement: Applicable reviews prove failure-path invariants

For a material reviewed delta that changes a state machine, persisted recovery contract, or subprocess/stream boundary, the harness SHALL require an executable failure-path proof before review can be complete. The proof MUST name the invariant exercised, bind the reviewed base and head, and show the regression fixture failing on the known-bad revision and passing on the reviewed revision.

#### Scenario: Stateful material change requires proof

- **WHEN** independent review covers a material delta that changes guarded packet transitions or persisted recovery state
- **THEN** review completion is rejected until executable invariants cover the applicable failure transitions and persistence guarantees

#### Scenario: Subprocess boundary requires proof

- **WHEN** independent review covers process, stream, timeout, or event-ordering behavior
- **THEN** the proof exercises injected boundary failure and terminal event ordering rather than relying only on successful process output

#### Scenario: Fixture does not discriminate

- **WHEN** the same failure-path fixture passes on both the known-bad revision and reviewed head
- **THEN** the harness rejects the proof because it does not demonstrate regression sensitivity

### Requirement: Review overhead remains proportional

The harness SHALL NOT require failure-path proof for direct S target-diff review or for independent review whose delta does not change a state machine, persisted recovery contract, or subprocess/stream boundary.

#### Scenario: Low-risk S change

- **WHEN** a direct S behavior-preserving delta uses target-diff review
- **THEN** the existing review and delivery path remains sufficient without a failure-path fixture

### Requirement: Review capability degradation is explicit

When an applicable executable proof cannot run or the available reviewer cannot use a method independent of implementation-authored examples, the review SHALL remain incomplete and record the missing capability. External diversity review is required only to supply that missing capability; its presence alone MUST NOT substitute for executable evidence.

#### Scenario: Proof capability unavailable

- **WHEN** the applicable fixture cannot execute at the required revision or no independent failure-path method is available
- **THEN** review records the degradation and remains incomplete pending capable internal execution or external diversity review
