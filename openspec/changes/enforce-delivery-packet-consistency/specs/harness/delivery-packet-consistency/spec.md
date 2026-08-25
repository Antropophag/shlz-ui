## Purpose

Defines the evidence-consistency gate that prevents planned delivery from accepting packet completion assembled from divergent lifecycle records.

## ADDED Requirements

### Requirement: Planned delivery reconciles mandatory packet evidence

Planned delivery SHALL fail closed unless every mandatory packet is represented by one consistent canonical lifecycle state, runtime execution record, telemetry execution boundary, and durable handoff. Packet identity, claim identity, brief digest, session, runtime identity, launch identity, and worker-report digest MUST agree wherever those fields are represented. Detached telemetry or handoff evidence MUST NOT manufacture canonical completion.

#### Scenario: Divergent routing-engine records are rejected

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** planned delivery receives the PR #40 incident fixture whose routing-engine handoff and telemetry show an executed worker while canonical packet state is pending, stale, or bound to a different attempt
- **THEN** delivery fails with a packet-specific consistency diagnostic before accepting review or Git/GitHub evidence

#### Scenario: Coherent packet evidence reaches ordinary delivery checks

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** canonical packet state, runtime execution evidence, telemetry, and durable handoff consistently identify the same completed worker attempt for every mandatory packet
- **THEN** packet reconciliation succeeds and delivery continues through the existing review and Git/GitHub checks

### Requirement: Incident provenance remains truthful

Review disposition SHALL distinguish an operational inconsistency from valid timezone-grounded metadata. Repository metadata MUST NOT be rewritten solely because a reviewer compared a UTC date with an earlier local calendar date.

#### Scenario: Moscow-local creation date is not future-dated

<!-- implementation-semantics: documentation-only -->
<!-- validation-impact: docs -->

- **WHEN** metadata records `2026-08-25` after midnight on 25 August 2026 in the repository timezone `Europe/Moscow`, while the corresponding UTC instant is still 24 August
- **THEN** the review disposition rejects the future-date claim and preserves the metadata and derived provenance
