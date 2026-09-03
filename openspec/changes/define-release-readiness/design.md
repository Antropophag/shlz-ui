## Context

See `proposal.md` for motivation and `specs/release/package-release-readiness/spec.md` for the observable contract. The repository is an npm-workspace monorepo hosted on GitHub, with CI in GitHub Actions and four package manifests currently fixed at `0.1.0`. `@shlz/styles` currently depends on `@shlz/tokens`; the other SHLZ packages do not declare cross-package dependencies. Existing validation already generates, builds, validates exports, packs the packages, and exercises a clean local consumer, but there is no release-intent data, registry authentication, immutable candidate record, publication workflow, or recovery operation.

The distribution target is an npm-compatible registry in corporate GitLab. Its host, project or group identifier, access policy, protected-environment approvers, and credential material are external administration state and cannot be committed to the repository. Source and review remain in GitHub; GitLab is the package distribution system, not a second source repository.

## Goals / Non-Goals

**Goals:**

- Make one reviewed source commit map reproducibly to one four-package version and four identifiable tarballs.
- Keep release intent close to each change and make version/changelog changes reviewable before publication.
- Prevent pull requests, ordinary merges, partial package uploads, or unverified artifacts from becoming the stable release set.
- Give maintainers deterministic resume, rollback, and audit paths without mutable package contents.
- Reuse existing build and consumer-smoke validation rather than creating a second package build system.

**Non-Goals:**

- Publishing from this planning change or configuring corporate GitLab/GitHub administration state.
- Selecting or modifying the milestone 7 pilot application.
- Supporting independent package versions, public/anonymous package access, multiple registries, or local ad hoc publication.
- Guaranteeing transactional updates across four npm distribution tags; npm registries do not provide a multi-package transaction.
- Declaring the library generally consumable before separate pilot evidence exists.

## Decisions

### Use a fixed Changesets release group

Add Changesets as repository release-intent tooling and configure the four `@shlz` packages as one fixed group. A package-affecting pull request adds a small changeset; release-exempt changes are limited to documented categories such as repository-only documentation, tests, or workflow maintenance that cannot alter distributed artifacts. CI checks this policy from the pull-request diff.

The release-preparation automation consumes changesets on `main` and opens or updates an ordinary version PR. That PR applies the highest requested SemVer increment to all four manifests, pins any internal SHLZ dependency to the same exact version, generates package changelogs, and preserves migration text. Merging it authorizes only the versioned source state, not publication.

Independent versions were rejected because consumers commonly combine tokens, styles, icons, and behaviors; independent selection would shift compatibility-matrix work onto every consumer. A manually edited monorepo version and changelog were rejected because release intent would be easy to omit and difficult to validate mechanically.

### Keep compatibility classification consumer-centered

Repository documentation will define the supported surface categories in the spec and provide concrete examples for maintainers. A change is breaking when a supported consumer must adapt, not merely when an implementation file or rendered pixel changes. For `0.y.z`, breaking changes increment the minor number and carry explicit migration notes; `1.0.0` begins normal major-version stability only through a separately reviewed version PR when pilot evidence supports that claim.

Treating every visual correction as breaking was rejected because authoritative source-fidelity corrections can preserve a semantic contract. Treating CSS, tokens, icons, or DOM behavior as implementation detail was also rejected because those are direct public inputs for framework-neutral consumers.

### Configure corporate GitLab without committing corporate coordinates

Package manifests gain the metadata needed for private npm publication, while the `@shlz` registry mapping, GitLab project/group endpoint, and authentication are injected by the protected release job. Consumer documentation shows placeholders and the required scope mapping without embedding real hostnames or tokens. The package tarballs remain framework-neutral and do not acquire a GitLab runtime dependency.

The write credential is a dedicated GitLab project/group deploy credential, or an equivalent short-lived credential if corporate GitLab supports an approved federation path at implementation time, scoped only to write the intended package namespace. It is exposed only inside the protected GitHub release environment. Consumer credentials are separate and read-only.

Committing `.npmrc` credentials or allowing a developer workstation to be the canonical publisher was rejected. Publishing from a parallel GitLab source checkout was rejected because it would introduce a second source-of-truth and an unverifiable commit transfer.

### Separate preparation, candidate publication, and stable promotion

The implementation uses two workflows:

1. Release preparation on `main` maintains the reviewable Changesets version PR and has no registry write credential.
2. A manually dispatched publication/rollback workflow accepts a versioned commit already merged to protected `main`, enters a protected `release` environment, and requires an authorized maintainer's approval before receiving the GitLab write credential.

Publication first re-runs the full release checks and creates a candidate manifest containing source SHA, shared version, package names, tarball integrity digests, changelog state, and validation result. It checks registry collisions, then publishes all four exact versions under a non-stable candidate tag in dependency-safe order (`tokens`, `icons`, `styles`, `behaviors`). Existing matching artifacts make a retry idempotent; an existing non-matching artifact is terminal. A clean temporary consumer installs exact versions from GitLab. Only then does the workflow move `latest` for each package, verify all four tags, create the source release tag, and publish the aggregate release record.

Publishing directly as `latest` was rejected because a third-package failure could advertise an incomplete set. Publishing only one changed package was rejected because it violates fixed-set identity. A registry-specific orchestration service was rejected as unnecessary: a manifest, serialized workflow concurrency, collision checks, candidate tags, exact-version verification, and fail-closed promotion provide the required control with existing CI.

### Extend the existing validation seam

The existing `npm run check`, `tools/validate.mjs`, and `tools/package-consumer-smoke.mjs` remain the underlying build/runtime evidence. Focused release tooling will add deterministic checks for:

- exactly four expected package names and one SemVer version;
- exact internal release-set dependencies;
- package metadata and private-registry publication intent;
- `npm pack --json` file inventories and integrity digests;
- export targets and forbidden/unexpected tarball content;
- changeset or release-exempt coverage of package-affecting diffs;
- installation of the exact four local tarballs and, after upload, the exact four GitLab versions;
- clean generated state and binding to the reviewed commit.

The pipeline calls repository-owned scripts for policy and manifest generation so pull-request and release jobs exercise the same logic. Workflow YAML remains orchestration rather than the only implementation of release rules.

### Roll back the stable pointer, never package contents

Rollback is a protected mode of the release workflow. It preflights that the requested target has all four packages and matching historical candidate/release evidence, records the current stable set, then moves all four `latest` tags to the target and verifies them. It deprecates the defective version with replacement guidance and records the operator, reason, before/after versions, and result. A forward fix always uses a new shared version.

Because four dist-tag changes cannot be atomic, the operation is serialized and records each mutation. If promotion or rollback fails mid-operation, the workflow immediately attempts to restore the recorded prior coherent tag set, reports any remaining mixed state as a release incident, and blocks further releases until verification passes. Consumers that require maximal reproducibility use exact versions rather than `latest`.

Deletion was rejected as normal rollback because it can break lockfiles and destroy auditability. Overwriting a version is forbidden by both policy and collision checks.

## Risks / Trade-offs

- **[A fixed group releases unchanged packages]** → Accept extra registry versions in exchange for a single supported compatibility coordinate and simpler consumer upgrades.
- **[GitHub publishes to external corporate GitLab]** → Keep endpoint configuration external, protect the environment, minimize credential scope, mask secrets, and fail before upload when configuration is incomplete.
- **[Four package/tag mutations are not atomic]** → Publish non-stable candidates first, serialize releases, verify exact versions before promotion, record every mutation, and repair toward the previous coherent set on failure.
- **[A long-lived deploy token can leak]** → Prefer approved short-lived federation when available; otherwise use a dedicated rotatable token accessible only to the protected environment and never to pull-request jobs.
- **[Changeset classification can be wrong]** → Review release intent in the originating PR and again in the version PR; mechanical checks enforce presence and fixed-group consistency, while reviewers own semantic bump correctness.
- **[Pre-1.0 consumers may underestimate breaking changes]** → Require the minor increment, an explicit breaking label, and migration guidance even before `1.0.0`.
- **[Registry availability can interrupt a release]** → Preserve immutable local candidate evidence, leave `latest` untouched until verification, and make matching partial publication resumable.

## Migration Plan

1. In the separate implementation PR, add Changesets configuration, release policy documentation, package metadata, and repository-owned release validation/manifest scripts without publishing.
2. Add focused tests for fixed versions, compatibility intent, tarball inventory, collision handling, partial-release resume, promotion, and rollback dry-run behavior; run the existing full package and browser validation as applicable.
3. Add pinned GitHub Actions for version-PR preparation and protected manual publication/rollback. Keep the publication path disabled or guaranteed to fail closed until administrators configure the environment, endpoint, approvers, and least-privilege GitLab credential.
4. Validate the workflow against a non-stable test version/channel, verify a clean authenticated registry consumer, and record the release evidence before enabling stable promotion.
5. Merge remains user-owned. After the release pipeline PR is reviewed and merged, perform milestone 7 in its own scoped change/PR and use exact package versions for the real-application pilot.

Repository rollback of the implementation is a normal revert while no version has been published. Once artifacts exist, rollback follows the immutable-version and stable-tag procedure above; reverting workflow code does not erase registry history.

## Open Questions

- Repository administrators must supply the corporate GitLab npm endpoint/project identity, protected GitHub environment name and approver list, credential mechanism, and secret/variable names before enabling publication. These values instantiate the approved contract but do not change its package, authority, or validation semantics.
