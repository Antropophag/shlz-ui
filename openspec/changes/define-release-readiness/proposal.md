## Why

The repository has four package-shaped workspaces at version `0.1.0`, but it has no governed way to decide versions, distribute immutable artifacts, communicate compatibility, or recover from a bad release. Milestone 6 must establish that contract before release automation is implemented and before the library is presented as generally consumable.

## What Changes

- Define one fixed SemVer release train for `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and `@shlz/behaviors`, including explicit rules for public-contract and breaking changes.
- Define private distribution through the corporate GitLab npm Package Registry while keeping the framework-neutral package boundaries unchanged.
- Require per-change release notes and generated package changelogs through Changesets, with a reviewable version PR before publication.
- Define a validation and staged-promotion gate that packs and tests the exact artifacts, publishes immutable versions without immediately changing the stable channel, verifies registry consumption, and promotes all four packages only after the release set passes.
- Separate preparation from authority: ordinary pull requests and merges cannot publish; an authorized maintainer must approve an exact-version release through a protected environment using least-privilege credentials.
- Define partial-publication recovery, stable-channel rollback, deprecation, and forward-fix behavior without overwriting or normally deleting published versions.
- Keep the pipeline implementation in a later, separate PR after this contract is approved; keep real-application pilot integration in the following milestone.

## Capabilities

### New Capabilities

- `release/package-release-readiness`: Versioning, distribution, compatibility, changelog, validation, publication-authority, promotion, and rollback requirements for the four-package release set.

### Modified Capabilities

None.

## Impact

The approved follow-up implementation will affect the four package manifests and internal dependency ranges, root release tooling/configuration, changelog files, package-consumer validation, and GitHub Actions workflows that authenticate to the corporate GitLab npm registry. It will require a protected release environment, a configurable corporate GitLab registry endpoint/project identity, and a least-privilege write credential managed outside the repository.

The change does not publish packages, create credentials, modify corporate GitLab settings, select the pilot application, change package runtime APIs or design values, modify `shlz-design-source/`, or perform the milestone 7 consumer integration. Registry endpoint values and protected-environment approvers remain deployment configuration supplied by repository administrators when the approved pipeline is enabled.
