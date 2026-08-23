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

For a requirements-gated plan, pass `--requirements <requirements-state>` to `claim` and `complete`. If apply discovers a material ambiguity, use the deterministic `pause`/`resume` commands in `docs/requirements-elicitation.md`.

Read the returned contracts, implementation paths, tests, evidence, and current findings as needed. Do not reload all OpenSpec artifacts, audit history, or other packets after each task.

## Route conformance and delivery

Before completing direct work, inspect the target-relevant episode diff and record a version 1 discovered-surface input with changed files and the same closed material-signal set used by routing. The CLI derives the actual Git diff from the persisted baseline, excludes only operational active-plan state, and rejects an incomplete or stale declared file set. Run:

```bash
npm run harness -- route-conformance <route-assessment> <discovered-surface> \
  --execution docs/exec-plans/active/<work>/execution-baseline.json
```

If deployment/publishing/release automation, permissions, public contracts, destructive effects, or another material/unknown signal appears, completion is blocked and the work returns to requirements/OpenSpec. A workflow pathname is an inspection trigger, not a keyword verdict: affirmatively behavior-preserving workflow text/format maintenance remains direct.

Normal successful implementation then pushes only its current task branch, creates a PR targeting `main`, and validates compact delivery evidence against the actual upstream, repository, and open PR returned by Git and GitHub:

```bash
npm run harness -- delivery-check <delivery-evidence>
```

The user owns merge. The local guard does not replace server-side branch protection; report missing administrator enforcement or required reviews as residual risk rather than silently changing repository settings.

The starting context hypotheses are 40–70k normal, 60–80k pressure, 80–100k red zone, and above 100k a strong decomposition/fresh-context signal. Runtime tokens take precedence when a trustworthy source exposes them. Without that source, use labeled proxies: repeated reads, command/output volume, phase changes, and irrelevant-output accumulation. In the red zone add no new scope; finish/handoff, compact only when continuity is valuable, or start fresh.

Fresh context is preferred at implementation → independent review, subsystem changes, major replans, and after noisy tool output. Independent two-axis review applies to material work and M/L/XL or explicitly review-risky work. Direct S work uses complete target-diff inspection without creating review state solely for ceremony. Use isolated subagents for bounded independent analysis/review. Use parallel writing only for declared disjoint surfaces and bounded concurrency.

## Durable handoff

OpenSpec owns requirements, Git owns code state, tests own executable evidence, and the execution state owns atomic claims, dependency progress, and per-packet handoffs. A handoff contains only its completed packet, changed areas, proven checks, settled decisions, unresolved findings/risks, next packet, and invalidated assumptions. Never paste chat transcripts or long spec summaries.

## Multi-session v1

Current official Codex interfaces can start/resume/fork threads and expose usage events; automated jobs are directed toward the Codex SDK. This repository intentionally ships an operator-driven v1 instead of an App Server daemon. Sessions reuse the workspace and exchange structured repository state. Automatic launching remains a future adapter behind the same plan/events interface after telemetry demonstrates the need.

See `docs/validation-workflow.md` for affected checks/reviews and `docs/exec-plans/README.md` for commands and telemetry.
