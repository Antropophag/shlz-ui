## Why

Completed guarded-worker changes show real input costs from 654,259 to 16,419,925 tokens per change, with individual workers reaching 11,378,026 input tokens. Broad packet sources such as `tools/tests/**`, repeated worker attempts, and aggregate-only telemetry make it impossible to bound or attribute that cost before launch even though contract and evidence coverage are already explicit.

## What Changes

- Add a deterministic harness-efficiency evaluation over representative completed changes, reporting cost by change, packet, attempt/session, and semantic phase without estimating unavailable runtime values.
- Preserve runtime input, cached input, output, physical-boundary, handoff, read-relevance, and retry/fan-out evidence separately instead of flattening it into one total.
- Add an explicit per-packet initial context-envelope budget for guarded workers and fail closed before launch when the resolved `readNow` source bytes exceed it.
- Require over-budget remediation to narrow declared sources or deliberately revise the packet budget; the harness never silently drops contracts, evidence obligations, findings, or source identities.
- Keep historical plans readable and leave plans without an explicit envelope budget observational rather than inventing a repository-wide threshold.
- Do not change UI packages, validation depth, independent review requirements, OpenSpec requirements, or files under `shlz-design-source/`.

## Capabilities

### New Capabilities

- `harness/context-envelope-efficiency`: Runtime-backed harness cost attribution and explicit fail-closed guarded-worker context envelopes.

### Modified Capabilities

None.

## Impact

The change affects the repository-local harness core/CLI, plan validation, worker telemetry, fixtures/tests, and agent execution documentation. Existing plan files remain compatible; the new launch guard applies only when a packet declares its own byte budget. No external dependency, service, or public design-system API is added.
