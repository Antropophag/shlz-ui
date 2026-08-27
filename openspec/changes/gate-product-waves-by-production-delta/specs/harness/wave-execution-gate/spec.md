## Purpose

Prevents evidence-only work from consuming product-wave execution or roadmap progress while keeping that work cheap, explicit, and verifiable.

## ADDED Requirements

### Requirement: Numbered product waves declare production delta before heavy execution

The harness SHALL require a numbered product wave to carry a non-empty expected production delta in its route assessment before producing a baseline receipt. The delta MUST identify an observable production implementation, behavior, public interface, or real consumer outcome; audit status, source knowledge, documentation, planning, and test-only evidence MUST NOT satisfy this field.

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

The harness SHALL classify source-only, discovery-only, and audit-only numbered work as bounded evidence execution. This classification MUST set product-roadmap eligibility to false and MUST NOT be overridable by calling the work a product wave or by recording a verified audit disposition.

#### Scenario: Source-only audit is submitted as a numbered wave

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec,docs -->
<!-- failure-invariant: evidence-wave-cannot-promote-roadmap concern=state-machine -->

- **WHEN** a numbered wave declares source-only, discovery-only, or audit-only work
- **THEN** its route receipt selects bounded evidence execution and records that product-roadmap advancement is forbidden

### Requirement: PR 43 remains a discriminating regression fixture

The executable harness regression suite SHALL preserve a compact fixture representing PR #43's Wave 10 source-only Card-compositions audit: zero production implementation delta, source and absence evidence, and a verified audit disposition. The fixture SHALL prove that this historical incident takes bounded evidence execution and cannot advance the product roadmap.

#### Scenario: Historical Wave 10 incident is replayed

- **WHEN** the PR #43 regression fixture is evaluated through the wave gate
- **THEN** it is classified as bounded evidence with no product-roadmap eligibility
