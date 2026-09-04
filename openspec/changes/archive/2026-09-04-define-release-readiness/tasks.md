## 1. Release policy and package metadata

- [x] 1.1 Add Changesets with the four packages configured as one fixed group, define package-impact release exemptions and pre-1.0 breaking-change guidance, and verify focused tests reject missing or inconsistent release intent.
- [x] 1.2 Add publishable private-package metadata and exact shared-version internal dependency rules to the four manifests without embedding a corporate endpoint, and verify the package metadata/version contract passes for all four packages and fails on a divergent fixture.
- [x] 1.3 Add maintainer and consumer documentation for SemVer classification, changelog/migration content, GitLab scope configuration placeholders, exact-version installation, release authority, and incident handling; verify documentation examples contain no real credential or corporate coordinate.

## 2. Exact-candidate validation

- [x] 2.1 Write failing focused tests for package-set closure, version/dependency divergence, tarball allowlists, missing exports, dirty generated state, candidate identity, registry collision, partial-publication resume, promotion, and rollback invariants; verify the tests fail for the intended missing implementation before production code is added.
- [x] 2.2 Implement repository-owned release validation and candidate-manifest tooling over the existing build, validation, pack, and clean-consumer seams; verify the focused tests pass and a real local run binds the source SHA, shared version, four tarball inventories/integrities, changelogs, and validation result.
- [x] 2.3 Extend clean-consumer coverage to install the exact four local candidates together and support an authenticated exact-version GitLab verification mode; verify local CI needs no write credential and registry mode fails closed with incomplete or masked configuration.

## 3. Reviewable preparation and protected release operations

- [x] 3.1 Add a pinned release-preparation workflow that maintains a Changesets version PR on `main` without registry credentials or publication side effects; verify workflow tests/inspection prove an ordinary merge only prepares reviewed version and changelog changes.
- [x] 3.2 Add a serialized, manually dispatched publication workflow bound to protected `main` and a protected release environment; implement candidate-tag publication, collision-safe resume, exact registry-consumer verification, four-package `latest` promotion, source tag/release record creation, and fail-closed repair, then verify untrusted and unapproved paths cannot access the write credential or publish.
- [x] 3.3 Add a protected rollback mode that preflights a complete historically verified release set, records the prior stable set, moves and verifies all four stable tags, deprecates the defective version, repairs partial tag movement, and emits an audit record; verify dry-run/failure fixtures never delete or overwrite package contents.

## 4. Activation, validation, and delivery

- [x] 4.1 Document the administrator handoff for GitLab endpoint/project identity, least-privilege publisher credential, read-only consumer credential, GitHub protected-environment approvers, rotation, and emergency response; verify stable promotion remains disabled or fail-closed until every external prerequisite is configured.
- [x] 4.2 Record the live corporate GitLab publication/resume/exact-consumer/promotion/rollback exercise as a required separate post-merge activation change, and verify the implementation PR performs no external registry mutation and cannot report the pipeline active.
- [x] 4.3 Run strict OpenSpec validation, Changesets/release-policy checks, the full repository validation appropriate to affected package/workflow surfaces, target-diff inspection, independent standards/spec review, failure-path proof, route conformance, and delivery guards; resolve blocking findings and deliver the release-pipeline implementation as an unmerged PR without starting the real-application pilot.
