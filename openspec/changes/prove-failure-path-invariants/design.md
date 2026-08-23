## Context

The existing two-axis review records axis, base, head, and findings. PR #32 demonstrates that physical context isolation and fixed-base review do not imply methodological independence: Standards, Spec, tests, and persisted handoffs all reused the same success-oriented model.

## Goals / Non-Goals

**Goals:**

- Turn claimed recovery guarantees into a small executable discriminator at the existing review seam.
- Trigger only from observed material change surfaces, preserving the cheap S path.
- Make capability degradation visible and reserve external diversity for missing methodology or execution capability.

**Non-Goals:**

- A third review axis, review-risk score, global checklist, fuzzing framework, or new execution mode.
- Reopening PR #32's implementation fixes or changing routing/isolation semantics.

## Decisions

### Extend review evidence, not review taxonomy

Add an optional `failurePathProof` contract to review state. Applicability is an explicit closed set (`state-machine`, `persistence`, `subprocess`) derived during diff inspection. An applicable review cannot be complete without a proof result.

Alternatives rejected: a third axis duplicates reviewers without changing their method; a prose checklist is non-executable; unconditional extra review taxes ordinary S work.

### Require a discriminating fixture

The proof binds a fixture command and digests of machine-readable results for a known-bad revision and the reviewed head. Required invariants are closed over applicable concerns: recoverable terminal transitions, monotonic persisted retry/completion evidence, single-settlement process failure, and terminal-event precedence. Harness validation checks structure, revision binding, fail/pass discrimination, and invariant coverage; tests own the actual executable behavior.

### Dogfood with PR #32

A repository fixture records `fd4f1cf` as the known-bad head and exercises stranded launching, impossible fallback completion, retry-state loss, subprocess/stream failure, event ordering, and unproven persisted completions. The fixture must go red against that revision and green against current code.

### Degradation and external diversity

Missing fixture execution or missing independent method is a blocking review capability degradation. External diversity is requested only when it can provide that missing method or environment; an external PASS without executable invariant evidence does not close the gate.

## Risks / Trade-offs

- [Self-reported proof metadata could overclaim coverage] → Bind proof results to a repository fixture and validate required invariant identifiers from applicability.
- [Historical revision execution can be slow] → Run only for applicable material review and allow a purpose-built compatibility fixture rather than a full historical checkout.
- [Concern classification can be wrong] → Keep it explicit in review input and test the PR #32 classification as a regression fixture; routing itself remains unchanged.

## Migration Plan

Existing review state remains readable. New proof requirements apply only when a review state explicitly declares applicable failure-path concerns.
