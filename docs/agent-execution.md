# Adaptive agent execution

Use this workflow after initial discovery and OpenSpec impact routing:

`request → discovery → impact routing → execution planning → orchestration → implementation → integration → evaluation → final validation`

## Size before implementation

Record observable signals in an assessment; do not predict an exact token bill. `npm run harness -- plan <assessment.json> <plan.json>` reports the contribution of independent work units, shared seams, contracts, consumers, evidence, ambiguity, scope, review risk, and context-growth risk.

- S: one narrow packet and direct continuation are normally sufficient.
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

Read the returned contracts, implementation paths, tests, evidence, and current findings as needed. Do not reload all OpenSpec artifacts, audit history, or other packets after each task.

The starting context hypotheses are 40–70k normal, 60–80k pressure, 80–100k red zone, and above 100k a strong decomposition/fresh-context signal. Runtime tokens take precedence when a trustworthy source exposes them. Without that source, use labeled proxies: repeated reads, command/output volume, phase changes, and irrelevant-output accumulation. In the red zone add no new scope; finish/handoff, compact only when continuity is valuable, or start fresh.

Fresh context is preferred at implementation → independent review, subsystem changes, major replans, and after noisy tool output. Use isolated subagents for bounded independent analysis/review. Use parallel writing only for declared disjoint surfaces and bounded concurrency.

## Durable handoff

OpenSpec owns requirements, Git owns code state, tests own executable evidence, and the execution state owns atomic claims, dependency progress, and per-packet handoffs. A handoff contains only its completed packet, changed areas, proven checks, settled decisions, unresolved findings/risks, next packet, and invalidated assumptions. Never paste chat transcripts or long spec summaries.

## Multi-session v1

Current official Codex interfaces can start/resume/fork threads and expose usage events; automated jobs are directed toward the Codex SDK. This repository intentionally ships an operator-driven v1 instead of an App Server daemon. Sessions reuse the workspace and exchange structured repository state. Automatic launching remains a future adapter behind the same plan/events interface after telemetry demonstrates the need.

See `docs/validation-workflow.md` for affected checks/reviews and `docs/exec-plans/README.md` for commands and telemetry.
