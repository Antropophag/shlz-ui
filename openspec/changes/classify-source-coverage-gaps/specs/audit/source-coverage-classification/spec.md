## Purpose

Defines how unresolved design-source records become evidence-backed coverage decisions while preserving an honest, actionable product-gap backlog.

## ADDED Requirements

### Requirement: Classification requires disposition-specific proof

The classification SHALL retain `unresolved` unless existing repository evidence satisfies every requirement of exactly one stronger disposition. A similar name, shared source archive, nested appearance, existing path, or family `audit_status` alone MUST NOT establish the classification.

#### Scenario: Existing implementation is proven

- **WHEN** an unresolved source record has a canonical family, production implementation, and evidence that directly covers its source identity or normalized output
- **THEN** the ledger classifies it as `implemented` and records those family, implementation, and evidence references

#### Scenario: Proof remains insufficient

- **WHEN** a record appears related to an existing family but direct disposition-specific evidence is absent or ambiguous
- **THEN** the record remains `unresolved` with a concrete statement of the missing decision or evidence

### Requirement: Existing non-product source records remain visible

Nested evidence surfaces, duplicate or legacy records, decorative records, and application-owned compositions SHALL remain in their source-unit denominator. They MAY be classified as `evidence-only` or `intentionally-excluded` only with a concrete reason, an explicit ownership boundary where exclusion applies, and supporting repository evidence.

#### Scenario: Application-owned composition

- **WHEN** existing audit evidence establishes that a source record describes a consumer-owned screen or domain composition rather than a reusable library contract
- **THEN** the record is `intentionally-excluded`, retains its source identity in the denominator, and names both the ownership boundary and exclusion evidence

#### Scenario: Nested evidence surface

- **WHEN** a source record is not an independent production implementation but directly supports an already audited family
- **THEN** it is `evidence-only` and references that family and its specific evidence without claiming implementation

### Requirement: Normalized icon coverage is traceable

An indexed icon record SHALL be classified as implemented only when committed normalization provenance links every indexed variant to an existing canonical icon source using exact name, dimensions, and paint-independent geometry, and the Icons family has production and runtime evidence. Duplicate source glyphs MAY share a canonical output when that normalization decision is explicit.

#### Scenario: Source glyph has normalized provenance

- **WHEN** normalization provenance binds an unresolved source glyph to a committed canonical icon file
- **THEN** the record is implemented by the Icons family and cites the normalized output plus source, generation, and runtime evidence

#### Scenario: Icon-like record lacks provenance

- **WHEN** a record visually or nominally resembles an icon but committed provenance cannot bind it to a canonical output
- **THEN** it remains unresolved rather than being assigned by name

### Requirement: Remaining gaps are reported as an actionable backlog

Generation SHALL report compatible-unit disposition totals after classification and SHALL expose the remaining unresolved component sets separately from resolved icon, evidence, and exclusion decisions. Record and variant totals MUST continue to match the source index exactly.

#### Scenario: Classification regeneration completes

- **WHEN** the updated ledger is generated and validated
- **THEN** all 195 records and 630 variants remain accounted for, disposition totals are deterministic, and the remaining unresolved reusable candidates can be reviewed without application-owned or already implemented records being counted as product gaps

### Requirement: Authoritative source and runtime contracts remain unchanged

The classification process MUST NOT modify `shlz-design-source/`, add or alter runtime component behavior, or expand a public package API. Source diagnostics SHALL be preserved and their classification impact SHALL be stated where they affect a coverage decision.

#### Scenario: Classification is applied

- **WHEN** coverage artifacts are updated and regenerated
- **THEN** authoritative source hashes and runtime package surfaces remain unchanged while diagnostics remain visible in the generated matrix
