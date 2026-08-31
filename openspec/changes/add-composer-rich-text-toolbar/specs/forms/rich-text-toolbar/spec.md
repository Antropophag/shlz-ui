## Purpose

Provides an accessible, framework-neutral visual toolbar for commands acting on a consumer-owned rich-text editing surface.

## ADDED Requirements

### Requirement: Rich Text Toolbar exposes semantic command controls

The styles package SHALL support a `role="toolbar"` container with an accessible name. Command groups SHALL use `role="group"` with an accessible name. Commands SHALL be native buttons grouped by formatting purpose. Every icon-only command SHALL have an accessible name, and decorative icons SHALL remain hidden from assistive technology.

#### Scenario: A consumer renders formatting commands

- **WHEN** command buttons are placed in the documented toolbar and group regions
- **THEN** assistive technology identifies the toolbar, each group, and the accessible name of every command

### Requirement: Command state is explicit and consumer-controlled

Toggle commands SHALL expose their current state with `aria-pressed`; unavailable commands SHALL use native disabled semantics. The component SHALL style resting, hover, focus-visible, pressed, and disabled states without executing commands or deriving editor state.

#### Scenario: A formatting mark is active

- **WHEN** the consumer sets a toggle command's `aria-pressed` value to `true`
- **THEN** the control exposes and visually presents its pressed state

#### Scenario: A command is unavailable

- **WHEN** the consumer disables a command button
- **THEN** the control is unavailable to native activation and displays the disabled state

### Requirement: Toolbar interaction remains usable without a library controller

The toolbar SHALL preserve native button keyboard and focus behavior and SHALL NOT require a JavaScript controller, roving tabindex, or editor implementation. The consumer SHALL own command execution, selection preservation, focus restoration, shortcuts, and synchronization with editor state.

#### Scenario: No behavior package is installed

- **WHEN** the toolbar is rendered with semantic HTML and the styles package only
- **THEN** its controls remain reachable and activatable through native browser behavior while command effects remain consumer-owned

### Requirement: Toolbar adapts to bounded width and content stress

The toolbar SHALL allow command groups to wrap without clipping controls or introducing component-owned horizontal page overflow. Accessible names SHALL remain available when visible labels are omitted, and focus indicators SHALL remain unobscured at supported narrow widths.

#### Scenario: Commands do not fit on one row

- **WHEN** the toolbar is placed in a narrow container or content is enlarged
- **THEN** complete command groups wrap into additional rows and all controls remain visible and operable
