## Purpose

Defines a framework-neutral date-only field that presents localized text while preserving stable values, validation, constraints, and native form lifecycle behavior.

## ADDED Requirements

### Requirement: Stable date-only value contract
The Date Field SHALL expose an empty value or a valid Gregorian calendar date in `YYYY-MM-DD` form and SHALL NOT apply timezone conversion to that value.

#### Scenario: Value survives a non-UTC environment
- **WHEN** a consumer sets `2026-08-28` while the browser timezone is not UTC
- **THEN** the field exposes `2026-08-28` and displays that same calendar day

#### Scenario: Empty value
- **WHEN** no date is selected or entered
- **THEN** the field exposes an empty value

### Requirement: Localized display and input
The Date Field SHALL format its visible date with `Intl` semantics using the consumer-supplied locale, falling back to the document language, and SHALL accept manual input only when it strictly represents a complete valid date in the active display format.

#### Scenario: Consumer supplies a locale
- **WHEN** the consumer sets a supported locale and a valid ISO date value
- **THEN** the visible value uses that locale while the exposed value remains `YYYY-MM-DD`

#### Scenario: Locale is omitted
- **WHEN** the consumer omits the locale
- **THEN** the field derives display formatting from the document language

#### Scenario: Manual input is incomplete or impossible
- **WHEN** a user leaves an incomplete date or enters a calendar-impossible date
- **THEN** the field preserves the editable text, reports an invalid state, and does not replace the last valid exposed value with a fabricated date

### Requirement: Date constraints
The Date Field SHALL support inclusive minimum and maximum dates and consumer-supplied disabled dates, and SHALL reject manual values that violate an active constraint.

#### Scenario: Date is inside the allowed interval
- **WHEN** a user enters a valid date at or between the configured minimum and maximum and it is not disabled
- **THEN** the field accepts the date

#### Scenario: Date violates a constraint
- **WHEN** a user enters a date before the minimum, after the maximum, or marked disabled by the consumer
- **THEN** the field reports an invalid state and does not commit that date

### Requirement: Field states and semantics
The Date Field SHALL expose an accessible name, optional description, invalid state and error association, disabled state, and read-only state using native form semantics where available.

#### Scenario: Disabled field
- **WHEN** the field is disabled
- **THEN** users cannot edit or trigger date selection and the control is omitted from successful native form submission

#### Scenario: Read-only field
- **WHEN** the field is read-only
- **THEN** its value remains readable and focusable but cannot be edited or changed through its picker trigger

#### Scenario: Invalid field has an error
- **WHEN** validation fails and error content is present
- **THEN** assistive technology can identify both the invalid state and its associated error content

### Requirement: Native form lifecycle
The Date Field SHALL participate in native form submission and reset and SHALL notify consumers only when its committed date-only value changes.

#### Scenario: Form submission
- **WHEN** a named enabled field with a committed value is submitted
- **THEN** the successful form data contains the field name and its `YYYY-MM-DD` value

#### Scenario: Form reset
- **WHEN** the containing form is reset
- **THEN** the visible text, committed value, and validation state return to their initial values

#### Scenario: Invalid edit does not emit a committed change
- **WHEN** manual text is invalid or violates a constraint
- **THEN** no committed-value change notification is emitted
