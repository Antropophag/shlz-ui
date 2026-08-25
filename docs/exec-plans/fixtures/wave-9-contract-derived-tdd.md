## ADDED Requirements

### Requirement: Sidebar states are source-traceable and operable

#### Scenario: Opened and closed compositions

<!-- implementation-semantics: material-state -->

- **WHEN** the sidebar is opened or closed
- **THEN** the application shell exposes the corresponding composition

#### Scenario: Active and default items

<!-- implementation-semantics: material-state -->

- **WHEN** navigation state changes
- **THEN** active and default items remain distinguishable

#### Scenario: Keyboard navigation

<!-- implementation-semantics: material-behavior -->

- **WHEN** the user navigates the sidebar from the keyboard
- **THEN** the shell follows its keyboard interaction contract

### Requirement: Header states preserve native input behavior

#### Scenario: Default and hover

<!-- implementation-semantics: material-state -->

- **WHEN** the native search input is default or hovered
- **THEN** the corresponding header state is observable

#### Scenario: Typing and filled

<!-- implementation-semantics: material-state -->

- **WHEN** the user types or the input contains a value
- **THEN** native input state remains application-owned

### Requirement: Responsive behavior is bounded by evidence

#### Scenario: Narrow content stress

<!-- implementation-semantics: material-behavior -->

- **WHEN** the application shell is rendered with narrow stressed content
- **THEN** its evidenced responsive behavior remains operable
