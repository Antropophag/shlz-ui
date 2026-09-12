## ADDED Requirements

### Requirement: Live activation proves the complete governed release lifecycle

The release pipeline MUST remain classified as inactive until authorized administrators configure the protected `release` environment with matching GitLab registry coordinates, separate least-privilege write and read credentials, and protected-branch approval; then successfully exercise non-stable publication, recovery from a real partial publication, exact installation of the four-package set from GitLab, coherent `latest` promotion, and rollback to a previously verified complete set. Activation MUST use approved immutable source commits and unused versions, MUST NOT overwrite or delete published versions, and MUST leave `latest` on one verified coherent four-package version after the exercise.

#### Scenario: External configuration is incomplete

- **WHEN** the protected environment, matching registry identity, approval policy, write credential, or read credential is absent or cannot be verified
- **THEN** activation remains blocked and no release mutation is intentionally attempted

#### Scenario: Candidate publication is interrupted after a subset

<!-- failure-invariant: activation-partial-publication-cannot-promote concern=state-machine -->

- **WHEN** an approved activation run publishes at least one but fewer than four candidate packages and is interrupted before promotion
- **THEN** no package moves to `latest`, the partial state is observed, and a rerun for the same source commit and version verifies matching existing artifacts and publishes only the missing packages

#### Scenario: Exact GitLab consumer verification succeeds

- **WHEN** the resumed candidate contains all four packages in GitLab
- **THEN** a clean authenticated consumer installs the exact same version of `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and `@shlz/behaviors` from the configured registry and passes the supported entry-point checks

#### Scenario: Candidate is promoted

- **WHEN** all four exact-version packages and clean-consumer checks succeed for the approved candidate
- **THEN** all four `latest` tags converge on that shared version and the source release record binds the version to the approved commit and artifact identities

#### Scenario: Test rollback is exercised

- **WHEN** an authorized maintainer identifies the promoted test version as defective for the exercise and selects a different previously verified complete release set
- **THEN** the protected rollback moves all four `latest` tags to the selected version, deprecates the test version with non-sensitive replacement guidance, records the action, and does not overwrite or delete package contents

#### Scenario: Activation evidence is retained

- **WHEN** the activation exercise finishes
- **THEN** repository evidence records the relevant GitHub run identifiers, source commits, versions, candidate digests, package-level outcomes, promotion state, rollback state, checks, and limitations while excluding credentials, registry URLs, project or group identifiers, personal identities, and raw secret-bearing configuration

#### Scenario: Any activation acceptance check fails

- **WHEN** configuration validation, partial-publication recovery, exact four-package installation, promotion, rollback, evidence redaction, or final coherent-state verification does not pass
- **THEN** the pipeline remains classified as inactive and milestone 7 does not begin

#### Scenario: Activation succeeds

- **WHEN** every activation acceptance check passes and the final GitLab state is one verified coherent stable release set
- **THEN** the release pipeline may be classified as active and milestone 7 may proceed as a separate OpenSpec change
