## Purpose

Defines how source-only Card compositions are bounded, classified, and verified without inventing runtime or public component semantics absent from the authoritative exports.

## ADDED Requirements

### Requirement: Raw card exports remain the sole visual authority

The audit SHALL treat `Card with button.svg`, `Reports card.svg`, and `Cover.svg` as the authoritative sources for represented card, report-card, and cover geometry, paint, typography, imagery, content, and action affordances. It MUST distinguish source facts, derived patterns, repository decisions, assumptions, and unsupported semantics, and MUST NOT modify the authoritative exports.

#### Scenario: Derived evidence conflicts with source

- **WHEN** an extraction, repository implementation, or prior audit statement conflicts with an original Card composition SVG
- **THEN** the original SVG governs the audit claim and the conflict is resolved or recorded as a finding

#### Scenario: Source integrity is evaluated

- **WHEN** Wave 10 evidence is validated
- **THEN** all three authoritative files remain byte-identical to the recorded baseline and their source-critical represented composition facts are traceable

### Requirement: Static compositions do not create runtime contracts

The design system MUST NOT infer click behavior, navigation, loading, media lifecycle, responsive reflow, application data models, or a generic Card API from the static exports. A runtime implementation SHALL be absent unless a separately complete and approved public contract establishes those semantics.

#### Scenario: Audit completes without implementation

- **WHEN** the repository census confirms that the family remains source-only and no complete runtime contract exists
- **THEN** the family may receive a verified absence disposition without adding production markup, styles, behavior, exports, fixtures, consumers, or browser snapshots

#### Scenario: Unspecified behavior is requested by an export

- **WHEN** a source frame visually contains an image, action affordance, report value, or cover content
- **THEN** the audit records only the represented static fact and does not claim activation, navigation, loading, responsive, media, or data behavior

### Requirement: Repository-wide absence is explicit and mutation-sensitive

Wave 10 SHALL census and classify repository-local production implementations, public exports, executable fixtures, live consumers, Data Workspace consumers, inert diagnostics, legacy or native substitutes, and local alternatives for the bounded Card composition family. Incidental uses of card terminology SHALL be classified as unrelated where their structure and purpose do not implement the source-defined family.

#### Scenario: Current repository has no implementation

- **WHEN** the complete census finds no bounded Card composition implementation or alternative
- **THEN** the manifest and inventory record exact zero occurrence counts and identify any inspected terminology collisions separately

#### Scenario: Card composition surface appears

- **WHEN** a production, consumer, fixture, diagnostic, native, local, or public-export surface matching the bounded family is added
- **THEN** the census fails until that surface is classified and the family contract and applicable evidence are reconsidered

### Requirement: Completion evidence reflects applicability

Card compositions MUST NOT be reported `VERIFIED` until their independent manifest, source ledger, repository-wide absence classification, source-integrity and structural-contract evidence, inventory reconciliation, Wave 10 report, regression validation, and manual source review pass with no blocking or unexplained finding. Runtime-browser, accessibility, focused-visual, consumer-integration, responsive-content-stress, and interaction evidence SHALL be marked `not-applicable` with specific source-only reasons when no executable implementation exists.

#### Scenario: Source-only completion gate

- **WHEN** Wave 10 acceptance is evaluated with an empty executable census
- **THEN** exact source hashes and facts, zero occurrence counts, excluded semantics, reasoned evidence applicability, limitations, CI, review state, and the independent family status are recorded

#### Scenario: Another component supplies evidence

- **WHEN** a verified primitive or an unrelated repository card-like surface appears inside the audit search space
- **THEN** its existing evidence does not certify Card compositions and it is retained only as a classified regression dependency or terminology collision
