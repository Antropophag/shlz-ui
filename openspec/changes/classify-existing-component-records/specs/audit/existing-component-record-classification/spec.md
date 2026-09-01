## Purpose

Defines the evidence-backed classification of source records that may already
belong to reusable library components or established composition ownership.

## ADDED Requirements

### Requirement: The classification scope is explicit and complete

The classification SHALL publish an exact census of unresolved records reviewed
as existing-component or composition candidates. Records deferred to source
diagnostics, future component implementation, icon provenance, or later roadmap
decisions MUST remain visible and MUST NOT be counted as classified by this
change.

#### Scenario: The classification is regenerated

- **WHEN** the step-1 coverage artifacts are generated
- **THEN** every previously unresolved record is either present in the reviewed census with a recorded outcome or identified under a named deferred boundary

### Requirement: Existing component coverage requires direct proof

A source record SHALL be classified as `implemented` only when an existing
canonical family, production implementation, and committed evidence directly
cover its source identity and applicable variants. Shared words, visual
similarity, or use of the same primitive MUST NOT prove implementation.

#### Scenario: Existing family directly covers the record

- **WHEN** source-specific and executable evidence binds every applicable variant to an existing reusable family
- **THEN** the record is classified as `implemented` with its family, implementation, and evidence references

#### Scenario: Similarity is the only relationship

- **WHEN** a record resembles an existing family but its state or variant contract is not directly covered
- **THEN** the record remains `unresolved` and states the missing proof

### Requirement: Composition ownership does not become component coverage

A non-reusable source composition SHALL remain in the denominator and MAY be
classified as `evidence-only` or `intentionally-excluded` only when committed
evidence establishes its relationship or consumer ownership. The result MUST
name the ownership boundary and MUST NOT claim a reusable implementation.

#### Scenario: Consumer-owned composition is proven

- **WHEN** a repository census or audit establishes that a source record is an application or domain composition rather than a reusable library contract
- **THEN** the record is intentionally excluded with explicit ownership and exclusion evidence

#### Scenario: Nested evidence supports a family

- **WHEN** a source record is not independently reusable but directly evidences an audited family or composition
- **THEN** the record is evidence-only and identifies the supported family and evidence

### Requirement: Classification remains fail-closed and deterministic

The authored ledger SHALL remain the single source of classification decisions.
Generation MUST reject incompatible dispositions, missing repository references,
or denominator drift, and repeated generation from unchanged inputs MUST produce
identical outputs.

#### Scenario: Evidence is incomplete or contradictory

- **WHEN** no single stronger disposition satisfies all required evidence
- **THEN** the authored decision remains `unresolved`

#### Scenario: Coverage generation succeeds

- **WHEN** the classified ledger is generated twice from unchanged inputs
- **THEN** record and variant totals match the source index and both generated outputs are byte-identical

### Requirement: Deferred roadmap work and user history remain intact

The classification MUST NOT modify the authoritative source, runtime packages,
showcase behavior, accessibility policy, or deferred component plans. Existing
branches, worktrees, and uncommitted user files MUST NOT be deleted or
overwritten as part of classification.

#### Scenario: Step 1 is completed

- **WHEN** classification artifacts and reports are updated
- **THEN** only scoped audit, tooling, test, planning, and generated-report files differ from the episode baseline

