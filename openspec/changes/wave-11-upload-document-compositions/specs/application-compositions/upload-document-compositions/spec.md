## Purpose

Defines how source-defined Upload / Document compositions are bounded and verified independently from their already audited row primitives, without inventing upload behavior absent from authoritative exports.

## ADDED Requirements

### Requirement: Raw composition exports remain the sole visual authority

The audit SHALL treat `Documents.svg` as the authoritative source for represented Document, Upload-Drag, Description Files, Small document, Attached Document, and Drag and Drop Document composition facts. Attached Document and Drag and Drop Document SHALL be traced to their nested representation inside Upload-Drag. `Detailed appeals.svg` SHALL be recorded as an inspected roadmap reference outside this family. The audit MUST distinguish source facts, derived patterns, repository decisions, assumptions, and unsupported semantics, and MUST NOT modify either raw export.

#### Scenario: Derived evidence conflicts with source

- **WHEN** extracted data, repository implementation, or an earlier audit statement conflicts with the original SVG
- **THEN** `Documents.svg` governs the family boundary and the conflict is resolved or recorded as a finding

#### Scenario: Source integrity is evaluated

- **WHEN** Wave 11 evidence is validated
- **THEN** `Documents.svg` and the inspected `Detailed appeals.svg` reference remain byte-identical to the recorded baseline, every claimed family boundary is traceable to `Documents.svg`, and the unrelated reference remains explicitly excluded

### Requirement: Higher-level compositions remain distinct from row primitives

Wave 11 SHALL classify where verified File Row and Document Row primitives are reused and where the source represents a distinct higher-level Upload / Document composition. Existing Wave 5 evidence MUST remain a regression dependency and MUST NOT certify the higher-level family by proxy.

#### Scenario: Source composition contains a verified row primitive

- **WHEN** an audited higher-level source frame includes structure attributable to File Row or Document Row
- **THEN** the ledger records the primitive dependency separately from the enclosing composition claim

#### Scenario: Only primitive evidence exists

- **WHEN** File Row or Document Row evidence passes but the higher-level family lacks required evidence
- **THEN** Upload / Document compositions remain independently incomplete

### Requirement: Static compositions do not create upload lifecycle contracts

The design system MUST NOT infer file selection, drag/drop events, validation, progress, retry, preview, removal, transport, persistence, or form integration from the static export. It MUST NOT promote unrelated screen-specific `Detailed appeals.svg` layout into this family or a generic public API without a separately complete and approved contract.

#### Scenario: Visual upload affordance has no behavior contract

- **WHEN** a source frame depicts a drop zone, attached document, description, or document action
- **THEN** the audit records only the represented static fact and leaves lifecycle and event semantics unsupported

#### Scenario: No distinct runtime composition exists

- **WHEN** the repository census finds only already classified primitive consumers and no higher-level implementation
- **THEN** the family may receive a bounded source/absence disposition without adding runtime markup, behavior, exports, or browser snapshots

### Requirement: Repository-wide occurrence classification is mutation-sensitive

Wave 11 SHALL census and classify production composition roots, public exports, executable fixtures, live consumers, Data Workspace consumers, inert diagnostics, legacy or native substitutes, and local alternatives for the bounded family. Primitive-only occurrences and unrelated document/upload terminology SHALL be classified separately.

#### Scenario: Current surfaces are classified

- **WHEN** the complete repository census runs
- **THEN** every discovered higher-level composition, primitive-only dependency, and terminology collision is recorded with exact observed counts

#### Scenario: New composition surface appears

- **WHEN** a matching production, consumer, fixture, diagnostic, substitute, local, or public-export surface is added
- **THEN** the census fails until that surface is classified and its evidence applicability is reconsidered

### Requirement: Completion evidence reflects actual applicability

Upload / Document compositions MUST NOT be reported `VERIFIED` until their independent manifest, source-to-primitive ledger, complete occurrence classification, source integrity, applicable structural/runtime/consumer evidence or reasoned absence, inventory reconciliation, Wave 11 report, regression validation, and review pass with no blocking or unexplained finding.

#### Scenario: Composition-family completion is evaluated

- **WHEN** Wave 11 acceptance is evaluated
- **THEN** exact source hashes and facts, observed counts, unsupported semantics, evidence applicability, limitations, CI, review state, and the independent family status are recorded

#### Scenario: Another component supplies evidence

- **WHEN** File Row, Document Row, or another verified primitive appears inside the search space
- **THEN** its evidence is retained only as a classified dependency and does not certify Upload / Document compositions
