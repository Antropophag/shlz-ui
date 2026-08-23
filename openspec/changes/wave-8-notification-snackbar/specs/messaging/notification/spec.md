## Purpose

Defines the source-backed, framework-neutral Notification presentation, semantic ownership, application lifecycle boundary, and independent audit acceptance contract.

## ADDED Requirements

### Requirement: Notification source census and visual contract

The system SHALL treat raw `Notification.svg` and the matching `components/Notification` extraction in raw `UI Kit – Basic elements.zip` as the visual authority for Notification. It SHALL preserve exactly three 384×58 Type variants named Default, Error, and With button, with the source-backed pill geometry, dark and danger surfaces, icon/close and action compositions, and source effects. It MUST NOT infer additional sizes, statuses, behavior, or semantics from sheet layout, labels, or derived files.

#### Scenario: Source census is executable

- **WHEN** source-integrity checks inspect Notification authority
- **THEN** they assert the three exact Type names, node identities, dimensions, zero extraction warnings, source hash, and lossless references

#### Scenario: Unsupported variant is not promoted

- **WHEN** an observed paint or composition lacks an authoritative Notification variant
- **THEN** it remains a documented decision, assumption, or unsupported mode rather than a public source-backed variant

### Requirement: Notification semantics and application ownership

Notification SHALL remain a CSS-first visual primitive using consumer-selected native semantics. Consumers SHALL select `status`, `alert`, or no live-region role from message urgency and insertion context, provide complete textual meaning, accessible names for icon-only close controls, and safe focus recovery when removing a focused notification. The library SHALL NOT choose urgency, inject announcements, remove content, emit events, or own placement, stacking, queueing, timing, persistence, dismissal, focus recovery, or business actions.

#### Scenario: Polite feedback uses consumer-selected semantics

- **WHEN** an application inserts a non-urgent Notification into a live region
- **THEN** the application may select `role="status"` and the library adds no competing announcement behavior

#### Scenario: Focused close is removed safely

- **WHEN** application code dismisses a Notification from its focused close control
- **THEN** the application moves focus to a connected operable target and no SHLZ controller or library event is required

#### Scenario: Static notification has no inferred announcement

- **WHEN** Notification is present as ordinary contextual content
- **THEN** the public contract does not require a live-region role solely from its color, icon, or geometry

### Requirement: Notification structure, interaction states, and stress behavior

The supported Notification contract SHALL cover Default, Error, With button, light paint where documented as a repository decision, close and action controls, native hover/active/focus-visible behavior, disabled controls where consumer markup uses the native attribute, long title/message/action content, narrow viewport, and text scaling. Interactive controls SHALL remain native buttons, expose visible or accessible names, preserve keyboard order, and show a perceivable focus indicator. The surface SHALL fit its container without horizontal page overflow; source height is a minimum, not a fixed height under content stress.

#### Scenario: Real interaction state is measured

- **WHEN** a browser focuses, hovers, presses, or disables a named Notification control
- **THEN** the same executable flow reads the relevant state and verifies its documented paint, focus, and operability contract

#### Scenario: Long content grows the surface

- **WHEN** title, message, or action content cannot fit the source single-line composition
- **THEN** the Notification grows vertically, keeps content and controls usable, and does not clip or cause horizontal page overflow

#### Scenario: Native disabled action is inert

- **WHEN** an application disables a Notification action button
- **THEN** it is skipped by sequential focus and does not dispatch an activation click

### Requirement: Notification audit acceptance

Notification SHALL remain `INVENTORIED` or move to `FINDINGS` until its component manifest classifies every repository occurrence and executable evidence independently passes source integrity, structural contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content-stress levels. Runtime and real-interaction claims MUST originate from actual browser state; static matrices and structural assertions MUST NOT substitute.

#### Scenario: Unclassified occurrence blocks verification

- **WHEN** repository or built-DOM census finds Notification markup, a native/legacy substitute, or an executable root absent from its manifest
- **THEN** the occurrence guard fails and Notification cannot be marked `VERIFIED`

#### Scenario: Complete evidence permits verification

- **WHEN** exact census, source fidelity, semantics, native interactions, focus recovery consumer behavior, narrow/long content, focused snapshots, package regressions, and a real consumer all pass without a blocking finding
- **THEN** Notification may independently move to `VERIFIED` with exact observed counts and limitations recorded
