## Purpose

Defines an accessible inline calendar for date-only navigation and constrained single-date or date-range selection in one- and two-month presentations.

## ADDED Requirements

### Requirement: Date-only calendar model

The Calendar SHALL operate on Gregorian `YYYY-MM-DD` dates without time or timezone conversion and SHALL support single-date and date-range selection modes.

#### Scenario: Single-date selection

- **WHEN** a user activates an enabled calendar day in single mode
- **THEN** that date becomes the sole selected value

#### Scenario: Ordered range selection

- **WHEN** a user selects a range end earlier than the provisional range start
- **THEN** the Calendar commits an ordered range whose start is the earlier date and whose end is the later date

#### Scenario: Start a replacement range

- **WHEN** a complete range exists and the user activates another enabled day
- **THEN** that date becomes the start of a new incomplete range

### Requirement: Month navigation

The Calendar SHALL allow users to move between months while retaining selection and constraints, and SHALL expose the currently presented month and year accessibly.

#### Scenario: Navigate to the next month

- **WHEN** a user invokes next-month navigation
- **THEN** the next calendar month is presented and its month and year are available to assistive technology

#### Scenario: Navigation cannot reveal selectable dates

- **WHEN** all dates in a direction are excluded by the configured minimum or maximum
- **THEN** navigation in that direction is unavailable

### Requirement: One- and two-month presentation

The Calendar SHALL present one month by default and SHALL present two consecutive months only when explicitly requested and sufficient layout width is available.

#### Scenario: Default presentation

- **WHEN** the consumer does not request a month count
- **THEN** exactly one month is presented

#### Scenario: Requested two-month presentation fits

- **WHEN** the consumer requests two months and the container satisfies the documented two-month width contract
- **THEN** two consecutive non-duplicated months are presented

#### Scenario: Requested two-month presentation does not fit

- **WHEN** the consumer requests two months but the container is narrower than the documented width contract
- **THEN** the Calendar presents one usable month without horizontal page overflow

### Requirement: Constraints apply consistently

The Calendar SHALL make dates outside inclusive minimum/maximum bounds or marked disabled by the consumer unavailable for selection while retaining their communicated disabled state.

#### Scenario: Pointer activation of a disabled date

- **WHEN** a user activates a disabled day with a pointing device
- **THEN** selection does not change

#### Scenario: Keyboard navigation encounters disabled dates

- **WHEN** directional navigation crosses disabled dates
- **THEN** focus continues to the next enabled date in that direction when one exists

#### Scenario: Existing value becomes constrained

- **WHEN** constraints change so that a committed selection is no longer allowed
- **THEN** the Calendar reports the mismatch without silently replacing the consumer's value

### Requirement: Keyboard and focus interaction

The Calendar SHALL expose a single keyboard entry point within its date grid and support arrow-key day/week movement, Home/End week-boundary movement, Page Up/Page Down month movement, and Enter/Space selection.

#### Scenario: Arrow-key navigation

- **WHEN** focus is on an enabled date and the user presses an arrow key
- **THEN** focus moves by one day horizontally or one week vertically in the corresponding direction, crossing month boundaries when necessary

#### Scenario: Week-boundary navigation

- **WHEN** the user presses Home or End on a focused date
- **THEN** focus moves to the first or last enabled date in the active locale week

#### Scenario: Month keyboard navigation

- **WHEN** the user presses Page Up or Page Down
- **THEN** focus moves to the corresponding enabled date in the previous or next month, clamped when that day does not exist

#### Scenario: Keyboard selection

- **WHEN** the user presses Enter or Space on an enabled focused date
- **THEN** the same selection behavior occurs as pointer activation

### Requirement: Calendar accessibility

The Calendar SHALL provide programmatic month, weekday, date, today, selected, range, and disabled information without relying on color alone.

#### Scenario: Today is not selected

- **WHEN** today's date is visible but not selected
- **THEN** assistive technology can distinguish today from selection and the visual presentation has a non-color cue

#### Scenario: Complete range is presented

- **WHEN** a range is committed
- **THEN** its start, end, and intervening dates are programmatically and visually distinguishable

#### Scenario: Locale changes week presentation

- **WHEN** the active locale uses a different weekday order or labels
- **THEN** weekday headings and grid ordering remain mutually consistent and accessible
