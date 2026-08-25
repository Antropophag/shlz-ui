## Context

See `proposal.md` for motivation and `specs/harness/delivery-packet-consistency/spec.md` for behavior. The execution state owns atomic packet progress and embeds adapter-attested runtime evidence; telemetry is append-only observational evidence; the durable handoff binds the completed worker report. Current `delivery-check` reads only plan and state, so it cannot reconcile a detached handoff/telemetry record with canonical state.

## Goals / Non-Goals

**Goals:**

- Detect the exact PR #40 split-brain incident through the public delivery command.
- Validate one causal worker attempt across state, execution evidence, telemetry, and handoff.
- Keep canonical state authoritative without discarding telemetry's independent corroborating value.
- Preserve historical plan readability outside the current planned-delivery contract.

**Non-Goals:**

- Repair or regenerate historical physical-session provenance.
- Treat telemetry as an alternate completion state machine.
- Broaden validation to browser/product checks for a harness-only delta.
- Merge PR #40.

## Decisions

### Require repository-owned telemetry at planned delivery

`delivery-check` accepts a telemetry path for planned execution and parses only trusted `execution-boundary` records. For each mandatory guarded packet, the state packet's session/runtime identity must have a matching boundary. Extra execution evidence for a mandatory packet whose canonical state is not completed is rejected as split-brain evidence.

Alternative: inspect only `state.packets[id].execution`. Rejected because the incident is observable precisely because telemetry survived while canonical state did not persist the attempt. Alternative: accept any telemetry record for the packet. Rejected because stale retries would satisfy the gate without matching the canonical attempt.

### Bind canonical handoff to packet state during delivery

The delivery reconciler applies the guarded completion bindings already enforced by `complete`: claim ID, brief digest, and worker-report digest must match between packet state and canonical `state.handoffs[id]`; launch and execution identities must be internally consistent. This validation runs even when all packet statuses say completed.

Alternative: validate only handoff shape. Rejected because a validly shaped handoff from another attempt is the core bypass.

### Preserve incident artifacts and reject the metadata finding

The regression fixture is a minimized copy derived from PR #40 rather than a rewrite of active historical orchestration records. The `2026-08-25` creation date is preserved because the repository timezone is `Europe/Moscow` and the review ran around local midnight; changing it would falsify provenance and cascade unrelated digests.

## Risks / Trade-offs

- **[Old telemetry has multiple attempts per packet]** → Match the canonical session/runtime pair, reject unmatched evidence only when it claims a mandatory packet attempt absent from canonical attempt history/completion state, and cover retry history explicitly.
- **[Telemetry path can point outside the intended episode]** → Confine mutable/evidence paths using the existing harness path policy and validate packet IDs against the current plan.
- **[More delivery inputs]** → Make the missing telemetry diagnostic explicit and document the required planned-delivery invocation.

## Migration Plan

Add the RED fixture and positive control first, then implement reconciliation and update operator guidance. Existing execution commands and persisted plans remain readable; only planned delivery for guarded current plans acquires the telemetry requirement. Rollback removes the new delivery input and reconciler without rewriting historical state.
