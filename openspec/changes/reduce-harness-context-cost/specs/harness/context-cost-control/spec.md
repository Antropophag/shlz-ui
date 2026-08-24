## Purpose

Controls repository-harness context cost through reproducible, evidence-preserving measurement and a minimally sufficient corrective mechanism rather than unverifiable token estimates.

## ADDED Requirements

### Requirement: Honest context-cost baseline

The harness SHALL distinguish runtime-observed context usage from reproducible proxy measurements and SHALL NOT infer unavailable runtime token values from bytes, commands, or file counts.

#### Scenario: User-observed runtime signal without a raw trace

- **WHEN** a replay records a user-observed active-context value but no trusted runtime event stream
- **THEN** the report labels that value by its provenance and reports replay proxy measurements separately

### Requirement: Deterministic representative replay

The harness SHALL represent discovery, procedural context, validation output, review output, repeated reads, state, and orchestration in a PR #36 replay bound to immutable PR artifacts and pinned captured external evidence. The expected contract SHALL be a frozen snapshot assembled from that captured evidence independently of the candidate replay definition. Stable collections and digests SHALL use locale-independent code-unit ordering, and identical repository content and replay definitions SHALL produce stable measurements.

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

The harness SHALL compare a candidate execution with an independently captured and stored oracle covering required sources, correctness/evidence obligations, findings, and state transitions. It SHALL fail closed on a missing or substituted source identity, missing obligation, any unresolved dependency-handoff finding, unresolved blocking structured finding, omitted raw-evidence pointer, or omitted required state transition.

#### Scenario: Smaller input drops validation evidence

- **WHEN** a candidate replay omits an obligation covered by the baseline
- **THEN** the comparison fails regardless of its context-cost reduction

#### Scenario: Equivalent smaller input

- **WHEN** both executions cover identical obligations and required replay inputs
- **THEN** the report may accept the optimized execution and quantify the reduction

### Requirement: Evidence-backed phase input control

The harness SHALL provide a packet-integrated, phase-local structured context representation that identifies required sources by current content digest, requires newly relevant or changed source content, and carries unchanged sources acknowledged earlier in the same physical session without reloading their full content. A persisted session ledger SHALL record acknowledgement and SHALL NOT be reused across a fresh worker boundary. Explicit later-phase CLI capsules use an operator-declared identity that SHALL be unique to that continuing physical worker. Guarded `worker-run` instead creates a fresh unacknowledgeable pre-launch capsule bound to the claim, then binds its ledger to the adapter-issued runtime identity after launch attestation; a claim ID SHALL NOT be reported as a physical boundary. The representation SHALL preserve compact validation/review verdicts, unresolved findings, obligations, and state transitions while keeping raw evidence addressable on demand.

#### Scenario: Unchanged source was attested in an earlier phase

- **WHEN** a later phase requires the same source content digest
- **THEN** the phase representation includes the source identity and digest without charging or carrying its full content again

#### Scenario: Required source content changed

- **WHEN** a later phase requires a source whose digest differs from the attested digest
- **THEN** the phase representation requires that source content to be read again

#### Scenario: Phase acknowledgement is persisted

- **WHEN** an operator acknowledges a capsule after reading its `readNow` inputs
- **THEN** the ledger binds the source digests, phase, transition, and capsule digest for later phases in that physical session

#### Scenario: A fresh worker starts

- **WHEN** packet work moves to a fresh worker process
- **THEN** the worker starts with a new ledger and all required packet sources are `readNow`, and the root binds that ledger to the adapter-issued runtime identity before accepting later lifecycle evidence

#### Scenario: Compact evidence index omits a blocking result

- **WHEN** compact validation or review state omits an obligation, unresolved blocking finding, verdict, or required transition
- **THEN** equivalence fails and no improvement claim is accepted

#### Scenario: A guarded worker is launched

- **WHEN** `worker-run` prepares a bounded worker input
- **THEN** it automatically creates and supplies the packet's initial phase capsule from a fresh physical-session ledger without requiring a separate operator protocol

### Requirement: Honest cost attribution

The replay SHALL classify each contributor delta as prevented work, content not reread after verified acknowledgement, retained/addressable evidence, or unmeasured runtime retention/output cost. It SHALL NOT count validation, CI, review output, raw-log retention, cached input, or active/session context as eliminated unless comparable trusted before/after telemetry proves that outcome.

#### Scenario: A source becomes an attested reference

- **WHEN** unchanged source content is replaced by its identity and digest in a later phase
- **THEN** the report labels its bytes as not reread and does not claim that source processing, cache retention, or active/session cost was prevented

#### Scenario: Runtime retention is unavailable

- **WHEN** the replay has no comparable trusted before/after active-context trace
- **THEN** active/session improvement remains unavailable even if repository-controlled input bytes decrease

### Requirement: Compact validation and CI evidence boundary

The harness SHALL require a raw log for every newly recorded structured validation or CI result, copy it to a digest-named repository-local artifact, and produce a deterministic compact evidence index. The compact index SHALL carry command identity, outcome, obligation identities, canonical repository-relative raw-log path, byte size, and digest. Phase capsules SHALL fail closed on a missing pointer and carry the compact index, not inline raw log content, unless raw inspection is required by a finding.

#### Scenario: Validation emits a large raw log

- **WHEN** a validation result is recorded for later phases
- **THEN** the compact evidence identifies its outcome and obligations while the exact raw log remains digest-verified and addressable

#### Scenario: Raw validation evidence changes

- **WHEN** the retained raw log no longer matches the compact index digest or byte size
- **THEN** capsule creation fails closed

### Requirement: Measurable improvement

The representative PR #36 replay SHALL publish a measured source-read baseline, candidate results, attributed contributor deltas, and a configured minimum reduction threshold using transparent repository-controlled byte/read metrics selected by the probe design. A passing improvement SHALL apply only to the explicitly measured repository-input proxy, meet the threshold without weakening equivalence, and SHALL report total active/session improvement as unavailable unless comparable trusted runtime telemetry exists.

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
