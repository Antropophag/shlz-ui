## Purpose

Defines how repository work selects semantic safeguards, an immutable execution baseline, proportionate orchestration, and discovery-time escalation independently.

## ADDED Requirements

### Requirement: Routing decisions are independent

The harness SHALL represent semantic impact and specification need independently from execution size and orchestration strategy. Diff size MUST NOT lower a material semantic route, and a material parent pull request MUST NOT by itself raise the semantic route or execution size of a bounded follow-up delta.

#### Scenario: Tiny local fix

- **WHEN** a bounded, reversible delta positively preserves behavior, contracts, security, permissions, automation semantics, and external effects
- **THEN** it uses the direct semantic route and may execute inline without OpenSpec or an adaptive packet plan

#### Scenario: Small contract change

- **WHEN** a one-line delta changes a public contract
- **THEN** it uses requirements readiness and OpenSpec even though its execution size is small and its implementation may remain inline

#### Scenario: Large behavior-preserving change

- **WHEN** a mechanical internal change preserves semantic contracts but spans enough independent work or context to require decomposition
- **THEN** it remains direct while adaptive planning and bounded orchestration apply according to execution signals

### Requirement: Execution uses a verified immutable episode baseline

Every implementation episode SHALL start clean on a non-default task branch and bind route conformance, affected validation, and diff review to a persisted immutable baseline. A new task branch baseline MUST be the current `origin/main`; an existing-pull-request baseline MUST be the verified current pushed head of that branch's open pull request targeting the default branch. When an existing-PR material follow-up requires planning artifacts, synthesis SHALL be committed and pushed before implementation preflight so the verified PR head remains clean. Baseline kind SHALL describe provenance only and MUST NOT create a review-tool-specific semantic route.

#### Scenario: New task branch

- **WHEN** implementation starts for a new change
- **THEN** preflight accepts only a clean task branch at current `origin/main` and records that commit as the episode baseline

#### Scenario: Existing pull request follow-up

- **WHEN** implementation starts for a bounded follow-up on an existing open pull request
- **THEN** preflight verifies the current branch, upstream, local head, remote head, open pull-request head, and default target agree and records that head as the episode baseline

#### Scenario: Stale or dirty pull request baseline

- **WHEN** the local branch is dirty, not fully pushed, differs from the open pull-request head, or the pull request does not target the default branch
- **THEN** implementation preflight rejects the episode before implementation mutation

### Requirement: Ceremony follows semantic risk and execution need

Direct small work SHALL require positive route evidence, branch preflight, route conformance, focused affected validation, target-diff inspection, pull-request delivery, and user-owned merge without requiring requirements state, OpenSpec, an adaptive execution plan, packet state, or independent two-axis review. Material work SHALL retain requirements/OpenSpec and independent diff-scoped review. Adaptive planning SHALL be required only for M/L/XL execution or uncertain context growth, regardless of semantic route.

#### Scenario: Two local findings on a material parent pull request

- **WHEN** each finding is verified against current code and the combined follow-up delta is local, reversible, behavior-preserving, and semantically unambiguous
- **THEN** the follow-up may use one direct small execution episode scoped to the pull-request-head baseline and validates only its affected surfaces

#### Scenario: Material small finding

- **WHEN** a review finding exposes a security, permission, external-effect, or public-contract decision
- **THEN** the episode uses requirements/OpenSpec and material review safeguards even if the code diff is one line

### Requirement: Discovery can only raise semantic safeguards

Before completion the harness SHALL compare discovered semantic surfaces with initial route evidence against the immutable episode baseline. Material or unknown impact discovered on a direct route MUST block completion and require requirements/OpenSpec re-entry; prior completed direct evidence MAY be retained only when the new specification does not invalidate it.

#### Scenario: Local fix reveals contract impact

- **WHEN** implementation or target-diff inspection discovers that a direct local fix changes a public contract
- **THEN** route conformance rejects direct completion and reports re-routing to requirements/OpenSpec

#### Scenario: Discovery remains local

- **WHEN** discovered files and semantic evidence remain within the positively established local contract
- **THEN** route conformance permits focused validation and delivery without adding planning ceremony

### Requirement: Representative evaluation remains executable

The repository SHALL keep machine-readable evaluation cases for a tiny local fix, a mechanical internal change, each of the two PR #30 findings, their combined follow-up, and a small contract-affecting change. Each case SHALL state semantic route, specification need, execution size, orchestration expectation, baseline provenance, review expectation, and escalation result; historical context observations MUST be labeled as observations rather than predicted budgets.

#### Scenario: PR #30 regression evaluation

- **WHEN** the evaluation matrix is checked
- **THEN** the archive-path finding and test-local Playwright-state finding classify from their follow-up delta rather than all files in PR #30, while the recorded roughly 255K-token and 45%-context run remains historical baseline evidence
