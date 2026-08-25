# Adaptive execution plans

OpenSpec is the normative contract. Git is implementation state, tests are executable evidence, and this directory stores only operational plan, packet/dependency, claim, handoff, validation, review, and telemetry state for substantial work.

## Operator flow

1. Record observable sizing signals and semantic work units in `assessment.json`.
2. Run `npm run harness -- plan <assessment> <plan>` and inspect the classification/contributions.
3. Initialize `state.json` once. Use `claim` only for `continue` packets; use `worker-run` for guarded packets so runtime-issued identity, not a session label, binds the claim. Run `context <plan> <packet> --state <state>`; read only the returned sources needed for the phase.
4. Implement and use `affected` before validation. `validation-record` computes the relevant-file fingerprint and appends the result; an identical successful expensive rerun requires `--reason`.
5. End a packet with `complete`; the state retains one structured handoff per packet, so dependency joins receive every direct handoff without chat history.
6. Record ordinary observed events with `telemetry-record`; pass `--telemetry-out <telemetry>` to `worker-run` so that command appends runtime boundaries and usage directly from its adapter result, then use `telemetry-summary` for calibration. Never import runtime proof from a caller-selected state file or estimate missing tokens.

Guarded packets may add an optional positive integer `maxInitialContextBytes`. `worker-run` checks it against the complete resolved initial capsule `readNow` byte total before reservation or adapter launch. An over-budget error lists the measured total, declared maximum, and largest files; it does not trim packet coverage. Correct the reviewed `contextSources` declaration or deliberately revise the packet maximum. Omit the field for legacy/unbudgeted behavior.

Before implementation, `route-check` validates semantic route evidence and `implementation-preflight --out <execution-baseline>` binds it to requirements intent/change/decision ownership/readiness plus either current-main task-branch state or a verified existing open-PR head. Before completion, `route-conformance --execution <execution-baseline>` binds discovered semantic surface to that episode diff and planned `delivery-check --review <current-review-state> --telemetry <runtime-telemetry-jsonl>` reconciles packet state, adapter evidence, and handoffs before requiring current Standards/Spec passes plus applicable failure proof and querying Git/GitHub for matching local, upstream, and open-PR heads targeting the default branch. Baseline kind is provenance, not a semantic lane. Route/discovery JSON is operational guard evidence, not normative requirements; OpenSpec remains authoritative.

Plan and handoff fields are validated by the CLI. `preferredExecutionMode` is one of `continue`, `fresh-session`, `isolated-subagent`, or `parallelizable-subagent`. An enforced plan guards the latter three with runtime evidence; parallel packets must also have disjoint implementation surfaces.

```bash
npm run harness -- state-init <plan> <state>
npm run harness -- claim <plan> <state> <packet> --session <id>
npm run harness -- worker-probe
npm run harness -- worker-brief <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --out <brief>
npm run harness -- worker-run <plan> <state> <packet> --execution <baseline> --requirements <requirements> --claim <id> --session <label> --brief-out <brief> --telemetry-out <telemetry>
npm run harness -- worker-retry <state> <packet>
npm run harness -- complete <plan> <state> <handoff-input> --requirements <requirements> --execution <baseline>
npm run harness -- validation-record <ledger> <target> --base <fixed-ref> --outcome pass --packet <id> --session <id> --raw-log <repository-path>
npm run harness -- context-capsule <plan> <packet> --state <state> --ledger <ledger> --phase <phase> --transition <transition> --session <physical-session-id> [--validation <validation-ledger>] [--review <review-state>] --out <capsule>
npm run harness -- context-ack <capsule> <ledger>
npm run harness -- context-cost-replay <fixture>
```

`context-capsule` applies the packet working set to a session-local content ledger. Read every `readNow` source, resolve `attested` sources only on demand, then run `context-ack`; acknowledgement persists the exact digests and transition for the next phase. A changed source digest returns to `readNow`. The ledger is an operational cache, never authority, and it must not cross a physical worker boundary because a fresh worker has not read the earlier content.

`context-cost-replay` is an additive, offline measurement command. Its independent oracle is a separate checked-in manifest bound to immutable Git blobs and captured evidence; the candidate emits deterministic phase capsules with `readNow` content identities, `attested` unchanged sources, compact obligations/transitions/evidence, and raw-evidence pointers. Its improvement verdict fails closed on nonequivalent sources, obligations, transitions, evidence, unresolved blocking findings, or a missed byte-proxy threshold. Reported bytes cover repository-controlled input only. Runtime token observations take precedence for total input and remain separate; the live implementation worker used 1,169,262 input tokens (1,048,576 cached), so this mechanism does not claim an equivalent reduction in total or active model context.

Version 2 plans may opt into `specDrivenTdd.version: 1` or the reviewed
`specDrivenTdd.version: 2`. Every material
behavioral slice then has either a bounded inapplicability disposition or an
enforced contract with scenario/authority mappings, a deterministic seam and
argv command, disjoint acceptance/fixture/production surfaces, controls,
repeat count, and test-design/implementation packet identities. Version 2 also
requires a distinct guarded test-review packet. Enforced version 2 flow:

```bash
npm run harness -- tdd-design-record <plan> <state> <design-handoff> --execution <baseline>
npm run harness -- tdd-review-record <plan> <state> <review-handoff>
npm run harness -- tdd-red <plan> <state> <slice> --execution <baseline>
npm run harness -- tdd-green <plan> <state> <slice> --execution <baseline>
```

Version 2 design ends at `pending-test-review`; only a complete approval from
the declared, completed, runtime-distinct review worker reaches `test-reviewed`
and unlocks RED. Approval repeats the adapter-bound worker-report digest and
the digest of that worker's durable packet handoff. Review inputs are normalized
before production-surface and implementation-handoff exclusion, including
absolute and referenced handoff paths. A changes-requested verdict preserves
bounded findings, clears completed design/review packet evidence, and returns
the slice to runnable test design. RED-time identity drift performs the same
full invalidation. Implementation readiness and launch require
accepted RED; packet completion requires GREEN. A requirements pause supplies
`--tdd-reentry <file>` and classifies every slice as affected or explicitly
retained; affected version 2 slices reset design, review, and implementation
packets. TDD-bound final review
initialization and records supply `--tdd-plan <plan> --tdd-state <state>` so
both axes, any separate failure-path proof, and delivery agree on the candidate
head and current approval digest. A final Spec finding that exposes a flawed
approval declares `invalidatesTestContract: true`, the affected `sliceId`, and
`reentry: "test-design"`; `review-record` resets that slice's design, review,
and implementation packets in the supplied TDD state. Historical plans without `specDrivenTdd`, and
version 1 TDD plans, preserve their prior behavior.

The operator lifecycle is root reservation → worker subprocess and final report → adapter-bound claim/report digest → root-validated durable handoff → dependent worker → independent review. The worker cannot complete while its launch is only reserved; after subprocess exit the root binds the runtime identity and final agent message, then a matching report digest is required in the compact handoff. S defaults to `continue`; coherent M stays inline until a meaningful phase or pressure transition; L/XL plans declare enforced, fail-closed isolated packet graphs. Bounded follow-ups remain separate episodes with a new baseline and sizing assessment.

Telemetry keeps logical labels separate from `codex-exec-jsonl` runtime identities. It summarizes physical boundaries, raw input/cached-input/uncached-input/output values, packet/phase/session/attempt attribution and fan-out, total tokens and peak active context when runtime-supplied, unique/repeated reads, repeated discovery commands, handoff bytes, and an observational relevance ratio for explicitly classified reads. Missing runtime values remain `unavailable`; caller labels, byte proxies, and aggregate arithmetic never become proof. Run `telemetry-summary <fixture> --evaluation` for a declared multi-change evaluation fixture whose source telemetry and source-envelope observations are checked in.

The checked representative fixture currently replays seven completed changes, 36 physical boundaries, 31 trusted usage events, 40,076,860 total tokens, and 39,860,211 input tokens. Five boundaries lack matching usage and are not estimated. Its broad `tools/tests/**` example resolves 52 files and 353,242 bytes inside a 571,271-byte packet source envelope; that is a source-byte proxy, not a token or relevance claim.

Guarded `worker-run` automatically writes an unacknowledgeable pre-launch phase capsule and fresh ledger beside `--brief-out`, includes the capsule in the launched brief, and binds the ledger to the adapter-issued runtime identity after launch. The claim ID is launch provenance, never a physical-boundary claim. Explicit later-phase capsules may acknowledge content only after reading `readNow`; the ledger records non-rereading through the harness, not avoided runtime retention.

`validation-record` requires `--raw-log <repository-path>` and accepts optional `--obligations <comma-separated-ids>`. It copies the log to `docs/exec-plans/raw-logs/<sha256>.log` and stores a compact result with the canonical repository-relative path, digest, and byte size. Capsule creation verifies that pointer and fails closed on drift. Raw logs remain retained and addressable; only their repeated inline carryover is replaced by compact evidence.

## Compatibility

Historical plans without `executionIsolation` remain readable and retain advisory behavior. New enforced plans require attested guarded claims; an unavailable adapter stops unless `unavailableFallback: "continue"` was declared in advance, in which case state records the explicit degradation. No migration rewrites historical state.

Active plans live in `docs/exec-plans/active/<change>/`. Fixtures live in `docs/exec-plans/fixtures/`; telemetry JSONL should be summarized rather than loaded into normal packet context.

# Contract-derived planning

`harness plan` derives mandatory spec-driven TDD from the requirements-selected
OpenSpec delta contract. Contract authors classify each scenario with one of
`material-behavior`, `material-state`, `source-only`, `absence-only`, or
`documentation-only`; planners map every material identity exactly once to an
enforced slice. Omitting `specDrivenTdd` cannot suppress a material obligation.
Existing plan files remain readable without migration.
