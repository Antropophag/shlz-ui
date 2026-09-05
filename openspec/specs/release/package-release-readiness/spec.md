## Purpose

Defines when the four SHLZ packages form a coherent, publishable release and how consumers can identify, install, assess, and recover from that release.

## Requirements

### Requirement: Four packages share one release-set version

The release system SHALL treat `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and `@shlz/behaviors` as one fixed release set. Every release candidate and stable release MUST assign the same valid SemVer version to all four packages and MUST publish all four, including a package whose contents did not change. Dependencies between packages in the set MUST resolve to that exact release-set version.

#### Scenario: A change affects only one package

- **WHEN** an approved release contains a change only to `@shlz/icons`
- **THEN** all four packages receive and publish the same new version, while the changelog identifies `@shlz/icons` as the materially changed package

#### Scenario: Versions or internal dependencies diverge

- **WHEN** a candidate has different versions across the four manifests or an internal dependency does not require the candidate's exact version
- **THEN** release validation fails before any package is published

### Requirement: Version increments communicate compatibility

Release versions SHALL follow SemVer. For stable `1.0.0` and later releases, a consumer-impacting incompatible change MUST increment the major version, a backward-compatible capability MUST increment the minor version, and a backward-compatible correction MUST increment the patch version. While the library remains on `0.y.z`, an incompatible change MUST increment `y`, MUST be labelled as breaking in release notes, and MUST include migration guidance; a compatible correction MAY increment `z`. The highest required increment among changes in a release SHALL determine the shared release-set increment.

#### Scenario: Several changes require different increments

- **WHEN** one release includes both a patch-level correction and a breaking public-contract change
- **THEN** the release set uses the breaking-change increment and records the breaking change and migration guidance

#### Scenario: A pre-1.0 release breaks compatibility

- **WHEN** a `0.y.z` release requires consumer migration
- **THEN** the release increments `y` rather than only `z` and visibly marks the change as breaking

### Requirement: Compatibility covers every supported consumer contract

A change SHALL be classified as breaking when a supported consumer must change code, markup, styles, assets, build configuration, or runtime assumptions to upgrade successfully. This includes removal or incompatible alteration of package export paths, JavaScript or TypeScript APIs, documented DOM/event/accessibility behavior, supported CSS selectors or custom properties, token names or types, icon identifiers or compatibility aliases, package names, module formats, or supported runtime/toolchain ranges. Additive APIs and new optional assets are backward-compatible. Internal refactors and value corrections that preserve documented semantics and require no consumer migration are not breaking, but their visible effect MUST still be described when material.

#### Scenario: A public export is removed

- **WHEN** a documented export path or exported API is removed without a compatibility bridge
- **THEN** the change is classified as breaking and provides migration guidance

#### Scenario: Source fidelity changes a semantic token value

- **WHEN** an authoritative correction changes a token's rendered value but preserves its documented name, type, and meaning without requiring consumer changes
- **THEN** the change is not automatically breaking and the visible correction is called out in release notes

#### Scenario: Supported platform range is reduced

- **WHEN** the minimum supported browser, Node.js version, npm version, or module capability is raised
- **THEN** the release is classified as breaking

### Requirement: Packages are distributed privately through corporate GitLab

All four packages SHALL be published under the `@shlz` scope to the configured corporate GitLab npm Package Registry and SHALL require authenticated read access. The registry endpoint and project or group identity MUST be deployment configuration rather than committed corporate coordinates. Published tarballs MUST contain only the declared distributable files and MUST expose the same package names and export paths that passed candidate validation.

#### Scenario: An authenticated corporate consumer installs a release set

- **WHEN** a consumer maps the `@shlz` scope to the configured corporate GitLab registry and requests one exact release-set version
- **THEN** the registry supplies the requested private package and its SHLZ dependencies at that same version

#### Scenario: A pull request runs validation

- **WHEN** package changes are validated in a pull request
- **THEN** the workflow builds and packs local candidates without publishing, changing registry tags, or requiring a registry write credential

#### Scenario: Registry configuration is absent

<!-- failure-invariant: missing-registry-config-cannot-mutate concern=state-machine -->

- **WHEN** a publication run lacks a valid registry endpoint, project identity, or write credential
- **THEN** publication fails closed without logging credential material or modifying a stable distribution tag

### Requirement: Every releasable change has reviewable release notes

Each package-affecting change MUST add a reviewable changeset that names the affected public behavior, proposed compatibility increment, and consumer impact, or MUST satisfy a documented release-exempt category. Release preparation SHALL consume the accumulated changesets, apply the highest required shared increment to all four packages, update package changelogs, preserve breaking-change migration guidance, and produce one release record binding the four package versions to the source commit.

#### Scenario: A package-affecting pull request has no release intent

- **WHEN** a pull request changes a distributable package but has neither a valid changeset nor a documented release-exempt classification
- **THEN** release validation rejects it before it can contribute to a release

#### Scenario: Release preparation is reviewed

- **WHEN** accumulated changes are ready for release
- **THEN** an ordinary pull request shows the shared version update and generated changelogs before publication can be authorized

### Requirement: Validation proves the exact candidate release set

Before publication, validation MUST run from a clean checkout and MUST generate, test, lint, build, and pack all four candidates. It MUST verify package metadata, the shared version, exact internal dependencies, export targets, tarball contents, and absence of undeclared source or secret files. It MUST install the exact packed artifacts together in a clean consumer and exercise the supported package entry points. Publication validation MUST bind the approved source commit, version, changelogs, tarball identities, and validation result so different artifacts cannot be substituted later.

#### Scenario: A packed export is missing

- **WHEN** an export declared by a candidate manifest is absent from its tarball
- **THEN** validation fails and no package is published

#### Scenario: Generated output differs from the committed candidate

- **WHEN** release generation or build leaves an unexpected repository diff or produces artifacts different from those bound to approval
- **THEN** validation fails and publication requires a newly reviewed candidate

#### Scenario: Exact tarballs work together

- **WHEN** all candidate checks pass and a clean consumer installs the four packed artifacts
- **THEN** the consumer can resolve every supported entry point without workspace links or repository-only files

### Requirement: Publication is staged and promotion is fail-closed

Publication SHALL treat package versions as immutable. A candidate run MUST check that the version is unused or contains only approved matching artifacts from an incomplete prior attempt, publish the four packages without assigning the stable `latest` tag, and verify installation of the exact versions from the corporate registry. Only after all four exact versions and registry-consumer checks pass MAY the same run promote the shared version for all four packages to `latest` and create the corresponding source tag and release record. A partial publication MUST remain non-stable and SHALL be safely resumable for missing packages after confirming any existing package has the approved artifact identity.

#### Scenario: The third package fails to publish

<!-- failure-invariant: partial-release-cannot-promote concern=state-machine -->

- **WHEN** two packages were published to the non-stable channel and a later package fails
- **THEN** no package in the candidate is promoted to `latest`, the partial state is reported, and a retry publishes only missing approved artifacts

#### Scenario: An existing version has different contents

<!-- failure-invariant: registry-collision-cannot-overwrite concern=persistence -->

- **WHEN** the target version already exists for any package with an artifact identity different from the approved candidate
- **THEN** the run fails and MUST NOT overwrite, resume, or promote that release set

#### Scenario: Registry verification succeeds

- **WHEN** all four exact versions are present and a clean registry consumer passes
- **THEN** the run may promote that version across the four packages and record the source commit and artifact identities

### Requirement: Publication requires explicit authorized approval

Normal pull requests, merges, and untrusted code SHALL NOT publish packages. Publication MUST execute from an immutable commit on the protected default branch, for the reviewed version state, through a protected release environment requiring an authorized maintainer's explicit approval. Automation SHALL use a dedicated least-privilege corporate GitLab credential capable only of publishing within the intended package scope; consumers SHALL use separate read-only credentials. Local maintainer publication SHALL NOT be the canonical release path.

#### Scenario: An ordinary change merges to the default branch

- **WHEN** a non-release or release-preparation pull request is merged
- **THEN** no package is published solely because of that merge

#### Scenario: An authorized maintainer approves an exact release

- **WHEN** the reviewed version commit is on the protected default branch and an authorized maintainer approves its publication
- **THEN** the release workflow may access the write credential and attempt the bound release

#### Scenario: Untrusted code requests publication

- **WHEN** a pull request, fork, unprotected branch, or unapproved actor invokes release automation
- **THEN** the workflow cannot obtain publication credentials or mutate package versions and distribution tags

### Requirement: Rollback preserves history and restores a coherent stable set

Published versions MUST NOT be overwritten and SHALL NOT normally be deleted. If a promoted release is defective, an authorized maintainer SHALL be able to move the stable tag for all four packages back to one previously verified shared version, deprecate the defective versions with a reason and replacement guidance, and publish a forward-fix under a new version. Rollback MUST verify that the target contains all four packages and passed release-set validation, MUST require the same protected approval as publication, and MUST produce an auditable record. Deletion or unpublish is an exceptional registry-administration incident outside the normal release workflow.

#### Scenario: A stable release causes a regression

- **WHEN** an authorized maintainer selects a previously verified release set and approves rollback
- **THEN** all four `latest` tags are restored to that same version, the defective set is deprecated, and the action is recorded without changing package contents

#### Scenario: The requested rollback target is incomplete

<!-- failure-invariant: incomplete-rollback-cannot-mutate concern=state-machine -->

- **WHEN** one of the four packages or its validation evidence is missing for the requested target version
- **THEN** rollback fails without moving any stable tag

#### Scenario: A fixed release follows rollback

- **WHEN** the defect has been corrected and validated
- **THEN** the correction is published as a new shared version rather than replacing the defective artifacts

### Requirement: General-consumption readiness requires consumer evidence

A successful pipeline release SHALL prove release mechanics but SHALL NOT by itself mark the library generally consumable. General-consumption readiness MUST additionally reference a separately approved real-application pilot that validates installation and update behavior, CSS ordering, applicable framework-adapter boundaries, accessibility, and migration guidance while treating the application only as a consumer and not as design authority.

#### Scenario: Pipeline validation passes before the pilot

- **WHEN** all release and registry checks pass but no approved real-application pilot evidence exists
- **THEN** the release mechanics may be reported ready while general-consumption readiness remains unproven

#### Scenario: Pilot findings require a contract change

- **WHEN** the real-application pilot exposes a reusable package or migration-contract defect
- **THEN** that defect is routed through its own approved contract change and is not silently normalized as application-specific behavior

### Requirement: Pipeline delivery and live registry activation are separate gates

The repository implementation SHALL be eligible for review and merge when local/package validation, workflow validation, failure-path tests, and independent review prove the pipeline implements this contract and fails closed without external configuration. It MUST NOT be reported as active against corporate GitLab until a separate post-merge activation change configures the protected environment and credentials, exercises non-stable publication and collision-safe resume, verifies exact registry consumption, and exercises stable promotion and rollback with redacted evidence. The real-application pilot remains a later and separate gate.

#### Scenario: Implementation PR has no corporate registry credentials

- **WHEN** the implementation PR passes repository validation and proves missing external configuration prevents publication before network mutation
- **THEN** the PR may be merged as pipeline implementation while live GitLab activation remains explicitly pending

#### Scenario: Post-merge activation succeeds

- **WHEN** an authorized activation change completes the protected non-stable publication, resume, exact-consumer, promotion, and rollback exercise against corporate GitLab
- **THEN** release automation may be reported active and the project may proceed to the separate real-application pilot
