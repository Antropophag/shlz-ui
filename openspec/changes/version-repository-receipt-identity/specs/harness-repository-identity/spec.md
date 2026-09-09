## Purpose

Minimize disclosed repository coordinates in harness receipts while preserving checkout isolation and immutable evidence-chain verification.

## ADDED Requirements

### Requirement: Versioned minimized identity

New repository identity payloads SHALL declare version 2 and contain only version, checkout digest, origin digest, and aggregate digest. Receipt envelopes SHALL retain their current version. Identity digests SHALL bind the resolved checkout root and exact configured origin without publishing either raw value.

#### Scenario: New baseline and delivery

- **WHEN** a new baseline or delivery receipt is emitted
- **THEN** its repository payload has version 2 and contains neither a raw local path nor a raw origin, including credentials or local origin paths

#### Scenario: Repeated identity

- **WHEN** identity is computed repeatedly for the same checkout and unchanged origin
- **THEN** its serialized payload and digest remain identical

### Requirement: Checkout isolation survives minimization

Delivery SHALL verify repository identity against the current checkout using the baseline identity version. Distinct checkout roots, relocated roots, and changed origins SHALL not continue the original episode. Relocation requires a fresh baseline; portable serialization does not authorize cross-checkout continuation.

#### Scenario: Different worktree or clone

- **WHEN** a baseline from another worktree or clone with the same origin is supplied
- **THEN** delivery rejects the repository mismatch

#### Scenario: Relocated checkout

- **WHEN** the original checkout is moved to a different absolute root
- **THEN** continuation against its previous baseline is rejected

#### Scenario: Changed origin

- **WHEN** the checkout origin differs from its baseline, including a different spelling of the origin
- **THEN** delivery rejects the repository mismatch

### Requirement: Immutable legacy compatibility

Existing unversioned repository identities SHALL remain verifiable using the original root-and-remote digest algorithm. Historical receipt bytes and downstream digest references SHALL remain unchanged. Successful legacy continuation SHALL emit a minimized version 2 repository payload while retaining the original baseline receipt digest reference.

#### Scenario: Legacy continuation

- **WHEN** a valid legacy baseline is used in its unchanged checkout with its original origin
- **THEN** its repository check succeeds without modifying the baseline and the new delivery repository payload is version 2

### Requirement: Invalid identities fail closed

Repository verification SHALL validate the complete version-specific shape and embedded digest before comparing live identity. Unknown versions, mixed schemas, missing fields, and altered identity fields SHALL be rejected even when the enclosing receipt digest has been recomputed.

#### Scenario: Tampered identity

- **WHEN** an identity field is changed but its embedded digest is stale
- **THEN** verification rejects it even if the enclosing receipt digest is valid

#### Scenario: Unsupported or malformed identity

- **WHEN** an identity has an unsupported version, mixed legacy and version 2 fields, or missing fields
- **THEN** verification rejects it rather than falling back to legacy comparison
