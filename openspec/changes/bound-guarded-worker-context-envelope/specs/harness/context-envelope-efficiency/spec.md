## Purpose

Measures guarded-worker context cost honestly and prevents explicitly budgeted packet launches from exceeding their declared initial source envelope without weakening required contract or evidence coverage.

## ADDED Requirements

### Requirement: Representative efficiency evaluation

The harness SHALL evaluate a declared set of completed changes using runtime-issued usage and physical-boundary evidence when available, and SHALL keep unavailable values unavailable rather than deriving tokens from bytes or file counts.

#### Scenario: Runtime usage exists

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** completed worker telemetry contains runtime-issued input, cached-input, and output token fields
- **THEN** the evaluation reports those fields separately for the change and for each packet attempt/session

#### Scenario: Runtime usage is incomplete

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** a requested metric is absent from the trusted runtime event
- **THEN** the evaluation reports that metric as unavailable and may report only clearly labeled repository-controlled proxies

### Requirement: Stage and session attribution

The harness SHALL preserve packet, phase, logical session, physical runtime identity, attempt count, handoff bytes, source-read relevance, and retry/fan-out evidence in the efficiency result so aggregate totals do not hide expensive or repeated stages.

#### Scenario: One packet is launched repeatedly

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** telemetry contains multiple physical runs for the same packet
- **THEN** the result exposes each run and a packet-level aggregate instead of presenting the runs only as unrelated change-wide totals

### Requirement: Explicit guarded-worker envelope

A guarded packet MAY declare a positive maximum for resolved initial `readNow` source bytes. When declared, the harness SHALL resolve the phase capsule before launch and SHALL fail closed if its initial source bytes exceed that maximum.

#### Scenario: Initial sources fit the packet budget

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** the complete resolved `readNow` source set is at or below the declared maximum
- **THEN** the worker may launch with every declared source identity, contract, obligation, finding, and evidence pointer intact

#### Scenario: Initial sources exceed the packet budget

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** the complete resolved `readNow` source set is above the declared maximum
- **THEN** the worker does not launch and the result identifies the measured total, declared maximum, and largest source contributors

### Requirement: Coverage-preserving remediation

The harness SHALL NOT automatically truncate, rank away, summarize, or omit declared contracts, obligations, findings, evidence pointers, or context source identities to meet an envelope. Operators SHALL narrow an over-broad declaration or deliberately revise the packet budget through a plan change.

#### Scenario: Broad source pattern exceeds the envelope

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** an over-broad pattern resolves beyond the declared maximum
- **THEN** the harness reports the contributing paths and requires an explicit plan correction without launching a reduced but semantically different packet

### Requirement: Backward-compatible adoption

Historical and current plans without an explicit envelope SHALL remain readable and executable, while their resolved initial source cost remains measurable.

#### Scenario: Legacy guarded packet has no envelope

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** a guarded worker uses a valid plan that predates the envelope field
- **THEN** plan validation and launch behavior remain compatible and the evaluation labels the packet unbudgeted
