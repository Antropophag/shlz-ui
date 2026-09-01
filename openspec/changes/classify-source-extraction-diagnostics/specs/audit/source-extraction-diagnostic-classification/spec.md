## Purpose

Provide a complete, reproducible account of design-source extraction diagnostics so they cannot silently distort coverage claims or product backlog decisions.

## ADDED Requirements

### Requirement: Closed diagnostic census

The audit system SHALL classify every diagnostic unit reported by the committed design-source index exactly once at the finest granularity the index preserves. Errors and warnings SHALL use node-level identity; skipped instances SHALL use archive-level cohort identity and an asserted multiplicity because the committed source records no individual skipped-instance identities.

#### Scenario: Complete committed corpus

- **WHEN** classification is generated against the committed source index
- **THEN** all 44 node-level diagnostic occurrences and both skipped-instance cohorts are present exactly once, and multiplicities reconcile independently to 9 errors, 35 warnings, and 47 skipped instances

#### Scenario: Missing or duplicate occurrence

- **WHEN** a reported node diagnostic or skipped-instance cohort is absent, duplicated, or carries a multiplicity that differs from the committed archive count
- **THEN** validation fails without producing a verified classification

### Requirement: Evidence-bound classification

Each diagnostic unit SHALL declare its granularity and multiplicity, a controlled disposition, an impact on source-library coverage, and repository evidence sufficient to support those claims.

#### Scenario: Supported classification

- **WHEN** a diagnostic unit has recognized granularity, multiplicity, disposition, and coverage impact with resolvable supporting evidence
- **THEN** the generated audit exposes the source identity or archive cohort, diagnostic kind, multiplicity, disposition, impact, rationale, and evidence

#### Scenario: Unsupported or contradictory claim

- **WHEN** a classification uses an unknown value, lacks required evidence, contradicts its coverage impact, or references a missing or repository-escaping path
- **THEN** validation fails closed

### Requirement: Classification does not imply implementation

The audit system SHALL keep extraction quality, source ambiguity, and product implementation status as separate claims.

#### Scenario: Harmless extraction diagnostic

- **WHEN** evidence proves that a diagnostic does not change the indexed identity, coverage denominator, or an existing implementation claim
- **THEN** it may be classified as non-blocking without changing source-library coverage

#### Scenario: Diagnostic exposes unresolved product work

- **WHEN** evidence shows that extraction loss prevents a supported source or implementation conclusion
- **THEN** the classification records that limitation without treating the affected surface as implemented

### Requirement: Deterministic audit outputs

The same committed source index and authored classification SHALL produce byte-stable machine-readable and human-readable audit outputs.

#### Scenario: Regeneration without input changes

- **WHEN** the audit outputs are regenerated twice from identical inputs
- **THEN** both generated outputs are byte-identical and report the same totals and classifications

### Requirement: Protected source and runtime neutrality

The diagnostic-classification change SHALL NOT modify the authoritative `shlz-design-source/` tree or change public runtime package behavior.

#### Scenario: Classification delivery

- **WHEN** the change is compared with its immutable implementation baseline
- **THEN** protected design-source paths and runtime package surfaces are unchanged
