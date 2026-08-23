## MODIFIED Requirements

### Requirement: Requirements readiness gates execution planning

For substantial, ambiguous, contract-affecting, new-capability, publishing/release, or other material external-effect work, the workflow SHALL establish `no unresolved blocking user-owned decisions` before repository implementation mutation or adaptive execution packet planning. Deterministic harness guards SHALL reject mutation and planning when persisted state contains an unresolved blocking user-owned decision. Direct typo, local bug-fix, mechanical, and implementation-only routes SHALL remain available only after positive route eligibility evidence proves they preserve observable behavior, contracts, permissions, automation semantics, and external effects.

#### Scenario: User-owned product decision blocks work

- **WHEN** persisted requirements state contains an unresolved blocking user-owned decision
- **THEN** OpenSpec synthesis, execution packet planning, and implementation mutation are blocked until the decision is resolved or explicitly delegated

#### Scenario: Trivial typo stays direct

- **WHEN** inspection positively establishes that a typo or local behavior-preserving fix is direct-eligible
- **THEN** the workflow permits direct implementation without interview or a requirements-state artifact

#### Scenario: Fully determined contract change uses OpenSpec directly

- **WHEN** a contract-affecting request is complete and has no unresolved blocking user-owned decision
- **THEN** the workflow creates OpenSpec artifacts without unnecessary questions and only then enters execution planning

#### Scenario: Publishing decisions remain user-owned

- **WHEN** GitHub Pages publishing is requested without a release policy or public URL decision
- **THEN** implementation mutation remains blocked while `release-policy` and `public-url` are unresolved user-owned decisions
