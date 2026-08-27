## Purpose

Ensures that executable evidence for a changed finite contract set accounts for every declared member or records a reviewable reason for each deliberate exclusion.

## ADDED Requirements

### Requirement: Changed finite sets are declared at route conformance

For an episode that introduces or changes a finite set of variants, states, weights, roles, enum values, or explicitly supported combinations, the discovered surface SHALL declare a stable set identity and the complete canonical member list. Members are opaque contract identities, so a declared combination is covered as one member without the harness inventing a Cartesian product.

#### Scenario: Finite contract surface is discovered

- **WHEN** post-implementation discovery identifies a changed finite contract set
- **THEN** route conformance binds its identity and every unique declared member into the candidate receipt

#### Scenario: Independent axes do not imply combinations

- **WHEN** a change declares separate finite axes but does not claim their Cartesian product as a supported set
- **THEN** the harness requires coverage of each declared axis and does not invent additional combination members

### Requirement: Executable evidence exhausts each declared set

A passing validation receipt for a declared finite set MUST partition every member into exactly one of executable-covered or explicitly excluded. Each covered member MUST reference executable outcome evidence in the validation input closure, and validation MUST execute the declared command once for that member through an explicit member placeholder before recording its passing outcome. Each excluded member MUST carry a non-empty justification and MUST NOT be reported as covered.

<!-- failure-invariant: closed-set-evidence-is-exhaustive concern=state-machine -->

#### Scenario: Golos Text regression omits declared weights

- **WHEN** the changed set declares Golos Text weights 400, 500, 600, and 700 but executable evidence covers only 400
- **THEN** validation fails and identifies 500, 600, and 700 as unaccounted members

#### Scenario: Every member is covered or justified

- **WHEN** executable evidence covers every declared member except members carrying explicit exclusion justifications
- **THEN** validation executes the shared command for every covered member and emits a receipt bound to the normalized declaration, coverage, exclusions, evidence references, and per-member outcomes

#### Scenario: Coverage declaration is internally inconsistent

- **WHEN** evidence contains duplicate or undeclared members, overlaps covered and excluded members, uses empty identities, omits evidence references, or gives an empty exclusion justification
- **THEN** validation fails without emitting a passing receipt

#### Scenario: Covered member is not executable

- **WHEN** closed-set evidence omits the member placeholder from its validation command or the command fails for any covered member
- **THEN** validation fails without treating the member's referenced path as executable proof

### Requirement: Delivery composes conformance and validation coverage

Delivery SHALL require the aggregate validation receipts for the candidate to exhaust every finite set bound by route conformance. A validation declaration for another set identity or a different member list MUST NOT satisfy the requirement, and changing a declaration or its evidence SHALL invalidate receipt reuse.

#### Scenario: One of several changed sets lacks evidence

- **WHEN** route conformance binds multiple changed finite sets but passing validation receipts account for only a subset
- **THEN** delivery fails and identifies the set without executable evidence

#### Scenario: Evidence belongs to a stale set declaration

- **WHEN** a set member is added, removed, or renamed after validation evidence was recorded
- **THEN** the stale validation receipt cannot satisfy delivery for the current conformance receipt

### Requirement: Unrelated validation remains compatible

Changes that do not introduce or modify a finite contract set SHALL declare no changed sets and MAY continue to use the existing validation manifest without closed-set evidence.

#### Scenario: Validation has no finite-set impact

- **WHEN** discovery declares an empty changed-set list and validation uses no closed-set evidence
- **THEN** existing validation and delivery behavior remains available
