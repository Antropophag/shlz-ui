## Purpose

Defines change-aware validation, review, evidence automation, and honest low-overhead telemetry for adaptive SHLZ UI agent execution.

## ADDED Requirements

### Requirement: Change-aware validation ladder

The harness SHALL map changed scope to the cheapest relevant checks, then focused module/component checks, affected integrations, and aggregate/final checks. It MUST retain all component completion gate evidence levels when applicable. Repeating an expensive suite for the same relevant change fingerprint MUST require a recorded invalidation reason.

#### Scenario: Documentation-only change avoids browser tests

- **WHEN** only report or policy documentation changes and no executable contract, fixture, manifest, or configuration is affected
- **THEN** affected validation selects documentation/format/contract checks and does not select Playwright

#### Scenario: Shared dialog lifecycle affects both consumers

- **WHEN** the shared native-dialog lifecycle implementation changes
- **THEN** affected validation selects focused Modal and Drawer lifecycle/runtime regressions plus relevant shared checks

#### Scenario: Component-local change stays local

- **WHEN** only Modal-local implementation changes and no shared seam is touched
- **THEN** focused validation selects Modal checks without loading or certifying Drawer completion context

#### Scenario: Expensive rerun needs invalidation

- **WHEN** a previously successful full browser suite is requested again with an unchanged relevant fingerprint
- **THEN** the harness rejects or flags the rerun until an invalidation reason is supplied

### Requirement: Bounded review and remediation

A substantial change SHALL receive one diff-scoped Standards review and one diff-scoped Spec review after focused validation. Findings SHALL be consolidated into one remediation batch. Re-review MUST target the remediation diff and known findings instead of repeating repository-wide discovery; real P0/P1 defects MUST NOT be ignored because of a context budget.

#### Scenario: Remediation review reuses findings

- **WHEN** a review batch has recorded actionable findings and remediation changes are made
- **THEN** the next review context contains the current remediation diff and unresolved findings without reloading unrelated discovery or resolved discussion

### Requirement: Machine-collected evidence

The harness SHALL derive stable evidence such as baseline/current Git refs, changed files, validation results, test totals when exposed by commands, and execution state from machine-readable sources. Reports MUST distinguish immutable baseline refs from moving working-tree state and MUST NOT require committing a newly calculated final SHA into the commit it identifies.

#### Scenario: Evidence collection does not create SHA churn

- **WHEN** evidence is collected before and after a documentation edit
- **THEN** the collector reports baseline and current refs at read time without modifying the report merely to embed the current commit SHA

### Requirement: Honest execution telemetry

The harness SHALL record packet/session/agent/phase identifiers, command and tool counts, context file reads and repeats, output volume, focused/full suite runs, review passes, scope additions, invalidation reasons, and remediation loops when observed. Runtime token/context usage SHALL be recorded only when supplied by a trustworthy runtime source. Telemetry storage and summaries MUST be machine-readable and compact.

#### Scenario: Execution profile is measurable

- **WHEN** commands, file reads, validations, reviews, and scope changes are recorded for a packet
- **THEN** a summary reports actual counts and known usage while labeling unavailable metrics as unavailable rather than zero

### Requirement: Supported multi-session operator flow

The v1 harness SHALL support fresh Codex sessions through persisted packet/handoff state and deterministic operator commands. Automated thread orchestration MAY be added only through a supported official Codex interface with bounded concurrency, explicit permissions, durable thread identifiers, and captured usage events; absence of that implementation MUST be documented as a capability gap rather than simulated.

#### Scenario: One change spans sessions

- **WHEN** an OpenSpec change contains multiple dependent execution packets
- **THEN** separate sessions can claim successive ready packets in the same workspace and update durable handoff/telemetry without creating additional OpenSpec changes or PRs
