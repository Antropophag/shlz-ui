## Purpose

Defines enforceable physical context isolation for substantial Codex execution packets while preserving repo-native planning, requirements, validation, review, and delivery authority.

## ADDED Requirements

### Requirement: Guarded execution modes are enforced

The harness SHALL treat `fresh-session`, `isolated-subagent`, and `parallelizable-subagent` as guarded execution modes. A guarded packet MUST be claimed only with runtime-issued evidence for a distinct execution context; an arbitrary caller-provided session label MUST NOT satisfy the guard. `preferredExecutionMode` MUST either be fulfilled or produce an explicit blocked or policy-authorized degraded result.

#### Scenario: Root cannot silently execute Wave 8

- **WHEN** the Wave 8 XL fixture contains four packets with guarded execution recommendations and the root context attempts to claim every packet using `root-wave8`
- **THEN** the harness rejects guarded claims that lack valid distinct runtime evidence

#### Scenario: Small continuation stays lightweight

- **WHEN** an S plan has one `continue` packet
- **THEN** the packet can use the current execution without launching a worker

#### Scenario: Declared degradation

- **WHEN** guarded execution is unavailable and the plan allows a specific fallback
- **THEN** the harness records the unavailable capability and explicit fallback decision before permitting the declared mode

#### Scenario: Undeclared degradation stops

- **WHEN** guarded execution is unavailable and no fallback is authorized
- **THEN** claim remains blocked without simulating isolation in repository state

### Requirement: Workers receive bounded authoritative context

A fresh worker SHALL receive the packet identity, immutable Git baseline, requirements revision and OpenSpec linkage, dependency handoffs, bounded context index, allowed implementation surface, focused validation, completion command, and failure semantics. It MUST NOT receive the parent conversation transcript, unrelated packet context, accumulated tool output, or normative requirements copied into operational state.

#### Scenario: Dependent worker starts from durable state

- **WHEN** a dependent packet launches after its dependencies complete
- **THEN** its brief is derived from the current plan, claim, authoritative repository files, and validated dependency handoffs without parent chat history

#### Scenario: Stale brief is rejected

- **WHEN** the requirements revision, baseline, dependency handoff, or claimed execution differs from the worker brief
- **THEN** completion is rejected and the packet requires refresh or replan

### Requirement: Isolation uses a supported replaceable adapter seam

The repository SHALL expose a small execution adapter seam that can launch and observe a new Codex context through a supported installed runtime interface without depending on the interactive UI. The default implementation MUST bound concurrency, preserve the caller's repository and security configuration, capture the runtime-issued context identity and terminal status, and avoid introducing a persistent orchestration platform.

#### Scenario: CLI worker physically starts a new context

- **WHEN** the installed Codex CLI supports non-interactive execution with machine-readable events
- **THEN** the adapter launches a new worker, records its runtime-issued context identity, and binds that identity to the packet claim

#### Scenario: Runtime capability is absent

- **WHEN** the installed runtime cannot supply a supported independent execution and identity
- **THEN** capability probing reports isolation unavailable and guarded execution follows its stop/degrade policy

### Requirement: Lifecycle and recovery are durable

The guarded lifecycle SHALL be root orchestration, atomic worker claim, bounded brief, implementation and focused validation, validated durable handoff, dependent worker, independent review, integration, route conformance, final validation, and delivery. Worker failure or partial completion MUST leave an explicit recoverable status and MUST NOT fabricate a completed handoff.

#### Scenario: Worker fails before completion

- **WHEN** a worker exits unsuccessfully or times out before writing a valid handoff
- **THEN** the claim records failure evidence, releases or preserves the claim according to an explicit retry policy, and no dependent packet becomes ready

#### Scenario: Material ambiguity pauses execution

- **WHEN** a worker discovers material ambiguity
- **THEN** it pauses the packet through the requirements revision protocol and later workers cannot proceed with stale readiness

#### Scenario: Replan invalidates stale handoff

- **WHEN** a replan changes a packet contract, dependency, baseline, or requirements revision
- **THEN** affected claims and handoffs are marked stale and must be regenerated while unaffected completed handoffs remain durable

#### Scenario: Independent review has a distinct context

- **WHEN** implementation packets are complete and independent review is required
- **THEN** review uses a fresh runtime context distinct from implementation contexts and consumes the fixed review base plus authoritative specs and diff

### Requirement: Isolation is selected only when it earns its overhead

The planner SHALL keep S work in the current context by default, SHALL make M fresh execution conditional on a meaningful semantic phase or context-pressure transition, and SHALL require explicit packet isolation strategy for L/XL plans. The decision MUST remain separate from bounded execution episodes for small follow-ups.

#### Scenario: M without semantic transition continues

- **WHEN** an M plan has one coherent packet and low context pressure
- **THEN** it may continue in the current execution

#### Scenario: M phase transition starts fresh

- **WHEN** an M plan crosses from implementation to independent review or another non-continuity phase
- **THEN** the next guarded packet uses a fresh execution

#### Scenario: L and XL declare isolation

- **WHEN** a plan is classified L or XL
- **THEN** validation rejects a plan whose packet graph permits one execution context to silently perform every semantic packet

### Requirement: Telemetry proves boundaries honestly

Telemetry SHALL distinguish logical packet identifiers from runtime-issued execution identities and SHALL report total tokens when supplied, peak active context, repeated and unique reads, rediscovery proxies, execution boundaries, handoff size, and context relevance. Runtime usage MUST be accepted only from a trustworthy runtime event source; missing observations MUST remain unavailable.

#### Scenario: Wave 8 before and after comparison

- **WHEN** the Wave 8 fixture is evaluated before and after enforcement
- **THEN** the report preserves the observed pre-change values of XL, four packets, all sessions `root-wave8`, approximately 592K usage and 53% remaining context, and shows the post-change physical boundary evidence or an explicit unavailable limitation

#### Scenario: Session labels are not proof

- **WHEN** telemetry contains distinct caller-provided session strings without runtime-issued identities
- **THEN** the summary reports logical sessions but does not claim physical isolation
