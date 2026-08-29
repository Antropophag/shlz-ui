## Purpose

Defines the framework-neutral popover composition that synchronizes Date Field input with Calendar selection and owns opening, commit, dismissal, and focus restoration behavior.

## ADDED Requirements

### Requirement: Field and Calendar stay synchronized

The Date Picker SHALL present a Date Field and Calendar over one shared date-only value contract, constraints, locale, and selection mode.

#### Scenario: Calendar changes a single value

- **WHEN** a user selects an enabled day in the Calendar
- **THEN** the Date Field displays that date and exposes the same `YYYY-MM-DD` value

#### Scenario: Manual input changes the calendar position

- **WHEN** a user commits a valid allowed date through the Date Field
- **THEN** the Calendar selection and presented month synchronize to that date

#### Scenario: Shared constraint changes

- **WHEN** the consumer changes a date constraint
- **THEN** both manual input and Calendar selection apply the same updated constraint

### Requirement: Picker opening and positioning

The Date Picker SHALL open from its field trigger into a non-modal floating surface, expose expanded/control relationships, and use the repository's shared popover positioning behavior to remain within the viewport where possible.

#### Scenario: Trigger opens the picker

- **WHEN** a user activates an enabled editable Date Picker trigger
- **THEN** the Calendar opens, the trigger reports the expanded state, and focus enters the Calendar at the selected date or an appropriate enabled fallback date

#### Scenario: Preferred placement lacks space

- **WHEN** the preferred placement would cross the viewport edge
- **THEN** the surface uses an available placement without changing the selected date or interaction contract

### Requirement: Selection commit and closing

The Date Picker SHALL close immediately after an enabled date is selected in single mode and after the second endpoint is selected in range mode, without requiring a confirmation footer.

#### Scenario: Single selection commits

- **WHEN** a user selects an enabled date in single mode
- **THEN** the value commits, the picker closes, and focus returns to the field trigger

#### Scenario: Range start remains provisional

- **WHEN** a user selects the first enabled date in range mode
- **THEN** the provisional range start is shown and the picker remains open

#### Scenario: Range end commits

- **WHEN** a user selects the second enabled date in range mode
- **THEN** the ordered range commits, the picker closes, and focus returns to the field trigger

### Requirement: Dismissal preserves committed data

The Date Picker SHALL close on Escape and outside interaction, restore focus appropriately after keyboard dismissal, and preserve the last committed value when an incomplete interaction is dismissed.

#### Scenario: Escape dismisses an open picker

- **WHEN** focus is inside the open picker and the user presses Escape
- **THEN** the picker closes, the last committed value is preserved, and focus returns to the field trigger

#### Scenario: Outside interaction dismisses an incomplete range

- **WHEN** only a provisional range start exists and the user interacts outside the picker
- **THEN** the picker closes without committing that incomplete range

### Requirement: Picker states inherit field semantics

The Date Picker SHALL preserve Date Field disabled, read-only, required, invalid, form submission, and reset semantics while open and closed.

#### Scenario: Form reset while picker is open

- **WHEN** the containing form is reset while the picker is open
- **THEN** the picker closes and both field and Calendar return to the initial committed value and validation state

#### Scenario: Picker becomes disabled while open

- **WHEN** the consumer disables an open picker
- **THEN** it closes, cannot be reopened, and does not commit provisional selection
