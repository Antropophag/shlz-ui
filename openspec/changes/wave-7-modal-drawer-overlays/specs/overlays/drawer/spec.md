## Purpose

Defines the bounded source-backed right-side modal Drawer contract without inferring unsupported placements, modality, or variants.

## ADDED Requirements

### Requirement: Drawer source census and bounded support

The system SHALL treat `shlz-design-source/raw/svg/Drawer.svg` as the sole Drawer visual authority and SHALL preserve its census of one standalone `Sidebar/Drawer` component at 420×900 with no component properties or variants. The supported production contract SHALL be one right-side modal Drawer with closed/open, dismissible/non-dismissible, focus-visible, long-content, and narrow-viewport material states. Right attachment, modal behavior, attached-edge radii, backdrop, and narrow full-width behavior SHALL be classified as repository decisions, not source facts.

#### Scenario: Drawer census is executable

- **WHEN** source-integrity checks inspect Drawer authority and the derived index
- **THEN** they assert one standalone zero-variant 420×900 component and one lossless diagnostic reference

#### Scenario: Unsupported Drawer request remains outside contract

- **WHEN** a consumer requests non-modal behavior or left, top, or bottom placement
- **THEN** the library exposes no inferred variant and documentation identifies that request as unsupported pending separate evidence and contract review

### Requirement: Drawer modal and focus contract

An open Drawer SHALL use modal dialog semantics, block background interaction, participate in the top layer, contain sequential focus, and expose an accessible name. Consumer and platform focus ownership, eligible opener restoration, and stale-target handling SHALL match the Modal contract. The right-side geometry SHALL NOT weaken modal semantics or imply a non-modal navigation sidebar.

#### Scenario: Drawer opens as modal

- **WHEN** a Drawer opener activates a closed Drawer
- **THEN** the Drawer becomes modal, background content is inert, initial focus follows consumer/platform ownership, and the opener reflects the open relationship

#### Scenario: Drawer restores eligible focus

- **WHEN** Drawer closes and its opener remains connected and operable
- **THEN** focus returns to that opener exactly once

### Requirement: Drawer dismissal, precedence, and scroll ownership

Drawer SHALL follow the same Escape/top-layer and opt-in backdrop gesture rules as Modal. Explicit close controls and native dialog forms SHALL retain declared return values. The Drawer body SHALL own vertical overflow while header and footer remain stationary; the library SHALL NOT install independent document scroll lock. At viewport widths below the supported source width, the Drawer SHALL fit the viewport without horizontal overflow.

#### Scenario: Drawer closes on unclaimed Escape

- **WHEN** Drawer is open, no higher-priority nested surface is open, and Escape is pressed
- **THEN** Drawer closes and restores eligible opener focus

#### Scenario: Nested surface has first precedence

- **WHEN** a supported nested floating surface is open inside Drawer and Escape is pressed
- **THEN** only that nested surface closes on the first Escape

#### Scenario: Drawer body owns long-content scroll

- **WHEN** body content exceeds Drawer height
- **THEN** body content scrolls while header/footer remain stationary and the document receives no library-owned scroll-lock mutation

#### Scenario: Narrow viewport

- **WHEN** viewport width is less than 420 px
- **THEN** Drawer fits the viewport width without horizontal clipping while retaining modal behavior and usable close/actions

### Requirement: Drawer controller isolation

Drawer enhancement, reopen, multi-instance isolation, and idempotent destroy SHALL meet the Modal lifecycle guarantees. State from one Drawer, one opener, or one pointer gesture MUST NOT affect another Drawer or a later cycle, and destruction MUST leave no stale trigger, focus-restoration, backdrop, or Escape behavior.

#### Scenario: Multiple Drawers remain isolated

- **WHEN** two Drawer instances are enhanced and operated in sequence
- **THEN** each synchronizes only its matching triggers, return value, focus target, and dismissal state

#### Scenario: Re-enhancement and teardown

- **WHEN** enhancement is repeated and the resulting owner is destroyed
- **THEN** activation occurs once before destruction and former triggers do nothing afterward without throwing

### Requirement: Drawer audit acceptance and regressions

Drawer SHALL remain `INVENTORIED` or move to `FINDINGS` until a component manifest and occurrence guard classify all reusable fixtures, the Data Workspace live consumer, plain-HTML consumer, inert diagnostics, and any legacy/native substitutes. Acceptance MUST include actual-browser runtime, accessibility, focused visual, narrow/long-content, modal interaction, lifecycle, and consumer evidence; source/structural tests alone are insufficient.

#### Scenario: Real consumer is mandatory

- **WHEN** Wave 7 Drawer acceptance is evaluated
- **THEN** Data Workspace opens, operates, closes, restores focus, and preserves application-owned state through the reusable Drawer contract

#### Scenario: Drawer regression suite passes

- **WHEN** Drawer is proposed for `VERIFIED`
- **THEN** exact census, source geometry, public exports, modal focus/Escape/backdrop behavior, scrolling, narrow layout, controller isolation/teardown, focused snapshots, plain HTML, Data Workspace, and Wave 6 nested-surface compatibility pass with no unclassified occurrence or blocking finding
