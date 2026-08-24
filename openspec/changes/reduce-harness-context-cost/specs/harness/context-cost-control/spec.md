## Purpose

Controls repository-harness context cost through reproducible, evidence-preserving measurement and a minimally sufficient corrective mechanism rather than unverifiable token estimates.

## ADDED Requirements

### Requirement: Honest context-cost baseline

The harness SHALL distinguish runtime-observed context usage from reproducible proxy measurements and SHALL NOT infer unavailable runtime token values from bytes, commands, or file counts.

#### Scenario: User-observed runtime signal without a raw trace

- **WHEN** a replay records a user-observed active-context value but no trusted runtime event stream
- **THEN** the report labels that value by its provenance and reports replay proxy measurements separately

### Requirement: Deterministic representative replay

The harness SHALL represent discovery, procedural context, validation output, review output, repeated reads, state, and orchestration in a PR #36 replay and SHALL produce stable measurements for identical repository content and replay definitions.

#### Scenario: Repeating a replay

- **WHEN** the same replay is executed twice against unchanged sources
- **THEN** source digests, obligation identities, baseline measurements, optimized measurements, and verdict are identical

#### Scenario: Source changes

- **WHEN** an authoritative replay source changes
- **THEN** its digest changes and a previously recorded capsule cannot be treated as current

### Requirement: Hypothesis comparison and minimal selection

The change SHALL probe each declared contributor, compare at least documentation/procedural pruning, phase-bound input control, and retrieval-oriented architectures, and SHALL select only mechanisms whose measured contribution is necessary to meet the improvement and equivalence requirements.

#### Scenario: Simpler mechanism meets the target

- **WHEN** a lower-complexity candidate meets the improvement threshold with equivalent correctness and evidence
- **THEN** the change rejects additional infrastructure as unnecessary

#### Scenario: Candidate does not address a measured contributor

- **WHEN** a candidate leaves a material measured contributor unchanged and misses the improvement threshold
- **THEN** the change rejects that candidate with replay evidence

### Requirement: Correctness and evidence equivalence

The harness SHALL compare baseline and candidate executions only when both cover the same required correctness, evidence, and reproducibility obligations. It SHALL fail closed on a missing obligation, unresolved blocking finding, or omitted required state transition.

#### Scenario: Smaller input drops validation evidence

- **WHEN** a candidate replay omits an obligation covered by the baseline
- **THEN** the comparison fails regardless of its context-cost reduction

#### Scenario: Equivalent smaller input

- **WHEN** both executions cover identical obligations and required replay inputs
- **THEN** the report may accept the optimized execution and quantify the reduction

### Requirement: Evidence-backed phase input control

The harness SHALL provide a phase-local structured context representation that identifies required sources by current content digest, requires newly relevant or changed source content, and carries unchanged previously attested sources without reloading their full content. It SHALL preserve compact validation/review verdicts, unresolved findings, obligations, and state transitions while keeping raw evidence addressable on demand.

#### Scenario: Unchanged source was attested in an earlier phase

- **WHEN** a later phase requires the same source content digest
- **THEN** the phase representation includes the source identity and digest without charging or carrying its full content again

#### Scenario: Required source content changed

- **WHEN** a later phase requires a source whose digest differs from the attested digest
- **THEN** the phase representation requires that source content to be read again

#### Scenario: Compact evidence index omits a blocking result

- **WHEN** compact validation or review state omits an obligation, unresolved blocking finding, verdict, or required transition
- **THEN** equivalence fails and no improvement claim is accepted

### Requirement: Measurable improvement

The representative PR #36 replay SHALL publish a measured baseline, candidate results, contributor deltas, and a configured minimum reduction threshold using transparent metrics selected by the probe design. A passing improvement SHALL meet the threshold without weakening equivalence and SHALL state the limitations of each metric.

#### Scenario: Improvement threshold is met

- **WHEN** the optimized replay is equivalent and its measured reduction meets the configured threshold
- **THEN** the replay reports a passing verdict with absolute and percentage deltas and metric limitations

#### Scenario: Improvement threshold is missed

- **WHEN** the optimized replay is equivalent but its reduction is below the threshold
- **THEN** the replay reports a failing improvement verdict

### Requirement: Local deterministic architecture

The capability SHALL use the least complex deterministic local architecture demonstrated sufficient by the replay. It SHALL NOT add embeddings, semantic brokers, vector stores, databases, daemons, or network services unless lower-complexity candidates demonstrably fail the outcome and equivalence requirements.

#### Scenario: Offline replay

- **WHEN** the replay runs with repository dependencies installed and no network access
- **THEN** it produces the complete comparison report
