# Adaptive execution plans

OpenSpec is the normative contract. Git is implementation state, tests are executable evidence, and this directory stores only operational packet/dependency/handoff state for substantial work.

## Operator flow

1. Record observable sizing signals and semantic work units in `assessment.json`.
2. Run `npm run harness -- plan <assessment> <plan>` and inspect the classification/contributions.
3. In each session run `npm run harness -- ready <plan>` then `context <plan> <packet>`; read only the returned sources needed for the phase.
4. Implement and use `affected` before validation. Record successful expensive checks with `validation-record`; an identical successful rerun requires `--reason`.
5. End a packet with `handoff-write`; the next session uses the repository, packet id, and handoff—not chat history.
6. Record compact observed events with `telemetry-record`, then use `telemetry-summary` for calibration. Never estimate missing runtime tokens.

Plan and handoff fields are validated by the CLI. `preferredExecutionMode` is one of `continue`, `fresh-session`, `isolated-subagent`, or `parallelizable-subagent`; it is routing advice, not an automatic launcher. Parallel packets must have disjoint implementation surfaces.

The context bands in `config.json` are initial hypotheses. Actual token/context data is accepted only with an explicit trustworthy source such as App Server `thread/tokenUsage/updated`; otherwise file reads, repeated reads, command count, and output bytes remain labeled proxies.

## Multi-session capability

Codex App Server supports thread start/resume/fork, compaction, and usage events, while official guidance recommends the Codex SDK for automated jobs. V1 therefore uses a deterministic operator flow and leaves a stable adapter seam at the plan/event interfaces. It does not ship authentication, approvals, model selection, cancellation, or a daemon disguised as orchestration.

Active plans live in `docs/exec-plans/active/<change>/`. Fixtures live in `docs/exec-plans/fixtures/`; telemetry JSONL should be summarized rather than loaded into normal packet context.
