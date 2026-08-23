# Adaptive execution plans

OpenSpec is the normative contract. Git is implementation state, tests are executable evidence, and this directory stores only operational plan, packet/dependency, claim, handoff, validation, review, and telemetry state for substantial work.

## Operator flow

1. Record observable sizing signals and semantic work units in `assessment.json`.
2. Run `npm run harness -- plan <assessment> <plan>` and inspect the classification/contributions.
3. Initialize `state.json` once, then atomically `claim` one ready packet per session. Run `context <plan> <packet> --state <state>`; read only the returned sources needed for the phase.
4. Implement and use `affected` before validation. `validation-record` computes the relevant-file fingerprint and appends the result; an identical successful expensive rerun requires `--reason`.
5. End a packet with `complete`; the state retains one structured handoff per packet, so dependency joins receive every direct handoff without chat history.
6. Record compact observed events with `telemetry-record`, then use `telemetry-summary` for calibration. Never estimate missing runtime tokens.

Before implementation, `route-check` validates semantic route evidence and `implementation-preflight --out <execution-baseline>` binds it to requirements intent/change/decision ownership/readiness plus either current-main task-branch state or a verified existing open-PR head. Before completion, `route-conformance --execution <execution-baseline>` binds discovered semantic surface to that episode diff and `delivery-check` queries Git/GitHub to require local HEAD, the task-branch upstream, and the open PR head to be the same commit targeting the default branch. Baseline kind is provenance, not a semantic lane. Route/discovery JSON is operational guard evidence, not normative requirements; OpenSpec remains authoritative.

Plan and handoff fields are validated by the CLI. `preferredExecutionMode` is one of `continue`, `fresh-session`, `isolated-subagent`, or `parallelizable-subagent`; it is routing advice, not an automatic launcher. Parallel packets must have disjoint implementation surfaces.

```bash
npm run harness -- state-init <plan> <state>
npm run harness -- claim <plan> <state> <packet> --session <id>
npm run harness -- complete <plan> <state> <handoff-input>
npm run harness -- validation-record <ledger> <target> --base <fixed-ref> --outcome pass --packet <id> --session <id>
```

The context bands in `config.json` are initial hypotheses. Actual token/context data is accepted only with an explicit trustworthy source such as App Server `thread/tokenUsage/updated`; otherwise file reads, repeated reads, command count, and output bytes remain labeled proxies.

## Multi-session capability

Codex App Server supports thread start/resume/fork, compaction, and usage events, while official guidance recommends the Codex SDK for automated jobs. V1 therefore uses a deterministic operator flow and leaves a stable adapter seam at the plan/event interfaces. It does not ship authentication, approvals, model selection, cancellation, or a daemon disguised as orchestration.

Active plans live in `docs/exec-plans/active/<change>/`. Fixtures live in `docs/exec-plans/fixtures/`; telemetry JSONL should be summarized rather than loaded into normal packet context.
