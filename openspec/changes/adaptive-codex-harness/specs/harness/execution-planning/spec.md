## Purpose

Defines bounded, durable execution planning for repository work so substantial changes can span focused agent sessions without losing normative or implementation state.

## ADDED Requirements

### Requirement: Observable work classification

Before implementation, the harness SHALL classify work as S, M, L, or XL from recorded observable signals including independent work units, shared seams, affected contracts, consumers, evidence levels, architecture ambiguity, expected scope, review risk, and tool-output/context-growth risk. The classification MUST be an adaptive routing signal rather than a token forecast, and thresholds MUST be configurable.

#### Scenario: Large change is detected before implementation

- **WHEN** an assessment describes multiple independently verifiable components, a shared behavioral seam, consumer integration, broad evidence, and elevated review/context risk
- **THEN** the planner classifies it as L or XL and requires packet decomposition before implementation begins

#### Scenario: Small change remains lightweight

- **WHEN** an assessment describes one local behavior-preserving outcome with narrow validation and low ambiguity
- **THEN** the planner classifies it as S and permits one direct execution packet without ceremony beyond the recorded assessment

### Requirement: Cognitive execution packets

For decomposed work, the planner SHALL produce a dependency graph of cognitively coherent packets. Every packet MUST record its id, objective, scope, explicit non-goals, dependencies, relevant contracts, expected context sources, implementation surface, focused validation, outputs/evidence, handoff requirements, and preferred execution mode. A packet MUST NOT be equated with an OpenSpec change, session, agent, commit, or PR.

#### Scenario: Shared seam precedes consumers

- **WHEN** two independently verifiable families depend on one shared lifecycle seam
- **THEN** the plan represents the seam as a prerequisite packet and the family packets depend on it without merging their completion states

#### Scenario: Packet working set is bounded

- **WHEN** an agent requests context for one packet
- **THEN** the harness returns the packet contract, direct dependencies, current handoff/findings, and resolved relevant file paths without loading unrelated packets or the whole repository knowledge set

### Requirement: Context lifecycle policy

The harness SHALL expose configurable normal, pressure, red-zone, and decomposition context bands. Pressure decisions MUST also consider semantic phase changes, subsystem changes, replanning, and accumulated irrelevant output. Compaction SHALL remain a fallback; a fresh session or isolated review SHALL be preferred when the next phase does not benefit from prior conversational history. If trustworthy runtime token usage is unavailable, the harness MUST label context estimates as proxies and MUST NOT fabricate token counts.

#### Scenario: Semantic phase boundary triggers fresh context

- **WHEN** implementation is focused-validated and the next work is independent review
- **THEN** the plan recommends a fresh session or isolated subagent even if the configured token pressure threshold has not been crossed

#### Scenario: Runtime usage is unavailable

- **WHEN** no Codex usage event or explicit measured token value is supplied
- **THEN** telemetry omits actual token usage, records the configured proxy observations separately, and preserves an adapter point for real counters

### Requirement: Durable continuation

OpenSpec SHALL remain normative, Git SHALL remain implementation state, tests SHALL remain executable evidence, and repo-local execution plans and structured handoffs SHALL carry operational state. A handoff MUST remain compact and contain only the completed packet, changes, proven checks, settled decisions, unresolved findings/risks, next packet, and invalidated assumptions.

#### Scenario: Fresh session continues without chat history

- **WHEN** a new session receives only the repository checkout and the current packet identifier
- **THEN** deterministic context and handoff commands provide enough current state to continue without reading the previous chat or reconstructing completed discovery

### Requirement: Outcome-level task granularity

OpenSpec tasks SHALL describe independently executable outcomes while acceptance detail remains in specs and tests. An execution packet SHOULD contain approximately three to seven implementation outcomes; more than twelve change tasks or multiple independent components/shared seams MUST trigger an explicit regrouping or decomposition check without weakening acceptance requirements.

#### Scenario: Acceptance scenarios do not become microtasks

- **WHEN** one capability has many executable assertions for one implementation outcome
- **THEN** the tasks artifact retains the outcome as one task and the assertions remain in specs/tests rather than becoming one checkbox per assertion
