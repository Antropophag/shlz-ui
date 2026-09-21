## Why

The release pipeline is implemented and merged, but it is still deliberately fail-closed because its corporate GitLab coordinates, credentials, and protected GitHub environment have not been activated and exercised. Before milestone 7 can begin, maintainers need auditable proof that the live pipeline can publish, resume, verify, promote, and roll back the four-package release set without exposing corporate secrets.

## What Changes

- Configure the protected GitHub environment named `release`, including restricted approvers and the protected `main` deployment policy.
- Configure the exact corporate GitLab npm registry URL and matching project or group identity as environment variables, while keeping corporate coordinates out of committed files and captured evidence.
- Add separate least-privilege package-write and read-only package-read credentials as protected environment secrets.
- Prepare and publish an authorized non-stable release candidate for all four SHLZ packages.
- Exercise a controlled partial-publication interruption and prove that a rerun verifies existing artifacts, publishes only the missing approved artifacts, and does not move `latest` prematurely.
- Install the same exact version of `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and `@shlz/behaviors` from GitLab in a clean consumer.
- Promote the verified four-package set to `latest`, then exercise rollback to a previously verified complete set without overwriting or deleting package contents.
- Preserve redacted activation evidence that binds outcomes to workflow runs, source commits, versions, and artifact identities without recording tokens, registry coordinates, project/group identity, or other sensitive corporate details.
- Keep milestone 7 and any real-application package integration explicitly blocked until every activation acceptance check succeeds.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `release/package-release-readiness`: Make live activation evidence, partial-publication recovery, exact four-package consumption, promotion, and rollback the explicit gate for declaring the pipeline active and allowing milestone 7 to start.

## Impact

- External configuration: GitHub environment protection, environment variables and secrets, and corporate GitLab package-registry permissions.
- Runtime systems: GitHub Actions, the corporate GitLab npm Package Registry, GitHub release records, and a clean disposable consumer workspace.
- Repository evidence: a redacted activation record and any narrowly required documentation/checklist updates; no credentials or corporate coordinates may be committed.
- Published state: one non-stable four-package candidate, one promoted test release, and a controlled stable-tag rollback. Published versions remain immutable.
- Prerequisites: merged release-pipeline implementation, authorized GitHub/GitLab administrators, approved test versions and rollback target, and an agreed maintenance window.
- Risks: irreversible version publication, partial tag mutation, insufficient credential isolation, evidence leakage, and collision with pre-existing package versions.
- Out of scope: milestone 7 application integration, changes derived from an existing application, registry administration such as deleting/unpublishing versions, and redesign of the already merged release pipeline unless activation exposes a separately routed defect.
