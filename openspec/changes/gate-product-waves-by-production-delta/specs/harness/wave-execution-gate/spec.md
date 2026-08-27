## Purpose

Prevents evidence-only work from consuming product-wave execution or roadmap progress while keeping that work cheap, explicit, and verifiable.

## ADDED Requirements

### Requirement: Numbered product waves declare production delta before heavy execution

The harness SHALL require a numbered product wave to carry a structured, non-empty expected production delta in its route assessment before producing a baseline receipt. The delta MUST select a closed production kind of implementation, behavior, public interface, or real consumer and describe that observable outcome; audit status, source knowledge, documentation, planning, and test-only evidence MUST NOT satisfy this field.

#### Scenario: Product wave has no production outcome

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec,docs -->
<!-- failure-invariant: product-wave-without-delta-cannot-start concern=state-machine -->

- **WHEN** a numbered wave requests the product execution path without a non-empty expected production delta
- **THEN** the harness refuses heavy execution before producing a baseline receipt

#### Scenario: Product wave declares a production outcome

- **WHEN** a numbered wave declares a non-empty expected production delta and selects production work
- **THEN** the route receipt classifies it as product execution and records that it may advance only the matching roadmap entry after delivery

### Requirement: Evidence-only waves automatically use bounded execution

The harness SHALL classify an `evidenceKind` of `source-only`, `discovery`, or `audit` as bounded evidence execution. Evidence kind and expected production delta MUST be mutually exclusive. This classification MUST set product-roadmap eligibility to false and MUST NOT be overridable by calling the work a product wave or by recording a verified audit disposition. Bounded execution MUST retain TDD or independent review when separately declared applicable and MUST retain proof for marked failure invariants.

#### Scenario: Source-only audit is submitted as a numbered wave

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec,docs -->
<!-- failure-invariant: evidence-wave-cannot-promote-roadmap concern=state-machine -->

- **WHEN** a numbered wave declares `source-only`, `discovery`, or `audit` work
- **THEN** its route receipt selects OpenSpec-backed bounded evidence execution, records that product-roadmap advancement is forbidden, and prevents isolated worker execution

#### Scenario: Historical evidence work attempts isolated execution

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec -->
<!-- failure-invariant: bounded-evidence-cannot-launch-isolated concern=subprocess -->

- **WHEN** the PR #43 bounded-evidence route is supplied to the isolated execution seam
- **THEN** the harness refuses the launch before starting a worker runtime

### Requirement: Roadmap proof is derived from candidate runtime evidence

For a roadmap-eligible product wave, validation SHALL derive production-outcome proof only after its route receipt confirms roadmap eligibility and the current candidate passes the requested runtime command over a hashed closure containing explicit outcome-evidence paths. The proof SHALL bind the route digest, expected production delta, candidate head, command target and arguments, closure digest, evidence paths, and command result. A caller-supplied copy of the expected production delta MUST NOT satisfy delivery by itself, and a bounded-evidence route MUST NOT produce this proof.

#### Scenario: Validation repeats the expected delta without outcome evidence

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec -->
<!-- failure-invariant: repeated-production-delta-is-not-proof concern=state-machine -->

- **WHEN** validation repeats a product wave's expected production delta without candidate/runtime-bound outcome evidence
- **THEN** delivery refuses roadmap advancement

### Requirement: PR 43 remains a discriminating regression fixture

The executable harness regression suite SHALL preserve a compact fixture representing PR #43's Wave 10 source-only Card-compositions audit: zero production implementation delta, zero runtime consumers, source and absence evidence, a verified audit disposition, and its historical multi-session/packet execution shape. The fixture SHALL prove that this historical incident takes bounded inline evidence execution, cannot produce production-outcome proof, cannot launch isolated execution, and cannot advance the product roadmap.

#### Scenario: Historical Wave 10 incident is replayed

- **WHEN** the PR #43 regression fixture is evaluated through the wave gate
- **THEN** it is classified as bounded evidence with no product-roadmap eligibility
