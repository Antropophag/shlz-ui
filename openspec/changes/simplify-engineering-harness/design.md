## Context

See `proposal.md` for motivation and `specs/harness/receipt-workflow/spec.md` for the normative guarantees. At the PR #41 baseline the public CLI exposes more than thirty commands across a 1,066-line dispatcher, roughly 5,800 runtime-module lines, and 6,500 focused harness-test lines, while 438 checked-in active-plan files carry completed history. Multiple mutable state machines duplicate candidate, contract, worker, TDD, review, and delivery identity.

## Goals / Non-Goals

**Goals:**

- Put all evidence behind one deep receipt module and a common immutable identity envelope.
- Keep 10–14 public commands and make the canonical route-to-delivery sequence readable without operational archaeology.
- Reach the requested substantial negative LOC while every guarantee has focused good/bad executable coverage.
- Let inline S/M work bypass orchestration and let optional isolated L/XL work cross one adapter seam.

**Non-Goals:**

- Preserve removed command names, packet/capsule schemas, or historical active-plan readability.
- Build a scheduler, daemon, generalized workflow engine, or telemetry analytics product.
- Change OpenSpec, Git, test-runner, GitHub, deployment, or UI behavior outside the harness.

## Decisions

### One deep receipt module

`core.mjs` becomes the receipt implementation behind a small CLI interface. Every receipt has a stable `version`, `kind`, repository identity, candidate/baseline identity where applicable, contract digest where applicable, outcome, input digests, and a digest over canonical JSON. Stage payloads carry only facts unique to that stage. Validation of a dependent receipt recomputes its digest and checks the shared identities.

This is preferred to one module/state schema per stage because the invariant logic is shared and callers learn one interface. It is preferred to a generic event log because receipts are terminal, immutable facts rather than replayable orchestration.

### Twelve public commands

The target interface is `route`, `requirements`, `baseline`, `contract`, `tdd`, `validate`, `review`, `failure-proof`, `run-isolated`, `conformance`, `delivery`, and `telemetry-summary`. Commands write a receipt only after their checks pass. `requirements` validates readiness rather than mirroring normative content. `validate` both records a fresh result and checks reuse against an identical closure.

Compatibility is deliberately behavioral rather than syntactic. Removed commands are not aliased because aliases would preserve the shallow interface and documentation burden.

### Inline execution has no orchestration model

S/M work uses receipts directly. No plan graph, ready/claim/complete/pause/resume lifecycle, handoff ledger, or checked-in mutable state is required. Human or external orchestration may sequence commands, but the harness only validates immutable inputs and outputs.

This is preferred to making packets optional fields in a shared state machine: an absent graph would still force every caller and delivery check to understand graph semantics.

### Isolation is one adapter seam

`run-isolated(manifest)` is the only subprocess interface. Immediately before launch it resolves explicit source paths, dependency receipts, byte totals, and digests; then the runtime adapter executes once and returns runtime identity, terminal outcome, report digest, observed usage, and the exact manifest digest. Retries reuse the immutable manifest and create a new result receipt; they do not mutate a claim.

The seam remains because inline and isolated execution are two real adapters. No worker fan-out is inferred from size: an operator explicitly chooses isolation and concurrency remains external.

### Contract and TDD are direct receipts

The contract command parses current-change OpenSpec scenarios into stable identities and normalized normative content. The TDD command runs one symmetric oracle against a baseline/known-bad target and candidate, then emits RED/GREEN results in one receipt. This replaces separate design, review, re-entry, red, green, and implementation-authorization states while retaining contract/head/oracle binding and known-bad discrimination.

### Validation closure and review/failure proof remain distinct

Validation receipts hash configured meaning-changing closures and can be reused only at an identical candidate/closure. Review keeps separate Standards and Spec outcomes because they answer different questions. Failure proof remains a separate receipt only when marked material failure invariants exist because ordinary review cannot prove discriminating failure behavior.

### Deletion-first migration

Tests first establish the new receipt interface and map every applicable scenario from prior harness changes. Once the new acceptance cases are red, remove historical operational data and retrospective efficiency machinery, then replace runtime modules and docs. Keep only purpose-built compact fixtures, preferably generated in test setup.

The scenario map is maintained in the focused test suite: every prior harness scenario identity is classified as `preserved`, `revised`, or `retired-with-reason`; the test fails on an unmapped identity. PR-specific retrospective scenarios may be retired when they are not durable product behavior, while their underlying guarantee is mapped to a receipt scenario.

### Artifact retention

Git retains OpenSpec artifacts plus, for a material episode, at most route, requirements, baseline, contract/TDD, validation summary, review/failure-proof summary, conformance, and delivery receipts. Raw command output and runtime streams are local or CI artifacts. Completed `docs/exec-plans/active/` history is removed except synthetic executable fixtures relocated under fixture roots.

## Risks / Trade-offs

- **Risk: a unique guard is hidden in legacy state machinery** → Generate and test the prior-scenario map before deleting its implementation; require known-bad acceptance adapters for TDD and failure paths.
- **Risk: a universal receipt envelope becomes speculative generality** → Keep only identity fields consumed by two or more stages; stage-only data stays in payloads.
- **Risk: removing compatibility blocks an in-flight old episode** → Treat the dedicated branch/PR as the migration boundary and document that old episodes finish on their existing branch; new episodes use receipts.
- **Risk: PR #41 ancestry makes the separate PR large** → Preserve its exact head as the immutable requested baseline and clearly report the simplification delta separately from the merge-base delta.
- **Trade-off: external orchestration is less recoverable than a committed state machine** → Receipts are independently reproducible and retries are additive; scheduling convenience is intentionally outside the normal harness.

## Migration Plan

1. Add receipt acceptance tests, prior-scenario mapping, and known-bad fixtures against the PR #41 baseline.
2. Replace the CLI/runtime behind the new interface and make focused checks green.
3. Delete legacy modules, operational history, raw telemetry, obsolete fixtures, and removed-command documentation.
4. Run focused and repository validation, independent Standards/Spec review, failure proof, conformance, and delivery guards.
5. Push the task branch and open a separate pull request targeting `main`; do not merge it.

Rollback is the task branch's parent commit `0ac8a0f6a4abddecc2758bc0945250fe006b7fd6`; no external state migration is performed.
