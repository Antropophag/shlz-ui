## Context

See `proposal.md` for motivation. Eight completed changes currently provide trusted worker telemetry. Their totals range from 654,259 to 16,419,925 tokens and from one to ten physical boundaries. The stored runtime usage includes `input_tokens`, `cached_input_tokens`, and `output_tokens`, but `workerTelemetryEvents` collapses input and output into one number and `telemetry-summary` exposes no packet/attempt breakdown. Phase capsules do resolve every `readNow` path and byte size before `codex exec`, so the harness already has the exact pre-launch seam needed for an honest repository-controlled envelope.

The strongest causal example is `enforce-contract-derived-tdd-routing`: its implementation packet declares `tools/tests/**`; the generated capsule expands that pattern to the repository test corpus, while the worker reports 1,473,766 input tokens. Five test-design and four test-review retries contribute additional physical fan-out. This does not prove that any named file was semantically useless, but it proves that the initial source envelope was unbounded and that current aggregate telemetry hides where cost accrued.

## Goals / Non-Goals

**Goals:**

- Attribute trusted usage to changes, packets, sessions, phases, and attempts.
- Expose cached versus uncached input and output without relabeling proxies as tokens.
- Reuse the resolved phase capsule as a fail-closed pre-launch envelope check.
- Preserve all declared coverage and make narrowing a reviewed plan decision.

**Non-Goals:**

- Automatically infer semantic relevance, summarize source files, or choose a universal byte/token threshold.
- Reconstruct root-agent context or costs absent from worker telemetry.
- Eliminate independent review, TDD, validation, retries caused by real findings, or fresh-session isolation.

## Decisions

### Declare budgets per packet

Add an optional positive `maxInitialContextBytes` to guarded packets. A repository-wide default would be an invented policy: UI source census, implementation, and independent review have legitimately different envelopes. An explicit packet value makes the trade-off reviewable and preserves compatibility.

### Enforce at the resolved capsule boundary

Compute `readNow` bytes from the already digest-bound phase capsule immediately before launch. This is more accurate than glob heuristics and requires no new scanner or service. The error includes the largest resolved contributors so the plan author can replace broad patterns with exact sources.

### Extend telemetry rather than add a second ledger

Preserve raw usage fields in `usage` events and derive deterministic `byPacket` and `bySession` summaries. Packet attempts are inferred only from runtime-issued boundaries already stored in telemetry. Existing top-level fields remain for compatibility.

### Keep relevance observational

The evaluation reports classified read relevance only when events explicitly classify reads. Capsule inclusion, cache hits, and large token counts are cost signals, not proof of irrelevance. Recommendations therefore target broad declarations and repeated attempts, while contract/evidence quality remains checked by the existing OpenSpec, TDD, validation, and review gates.

## Risks / Trade-offs

- [A byte envelope does not predict model tokens] → Name it initial source bytes and report runtime tokens separately.
- [A budget can encourage unsafe omission] → Fail closed; never trim automatically; retain existing contract and evidence guards.
- [Legacy plans remain unbounded] → Preserve compatibility but label them unbudgeted in evaluation, allowing incremental adoption.
- [Retries may be necessary remediation] → Expose fan-out without automatically preventing retries or judging their usefulness.

## Migration Plan

The schema addition is optional. Add explicit budgets only to newly evaluated packets whose complete source set is measured and whose contract/evidence coverage is proven. Rollback removes those optional fields and the guard; historical plans and telemetry remain valid.
