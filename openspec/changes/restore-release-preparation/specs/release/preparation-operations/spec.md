## Purpose

Restore reviewable version pull requests while preserving the boundaries between release preparation, package publication and application adoption.

## ADDED Requirements

### Requirement: Preparation has the required repository permission

The repository SHALL permit the existing GitHub Actions release-preparation workflow to create its version pull request. Default workflow token permissions MUST remain read-only. The operation MUST NOT add an approval or merge step or change existing publication/environment protections.

#### Scenario: Repository permission prevented version PR creation

- **WHEN** the failed preparation run is retried after enabling the required repository permission
- **THEN** preparation succeeds and a version pull request targeting main exists with coherent package versions and release notes
- **AND** the pull request remains unmerged and default workflow permissions remain read-only

### Requirement: Preparation and activation have distinct completion evidence

The maintainer record SHALL identify the failed run, corrected permission, successful retry and resulting version PR. Documentation SHALL distinguish completed release-policy/pipeline implementation from pending live GitLab activation and the subsequent real-application pilot.

#### Scenario: Preparation succeeds before activation

- **WHEN** the version pull request is created successfully
- **THEN** documentation records preparation as restored without claiming packages were published, GitLab activation passed, or the consumer pilot completed

### Requirement: Current roadmap preserves evidence boundaries

The development roadmap SHALL reference merged capabilities and order remaining release, adoption, accessibility, browser, specification and provenance work. Component audit status and source-record classification MUST NOT be represented as interchangeable product-completion percentages.

#### Scenario: A source record remains unresolved for a delivered component

- **WHEN** maintainers consult the roadmap
- **THEN** reconciliation of the source mapping is distinguished from implementing a new component and uncertain mappings remain unresolved until supported
