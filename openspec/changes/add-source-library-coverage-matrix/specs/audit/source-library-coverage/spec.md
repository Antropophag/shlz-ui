## Purpose

Defines a complete, machine-verifiable accounting from indexed design-source records and variants to library families, implementation evidence, or explicit exclusions without overloading audit verification as a transfer claim.

## ADDED Requirements

### Requirement: Every indexed source record is accounted for exactly once

The coverage matrix SHALL contain one canonical entry for every component record in the current `design-source-index/components.json`, identified by source archive, Figma node ID, kind, name, and hierarchy path. It MUST reject missing, duplicate, stale, or invented record identities.

#### Scenario: Complete current corpus

- **WHEN** the matrix is validated against the generated source index
- **THEN** all 195 current records are represented exactly once and the matrix summary equals the source index record totals

#### Scenario: Source index changes

- **WHEN** a source record is added, removed, or receives a changed canonical identity without a corresponding matrix update
- **THEN** validation fails and reports the affected record identity

### Requirement: Record dispositions are explicit and non-overlapping

Each source record SHALL declare exactly one disposition: `implemented`, `evidence-only`, `intentionally-excluded`, or `unresolved`. An implemented or evidence-only record MUST reference at least one existing library family; an intentionally excluded record MUST state a concrete reason and ownership boundary; an unresolved record MUST state the missing decision or evidence. `audit_status`, record naming similarity, and shared source-file membership MUST NOT implicitly assign a disposition.

#### Scenario: Implemented source record

- **WHEN** a record is classified as `implemented`
- **THEN** it references a valid inventory family, at least one existing production implementation path, and at least one existing evidence path

#### Scenario: Intentional exclusion

- **WHEN** a record represents application-owned, duplicate, nested, decorative, or otherwise non-library scope
- **THEN** it is retained in the denominator with `intentionally-excluded`, a non-empty reason, an ownership boundary, and supporting evidence

#### Scenario: Insufficient evidence

- **WHEN** no supported implementation, evidence-only, or exclusion claim can be proven
- **THEN** the record remains `unresolved` instead of inheriting a family or `VERIFIED` status

### Requirement: Variant coverage remains independently visible

For every indexed variant, the matrix SHALL record whether it is covered by the parent record disposition, covered by a narrower family/evidence reference, intentionally excluded with a reason, or unresolved. Variant totals MUST be calculated as variant units and MUST NOT be combined with record or family totals.

#### Scenario: Parent disposition covers all variants

- **WHEN** every variant of a record shares the same supported disposition and references
- **THEN** the matrix may use an explicit all-variants declaration while validation expands it to the exact indexed variant identities

#### Scenario: Variant exception exists

- **WHEN** one or more variants differ from the parent record disposition
- **THEN** each exception is listed by Figma node ID and the generated matrix reports the resulting per-variant disposition separately

### Requirement: Family and evidence references are verifiable

Every family reference SHALL resolve to exactly one canonical family in `docs/component-audits/project-inventory.json`. Every implementation, evidence, and exclusion-support path SHALL exist inside the repository, and authoritative source paths SHALL remain read-only inputs rather than generated outputs.

#### Scenario: Stale family or path

- **WHEN** a mapping names an unknown family or a referenced path no longer exists
- **THEN** validation fails with the source-record identity and invalid reference

#### Scenario: Many-to-many relationship

- **WHEN** one source record maps to multiple reusable families or one family represents multiple source records
- **THEN** the matrix preserves every explicit edge without duplicating the canonical source record

### Requirement: Coverage metrics use compatible denominators

The generated summary SHALL report record and variant counts independently for every disposition, plus family implementation/audit classifications as contextual dimensions. It MUST NOT label a family ratio as corpus transfer coverage or treat `VERIFIED` as equivalent to `implemented`.

#### Scenario: Coverage summary

- **WHEN** the matrix is generated successfully
- **THEN** each record-disposition total sums to the source record total, each variant-disposition total sums to the source variant total, and percentages state their unit and denominator

#### Scenario: Verified source-only family

- **WHEN** a referenced family has `audit_status: VERIFIED` and `implementation_status: source-only`
- **THEN** the matrix preserves both facts and does not classify its records as implemented without independent implementation references

### Requirement: Output is deterministic and reviewable

Generation SHALL produce stable ordering and byte-identical output for unchanged source index, inventory, and mapping decisions. The repository SHALL provide a focused validation command or test that regenerates and verifies the committed matrix without modifying `shlz-design-source/`.

#### Scenario: Repeated generation

- **WHEN** generation runs twice with identical inputs
- **THEN** the committed machine-readable matrix is byte-identical and source-file hashes remain unchanged
