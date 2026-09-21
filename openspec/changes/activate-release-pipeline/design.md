## Context

The merged workflow already publishes from protected `main`, uses a GitHub environment named `release`, reads `SHLZ_NPM_REGISTRY_URL` and `SHLZ_GITLAB_REGISTRY_ID`, separates `GITLAB_NPM_PUBLISH_TOKEN` from `GITLAB_NPM_READ_TOKEN`, publishes under `candidate`, verifies exact versions, promotes all four `latest` tags, and supports rollback. See `proposal.md` for why live activation is now required and `specs/release/package-release-readiness/spec.md` for the observable gate.

Activation crosses GitHub administration, GitLab administration, irreversible package-version publication, mutable distribution tags, and repository evidence. Exact corporate coordinates and credentials are operator-owned inputs delivered out of band; planning does not need or authorize their disclosure.

## Goals / Non-Goals

**Goals:**

- Prove the existing protected workflow against the intended corporate registry using the same four-package fixed-version contract consumers will use.
- Make partial-publication recovery and rollback observable without relying only on unit fixtures.
- Finish with a coherent, explicitly recorded stable state and a compact redacted evidence bundle.
- Provide a binary gate that prevents milestone 7 from starting on partial success.

**Non-Goals:**

- Storing or echoing GitLab coordinates, credentials, personal approver identities, or raw configuration in Git.
- Using the future pilot application during activation.
- Deleting or overwriting published package versions.
- Treating a test rollback as proof of general-consumption readiness.
- Broadly redesigning release automation. A defect found during activation pauses the exercise and is routed as a separate change unless a narrowly required correction is explicitly approved into this change.

## Decisions

### 1. Configure all sensitive values on the protected environment

`SHLZ_NPM_REGISTRY_URL` and `SHLZ_GITLAB_REGISTRY_ID` are environment variables on `release`; publisher and reader tokens are environment secrets on the same environment. The environment requires designated reviewers and permits deployment only from protected `main`. The write token is limited to the intended package namespace; the read token cannot publish or mutate tags.

Repository-level variables or secrets were rejected because they broaden exposure beyond the approval boundary. Committed `.npmrc` configuration was rejected because it would disclose corporate coordinates and encourage credential leakage.

### 2. Use a two-version drill when no verified rollback target exists

Rollback needs a different, previously verified complete release set. Preflight first looks for a coherent prior SHLZ release with an immutable candidate manifest. If one exists, it becomes the rollback target. If none exists, activation establishes an approved baseline release set, then prepares a distinct candidate version for the partial-publication, promotion, and rollback drill. Both versions follow the normal reviewed version-commit path; neither is overwritten or reused.

Declaring rollback not applicable was rejected because rollback is an explicit activation acceptance criterion. Fabricating a manifest for an unverified registry version was rejected because it bypasses artifact identity and consumer proof.

### 3. Demonstrate resume with an actual partial registry state

The first candidate attempt is deliberately cancelled only after GitLab confirms at least one package at the target version and before all four are present. Before cancellation, operators must ensure no promotion step has begun. The registry state is then queried with read-only credentials to prove a strict subset exists and `latest` is unchanged. The same workflow dispatch is rerun for the identical `main` SHA and version; its publication audit must show matching existing artifacts were skipped and missing artifacts were published.

A synthetic fixture was rejected because the activation contract requires live GitLab behavior. Direct ad-hoc publication from a maintainer workstation was rejected because it bypasses the canonical protected environment. If the existing workflow cannot be interrupted at a safely observable package boundary, activation pauses; maintainers must authorize a narrowly scoped deterministic interruption seam through OpenSpec rather than creating an uncontrolled partial state.

### 4. Promotion and rollback use protected workflow dispatches

After the resumed run verifies a clean exact-version consumer, it may promote all four tags and record the source release. Rollback is then dispatched with the verified prior version, the promoted test version as defective, and non-sensitive exercise/replacement guidance. Final read-only checks prove all four `latest` tags match the rollback target and the test version still exists but is deprecated.

Manual `npm dist-tag` mutation was rejected because it would not exercise approval, transaction repair, or workflow evidence. Deleting the test version was rejected because versions are immutable and rollback is tag movement plus deprecation.

### 5. Store a redacted evidence index, not raw operational output

The durable repository record is a small machine-readable manifest plus a maintainer summary. It contains GitHub run IDs/attempts, source SHAs, shared versions, candidate digests, the four public package names, per-stage outcomes, prior/final coherent tag versions, timestamps, checks executed, and known limitations. It omits registry URL/host/path, GitLab project/group ID, token material or fingerprints, secret/variable values, approver/operator names, raw `.npmrc`, and unreviewed logs. Evidence references protected external records by opaque run ID where necessary.

Raw logs and GitHub release assets remain governed operational records, not copied wholesale into Git. A redaction check scans staged evidence before commit and fails on URL/API-path, credential-assignment, token-like, numeric project-ID, and personal-identity fields.

### 6. Activation is all-or-nothing for roadmap progression

The activation status remains `pending` unless configuration, partial resume, exact install, promotion, rollback, final-state verification, and redaction all pass. A failed stage records a sanitized limitation and recovery state but cannot be aggregated with successful stages into an `active` claim. Milestone 7 begins only in a later OpenSpec change after this activation change is validated, reviewed, delivered, and its external exercise is complete.

## Risks / Trade-offs

- **[Cancellation occurs too late and the first run completes]** → Do not claim partial-resume evidence; use a new unused approved version or pause for an authorized deterministic interruption seam.
- **[Cancellation leaves an ambiguous package state]** → Inspect exact versions and `latest` with the read-only credential before rerun; block on any integrity mismatch or unexpected tag movement.
- **[No prior verified rollback target exists]** → Establish a baseline through the same full protected pipeline before the candidate drill, accepting the cost of a second immutable version.
- **[Promotion or rollback changes only some tags]** → Let transaction repair run, verify all four tags read-only, record the sanitized incident, and keep activation blocked until the registry is coherent.
- **[Evidence leaks corporate or personal data]** → Generate an allowlisted schema, run automated and human redaction review, and commit only the sanitized derivative.
- **[Token scope is broader than intended]** → Validate capabilities with safe positive/negative probes where the platform permits; rotate/revoke and block activation if least privilege cannot be demonstrated.
- **[The exercise deprecates a usable test version]** → Use explicit non-sensitive exercise guidance and retain the immutable version for audit; consumers install the selected final exact version.

## Migration Plan

1. Confirm a maintenance window, authorized approvers, unused release version(s), and a verified rollback target or baseline plan.
2. Configure and independently review the protected `release` environment, variables, secrets, branch policy, token scopes, rotation owner, and emergency contact without copying their values into the repository.
3. Perform read-only/fail-closed preflight and capture only sanitized configuration-presence results.
4. Prepare the reviewed version commit(s) on `main` through the normal version PR flow.
5. Create the controlled partial candidate state, verify no `latest` movement, rerun the identical candidate, and verify all four exact packages in a clean consumer.
6. Promote the test version, verify the four-tag and source-release record, then run protected rollback to the verified prior release and verify deprecation plus final coherent tags.
7. Produce and validate the redacted evidence bundle, complete independent review, and mark activation successful only if every gate passes.

Operational recovery always prefers the workflow's repair/rollback path. If a coherent final state cannot be proven, stop further releases, preserve sanitized incident references, rotate affected credentials if needed, and keep milestone 7 blocked.
