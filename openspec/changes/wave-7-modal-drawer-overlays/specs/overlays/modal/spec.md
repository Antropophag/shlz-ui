## Purpose

Defines the source-backed, accessible, modal lifecycle and evidence contract for SHLZ Modal across framework-neutral consumers.

## ADDED Requirements

### Requirement: Modal source census and supported material states

The system SHALL treat `shlz-design-source/raw/svg/Modal.svg` as the sole visual authority and SHALL preserve its census of five standalone components: one 572×196 Basic (Legacy) composition and four 416/417×165 Info, Success, Warning, and Error compositions. It MUST NOT represent these nodes as a source Component Set or infer additional variants, sizes, behaviors, or semantic status APIs. The supported material-state ledger SHALL separately cover closed, open structured, open compact Info, Success, Warning, and Error appearances, real focus-visible controls, long-content overflow, and narrow viewport where applicable.

#### Scenario: Source census is executable

- **WHEN** source-integrity checks read the authoritative Modal SVG and derived index
- **THEN** they assert five standalone zero-variant components with the authoritative names and dimensions and retain all five lossless diagnostic references

#### Scenario: Unsupported variant is not promoted

- **WHEN** an observed geometry or outlined label lacks a source component name or repeatable contract
- **THEN** it remains a documented unknown and creates no public variant, size, or behavior API

### Requirement: Modal semantics and focus ownership

An open Modal SHALL be modal, top-layer dialog content with an accessible name. The consumer SHALL own content, accessible naming, and optional safe initial-focus selection; the platform SHALL own baseline initial focus when no explicit target is supplied, background inertness, sequential focus containment, and modal top-layer behavior. Closing SHALL restore focus to the actual opener when it remains connected and operable; otherwise closure SHALL complete without focusing a stale, disconnected, disabled, or aria-disabled target.

#### Scenario: Explicit initial focus

- **WHEN** a consumer marks a safe descendant as its initial-focus target and opens the Modal
- **THEN** that descendant receives initial focus and focus remains within the active modal during sequential navigation

#### Scenario: Platform initial focus fallback

- **WHEN** the Modal opens without a consumer-selected initial target
- **THEN** native dialog focus behavior applies without a library-selected destructive or workflow-specific action

#### Scenario: Focus restoration

- **WHEN** an opener activates the Modal and the Modal closes by any supported path
- **THEN** focus returns to that opener if it is still connected and operable

#### Scenario: Stale opener is unavailable

- **WHEN** the recorded opener is removed or becomes disabled before close
- **THEN** the Modal closes successfully and does not focus that stale target or throw

### Requirement: Modal dismissal and Escape precedence

Escape SHALL close only the highest-priority currently open dismissible surface. A Wave 6 Dropdown, Tooltip, or Popover opened inside Modal SHALL consume the first Escape and leave the Modal open; a subsequent Escape SHALL close the Modal. Explicit descendant close controls and native dialog-form submission SHALL close with their declared return value. Backdrop pointer dismissal SHALL be disabled by default and SHALL occur only when explicitly opted in and the same pointer gesture starts and ends outside the Modal surface.

#### Scenario: Nested floating surface owns first Escape

- **WHEN** a Dropdown, Tooltip, or Popover is open inside an open Modal and Escape is pressed
- **THEN** the floating surface closes and the Modal remains open

#### Scenario: Modal owns next Escape

- **WHEN** no higher-priority nested surface is open and Escape is pressed
- **THEN** the Modal closes through the native cancel/close lifecycle and restores eligible opener focus

#### Scenario: Interior drag does not backdrop-dismiss

- **WHEN** backdrop dismissal is enabled but a pointer gesture begins within the Modal surface and ends outside it
- **THEN** the Modal remains open

#### Scenario: Non-dismissible backdrop

- **WHEN** backdrop dismissal is not enabled and the user interacts outside the Modal surface
- **THEN** the Modal remains open and background content is not activated

### Requirement: Modal scroll and nested-overlay ownership

The Modal surface SHALL remain viewport-bounded. When content overflows, the Modal body SHALL own scrolling while header and footer remain stationary; the library SHALL NOT add document-scroll-lock state beyond native modal behavior. Wave 6 floating surfaces inside Modal SHALL stay visible within the dialog top-layer context, retain their own semantics, focus behavior, placement, outside-dismissal rules, and lifecycle, and SHALL NOT be converted into Modal variants.

#### Scenario: Long content scrolls locally

- **WHEN** Modal body content exceeds the available viewport height
- **THEN** the body scrolls, header and footer positions remain stable, and background interaction remains blocked

#### Scenario: Floating surface remains usable in top layer

- **WHEN** a supported Wave 6 floating surface opens from a control inside Modal near a viewport edge
- **THEN** it is visible, collision-bounded, interactive according to its own contract, and does not escape behind the Modal

### Requirement: Modal controller lifecycle and isolation

Enhancement SHALL create at most one active behavior owner per Modal element within a live enhancement lifecycle, SHALL NOT duplicate trigger or dialog listeners when enhancement is repeated, and SHALL isolate opener, return value, backdrop gesture, open state, and teardown state between Modal instances and between close/reopen cycles. Destroy SHALL be idempotent, SHALL remove owned listeners, SHALL close an open Modal through a consistent close lifecycle, and SHALL prevent stale callbacks or prior-cycle state from reopening, closing, or focusing a later instance.

#### Scenario: Repeated enhancement is idempotent

- **WHEN** the same scope is enhanced twice and one trigger is activated
- **THEN** one Modal open transition occurs and one controller owns the element

#### Scenario: Reopen has fresh state

- **WHEN** a Modal closes and is reopened by a different trigger
- **THEN** dismissal and focus restoration use only the new open cycle's gesture and opener state

#### Scenario: Destroyed controller is inert

- **WHEN** a Modal controller is destroyed twice and former triggers or stale async work subsequently fire
- **THEN** no exception, duplicate close, reopen, or stale focus restoration occurs

### Requirement: Modal audit acceptance and regressions

Modal SHALL remain `INVENTORIED` or move to `FINDINGS` until its component manifest classifies every repository occurrence and executable evidence passes source integrity, structural contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content stress levels. Runtime and real-interaction claims MUST be produced by actual browser state; structural tests and forced-state visuals MUST NOT substitute. At least the Showcase structured and compact fixtures and the plain-HTML consumer SHALL be exercised, with exact observed counts reported rather than encoded as permanent thresholds.

#### Scenario: Unclassified occurrence blocks verification

- **WHEN** census discovers Modal markup, a native/legacy substitute, or an executable root absent from the manifest
- **THEN** the occurrence guard fails and Modal cannot be marked `VERIFIED`

#### Scenario: Regression suite passes

- **WHEN** Wave 7 acceptance is evaluated
- **THEN** source hashes/census, package exports, framework-neutral consumption, open/close paths, focus, Escape precedence, backdrop policy, scroll, narrow/long content, nested Wave 6 surfaces, idempotence, teardown, focused snapshots, and one real consumer all pass with no unexplained snapshot change or blocking finding
