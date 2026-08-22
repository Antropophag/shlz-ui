# Requirements readiness

Use this layer after initial repository inspection and impact routing, before OpenSpec synthesis and adaptive execution planning:

`request → inspect → impact route → decision ownership → targeted interview → readiness → OpenSpec → authorization → execution planning`

Direct behavior-preserving work exits after impact routing. A complete contract-affecting request skips questions but still follows OpenSpec. A short or ambiguous substantial intent enters the decision loop below.

## Inspect, then assign ownership

Inspect the affected repository paths, existing specs, architecture, source authority, tooling, and publishing/security constraints before asking anything. Record only material decisions:

- **repo-owned**: facts and constraints reliably established by repository authority. Cite the path or command result and resolve them without asking.
- **agent-owned**: implementation choices that preserve observable behavior and public contracts. Resolve them independently; a user's explicit “decide yourself” transfers that decision here with `user-delegation` provenance.
- **user-owned**: unresolved product, scope, UX, public-contract, security, publishing, destructive, or material trade-off choices that repository authority cannot settle.

Ask only blocking user-owned questions. Group related high-impact questions into a small round. Ask a follow-up only when an answer introduces a new material user-owned decision. The interview is complete at the explicit gate:

`no unresolved blocking user-owned decisions`

## Durable operational state

For requirements-gated work, write `docs/exec-plans/active/<work>/requirements.json` and validate it with:

```bash
npm run harness -- requirements-check docs/exec-plans/active/<work>/requirements.json
```

The version 1 state contains only:

- `intent`, a monotonic operational `revision`, and the selected `direct` or `open-spec` route;
- decisions with `id`, `owner`, `status`, `blocking`, and compact `{ kind, ref }` provenance;
- compact OpenSpec `{ change, status }` linkage;
- execution authorization status and provenance.

Store acceptance criteria and resolved answers in OpenSpec, not this state. Use `unresolved`, `resolved`, or `delegated` decision status; delegated decisions are agent-owned with `user-delegation` provenance.

An assessment that declares `"requirementsGate": "required"` also records `"openSpecChange": "<change>"` and must pass the matching state to planning:

```bash
npm run harness -- plan <assessment> <plan> --requirements <requirements-state>
```

The harness permits planning only after the readiness gate, OpenSpec status is `synthesized`, and authorization is `pre-authorized` or `approved`.

## OpenSpec synthesis and authorization

Synthesize every resolved normative decision into the existing OpenSpec proposal/spec/design/tasks artifacts and set the linkage status to `synthesized` only after OpenSpec validation succeeds.

Substantial/new capability work defaults to `approval-required`: present a compact understanding/spec summary and stop before adaptive planning/apply. Record `approved` after explicit approval. Record `pre-authorized` only when the user's request explicitly authorizes implementation after requirements synthesis; then continue through adaptive planning/apply without a second approval.

## Apply re-entry

When implementation exposes new material user-owned ambiguity or scope expansion:

1. Pause the affected packet and record the new blocking decision as unresolved.
2. Set OpenSpec linkage to `pending`; set authorization to `approval-required` unless the earlier authorization explicitly covers the added scope.
3. Ask only the newly blocked user-owned question. Delegation resolves it as agent-owned.
4. Update the existing OpenSpec artifacts from the answer and validate them.
5. Restore `synthesized`, re-check requirements, and resume the packet only when authorization is ready.

Keep completed handoffs unless the revised OpenSpec invalidates a recorded assumption; record any invalidation explicitly.

For a guarded execution plan, persist the pause and resume through the existing execution state:

```bash
npm run harness -- pause <plan> <state> <packet> --requirements <blocked-requirements-state>
npm run harness -- resume <plan> <state> <packet> --session <session> --requirements <ready-requirements-state>
```

Increment `revision` when apply records a new ambiguity. The pause binds that revision into execution state; guarded `claim`, `resume`, and `complete` commands require a matching ready state at least that new. This prevents another packet or fresh session from bypassing a newly closed gate with a stale snapshot.
