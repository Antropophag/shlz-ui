## Purpose

Defines the independently attributable source, occurrence, and completion evidence required to audit the Messaging, History, and Planner composition family without inferring unsupported product behavior.

## ADDED Requirements

### Requirement: Independent sub-scope dispositions

The Wave 12 audit SHALL preserve separate source, occurrence, evidence, limitation, finding, and disposition records for Messaging, History, and Planner, and SHALL mark the parent family `VERIFIED` only when all three records are explicit and complete.

#### Scenario: One sub-scope lacks a disposition

- **WHEN** any one of Messaging, History, or Planner lacks an explicit source, occurrence, evidence, limitation, finding, or disposition record
- **THEN** the parent family remains incomplete and evidence from either other sub-scope does not satisfy the missing record

#### Scenario: All sub-scopes have bounded dispositions

- **WHEN** each sub-scope has independently complete source, occurrence, evidence, limitation, finding, and disposition records with no blocking finding
- **THEN** the inventory may record the parent family's bounded audit status as `VERIFIED`

### Requirement: Authoritative source attribution

The audit SHALL trace Messaging only to `Messages.svg`, History only to `History of changes.svg`, and Planner only to `Planner.svg`, SHALL classify source claims explicitly, and SHALL leave every authoritative SVG unchanged.

#### Scenario: Source facts are recorded

- **WHEN** the audit records a composition, state, or content claim
- **THEN** it identifies the responsible source and distinguishes directly observed source facts from derived patterns, repository decisions, and assumptions

#### Scenario: Source integrity is checked

- **WHEN** Wave 12 validation runs
- **THEN** it verifies the three authoritative files against their recorded integrity values and fails if any has changed

### Requirement: Repository-wide occurrence classification

The audit SHALL census repository-local implementations, public exports, executable fixtures, live consumers, diagnostics, native or legacy substitutes, and local alternatives independently for Messaging, History, and Planner, and SHALL fail closed on an unclassified matching surface.

#### Scenario: Current absence is observed

- **WHEN** no higher-level implementation or occurrence exists for a sub-scope
- **THEN** its ledger records exact zero counts and concrete not-applicable reasons rather than inheriting evidence from source artwork or nested primitives

#### Scenario: A new matching surface appears

- **WHEN** a repository change introduces a matching Messaging, History, or Planner implementation, export, fixture, consumer, diagnostic, substitute, or alternative not listed by the audit
- **THEN** focused census validation fails until that surface is classified and the affected disposition is reconciled

### Requirement: Unsupported application semantics remain excluded

The audit SHALL NOT infer or add editor commands, message delivery or read state, synchronization, chronology, recurrence, scheduling or timezone rules, employee data behavior, attachment lifecycle, persistence, live-region behavior, or a generic public domain API from static source exports.

#### Scenario: Static artwork depicts an interactive concept

- **WHEN** an authoritative SVG visually depicts editing, messaging, scheduling, employees, or attachments but supplies no executable contract
- **THEN** the audit records the visual fact and the missing runtime semantics without creating a runtime implementation or claiming runtime, accessibility, consumer, or responsive evidence

### Requirement: Nested primitive evidence stays independent

The audit SHALL classify already verified Notification, Snackbar, File Row, Document Row, Avatar, and other nested primitives as dependencies only and SHALL NOT use their status or evidence to certify any Wave 12 sub-scope.

#### Scenario: A verified primitive appears in source or repository evidence

- **WHEN** a Wave 12 composition includes or resembles an independently verified primitive
- **THEN** the audit records the dependency boundary while keeping both completion statuses and evidence ledgers independent
