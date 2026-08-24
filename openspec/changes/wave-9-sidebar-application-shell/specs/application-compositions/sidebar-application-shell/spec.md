## Purpose

Defines the bounded, application-owned Showcase Sidebar / Application Shell composition and the evidence required to keep its source-derived navigation, header, and responsive states trustworthy without exposing a reusable shell API.

## ADDED Requirements

### Requirement: Source authority and ownership remain explicit

The Showcase shell SHALL use `Sidebar.svg` and `Header.svg` as visual authority, SHALL distinguish observed facts from repository decisions and unknown behavior, and MUST remain application-owned. The design system MUST NOT expose a reusable App Shell or Sidebar API as part of this capability.

#### Scenario: Bounded application composition

- **WHEN** Wave 9 artifacts and exports are inspected
- **THEN** the shell implementation is confined to the Showcase application and no framework-neutral shell package, routing, authorization, or portal navigation contract is introduced

#### Scenario: Source conflict

- **WHEN** derived extraction data or the incumbent Showcase implementation conflicts with either raw SVG
- **THEN** the raw SVG governs the recorded visual contract and the discrepancy is resolved or reported as a finding

### Requirement: Sidebar states are source-traceable and operable

The Showcase sidebar SHALL represent the source-supported opened and closed compositions and active and default menu-item states. Its navigation SHALL retain native landmark/link semantics, visible keyboard focus, a single current destination, and deterministic activation without claiming application routing behavior.

#### Scenario: Opened and closed compositions

- **WHEN** the shell is exercised at the supported desktop and narrow layouts
- **THEN** the opened and closed sidebar presentations preserve their documented geometry, content hierarchy, accessible name, and navigation reachability without obscuring the page content

#### Scenario: Active and default items

- **WHEN** a navigation destination becomes current through the real Showcase interaction
- **THEN** exactly one item exposes the active visual and semantic state while the other items retain the default state

#### Scenario: Keyboard navigation

- **WHEN** a keyboard user moves through and activates sidebar links
- **THEN** focus remains visible, activation updates the destination and current-item state, and no focus trap or inaccessible off-screen navigation is introduced

### Requirement: Header states preserve native input behavior

The application header SHALL cover the source-supported default, hover, typing, and filled states through real browser interaction. Header controls SHALL use native accessible elements and SHALL preserve source-backed paint, typography, geometry, and focus treatment while the material state is active.

#### Scenario: Default and hover

- **WHEN** the header is rendered and its supported interactive control is hovered
- **THEN** the default and hover states match the recorded source contract and the hover state does not become the sole indication of purpose

#### Scenario: Typing and filled

- **WHEN** a user focuses the header input, types a value, and then leaves the control filled
- **THEN** the typing and filled states are produced by the native control, remain accessible by keyboard, and match the recorded source-backed material properties

### Requirement: Responsive behavior is bounded by evidence

The Showcase shell SHALL remain usable at the desktop source composition and at the approved narrow stress viewport. Narrow behavior not established by the source SHALL be recorded as a repository decision and MUST NOT be generalized into a reusable responsive-shell contract.

#### Scenario: Narrow content stress

- **WHEN** the shell is rendered at the recorded narrow viewport with long Cyrillic and Latin navigation/header content and browser text scaling
- **THEN** essential navigation and header controls remain reachable and legible without unintended page-level horizontal overflow or clipped focus indicators

### Requirement: Completion evidence is independent and exhaustive

Wave 9 SHALL inventory every repository-local shell/sidebar/header occurrence and classify executable fixtures, live compositions, inert diagnostics, legacy/native substitutes, and local alternatives. The family MUST NOT be reported `VERIFIED` unless its manifest, source and state ledger, applicable seven-level evidence, real Showcase consumer, responsive/content stress, findings disposition, source integrity, regression checks, and manual state walk all pass independently.

#### Scenario: Unclassified occurrence

- **WHEN** an unclassified shell, sidebar, header, or substitute is added within the census scope
- **THEN** the occurrence guard fails until the occurrence is classified or removed

#### Scenario: Completion gate

- **WHEN** Wave 9 acceptance is evaluated
- **THEN** exact source hashes and occurrence counts, material states, runtime/accessibility/focused-visual/consumer/responsive evidence, snapshot disposition, limitations, CI, and review state are recorded and no blocking or unexplained finding remains
