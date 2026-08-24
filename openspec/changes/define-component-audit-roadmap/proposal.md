## Why

The current inventory records four remaining component families after Waves 1–8, but no durable source maps future wave numbers to those families. A short request such as `Сделай Wave 9` therefore cannot establish task scope without rediscovering and renegotiating the plan.

## What Changes

- Add a durable Wave 9–12 component-audit roadmap derived from the current inventory, prior wave boundaries, and the existing audit workflow.
- Define deterministic short-intent resolution, scope boundaries, prerequisites, and invalidation rules for each remaining wave.
- Add an always-loaded pointer that routes Wave N requests to the roadmap while keeping pipeline mechanics authoritative in their existing documents.
- Leave the execution harness, design source, and component implementations unchanged.
- Non-goal: pre-authorize implementation choices, findings remediation, source changes, or completion claims for any future wave.

## Capabilities

### New Capabilities

- `component-audits/wave-roadmap`: Defines how future component-audit wave numbers resolve to inventory-backed scope and how roadmap drift is handled.

### Modified Capabilities

None.

## Impact

The change affects agent-facing repository instructions, component-audit documentation, and OpenSpec planning artifacts. It adds no runtime dependency, public package API, component behavior, publishing action, or harness command. The main risk is stale scope after inventory changes, addressed by an explicit reconciliation gate rather than silent reinterpretation.
