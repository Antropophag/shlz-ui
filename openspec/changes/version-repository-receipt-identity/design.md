## Context

See proposal.md for motivation. `repository()` in `tools/lib/harness/core.mjs` currently returns `{ root, remote, digest }`; `delivery()` compares only the stored digest to a newly computed identity. No living harness specification exists. Issues #71 and #82 explicitly prohibit rewriting historical receipts.

## Goals / Non-Goals

**Goals:** Remove raw coordinates from newly serialized repository payloads while preserving the existing checkout-bound episode semantics.

**Non-Goals:** Cross-clone episode portability, credential sanitization throughout arbitrary command logs, or cryptographic secrecy of guessable paths.

## Decisions

Keep identity generation and version-aware verification behind the harness repository seam. Version 2 contains exactly `version`, `checkoutDigest`, `originDigest`, and `digest`. Domain-separated SHA-256 inputs bind the existing resolved root, exact configured origin string, and resolved origin URL; the aggregate hashes the other three fields using the existing stable serializer. Do not publish the raw root or origin. Receipt envelopes stay version 1 because this versions a nested contract.

Read the configured spelling with NUL-terminated `git config --get remote.origin.url` and preserve its whitespace. Bind both that value and `git remote get-url origin` in the origin digest: changing an alias or changing its rewrite destination must invalidate version 2. Legacy identities retain only the original resolved-URL comparison. URL canonicalization would broaden equivalence and change isolation behavior. Keep root sensitivity: replacing the root with `.` or using origin alone merges distinct worktree identities. Reject relocation with an actionable fresh-baseline error. Random local identifiers were considered but add persistent local state and copy/recovery semantics unnecessary for the requested minimization.

Recognize only the exact legacy shape or exact version 2 shape. Validate embedded digests and field types before comparing live identity. Legacy comparison uses the original serializer and coordinate calculation. Delivery always emits a fresh version 2 identity, even after validating a legacy baseline, and references the unchanged legacy receipt digest.

## Risks / Trade-offs

- Digests of predictable paths can be guessed → describe this as disclosure minimization, not anonymization or encryption.
- Relocation still invalidates an episode → preserve isolation and document that a fresh baseline is required.
- Nested schema consumers may assume raw fields → document version dispatch and reject unknown schemas explicitly.
- Legacy compatibility could accidentally bypass checks → exercise tampering with recomputed outer receipt digests and unchanged inner digests.

## Migration Plan

Introduce version-aware reading and version 2 generation together. Existing chains require no migration and must not be rewritten. Rolling back the generator is safe for historical legacy data but old code cannot consume version 2 baselines; finish those episodes with version-aware code or begin a new baseline.

## Validation

Use temporary Git repositories and worktrees to test stable identities, distinct clones/worktrees, moved roots, changed origins (including local paths and credentials), legacy acceptance, malformed schemas, and tampering. Add delivery-level tests proving legacy baseline references survive and new payloads omit raw coordinates. Run focused harness tests, lint/format checks, strict OpenSpec validation, and the repository receipt chain with independent Standards/Spec review before delivery. Execution size is M, one shared seam, with no packet graph needed.
