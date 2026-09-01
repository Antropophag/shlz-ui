## Purpose

Provide a complete, reproducible account of design-source extraction diagnostics so they cannot silently distort coverage claims or product backlog decisions.

## ADDED Requirements

### Requirement: Closed diagnostic census
The audit system SHALL classify every error, warning, and skipped instance reported by the committed design-source index exactly once, using stable source identity rather than display text alone.

#### Scenario: Complete committed corpus
- **WHEN** classification is generated against the committed source index
- **THEN** every reported diagnostic occurrence is present exactly once and totals reconcile independently by error, warning, and skipped-instance kind

#### Scenario: Missing or duplicate occurrence
- **WHEN** a reported diagnostic is absent from the classification or the same stable occurrence is classified more than once
- **THEN** validation fails without producing a verified classification

### Requirement: Evidence-bound classification
Each diagnostic occurrence SHALL declare a controlled disposition, an impact on source-library coverage, and repository evidence sufficient to support both claims.

#### Scenario: Supported classification
- **WHEN** a diagnostic has a recognized disposition and coverage impact with resolvable supporting evidence
- **THEN** the generated audit exposes the source identity, diagnostic kind, disposition, impact, rationale, and evidence

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
