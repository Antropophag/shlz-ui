## Purpose

Ensures substantial or ambiguous repository work has resolved, attributable requirements and authorization before adaptive execution planning begins.

## ADDED Requirements

### Requirement: Discovery precedes requirements questions

The workflow SHALL inspect the request, repository, applicable contracts, architecture, source authority, and tooling before asking requirements questions. It SHALL classify each material decision as repo-owned, agent-owned, or user-owned and SHALL ask only unresolved user-owned questions. Fully determined work and explicit delegation MUST NOT produce ritual questions.

#### Scenario: Repository answers the ambiguity

- **WHEN** a material-looking ambiguity can be resolved reliably from repository authority
- **THEN** the workflow records the repository source and does not ask the user

#### Scenario: Implementation choice is safely delegated

- **WHEN** a choice does not change observable behavior or a public contract
- **THEN** the workflow classifies it as agent-owned and proceeds without asking the user

#### Scenario: User-owned decision remains unresolved

- **WHEN** a product, scope, UX, public-contract, security, publishing, destructive, or material trade-off decision cannot be derived from repository authority
- **THEN** the workflow asks a targeted high-impact question before synthesis or implementation

#### Scenario: Complete prompt needs no interview

- **WHEN** the request already resolves every blocking user-owned decision
- **THEN** the workflow skips interview and proceeds to specification or direct execution as impact routing requires

### Requirement: Interview rounds are material and bounded

The workflow SHALL group related high-impact questions into small rounds and SHALL ask a follow-up only when an answer creates a new material user-owned uncertainty. An explicit user delegation such as “decide yourself” SHALL transfer that decision to the agent and MUST NOT trigger the same question again.

#### Scenario: Delegated answer closes a decision

- **WHEN** the user explicitly delegates an unresolved decision to the agent
- **THEN** the workflow records agent ownership with user-delegation provenance and treats the decision as resolved

#### Scenario: Answer creates no new material ambiguity

- **WHEN** a user answer resolves the current decision without changing material scope or contract
- **THEN** the workflow does not add a follow-up round for implementation details

### Requirement: Requirements readiness gates execution planning

For substantial, ambiguous, or contract-affecting work, the workflow SHALL establish `no unresolved blocking user-owned decisions` before implementation or adaptive execution packet planning. Deterministic harness guards SHALL reject planning when persisted state contains an unresolved blocking user-owned decision. Direct trivial, bug-fix, mechanical, and fully implementation-only routes SHALL remain available without requirements state ceremony.

#### Scenario: User-owned product decision blocks work

- **WHEN** persisted requirements state contains an unresolved blocking user-owned decision
- **THEN** OpenSpec synthesis, execution packet planning, and implementation are blocked until the decision is resolved or explicitly delegated

#### Scenario: Trivial typo stays direct

- **WHEN** inspection classifies a typo or local behavior-preserving fix as direct
- **THEN** the workflow permits direct implementation without interview or a requirements-state artifact

#### Scenario: Fully determined contract change uses OpenSpec directly

- **WHEN** a contract-affecting request is complete and has no unresolved blocking user-owned decision
- **THEN** the workflow creates OpenSpec artifacts without unnecessary questions and only then enters execution planning

### Requirement: OpenSpec remains normative

The workflow SHALL synthesize resolved requirements into OpenSpec artifacts before apply. Persisted interview state MUST contain only the intent, decision identity and status, owner, source/provenance, blocking status, OpenSpec linkage, and execution authorization needed for deterministic guards and fresh-session recovery; it MUST NOT duplicate normative acceptance content.

#### Scenario: Fresh session restores readiness

- **WHEN** a fresh session has the repository checkout but no chat history
- **THEN** it can identify unresolved and resolved decisions, their owners and provenance, OpenSpec linkage, and authorization status from persisted operational state

#### Scenario: Specification supersedes interview prose

- **WHEN** resolved answers have been synthesized into OpenSpec
- **THEN** later planning and apply read normative behavior from OpenSpec while the operational state retains only provenance and gate status

#### Scenario: Generated OpenSpec skills are regenerated

- **WHEN** an OpenSpec update or reinstall refreshes upstream-managed workflow skills
- **THEN** the repo-owned requirements and authorization integration remains authoritative and a deterministic check detects policy copied into or lost from the generated-skill seam

### Requirement: Execution authorization is explicit

Substantial or new capability work SHALL default to a compact specification summary and an approval stop before apply. A request that explicitly pre-authorizes implementation after readiness and specification SHALL permit automatic transition into adaptive planning and apply. Authorization MUST be durable and attributable.

#### Scenario: Default substantial capability stops for approval

- **WHEN** requirements are ready and OpenSpec is complete but no execution pre-authorization exists
- **THEN** the workflow presents a compact summary and waits for explicit approval before adaptive execution planning or apply

#### Scenario: Pre-authorized work continues

- **WHEN** the user explicitly authorized implementation after interview and specification
- **THEN** the workflow records that provenance and automatically enters adaptive execution planning after readiness and OpenSpec validation

### Requirement: Apply can re-enter requirements

If implementation discovers a new material user-owned ambiguity or scope expansion, the workflow SHALL pause the affected execution packet, record the decision as unresolved, return to requirements elicitation and OpenSpec update, and resume only after readiness and authorization gates pass again. The workflow MUST NOT guess or silently narrow the approved contract.

#### Scenario: Material ambiguity appears during apply

- **WHEN** implementation exposes a product or public-contract choice not resolved by the current OpenSpec
- **THEN** the affected packet pauses, OpenSpec is updated from the resolved decision, and execution resumes from durable packet state

### Requirement: Retrospective publishing fixture remains non-executable

The harness evaluation SHALL include “Publish the showcase as GitHub Pages for this project” as a requirements fixture. The evaluation SHALL distinguish repository facts from unresolved user-owned publishing decisions and SHALL show the expected OpenSpec shape without implementing or publishing GitHub Pages.

#### Scenario: GitHub Pages intent is evaluated safely

- **WHEN** the retrospective fixture runs
- **THEN** it reports independently discoverable repository facts, targeted user-owned questions, and synthesized specification expectations without changing publishing configuration or external state
