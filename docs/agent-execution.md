# Adaptive agent execution

Use this workflow after initial discovery, impact routing, requirements readiness, and OpenSpec synthesis/authorization:

`request → discovery → impact routing → requirements readiness → OpenSpec → authorization → execution planning → orchestration → implementation → integration → evaluation → final validation`

For requirements-gated work, `plan` receives the validated state described in `docs/requirements-elicitation.md`. Planning is downstream of the readiness gate; direct S work remains lightweight.

Implementation is also downstream of `implementation-preflight`: work runs on a non-default task branch and records an immutable execution-episode baseline. New work starts at current `origin/main`; a bounded existing-PR follow-up may start at its verified clean, fully pushed open-PR head. Material follow-up planning is synthesized, committed, and pushed before that head is fixed as the implementation baseline. Planning files do not weaken either invariant. Never commit or push implementation directly to `main`.

Keep four decisions orthogonal:

1. semantic impact selects direct or material/unknown;
2. specification need follows that impact: none or requirements/OpenSpec;
3. observable execution signals classify S/M/L/XL;
4. size, context growth, and review risk select inline execution, adaptive packets, and review depth.

There is no remediation or fast lane. The episode delta is simply the unit being routed. A tiny material/security/public-contract delta keeps strict requirements, OpenSpec, and independent review; a local reversible S delta skips those layers while retaining positive route evidence and completion guards.

## Size before implementation

Record observable signals in an assessment; do not predict an exact token bill. `npm run harness -- plan <assessment.json> <plan.json>` reports the contribution of independent work units, shared seams, contracts, consumers, evidence, ambiguity, scope, review risk, and context-growth risk.

- S: inline execution is normally sufficient; OpenSpec S still uses requirements/specification but does not need a packet plan solely for that reason.
- M: record packets; use a fresh session when the semantic phase changes.
- L: decomposition is required; isolate independent modules/review and integrate through dependencies.
- XL: re-check whether the OpenSpec change/PR is still coherent, then use bounded packets and concurrency only for disjoint implementation surfaces.

The weights and bands in `docs/exec-plans/config.json` are calibration inputs. Override an observed misclassification only with a recorded rationale; never treat the size as a model-quality guarantee.

## Packets and bounded context

A packet is one cognitive outcome with a small interface: objective, scope/non-goals, dependencies, contracts, context sources, implementation surface, focused validation, outputs, handoff, and execution mode. It is not a PR, OpenSpec change, agent, commit, or session.

At session start:

```bash
npm run harness -- ready docs/exec-plans/active/<change>/plan.json --state docs/exec-plans/active/<change>/state.json
npm run harness -- claim docs/exec-plans/active/<change>/plan.json docs/exec-plans/active/<change>/state.json <packet-id> --session <session-id>
npm run harness -- context docs/exec-plans/active/<change>/plan.json <packet-id> --state docs/exec-plans/active/<change>/state.json
```

For an eligible plan with `specDrivenTdd.version: 1`, each enforced slice names
its OpenSpec scenarios and authorities, deterministic public seam, one argv
command, controls/repeat count, disjoint acceptance/fixture/production surfaces,
and distinct guarded test-design and implementation packets. Use
`tdd-design-record`, then `tdd-red --execution <baseline>` before launching the
implementation packet, and `tdd-green --execution <baseline>` before completing
it. The harness derives and freezes acceptance, fixture, controls, contract, and
baseline identities; callers cannot provide separate baseline/candidate
commands. The test-design brief must contain only requirements, authorities,
the seam, tests, and fixtures—not a production proposal or implementation
handoff. Direct changes and slices without an honest deterministic RED use
ordinary TDD or an explicit bounded `inapplicable` disposition.

Guarded packets use the runtime adapter rather than a caller-selected label. The root reserves the claim atomically, releases the state lock, launches one bounded worker, then binds its runtime identity before accepting the worker's durable handoff:

```bash
npm run harness -- worker-probe
npm run harness -- worker-run <plan> <state> <packet-id> \
  --execution <execution-baseline> --requirements <requirements-state> \
  --claim <claim-id> --session <logical-label> --brief-out <worker-brief>
npm run harness -- complete <plan> <state> <handoff-input> \
  --requirements <requirements-state> --execution <execution-baseline>
```

The lifecycle is root orchestration → fresh worker → durable handoff → dependent fresh worker → distinct independent review. A failed or unattested launch keeps dependents blocked; use `worker-retry <state> <packet-id>` before generating a new brief. `worker-brief` is available when an operator needs to inspect or transport the immutable brief without launching it.

Selection remains proportional: S continues inline; coherent M continues unless it crosses a semantic or context-pressure boundary; L declares decomposition and isolation; XL re-checks coherence and uses bounded isolated packets. A small follow-up remains a separate execution episode with its own immutable baseline—its size is assessed from that delta, not inherited from the parent PR.

For a requirements-gated plan, pass `--requirements <requirements-state>` to `claim` and `complete`. If apply discovers a material ambiguity, use the deterministic `pause`/`resume` commands in `docs/requirements-elicitation.md`; resuming a guarded packet returns it to pending so a fresh `worker-run` must re-attest the updated revision.

For a spec-driven TDD plan, `pause` also requires `--tdd-reentry <file>`. The
versioned file classifies every enforced slice as `affected` or `retained` and
binds the old/new requirements revisions. Affected slices lose RED/GREEN and
return both test-design and implementation packets to pending. Retention is
accepted only for already-green slices whose complete slice contract digest is
unchanged; the bridge remains in execution state. Resume never authorizes an
affected implementation slice until a fresh independent design and RED pass.

Read the returned contracts, implementation paths, tests, evidence, and current findings as needed. Do not reload all OpenSpec artifacts, audit history, or other packets after each task.

For multiple semantic phases in one physical session, generate `context-capsule <plan> <packet> --state <state> --ledger <ledger> --phase <phase> --transition <transition> --session <physical-session-id> [--validation <validation-ledger>] [--review <review-state>] --out <capsule>`. Supply the current validation/review state in those phases so verdicts, findings, and raw-evidence pointers remain explicit. Read every `readNow` source, resolve `attested` sources only on demand, and persist the attestation with `context-ack <capsule> <ledger>`. Start a new ledger for every fresh worker; a ledger bound to another physical-session ID fails closed. Any source change returns it to `readNow`; an unresolved blocking handoff prevents acknowledgement. This controls repository-owned phase input without treating a digest as proof of comprehension.

Use `context-cost-replay <fixture>` to compare a candidate against a separate pinned oracle. An improvement verdict is valid only when source, obligation, transition, evidence, and blocking-finding equivalence passes and the configured byte-proxy threshold is met. Proxy bytes cover repository-controlled inputs, not total model context. Trustworthy runtime usage takes precedence and retains its provenance; a proxy improvement must report any contrary live runtime observation rather than generalize it.

## Route conformance and delivery

Before completing direct work, inspect the target-relevant episode diff and record a version 1 discovered-surface input with changed files and the same closed material-signal set used by routing. The CLI derives the actual Git diff from the persisted baseline, excludes only operational active-plan state, and rejects an incomplete or stale declared file set. Run:

```bash
npm run harness -- route-conformance <route-assessment> <discovered-surface> \
  --execution docs/exec-plans/active/<work>/execution-baseline.json
```

If deployment/publishing/release automation, permissions, public contracts, destructive effects, or another material/unknown signal appears, completion is blocked and the work returns to requirements/OpenSpec. A workflow pathname is an inspection trigger, not a keyword verdict: affirmatively behavior-preserving workflow text/format maintenance remains direct.

Normal successful implementation then pushes only its current task branch, creates a PR targeting `main`, and validates compact delivery evidence against the actual upstream, repository, and open PR returned by Git and GitHub:

```bash
npm run harness -- delivery-check <delivery-evidence> \
  --plan <current-plan> --state <current-state> --requirements <requirements-state> \
  --review <current-review-state>
```

Initialize a material TDD review with `--tdd-plan <plan> --tdd-state <state>`.
Each `review-record` for that review repeats those options. The harness binds
both review axes to the current GREEN candidate head; failure-invariant proof
remains an additional independent obligation for marked state-machine,
persistence, or subprocess scenarios. `delivery-check` likewise rejects a
missing/stale GREEN, requirements bridge, slice contract, or PR head.

Adaptive-plan delivery requires the current plan and execution state; every declared packet must be completed with a handoff, and requirements-gated plan/state/revisions must agree. Direct work instead passes `--direct <route-assessment>` so the narrow route is positively re-proven. The user owns merge. The local guard does not replace server-side branch protection; report missing administrator enforcement or required reviews as residual risk rather than silently changing repository settings. For material state-machine, persistence, or subprocess changes, executable review derives change-specific failure invariants from marked scenarios in the current OpenSpec delta and proves them alongside the fixed baseline; see `docs/validation-workflow.md`.

The starting context hypotheses are 40–70k normal, 60–80k pressure, 80–100k red zone, and above 100k a strong decomposition/fresh-context signal. Runtime tokens take precedence when a trustworthy source exposes them. Without that source, keep usage and peak active context `unavailable`; use labeled proxies such as repeated/unique reads, repeated discovery commands, command/output volume, phase changes, handoff bytes, and irrelevant-output accumulation. Context relevance is only the observed ratio of explicitly classified reads, never a semantic quality score. In the red zone add no new scope; finish/handoff, compact only when continuity is valuable, or start fresh.

Fresh context is preferred at implementation → independent review, subsystem changes, major replans, and after noisy tool output. Independent two-axis review applies to material work and M/L/XL or explicitly review-risky work. Direct S work uses complete target-diff inspection without creating review state solely for ceremony. Use isolated subagents for bounded independent analysis/review. Use parallel writing only for declared disjoint surfaces and bounded concurrency.

Physical separation proves context independence, not method independence. For material state-machine, persistence, or subprocess/stream changes, the existing independent review also needs the conditional executable failure-path proof in `docs/validation-workflow.md`. Missing proof execution or an independent failure-path method is review capability degradation; external diversity is useful when it supplies that missing capability, not as an unconditional extra vote.

## Durable handoff

OpenSpec owns requirements, Git owns code state, tests own executable evidence, and the execution state owns atomic claims, dependency progress, and per-packet handoffs. A handoff contains only its completed packet, changed areas, proven checks, settled decisions, unresolved findings/risks, next packet, and invalidated assumptions. Never paste chat transcripts or long spec summaries.

## Multi-session v1

This repository ships an operator-driven `codex exec --json` adapter, not an App Server daemon. Runtime-issued thread identity proves a physical boundary; logical session labels remain display metadata. `worker-run --telemetry-out` records identity and usage directly from the just-completed adapter result; arbitrary state files cannot be imported as runtime proof. Legacy plans without `executionIsolation` remain readable and advisory. New L/XL plans enforce isolation and fail closed when runtime attestation is unavailable; smaller explicitly guarded plans may pre-authorize `continue` degradation.

See `docs/validation-workflow.md` for affected checks/reviews and `docs/exec-plans/README.md` for commands and telemetry.
