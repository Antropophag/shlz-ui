## Purpose

Defines Snackbar's source-backed countdown presentation while keeping timing, announcements, lifecycle, and orchestration explicitly outside the design-system contract.

## ADDED Requirements

### Requirement: Snackbar source census and visual contract

The system SHALL treat `components/Snackbar` inside raw `UI Kit – Basic elements.zip` as Snackbar's visual authority. It SHALL preserve exactly six 384×58 Number variants 5, 4, 3, 2, 1, and 0, including the stable dark pill, message/action composition, displayed numeral, and each exact decreasing white contour. The source archive and extracted variant paths SHALL be traceable without modifying or regenerating the authority.

#### Scenario: Six source frames are executable

- **WHEN** source-integrity checks inspect the raw Snackbar component set
- **THEN** they assert the exact six Number variants, node identities, dimensions, zero extraction warnings, source archive hash, and lossless references

#### Scenario: Countdown contour matches its frame

- **WHEN** each Snackbar Number variant is rendered in the fidelity fixture
- **THEN** its displayed numeral and contour geometry match the corresponding authoritative exported path rather than an inferred generic percentage

### Requirement: Snackbar timing and announcement boundary

Snackbar countdown frames SHALL be exposed only as source-backed presentation states. The library SHALL NOT infer or implement duration, one-second stepping, easing, animation, auto-dismiss, pause on hover or focus, reset, synchronization, callbacks, queueing, persistence, announcement cadence, or live-region priority. Consumers SHALL own any lifecycle and SHALL avoid repeatedly announcing visual countdown numerals.

#### Scenario: Static frame has no timer

- **WHEN** a consumer renders one supported Snackbar Number frame
- **THEN** no library timer advances it or removes the surface

#### Scenario: Application owns countdown lifecycle

- **WHEN** an application chooses to progress across source-backed frames
- **THEN** application code owns timing, pause, synchronization, removal, action handling, and announcement policy

#### Scenario: Numeral is decorative for announcements

- **WHEN** the visible number communicates remaining time visually
- **THEN** the consumer can hide that changing numeral from assistive technology while preserving a stable textual message and accessible action

### Requirement: Snackbar structure, interaction states, and stress behavior

Snackbar SHALL compose the shared feedback surface with a source-exact countdown graphic, stable text, and a native visible-text action. The supported ledger SHALL cover all six static Number frames, real action hover/active/focus-visible, native disabled action, long localized message/action content, narrow viewport, and text scaling. The source height SHALL be treated as a minimum under stress, and the surface SHALL fit its container without horizontal page overflow.

#### Scenario: Action remains keyboard operable

- **WHEN** a user tabs to and activates the Snackbar action
- **THEN** the native button receives visible focus and application-owned activation occurs once

#### Scenario: Long Snackbar content remains usable

- **WHEN** localized message or action text exceeds the source single-line width
- **THEN** the surface grows without clipping its countdown, text, or action and without horizontal page overflow

#### Scenario: Visual frame is not runtime proof

- **WHEN** a static matrix or snapshot shows all six numbers
- **THEN** it proves only static visual fidelity and does not satisfy timer, lifecycle, or real-interaction evidence

### Requirement: Snackbar audit acceptance

Snackbar SHALL be audited independently from Notification and SHALL remain `INVENTORIED` or move to `FINDINGS` until its own manifest classifies every occurrence and independently passes source integrity, structural contract, runtime browser where applicable, accessibility, focused visual, consumer integration, and responsive/content-stress evidence. Shared CSS or a passing Notification gate MUST NOT confer Snackbar verification.

#### Scenario: Independent occurrence guard

- **WHEN** a Snackbar fixture, consumer, diagnostic, or substitute is added or discovered
- **THEN** Snackbar's manifest and focused guard classify it independently or verification fails

#### Scenario: Complete Snackbar evidence permits verification

- **WHEN** all six source frames, semantic boundary, native action interaction, disabled behavior, long/narrow content, focused visual, real consumer, source hashes, and regressions pass without a blocking finding
- **THEN** Snackbar may independently move to `VERIFIED` with exact observed counts and lifecycle limitations recorded
