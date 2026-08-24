## Context

PR #33 introduced executable failure-path proof with three concern classes and six fixed invariant IDs. The harness validates that all fixed IDs discriminate a known-bad revision from the reviewed head, but the set is compiled into `core.mjs` and has no relationship to the delta contracts being reviewed. Consequently, a proof can be complete while omitting new change-specific guarantees. CodeRabbit's seven actionable findings and one timeout nitpick provide a bounded historical fixture: four correspond to executable behavior promised or required by that change, while four belong to lint, independent test-quality review, or required CI environment coverage.

## Goals / Non-Goals

**Goals:**

- Make current-change contract sources the authority for additional executable failure invariants.
- Preserve the fixed invariant set as a baseline instead of replacing it.
- Bind proofs to normalized manifest and cited delta content.
- Produce machine-readable PR #33 classification and red/green evidence.

**Non-Goals:**

- Infer semantic invariants from arbitrary prose with heuristics or an LLM inside the harness.
- Replace Standards/Spec review, lint, CI, or external review.
- Require OpenSpec manifests for direct S or non-applicable reviews.
- Reopen or modify PR #33.

## Decisions

### 1. Review initialization receives an explicit contract manifest

Applicable `review-init` calls receive `--change <name>` and `--invariants <json>`. The manifest contains invariant `id`, `concern`, `requirement`, and `scenario`. The harness resolves only delta specs inside `openspec/changes/<change>/specs/**/spec.md`, parses exact Requirement/Scenario headings, rejects ungrounded references, and computes a source digest over normalized entries and cited scenario blocks.

This keeps semantic derivation agent-owned and reviewable while making grounding deterministic. Automatically generating test logic from Markdown was rejected because the harness cannot reliably infer executable oracles from prose.

### 2. Delta scenarios opt into executable coverage explicitly

Applicable scenarios carry a compact HTML metadata marker adjacent to the scenario heading: `<!-- failure-invariant: <id> concern=<concern> -->`. The manifest must cover every marker and every entry must match one marker. The marker is the single source of coverage intent; ordinary scenarios do not accidentally become mandatory failure probes.

Markers were chosen over a second inventory file because co-location makes contract review and omission detection possible. The manifest remains necessary because it is the executable fixture interface and can be validated before running commands.

### 3. Proof results use a unified namespaced invariant list

Baseline IDs retain their current names. Change-specific IDs use `<change>/<id>` in normalized proof state. `failurePathResultDigest` includes the change name, manifest digest, and results. Review completion requires red/green discrimination for the union of applicable baseline and change-specific IDs.

The alternative of separate proof documents would duplicate revision binding and stale-proof logic.

### 4. PR #33 fixture classifies four dynamic findings and four validation-layer findings

The fixture records eight immutable finding identities and source URLs. It executes these dynamic invariants against pre-remediation `55c3eb3` and immutable known-good `32c2cdf`:

1. review-state read/modify/write operations serialize;
2. proof execution failure records conforming degradation and invalidates stale proof;
3. reviewed-head reset cannot leave dangling pass provenance;
4. proof execution is bounded.

The mutation assertion is classified `test-quality-validation`; the cache-parent failure is `ci-environment-validation`; and the `structuredClone` plus unsafe-finally findings are `static-validation`. Forcing those into runtime red/green proof would misstate ownership.

The timeout probe runs the known-good handler through a temporary time-compressed copy that changes only its fixed timeout duration from ten minutes to 25 milliseconds and verifies the substitution is unique. This preserves the immutable revision as the code source while making the terminal timeout behavior executable in a focused test. Current-change dogfood remains separate from the historical control pair.

### 5. Compatibility is additive

Version 1 state without concerns remains valid. Concern-bearing initialization without change metadata is rejected only for newly initialized reviews; stored PR #33-era states can still be read and reported. This avoids pretending old evidence was contract-derived while keeping diagnostics usable.

### 6. Execution delivery is bound to the current plan

Requirements-gated lifecycle commands require `plan.requirementsRevision`, execution-state revision, and the supplied ready requirements revision to agree. A re-entry therefore requires a revised plan before claim, resume, worker launch, or completion can proceed. Delivery validation receives the plan and execution state and rejects unknown, non-completed, or missing mandatory packets.

Keeping delivery as a Git/PR-only check was rejected because it allowed an L/enforced plan to publish completion while a required fresh-session packet remained pending. Silently rewriting state was rejected because durable claims, worker identity, and handoffs are the evidence that the packet actually ran.

## Risks / Trade-offs

- **[Markers drift from scenario prose]** → Validate exact heading adjacency and digest cited blocks so edits stale the proof.
- **[Agent writes a weak executable oracle]** → Require known-bad/red and reviewed-head/green discrimination; PR #33 fixture demonstrates branch-sensitive probes.
- **[Historical commits become unavailable]** → Keep the fixture fail-closed with an actionable revision error; do not silently substitute current files.
- **[Manifest ceremony expands low-risk review]** → Activate only for the existing closed concern set and leave `none` unchanged.
- **[Old callers omit execution evidence at delivery]** → Require plan/state inputs for delivery-check and fail with an actionable error; delivery is terminal, so permissive compatibility would preserve the bypass.
- **[Markdown parser accepts ambiguous headings]** → Use strict line-oriented heading and marker rules, rejecting duplicate Requirement/Scenario identities.

## Migration Plan

Introduce parser/normalization helpers and tests first, extend review initialization and proof validation, then add the PR #33 fixture and agent-facing workflow pointers. Existing concern-free review fixtures remain unchanged. Rollback removes the additive manifest fields and CLI flags without data migration; existing version 1 state remains readable.
