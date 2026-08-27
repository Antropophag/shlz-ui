# Requirements readiness

Use this protocol after route eligibility and before material implementation:

`request → inspect → decision ownership → targeted interview if blocked → OpenSpec synthesis → authorization → requirements receipt → baseline`

## Decision ownership

- **repo-owned** facts and constraints are resolved from repository authority and cite that source.
- **agent-owned** implementation choices preserve the specified contract; explicit “decide yourself” delegation is recorded here.
- **user-owned** product, scope, public-contract, security, publishing, destructive, or material trade-off choices block until answered.

Ask only unresolved blocking user-owned questions. A complete request skips interview. Readiness means no unresolved blocking user-owned decisions.

## Operational state and receipt

During synthesis, `docs/exec-plans/active/<change>/requirements.json` stores only intent/revision/route, compact decision ownership/status/provenance, OpenSpec linkage status, and authorization. Acceptance content belongs only in OpenSpec.

After strict OpenSpec validation marks linkage `synthesized` and authorization is `approved` or explicitly `pre-authorized`, run:

```bash
npm run harness -- requirements <route-receipt.json> <requirements.json> \
  --out <requirements-receipt.json>
```

The receipt fails on missing/mismatched decisions, pending synthesis, unresolved blocking state, or missing authorization. Pass it to `baseline` before implementation.

Substantial new work defaults to approval-required. Use pre-authorization only when the user's request explicitly authorizes implementation after synthesis.

## Apply re-entry

If implementation discovers new material ambiguity, stop the affected work, increment the requirements revision, record the new blocking decision, set OpenSpec linkage pending, and ask only that question. Update and validate the existing OpenSpec change, restore synthesis/authorization, and emit a new requirements receipt. Every downstream receipt bound to the old contract, revision, or candidate becomes stale and must be recreated. No mutable pause/resume state is required.
