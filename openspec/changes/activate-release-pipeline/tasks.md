## 1. Activation Preconditions and Guardrails

- [ ] 1.1 Record the OpenSpec/requirements execution gate, maintenance window, authorized administrators, immutable `origin/main` baseline, and explicit authority for GitHub/GitLab mutations; verify repository preflight classifies publishing, secrets, permissions, and external state as material and blocks execution while any required authority or input is missing.
- [ ] 1.2 Obtain the exact GitLab npm registry URL and matching project/group identity through the approved out-of-band channel, validate that they address the intended `@shlz` namespace without writing their values to disk or logs, and verify a missing or mismatched coordinate fails before package or tag mutation.
- [ ] 1.3 Identify an unused test candidate version and a different previously verified complete rollback target; if none exists, plan and approve a baseline version first, then verify both selected versions are coherent across all four manifests, immutable, and absent from conflicting registry contents.
- [ ] 1.4 Define an allowlisted activation-evidence schema and automated redaction checks; verify known-bad fixtures containing a registry URL/API path, project/group ID, credential assignment, token-like value, `.npmrc` content, or personal identity are rejected while the intended sanitized record passes.

## 2. Protected Environment and Credentials

- [ ] 2.1 Configure the GitHub environment named `release` with required restricted reviewers and a deployment branch policy limited to protected `main`; verify an unapproved or non-`main` dispatch cannot access environment secrets or mutate GitLab.
- [ ] 2.2 Configure `SHLZ_NPM_REGISTRY_URL` and `SHLZ_GITLAB_REGISTRY_ID` as protected environment variables and add separate `GITLAB_NPM_PUBLISH_TOKEN` and `GITLAB_NPM_READ_TOKEN` environment secrets; verify presence and matching registry identity through sanitized pass/fail checks without exposing values.
- [ ] 2.3 Verify least privilege, masking, rotation ownership, and emergency revocation: the reader can read/install but cannot publish or mutate tags, the publisher is limited to the intended package namespace, and neither credential is available to pull-request, fork, or unprotected-branch jobs.

## 3. Baseline and Partial Candidate Publication

- [ ] 3.1 If no verified rollback target exists, prepare, approve, publish, verify, and promote a baseline four-package release through the canonical workflows; verify its GitHub release contains the immutable candidate manifest and all four exact GitLab packages and `latest` tags resolve to the same baseline version.
- [ ] 3.2 Prepare the distinct activation candidate through the normal Changesets version PR and protected `main` flow; verify the approved source SHA, shared version, changelogs, four tarball inventories/integrities, and candidate digest are bound before external publication.
- [ ] 3.3 Start protected non-stable publication and deliberately interrupt it after GitLab contains at least one but fewer than four exact-version packages and before promotion; verify read-only registry inspection proves a strict partial set, candidate artifact identities match, and every `latest` tag remains on the prior coherent version.
- [ ] 3.4 Rerun publication for the identical source SHA and version; verify the audit shows matching existing packages were skipped, only missing packages were published, all four candidate integrities match the approved manifest, and no collision or overwrite occurred.

## 4. Exact Consumption, Promotion, and Rollback

- [ ] 4.1 Using only the read credential in a clean workspace, install `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, and `@shlz/behaviors` at the same exact GitLab version and run the supported package entry-point smoke checks; verify resolution uses the corporate registry rather than workspace links, cache substitutes, or public npm.
- [ ] 4.2 Complete protected promotion of the resumed candidate; verify all four `latest` tags converge on the candidate version and the GitHub source tag/release record binds the approved SHA, candidate digest, and artifact identities.
- [ ] 4.3 Dispatch protected rollback with the promoted activation version as defective and the verified prior version as target; verify all four `latest` tags return to the same target version, all four activation versions remain immutable and are deprecated with non-sensitive guidance, and the rollback audit records a successful coherent transaction.
- [ ] 4.4 Perform final read-only registry verification of the rollback target, exact package availability, deprecation state, and coherent tags; verify any incomplete repair, unexpected mutation, or unresolved incident keeps activation blocked and prevents additional release or milestone-7 activity.

## 5. Evidence, Review, and Gate Transition

- [ ] 5.1 Produce the allowlisted machine-readable activation record and concise maintainer summary containing only GitHub run IDs/attempts, source SHAs, versions, candidate digests, public package names, stage outcomes, prior/final tag versions, timestamps, checks, and sanitized limitations; verify automated redaction passes and a human reviewer confirms no corporate coordinates, credentials, IDs, or personal data are present.
- [ ] 5.2 Run strict OpenSpec validation, focused release-policy/workflow tests, the change-specific partial-publication failure proof, target-diff inspection, and proportionate full repository validation; verify every required check passes against the delivered candidate and record exact commands/results in redacted evidence.
- [ ] 5.3 Complete independent Standards and Spec review plus post-discovery route-conformance and delivery guards; resolve every blocking finding, push only the activation task branch, and open an unmerged PR whose evidence reports the external exercise without copying protected logs or configuration.
- [ ] 5.4 Mark the pipeline active only after configuration, partial resume, exact four-package install, promotion, rollback, final-state verification, evidence redaction, validation, and review all pass; verify milestone 7 remains absent or explicitly blocked until this activation change is successfully delivered and then begins only as its own OpenSpec change.
