## Purpose

Defines semantic ownership and interaction precedence among blocking overlays and Wave 6 floating surfaces without a generic overlay framework.

## ADDED Requirements

### Requirement: Overlay semantic boundary

Modal SHALL represent centered blocking dialog content for a bounded decision or task. Drawer SHALL represent the supported right-edge blocking supplementary task surface and SHALL remain modal in this contract. Popover SHALL remain anchored, non-modal, optionally interactive supplementary content without implicit focus containment. Tooltip SHALL remain a short non-interactive description with tooltip semantics. Dropdown SHALL remain an anchored command/menu surface with menu keyboard semantics. Geometry or visual elevation alone MUST NOT reclassify one family as another.

#### Scenario: Interactive anchored content is not a Tooltip

- **WHEN** an anchored surface contains focusable controls
- **THEN** it uses the Popover or another applicable interactive contract and not Tooltip semantics

#### Scenario: Blocking edge task is Drawer

- **WHEN** a supported right-edge task blocks background interaction and contains a bounded workflow
- **THEN** it uses Drawer semantics rather than Popover placement or Dropdown menu semantics

#### Scenario: Command choices remain Dropdown

- **WHEN** an anchored surface exposes a menu of commands
- **THEN** Dropdown owns keyboard/menu behavior even when composed inside Modal or Drawer

### Requirement: Topmost dismissible surface owns Escape

For the supported composition of one Modal or Drawer containing Wave 6 floating surfaces, the currently open highest-priority dismissible surface SHALL receive Escape first. Handling Escape MUST close at most one surface per key press and MUST NOT require a global public overlay stack. Tooltip, Popover, and Dropdown SHALL retain their Wave 6 ownership rules; the containing native modal SHALL receive Escape only after nested floating state is closed.

#### Scenario: One Escape closes one layer

- **WHEN** a nested floating surface and its containing modal overlay are both open and Escape is pressed once
- **THEN** the floating surface closes and the containing overlay remains open

#### Scenario: Second Escape reaches container

- **WHEN** the nested surface has closed and Escape is pressed again
- **THEN** the containing Modal or Drawer closes

### Requirement: Outside interaction is surface-local

Outside interaction SHALL be interpreted by the active surface's own contract. Modal and Drawer backdrops SHALL require explicit opt-in and an outside-to-outside pointer gesture. Popover and Dropdown SHALL retain their Wave 6 outside-dismissal rules. Tooltip SHALL retain hover/focus visibility rules. An interaction inside any nested open surface MUST NOT be treated as outside its containing modal overlay.

#### Scenario: Click inside nested Popover

- **WHEN** the user interacts with a control inside a Popover contained by Modal
- **THEN** neither Popover outside-dismissal nor Modal backdrop dismissal fires solely because of top-layer geometry

### Requirement: Focus ownership does not leak across seams

Modal and Drawer SHALL own only modal entry, containment, and restoration boundaries. Nested Dropdown, Tooltip, and Popover SHALL retain their Wave 6 focus contracts, and Popover focus entry SHALL remain consumer-owned. Closing a nested floating surface MUST NOT restore focus outside the containing modal overlay. Closing the containing overlay SHALL restore only its current-cycle eligible opener.

#### Scenario: Nested surface closes within modal boundary

- **WHEN** a nested floating surface closes while its Modal remains open
- **THEN** any focus restoration stays inside the active Modal and background content does not receive focus

### Requirement: Bounded nested-overlay support

The supported nested contract SHALL cover Wave 6 Dropdown, Tooltip, and Popover inside a single Modal or Drawer. Arbitrary Modal-in-Modal, Drawer-in-Modal, Modal-in-Drawer, sibling modal concurrency, nested popover trees, portals across dialog boundaries, and global z-index ordering SHALL be explicit non-goals until separate evidence defines their behavior.

#### Scenario: Unsupported modal nesting is not silently accepted

- **WHEN** census or a consumer reveals nested or concurrent modal overlays outside the supported matrix
- **THEN** Wave 7 classifies it as a finding or separate requirement rather than claiming it passes under the single-container contract

### Requirement: Composition regressions preserve Wave 6

Wave 7 changes MUST NOT regress the verified Wave 6 Dropdown, Tooltip, or Popover contracts in standalone, plain-HTML, or modal-nested use. Regression evidence SHALL exercise real nested open state, placement visibility, interaction, focus, first-Escape ownership, reopen, idempotence, and teardown.

#### Scenario: Wave 6 regression gate

- **WHEN** Modal or Drawer behavior, styles, fixtures, or shared internals change
- **THEN** relevant Wave 6 source, interaction-evidence, placement, accessibility, and occurrence-guard tests remain passing without weakening their manifests or ledgers
