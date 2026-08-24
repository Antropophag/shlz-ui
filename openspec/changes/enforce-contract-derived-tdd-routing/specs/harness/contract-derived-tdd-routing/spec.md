## Purpose

Defines how the repository harness derives mandatory test-first execution from current OpenSpec scenario contracts instead of planner discretion.

## ADDED Requirements

### Requirement: Current-change scenarios declare implementation semantics

Every scenario in a newly planned OpenSpec delta SHALL declare exactly one supported implementation-semantics category. The closed categories MUST distinguish material observable behavior, material state transitions, source-only evidence, absence-only evidence, and documentation-only evidence; missing, duplicate, or unknown declarations MUST fail planning.

#### Scenario: Complete semantic declaration

<!-- implementation-semantics: material-behavior -->

- **WHEN** a requirements-gated plan reads the selected change's delta specs
- **THEN** every scenario has one stable identity and one closed implementation-semantics category bound to the contract digest

#### Scenario: Invalid semantic declaration

<!-- implementation-semantics: material-behavior -->

- **WHEN** a current-change scenario omits its category, declares more than one category, or uses an unknown category
- **THEN** plan creation fails before execution state or implementation authorization can be produced

### Requirement: Material behavior and state require enforced TDD coverage

The harness SHALL derive a TDD obligation whenever a current-change scenario is classified as material observable behavior or a material state transition. Every obligated scenario MUST be covered exactly once by an enforced spec-driven TDD slice, and a planner MUST NOT suppress the obligation by omitting `specDrivenTdd`, declaring the scenario inapplicable, or supplying an unrelated scenario identity.

#### Scenario: Wave 9 behavior and state bypass is rejected

<!-- implementation-semantics: material-state -->

- **WHEN** the original Wave 9 execution plan and its behavior/state change contract are planned without an enforced TDD lifecycle
- **THEN** the harness rejects the plan and reports the uncovered material scenario identities

#### Scenario: Material scenarios have enforced coverage

<!-- implementation-semantics: material-behavior -->

- **WHEN** every derived material scenario identity is mapped exactly once to an enforced TDD slice and all existing TDD contract checks pass
- **THEN** the harness emits a plan whose TDD obligation is bound to the selected OpenSpec change and contract digest

### Requirement: Evidence-only scenarios do not create false TDD obligations

The harness MUST NOT require the spec-driven TDD lifecycle solely because a current-change scenario is classified as source-only evidence, absence-only evidence, or documentation-only evidence. These exclusions SHALL affect only mandatory lifecycle routing and MUST NOT prohibit voluntary ordinary tests or an independently justified enforced slice.

#### Scenario: Source-only contract

<!-- implementation-semantics: source-only -->

- **WHEN** a change contains only source-authority inspection or immutable-source evidence scenarios
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

#### Scenario: Absence-only contract

<!-- implementation-semantics: absence-only -->

- **WHEN** a change verifies only the absence of an implementation, export, occurrence, or generated artifact
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

#### Scenario: Documentation-only contract

<!-- implementation-semantics: documentation-only -->

- **WHEN** a change contains only documentation or report-output scenarios and no material behavior/state scenario
- **THEN** planning succeeds without a mandatory spec-driven TDD slice

### Requirement: Contract-derived routing composes with compatibility and delivery

New plan creation SHALL bind the derived obligation to the OpenSpec change and contract content. Historical persisted plans without a contract-derived obligation MUST remain readable, while a newly created requirements-gated plan MUST fail closed when its selected change is missing, unreadable, semantically incomplete, or inconsistent with its TDD coverage.

#### Scenario: Historical plan remains readable

<!-- implementation-semantics: documentation-only -->

- **WHEN** `plan-check` or execution-state compatibility reads a persisted plan created before contract-derived routing
- **THEN** the plan retains its existing compatibility behavior and is not retroactively assigned a new obligation

#### Scenario: Newly planned contract is unavailable

<!-- implementation-semantics: material-behavior -->

- **WHEN** a new requirements-gated plan cannot resolve and classify the selected OpenSpec change's delta specs
- **THEN** plan creation fails closed before writing the plan output
