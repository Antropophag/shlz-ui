## Purpose

Defines how the repository harness derives mandatory test-first execution from current OpenSpec scenario contracts instead of planner discretion.

## ADDED Requirements

### Requirement: Current-change scenarios declare implementation semantics

Every scenario in a newly planned OpenSpec delta SHALL declare exactly one supported implementation-semantics category. The closed categories MUST distinguish material observable behavior, material state transitions, source-only evidence, absence-only evidence, and documentation-only evidence; missing, duplicate, or unknown declarations MUST fail planning.

#### Scenario: Complete semantic declaration

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** a requirements-gated plan reads the selected change's delta specs
- **THEN** every scenario has one stable identity and one closed implementation-semantics category bound to the contract digest

#### Scenario: Invalid semantic declaration

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** a current-change scenario omits its category, declares more than one category, or uses an unknown category
- **THEN** plan creation fails before execution state or implementation authorization can be produced

### Requirement: Material behavior and state require enforced TDD coverage

The harness SHALL derive a TDD obligation whenever a current-change scenario is classified as material observable behavior or a material state transition. Every obligated scenario MUST be covered exactly once by an enforced spec-driven TDD slice, and a planner MUST NOT suppress the obligation by omitting `specDrivenTdd`, declaring the scenario inapplicable, or supplying an unrelated scenario identity.

#### Scenario: Wave 9 behavior and state bypass is rejected

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** the original Wave 9 execution plan and its behavior/state change contract are planned without an enforced TDD lifecycle
- **THEN** the harness rejects the plan and reports the uncovered material scenario identities

#### Scenario: Material scenarios have enforced coverage

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** every derived material scenario identity is mapped exactly once to an enforced TDD slice and all existing TDD contract checks pass
- **THEN** the harness emits a plan whose TDD obligation is bound to the selected OpenSpec change and contract digest

### Requirement: Evidence-only scenarios do not create false TDD obligations

The harness MUST NOT require the spec-driven TDD lifecycle solely because a current-change scenario is classified as source-only evidence, absence-only evidence, or documentation-only evidence. These exclusions SHALL affect only mandatory lifecycle routing and MUST NOT prohibit voluntary ordinary tests or an independently justified enforced slice.

#### Scenario: Source-only contract

<!-- implementation-semantics: source-only -->
<!-- validation-impact: harness -->

- **WHEN** a change contains only source-authority inspection or immutable-source evidence scenarios
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

#### Scenario: Absence-only contract

<!-- implementation-semantics: absence-only -->
<!-- validation-impact: harness -->

- **WHEN** a change verifies only the absence of an implementation, export, occurrence, or generated artifact
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

#### Scenario: Documentation-only contract

<!-- implementation-semantics: documentation-only -->
<!-- validation-impact: harness -->

- **WHEN** a change contains only documentation or report-output scenarios and no material behavior/state scenario
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

### Requirement: Contract-derived routing composes with compatibility and delivery

New plan creation SHALL bind the derived obligation to the OpenSpec change and contract content. Historical persisted plans without a contract-derived obligation MUST remain readable, while a newly created requirements-gated plan MUST fail closed when its selected change is missing, unreadable, semantically incomplete, or inconsistent with its TDD coverage.

#### Scenario: Historical plan remains readable

<!-- implementation-semantics: documentation-only -->
<!-- validation-impact: harness -->

- **WHEN** `plan-check` or execution-state compatibility reads a persisted plan created before contract-derived routing
- **THEN** the plan retains its existing compatibility behavior and is not retroactively assigned a new obligation

#### Scenario: Newly planned contract is unavailable

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** a new requirements-gated plan cannot resolve and classify the selected OpenSpec change's delta specs
- **THEN** plan creation fails closed before writing the plan output

### Requirement: Validation routing is derived from semantic impact

The harness SHALL select validation targets from closed semantic impact classification and configured executable surfaces. Every current delta scenario used for affected routing MUST contain exactly one supported `validation-impact` declaration; a missing, duplicate, or unknown declaration MUST fail closed. A pathname, extension, or directory name MUST NOT by itself suppress or require Playwright. Work classified as harness/spec/docs-only MUST exclude Playwright only when it does not affect any browser or product executable surface.

#### Scenario: Harness-only impact excludes Playwright

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness,spec,docs -->

- **WHEN** a change is classified as harness/spec/docs-only and has no browser-contract, product executable, showcase fixture, or browser-oracle impact
- **THEN** affected validation selects focused harness/spec/docs targets and does not select a Playwright target

#### Scenario: Contract text carries browser impact

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** an OpenSpec or documentation change modifies a browser contract, showcase fixture contract, or other browser-executable obligation
- **THEN** affected validation selects the corresponding Playwright target regardless of the changed file's pathname

#### Scenario: Unknown impact fails closed

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** impact evidence is missing, unknown, or contradicts the configured executable surfaces
- **THEN** routing requires explicit conservative escalation and does not silently classify the change as browser-free

### Requirement: Validation reuse binds every meaning-changing input

An expensive validation result SHALL be reusable only when its target-specific validation-input closure is digest-identical. The closure MUST include relevant source/executable surface, the selected test suite and oracle inputs, browser/test-runner configuration, validation policy, and dependency or lock inputs whenever they can change the result's meaning.

#### Scenario: Unchanged closure reuses a successful result

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** an expensive target already passed and every input in its configured validation-input closure is unchanged
- **THEN** the harness reports the existing result as reusable without executing the target again

#### Scenario: Meaning-changing input invalidates reuse

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** relevant source, a test or oracle, runner/browser configuration, validation policy, or an applicable dependency input changes after a pass
- **THEN** the closure fingerprint changes and the prior result cannot satisfy the current validation obligation
