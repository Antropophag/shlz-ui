## Purpose

Defines the durable mapping from future component-audit wave numbers to inventory-backed scope while preserving the repository's existing execution and completion gates.

## ADDED Requirements

### Requirement: Remaining waves have a closed scope map

The repository SHALL map every component family that is `INVENTORIED` in the roadmap baseline to exactly one numbered wave beginning with Wave 9. Each wave SHALL name its included inventory families, authoritative source files, starting implementation disposition, scope boundary, and excluded neighboring contracts.

#### Scenario: Resolve a known wave

- **WHEN** an agent receives the short intent `Сделай Wave N` for a mapped wave
- **THEN** the agent resolves the task scope from the roadmap without asking the user to repeat component names or pipeline instructions

#### Scenario: Account for the baseline inventory

- **WHEN** the roadmap is compared with its recorded inventory baseline
- **THEN** every non-`VERIFIED` family is assigned once and no `VERIFIED` family is silently re-certified

### Requirement: Short intent selects scope but does not bypass workflow

Resolving a Wave N intent SHALL select the roadmap entry as task scope and SHALL continue through the current repository-owned routing, requirements, OpenSpec, execution, validation, component completion, review, and delivery rules by reference. The intent SHALL NOT by itself authorize source changes, application-derived design authority, unsupported runtime contracts, merging, or a combined completion status across independently auditable families.

#### Scenario: Execute a wave

- **WHEN** a mapped Wave N is requested
- **THEN** the agent treats the request as implementation authorization for that bounded wave while deriving the applicable workflow from the current authoritative repository documents

#### Scenario: Encounter findings or missing implementation

- **WHEN** source inspection or the repository census reveals a finding, source-only family, or material contract ambiguity inside the selected wave
- **THEN** the agent records and routes that state through the current workflow instead of treating the roadmap as advance approval for an invented implementation

### Requirement: Roadmap drift fails closed

The roadmap SHALL identify its inventory provenance and SHALL require reconciliation before implementation when the selected entry no longer matches current inventory status, family membership, authoritative source, or a material implementation surface. A request for an unmapped Wave number SHALL be reported as unplanned rather than extrapolated.

#### Scenario: Inventory changed after roadmap creation

- **WHEN** pre-implementation inspection finds material drift between the selected roadmap entry and current inventory
- **THEN** implementation pauses until the roadmap and affected planning artifacts are updated coherently

#### Scenario: Request an unmapped wave

- **WHEN** an agent receives `Сделай Wave N` and N is outside the roadmap's mapped range
- **THEN** the agent reports that no durable scope exists for that wave and requests a roadmap decision

### Requirement: Pipeline authority remains single-sourced

The roadmap SHALL state wave-specific scope and acceptance boundaries without copying command sequences or redefining the execution harness. It SHALL point to the existing authoritative workflow documents, and those documents SHALL control whenever their mechanics change.

#### Scenario: Workflow mechanics evolve

- **WHEN** a repository workflow command or gate changes while a wave mapping remains valid
- **THEN** future Wave N execution follows the updated authoritative workflow without requiring the roadmap to duplicate that change
