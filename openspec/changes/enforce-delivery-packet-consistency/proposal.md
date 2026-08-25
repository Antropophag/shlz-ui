## Why

PR #40 contains a real split-brain execution record: `routing-engine` remains pending in canonical packet state while its telemetry and durable handoff describe an executed worker. Repairing that JSON snapshot alone would leave `delivery-check` unable to detect the same failed-persistence incident in future guarded executions.

## What Changes

- Add the observed PR #40 packet-state, runtime-evidence, telemetry, and handoff divergence as a deterministic RED regression fixture at the public delivery seam.
- Make planned delivery reconcile every mandatory packet across canonical state, embedded execution evidence, repository-owned telemetry, and durable handoff before Git/GitHub delivery checks.
- Preserve canonical execution state as lifecycle authority: detached telemetry or handoff evidence cannot manufacture completion.
- Record and close review dispositions without rewriting valid timezone-grounded metadata; leave PR merge user-owned.

## Capabilities

### New Capabilities

- `harness/delivery-packet-consistency`: Fail-closed reconciliation of canonical packet completion, runtime execution evidence, telemetry, and durable handoffs during planned delivery.

### Modified Capabilities

None.

## Impact

The public `harness delivery-check` command, harness state/evidence validation, focused fixtures/tests, and operator documentation are affected. Existing plan readability and non-delivery execution commands remain compatible. No design-system packages, application UI, or `shlz-design-source/` files change. The main compatibility cost is that planned delivery must provide trusted telemetry for guarded packet graphs; an explicit diagnostic replaces silent acceptance of incomplete evidence. PR #40 remains open and unmerged.
