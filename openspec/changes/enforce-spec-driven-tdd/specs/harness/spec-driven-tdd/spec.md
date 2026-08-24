## Purpose

Defines a trustworthy, requirements-bound red-to-green execution gate that keeps acceptance-test design independent from production implementation.

## ADDED Requirements

### Requirement: Eligibility is explicit and bounded

An OpenSpec execution plan that enables spec-driven TDD MUST declare the observable seam, acceptance command, production implementation surface, acceptance-test surface, fixtures, deterministic controls, and why the baseline can reasonably be expected not to satisfy the changed requirements. The harness SHALL reject overlapping production and acceptance-test surfaces and SHALL leave ordinary TDD available without the enforced gate when eligibility cannot be established. Changes whose acceptance requires uncontrolled external systems, subjective-only judgment, destructive effects, secrets unavailable to the harness, or a baseline already satisfying the requirement MUST be recorded as inapplicable rather than manufacturing RED.

#### Scenario: Eligible behavioral change

- **WHEN** a requirements-ready OpenSpec plan declares disjoint test and implementation surfaces plus a deterministic executable seam
- **THEN** the harness accepts the spec-driven TDD lifecycle declaration

#### Scenario: No honest baseline RED is possible

- **WHEN** the immutable baseline already satisfies the changed requirement or only a nondeterministic or subjective oracle is available
- **THEN** the harness rejects enforced spec-driven TDD for that slice and records the applicability reason without blocking an otherwise valid execution route

### Requirement: Test design precedes and is independent from implementation

For every enforced slice, a physically distinct test-design worker SHALL receive the synthesized current-change requirements, immutable baseline, declared seam, test-only surface, fixtures, and relevant authoritative sources, but MUST NOT receive proposed production implementation or an implementation-worker handoff. The implementation worker MUST NOT be claimable until the test-design handoff and RED proof are accepted. The test-design handoff SHALL identify each covered requirement and scenario, the independent expected result source, the exact command, stable failure signature, fixture controls, and all acceptance files.

#### Scenario: Test designer produces an acceptance contract first

- **WHEN** an enforced slice is ready for test design
- **THEN** the worker brief excludes production implementation proposals and the resulting handoff binds executable tests to current OpenSpec scenario identities before any implementation claim is allowed

#### Scenario: Same worker or leaked implementation context

- **WHEN** test design and implementation use the same runtime identity or the test-design evidence declares production implementation input
- **THEN** the harness rejects implementation authorization

### Requirement: RED uses one symmetric deterministic oracle

The harness SHALL execute the acceptance command against the immutable execution baseline in an isolated Git worktree and SHALL accept RED only when the command fails with the declared stable failure signature for at least one current-change scenario. RED and GREEN MUST execute the same acceptance files, command, fixtures, environment controls, and oracle. A probe MUST control concurrency, clocks, randomness, ports, and timeouts where they affect the result; incidental process timing, retries that erase the initial failure, source-text or symbol presence checks standing in for behavior, and comparison of different artifacts on the two revisions MUST be rejected.

#### Scenario: Meaningful deterministic RED

- **WHEN** the same acceptance command is repeated on the immutable baseline under declared deterministic controls
- **THEN** every run fails with the same normalized expected signature and maps that failure to a current-change scenario

#### Scenario: Weak or asymmetric oracle

- **WHEN** baseline and candidate execute different commands, tests, fixtures, or oracle methods, or the assertion can pass without observing the promised behavior
- **THEN** the harness rejects the RED proof and implementation remains blocked

#### Scenario: Nondeterministic probe

- **WHEN** repeated baseline executions disagree in outcome or normalized failure signature
- **THEN** the harness rejects the RED proof and reports the probe as nondeterministic

### Requirement: GREEN preserves the acceptance contract

After accepted RED, the implementation worker SHALL be constrained to the declared production surface and SHALL receive the immutable acceptance-contract identity without permission to edit it. GREEN SHALL be accepted only when the same acceptance command passes at the candidate head and the acceptance-contract digest, OpenSpec contract digest, requirements revision, baseline, fixture digest, and deterministic-control digest still match the RED evidence. Unit or implementation-supporting tests MAY be added or changed within their separately declared surface but MUST NOT replace acceptance evidence.

#### Scenario: Production implementation reaches GREEN

- **WHEN** production files change, the acceptance contract remains byte-identical, and the bound command passes at the candidate head
- **THEN** the harness records GREEN for the same RED contract and permits the implementation packet to complete

#### Scenario: Acceptance tests are tuned to the implementation

- **WHEN** an acceptance file, expected result, command, fixture, oracle control, or covered scenario changes after RED
- **THEN** the harness invalidates RED and GREEN, blocks completion, and requires test-design re-entry rather than accepting the modified test

### Requirement: Requirements changes trigger test-design re-entry

Any newer requirements revision or changed OpenSpec contract digest SHALL invalidate affected RED/GREEN evidence and pause implementation. Resume SHALL require a fresh physically distinct test-design worker to classify existing tests as retained, revised, added, or removed against the new requirements, establish a new immutable acceptance contract, and prove RED again where the revised behavior is not present on the immutable baseline. Unaffected completed slices MAY remain valid only when their scenario and dependency digests are unchanged and the retained classification is explicit.

#### Scenario: Material requirement changes during implementation

<!-- failure-invariant: affected-slice-requires-fresh-red concern=state-machine -->

- **WHEN** requirements re-entry synthesizes a newer OpenSpec revision affecting an enforced slice
- **THEN** its implementation claim is invalidated and cannot resume until revised independent test design and RED evidence are accepted

#### Scenario: Requirement change does not affect a completed slice

- **WHEN** a newer revision leaves a slice's scenario, dependencies, tests, fixtures, and oracle controls unchanged
- **THEN** the harness may retain that slice's evidence with an explicit unaffected attestation bound to both revisions

### Requirement: Existing execution and review gates compose with TDD evidence

Worker readiness, claims, completion, independent Standards and Spec review, change-specific failure-invariant proof, route conformance, and delivery SHALL all fail closed when required TDD evidence is missing, stale, nondeterministic, or refers to another baseline or candidate head. Spec review SHALL inspect scenario coverage and oracle independence; Standards review SHALL inspect deterministic isolation and harness integrity. Applicable failure-invariant scenarios SHALL continue to require their independent executable proof in addition to acceptance RED/GREEN.

#### Scenario: Implementation packet is claimed before RED

<!-- failure-invariant: implementation-claim-requires-red concern=state-machine -->

- **WHEN** a worker attempts to claim or launch an implementation packet whose enforced slice lacks accepted RED evidence
- **THEN** the harness refuses the transition without mutating the packet to claimed or launching

#### Scenario: Delivery has stale TDD evidence

<!-- failure-invariant: delivery-rejects-stale-green concern=persistence -->

- **WHEN** delivery evidence refers to a different requirements revision, baseline, current head, acceptance digest, or incomplete packet graph
- **THEN** delivery-check rejects the PR as not ready

### Requirement: Representative fixtures discriminate good and bad workflow revisions

The repository SHALL keep executable fixtures that exercise the public harness seam for a successful red-to-green lifecycle and known-bad cases including asymmetric oracle inputs, tautological or source-inspection oracles, nondeterministic timing, post-RED acceptance edits, implementation/test runtime reuse, requirement-revision re-entry, and inapplicable slices. Every historical or synthetic known-bad fixture MUST fail for its intended invariant while the reviewed head passes the same fixture and oracle.

#### Scenario: Fixture suite evaluates workflow sensitivity

- **WHEN** the representative fixture suite runs against the known-bad adapters and reviewed harness
- **THEN** each known-bad adapter fails only its declared invariant and the reviewed harness passes the same symmetric deterministic probe
