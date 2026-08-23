# Adaptive execution plans

OpenSpec is the normative contract. Git is implementation state, tests are executable evidence, and this directory stores only operational plan, packet/dependency, claim, handoff, validation, review, and telemetry state for substantial work.

## Operator flow

1. Record observable sizing signals and semantic work units in `assessment.json`.
2. Run `npm run harness -- plan <assessment> <plan>` and inspect the classification/contributions.
3. Initialize `state.json` once. Use `claim` only for `continue` packets; use `worker-run` for guarded packets so runtime-issued identity, not a session label, binds the claim. Run `context <plan> <packet> --state <state>`; read only the returned sources needed for the phase.
4. Implement and use `affected` before validation. `validation-record` computes the relevant-file fingerprint and appends the result; an identical successful expensive rerun requires `--reason`.
5. End a packet with `complete`; the state retains one structured handoff per packet, so dependency joins receive every direct handoff without chat history.
6. Record compact observed events with `telemetry-record`, then use `telemetry-summary` for calibration. Never estimate missing runtime tokens.

Before implementation, `route-check` validates semantic route evidence and `implementation-preflight --out <execution-baseline>` binds it to requirements intent/change/decision ownership/readiness plus either current-main task-branch state or a verified existing open-PR head. Before completion, `route-conformance --execution <execution-baseline>` binds discovered semantic surface to that episode diff and `delivery-check` queries Git/GitHub to require local HEAD, the task-branch upstream, and the open PR head to be the same commit targeting the default branch. Baseline kind is provenance, not a semantic lane. Route/discovery JSON is operational guard evidence, not normative requirements; OpenSpec remains authoritative.

Plan and handoff fields are validated by the CLI. `preferredExecutionMode` is one of `continue`, `fresh-session`, `isolated-subagent`, or `parallelizable-subagent`. An enforced plan guards the latter three with runtime evidence; parallel packets must also have disjoint implementation surfaces.

```bash
npm run harness -- state-init <plan> <state>
npm run harness -- claim <plan> <state> <packet> --session <id>
npm run harness -- worker-probe
npm run harness -- worker-brief <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --out <brief>
npm run harness -- worker-run <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --session <label> --brief-out <brief>
npm run harness -- worker-retry <state> <packet>
npm run harness -- complete <plan> <state> <handoff-input> --requirements <requirements> --execution <baseline>
npm run harness -- validation-record <ledger> <target> --base <fixed-ref> --outcome pass --packet <id> --session <id>
```

The operator lifecycle is root → worker → handoff → dependent worker → independent review. S defaults to `continue`; coherent M stays inline until a meaningful phase or pressure transition; L/XL plans declare isolated packet graphs. Bounded follow-ups remain separate episodes with a new baseline and sizing assessment.

Telemetry keeps logical labels separate from `codex-exec-jsonl` runtime identities. It summarizes physical boundaries, total tokens and peak active context when runtime-supplied, unique/repeated reads, repeated discovery commands, handoff bytes, and an observational relevance ratio for explicitly classified reads. Missing runtime values remain `unavailable`; caller labels and estimates never become proof.

## Compatibility

Historical plans without `executionIsolation` remain readable and retain advisory behavior. New enforced plans require attested guarded claims; an unavailable adapter stops unless `unavailableFallback: "continue"` was declared in advance, in which case state records the explicit degradation. No migration rewrites historical state.

Active plans live in `docs/exec-plans/active/<change>/`. Fixtures live in `docs/exec-plans/fixtures/`; telemetry JSONL should be summarized rather than loaded into normal packet context.
