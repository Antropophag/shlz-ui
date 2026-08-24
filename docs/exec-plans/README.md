# Adaptive execution plans

OpenSpec is the normative contract. Git is implementation state, tests are executable evidence, and this directory stores only operational plan, packet/dependency, claim, handoff, validation, review, and telemetry state for substantial work.

## Operator flow

1. Record observable sizing signals and semantic work units in `assessment.json`.
2. Run `npm run harness -- plan <assessment> <plan>` and inspect the classification/contributions.
3. Initialize `state.json` once. Use `claim` only for `continue` packets; use `worker-run` for guarded packets so runtime-issued identity, not a session label, binds the claim. Run `context <plan> <packet> --state <state>`; read only the returned sources needed for the phase.
4. Implement and use `affected` before validation. `validation-record` computes the relevant-file fingerprint and appends the result; an identical successful expensive rerun requires `--reason`.
5. End a packet with `complete`; the state retains one structured handoff per packet, so dependency joins receive every direct handoff without chat history.
6. Record ordinary observed events with `telemetry-record`; pass `--telemetry-out <telemetry>` to `worker-run` so that command appends runtime boundaries and usage directly from its adapter result, then use `telemetry-summary` for calibration. Never import runtime proof from a caller-selected state file or estimate missing tokens.

Before implementation, `route-check` validates semantic route evidence and `implementation-preflight --out <execution-baseline>` binds it to requirements intent/change/decision ownership/readiness plus either current-main task-branch state or a verified existing open-PR head. Before completion, `route-conformance --execution <execution-baseline>` binds discovered semantic surface to that episode diff and planned `delivery-check --review <current-review-state>` requires current Standards/Spec passes plus applicable failure proof before it queries Git/GitHub for matching local, upstream, and open-PR heads targeting the default branch. Baseline kind is provenance, not a semantic lane. Route/discovery JSON is operational guard evidence, not normative requirements; OpenSpec remains authoritative.

Plan and handoff fields are validated by the CLI. `preferredExecutionMode` is one of `continue`, `fresh-session`, `isolated-subagent`, or `parallelizable-subagent`. An enforced plan guards the latter three with runtime evidence; parallel packets must also have disjoint implementation surfaces.

```bash
npm run harness -- state-init <plan> <state>
npm run harness -- claim <plan> <state> <packet> --session <id>
npm run harness -- worker-probe
npm run harness -- worker-brief <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --out <brief>
npm run harness -- worker-run <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --session <label> --brief-out <brief> --telemetry-out <telemetry>
npm run harness -- worker-retry <state> <packet>
npm run harness -- complete <plan> <state> <handoff-input> --requirements <requirements> --execution <baseline>
npm run harness -- validation-record <ledger> <target> --base <fixed-ref> --outcome pass --packet <id> --session <id>
npm run harness -- context-cost-replay <fixture>
```

`context-cost-replay` is an additive, offline measurement command. It emits a deterministic phase capsule with `readNow` content identities for new or changed sources, `attested` identities for unchanged sources, compact obligations/transitions/evidence, and raw-evidence pointers when the fixture declares them. Its improvement verdict fails closed on nonequivalent sources, obligations, transitions, evidence, unresolved blocking findings, or a missed byte-proxy threshold. Reported bytes are reproducible proxies; runtime token observations are copied only with their fixture provenance and are never inferred.

Version 2 plans may opt into `specDrivenTdd.version: 1`. Every material
behavioral slice then has either a bounded inapplicability disposition or an
enforced contract with scenario/authority mappings, a deterministic seam and
argv command, disjoint acceptance/fixture/production surfaces, controls,
repeat count, and test-design/implementation packet identities. Enforced flow:

```bash
npm run harness -- tdd-design-record <plan> <state> <design-handoff> --execution <baseline>
npm run harness -- tdd-red <plan> <state> <slice> --execution <baseline>
npm run harness -- tdd-green <plan> <state> <slice> --execution <baseline>
```

Implementation readiness and launch require accepted RED; packet completion
requires GREEN. A requirements pause supplies `--tdd-reentry <file>` and
classifies every slice as affected or explicitly retained. TDD-bound review
initialization and records supply `--tdd-plan <plan> --tdd-state <state>` so
both axes, any separate failure-path proof, and delivery agree on the candidate
head. Historical plans without `specDrivenTdd` preserve their prior behavior.

The operator lifecycle is root reservation → worker subprocess and final report → adapter-bound claim/report digest → root-validated durable handoff → dependent worker → independent review. The worker cannot complete while its launch is only reserved; after subprocess exit the root binds the runtime identity and final agent message, then a matching report digest is required in the compact handoff. S defaults to `continue`; coherent M stays inline until a meaningful phase or pressure transition; L/XL plans declare enforced, fail-closed isolated packet graphs. Bounded follow-ups remain separate episodes with a new baseline and sizing assessment.

Telemetry keeps logical labels separate from `codex-exec-jsonl` runtime identities. It summarizes physical boundaries, total tokens and peak active context when runtime-supplied, unique/repeated reads, repeated discovery commands, handoff bytes, and an observational relevance ratio for explicitly classified reads. Missing runtime values remain `unavailable`; caller labels and estimates never become proof.

## Compatibility

Historical plans without `executionIsolation` remain readable and retain advisory behavior. New enforced plans require attested guarded claims; an unavailable adapter stops unless `unavailableFallback: "continue"` was declared in advance, in which case state records the explicit degradation. No migration rewrites historical state.

Active plans live in `docs/exec-plans/active/<change>/`. Fixtures live in `docs/exec-plans/fixtures/`; telemetry JSONL should be summarized rather than loaded into normal packet context.
