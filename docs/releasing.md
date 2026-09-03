# Package release policy

SHLZ UI releases `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and
`@shlz/behaviors` as one private, fixed-version set. Source and review live in
GitHub. Package artifacts live in the npm-compatible corporate GitLab Package
Registry. The application used for the later consumer pilot is evidence, not a
design source.

## Version and compatibility contract

All four package manifests have the same SemVer version. Every release publishes
all four packages, even when only one has materially changed, and SHLZ package
dependencies use that exact version.

For `1.0.0` and later:

- `major`: a supported consumer must change code, markup, styles, assets, build
  configuration, or runtime assumptions;
- `minor`: a backward-compatible capability;
- `patch`: a backward-compatible correction.

Before `1.0.0`, a breaking change increments the minor number, is labelled
**breaking**, and includes migration guidance. A compatible correction may
increment the patch. The highest increment in a release determines the version
for the whole package set.

Public compatibility includes package/export paths, JavaScript and TypeScript
interfaces, documented DOM/events/accessibility, supported CSS selectors and
custom properties, token names/types, icon identifiers and aliases, module
formats, and supported browser/Node/npm ranges. An internal refactor or
authoritative visual-value correction is not automatically breaking when its
documented meaning remains intact and consumers need no migration; describe any
material visible effect anyway.

## Changesets and changelogs

A pull request that changes distributable package behavior adds a file under
`.changeset/`. Its summary states the consumer effect and migration guidance.
During `0.y.z`, use `minor` for a breaking change and say **breaking** in the
summary. Changesets fixes the four package versions and generates their
changelogs in a reviewable version PR.

A change is release-exempt only when it cannot alter a packed artifact or its
supported contract. Exempt categories are repository-only documentation,
tests/fixtures, audit evidence, development-only showcase changes, and workflow
maintenance that preserves release behavior. A package source, generated
distribution, package manifest, generator, or package build change is not
exempt.

## Consumer setup

Administrators provide the real host and project/group identity through the
approved corporate channel. Documentation and repository configuration retain
placeholders:

```ini
@shlz:registry=https://<gitlab-host>/api/v4/projects/<project-or-group-id>/packages/npm/
//<gitlab-host>/api/v4/projects/<project-or-group-id>/packages/npm/:_authToken=${GITLAB_NPM_READ_TOKEN}
always-auth=true
```

Install one exact release-set version to make deployments reproducible:

```sh
npm install --save-exact @shlz/tokens@<version> @shlz/icons@<version> @shlz/styles@<version> @shlz/behaviors@<version>
```

`latest` is a convenience pointer to one verified shared version. Lockfiles and
exact dependencies, not `latest`, are the deployment authority.

## Release preparation and authority

The preparation workflow updates a version PR only. Merging an ordinary or
version PR never publishes packages. An authorized maintainer manually starts
the publication workflow for the reviewed version commit on protected `main`.
The protected GitHub `release` environment must require approval before it
exposes `GITLAB_NPM_PUBLISH_TOKEN`.

The publisher credential is dedicated and least-privilege: it may write only
the intended corporate GitLab package namespace. Consumer credentials are
separate and read-only. Pull requests, forks, and unprotected branches never
receive either publication credentials or stable-tag mutation authority. Local
`npm publish` is not the canonical release path.

## Publication and incident handling

The release job validates and packs a clean, immutable `main` commit. It binds
the commit, version, changelogs, tarball inventories and integrity values in a
candidate manifest. It publishes exact versions under a non-stable candidate
tag, verifies all four from GitLab in a clean consumer, and only then moves all
four `latest` tags and creates the source release record.

If publication stops part way through, do not change `latest`. A rerun may skip
an existing package only when its registry integrity matches the approved
candidate. Any collision with different content is an incident and requires a
new version.

For a defective stable release, an authorized maintainer runs protected
rollback to a previously verified complete set. The workflow moves all four
stable tags together as closely as the registry permits, deprecates the
defective version with replacement guidance, and records the action. If tag
mutation fails part way through, restore the recorded prior coherent set and
block further releases until verification passes. Never overwrite a version;
normal rollback does not unpublish or delete it. Ship the fix under a new shared
version.

## Administrator activation checklist

Before stable publication is enabled, administrators must configure and verify:

1. `SHLZ_NPM_REGISTRY_URL` and its matching project/group
   `SHLZ_GITLAB_REGISTRY_ID`;
2. a rotatable `GITLAB_NPM_PUBLISH_TOKEN` with only the required package-write
   scope;
3. a separate `GITLAB_NPM_READ_TOKEN` for the post-publication consumer check;
4. a protected GitHub environment named `release`, restricted approvers, and
   branch policy for protected `main`;
5. masked secret handling, rotation ownership, and an emergency contact;
6. a separately authorized non-stable candidate, resume, promotion, and rollback
   exercise with redacted evidence.

Missing configuration must fail before upload or stable-tag mutation. Passing
local/CI checks proves the pipeline implementation, not external activation.
General-consumption readiness additionally requires the separately approved
real-application pilot.
