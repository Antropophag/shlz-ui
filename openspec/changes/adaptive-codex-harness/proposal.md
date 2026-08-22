## Why

Substantial SHLZ UI changes currently accumulate discovery, implementation, evidence, review, and reporting in one expanding agent context. Wave 7 demonstrated the failure mode: 31 microtasks, repeated broad validation and rediscovery, and mutable SHA/report maintenance contributed to roughly 900k tokens despite a bounded component problem.

## What Changes

- Add an execution-planning layer after impact routing that classifies work as S/M/L/XL from observable complexity and context-growth signals.
- Represent M/L/XL work as dependency-aware, cognitively coherent execution packets with bounded working sets, focused validation, durable handoffs, and explicit execution modes.
- Add deterministic repo-local tooling for plan validation, progressive context disclosure, affected validation selection, repeat-run invalidation policy, evidence capture, and low-overhead telemetry.
- Define semantic session boundaries and configurable context-pressure bands without claiming false token precision when runtime usage is unavailable.
- Keep OpenSpec normative, Git and tests executable, and `docs/exec-plans/` operational; do not mirror acceptance criteria into packet microtasks.
- Replace the aggregate-only validation interface with focused/affected commands while retaining the existing final checks and component completion gate.
- Add Wave 7 as a retrospective fixture proving large-task decomposition and change-aware validation.
- Document a supported operator-driven multi-session v1 and the capability gap for fully automated Codex thread orchestration; do not add a daemon or task tracker.

Non-goals are a generic agent platform, model-quality guarantees tied to one token threshold, automatic GitHub issue tracking, changing generated upstream OpenSpec skills, weakening component evidence, or modifying `shlz-design-source/`.

## Capabilities

### New Capabilities

- `harness/execution-planning`: Work sizing, packet contracts, context lifecycle, durable handoff, orchestration policy, and task-granularity requirements.
- `harness/change-aware-validation`: Affected validation selection, invalidation-controlled expensive reruns, review lifecycle, evidence capture, and execution telemetry.

### Modified Capabilities

None.

## Impact

The change affects `AGENTS.md`, workflow/routing documentation, a new `docs/exec-plans/` operational state area, package scripts, deterministic Node tooling and fixtures/tests, and CI integration for harness contracts. Existing OpenSpec changes/specs remain valid, generated `.agents/skills/openspec-*` files stay untouched, full repository checks remain available, and the component completion gate remains authoritative for UI work. The principal risk is building policy that costs more context than it saves; small interfaces, terse artifacts, deterministic output, and measured telemetry constrain that risk.
