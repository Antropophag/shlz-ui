## Context

`preferredExecutionMode` is validated as an enum but remains advice. `claimPacket()` accepts any caller string as `session`, so durable packet state can describe multiple sessions without proving that any new Codex context existed. The installed Codex CLI 0.149.0 exposes `codex exec --json`, fresh non-interactive sessions, resume/fork, non-interactive review, and an experimental App Server. The repo needs a supported executable mechanism, not a UI automation or a new control plane.

## Goals / Non-Goals

**Goals:**

- Put enforcement at the atomic claim seam so a root context cannot bypass it.
- Launch the smallest supported independent worker and bind its runtime identity to repository state.
- Keep the worker brief bounded and reconstructible from authoritative repo state.
- Make stop, retry, stale-state, replan, ambiguity, and review behavior deterministic.
- Measure physical boundaries and context quality without inventing unavailable usage.

**Non-Goals:**

- Build an App Server daemon, general scheduler, distributed queue, or SDK platform.
- Retune sizing bands or review-remediation logic.
- Replace bounded execution episodes, requirements readiness, OpenSpec, validation, Git baselines, or delivery guards.
- Guarantee isolation on Codex versions that cannot expose a supported runtime identity.

## Decisions

### 1. Use `codex exec --json` as the default fresh-worker adapter

The CLI subprocess is installed, non-interactive, UI-independent, creates a new persisted thread by default, and emits machine-readable lifecycle/usage events. The harness will probe capabilities and invoke one bounded packet worker at a time by default. The adapter consumes a generated prompt from repository paths and captures JSONL; it does not parse private rollout files.

Alternatives considered:

- Interactive `codex` threads or `resume`/`fork`: supported for operators, but UI/TUI orchestration is fragile and fork inherits unwanted history.
- Built-in subagents: useful inside a capable parent runtime, but the repo-local CLI cannot require that this facility is exposed to every caller or attest it from a caller string.
- App Server: richer thread lifecycle and usage events, but experimental protocol/client/auth/cancellation lifecycle is disproportionate here.
- Codex SDK: appropriate for larger automation products, but adds a package/runtime integration and more policy surface than a local subprocess needs.
- JSON-only attestation: rejected because it would reproduce the current false-isolation failure.

The adapter seam remains small: capability probe plus launch result. A future App Server or SDK adapter must satisfy the same claim evidence contract.

### 2. Separate logical sessions from runtime execution identity

A guarded claim carries an execution record with adapter kind, runtime-issued thread id, parent/root invocation id when available, launch timestamp, status, and evidence digest. The harness validates that guarded packets have a fresh identity and enforces distinctness where the plan requires it. Human labels remain display metadata only.

`continue` is the explicit compatibility path. L/XL plan validation requires a guard policy that prevents one context from performing the full graph. M only pays the boundary overhead on semantic/context transitions; S defaults to continue.

### 3. Generate an immutable worker brief, not a parent transcript

The root generates a compact brief after atomic claim from:

- packet objective, scope/non-goals, contracts, paths, outputs and focused checks;
- immutable implementation baseline and current claim id;
- OpenSpec change plus exact requirements revision;
- dependency handoff digests and bounded context index;
- completion/pause/failure commands and allowed fallback.

The worker opens authoritative sources from disk as needed. Parent chat, unrelated packet details, telemetry history, and broad OpenSpec/audit dumps never enter the brief. The brief has a digest; completion verifies the claim, baseline, revision, dependencies and digest remain current.

### 4. Make the launcher transactional around existing state

The root invokes one harness command that probes capability, claims the packet, writes the brief, launches Codex, streams/captures events, and records exit status. Only a valid worker-produced handoff can complete the packet. On launch failure the state records the attempt and returns the packet to retryable blocked/pending status according to policy. Dependents remain unavailable.

Material ambiguity uses the existing requirements pause/resume protocol. A changed revision or plan/baseline/dependency digest invalidates the old brief and affected handoff. Partial code stays visible in Git and is described as partial; it is never promoted to completion evidence.

### 5. Independent review uses the same physical-boundary contract

Review is a guarded packet whose immutable inputs are the fixed base/head, authoritative specs, diff and review instructions. Its runtime identity must differ from implementation worker identities. Review findings still flow through the existing review state; delivery remains branch → unmerged PR.

### 6. Telemetry reports relevance as observations and proxies

The launcher maps trustworthy CLI JSONL usage/thread events into typed telemetry. Summary output separates total usage from peak active context and reports session boundaries, unique/repeated reads, handoff bytes, and a context-relevance ratio based on packet-declared sources versus observed reads. Rediscovery remains a labeled proxy (repeated reads and repeated discovery commands), not a fabricated semantic score.

Wave 8 is both a deterministic regression fixture and, if the installed CLI emits a runtime thread id, a live dogfood run using a minimal read-only packet. The acceptance report states exactly which proof was observed.

## Risks / Trade-offs

- **[Nested Codex execution may be disabled or credentials/config may differ]** → Probe before claim, preserve explicit blocked/degraded semantics, and report the runtime limitation.
- **[Subprocess workers share one Git worktree]** → Default to sequential claims; allow parallel execution only for declared disjoint write surfaces and bounded concurrency.
- **[CLI JSON event schema changes]** → Parse only versioned minimal fields, preserve raw evidence digest, and fail closed when identity cannot be established.
- **[Fresh workers repeat necessary repository discovery]** → Bound briefs and measure repeated reads/rediscovery; keep S/coherent M work on `continue`.
- **[A worker exits after partial edits]** → Preserve Git evidence, block dependents, and require explicit retry/replan rather than auto-completion.
- **[Historical plans lack guard policy]** → Treat them as legacy advisory plans; newly generated L/XL plans require enforcement metadata, with a documented migration path rather than silently rewriting historical state.

## Migration Plan

1. Add schema/guard validation and Wave 8 plus S/M/L fixtures with failing tests.
2. Add runtime evidence, worker brief, launcher, failure/recovery, and telemetry behavior behind new harness commands.
3. Update execution documentation and examples while retaining legacy read compatibility.
4. Dogfood a physically fresh read-only worker if capability probing succeeds; otherwise preserve the failed capability evidence.
5. Run route conformance, focused/full validation, independent review, and open an unmerged PR.
