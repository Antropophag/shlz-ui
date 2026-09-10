## Purpose

Provide the complete source-backed reusable table presentation and demonstrate how applications compose it with native controls and existing SHLZ components.

## ADDED Requirements

### Requirement: Account for the complete source family

The library SHALL account individually for the 49 exported Table Cell variants, three Sorter variants, three Filter variants, all nine domain compositions shown in Table.svg, and the related pagination family. Evidence SHALL distinguish original SVG facts, derived variant names, repository decisions, and source limitations. A composition SHALL reuse primitives rather than become a business-specific core API.

#### Scenario: Inspect complete source coverage

- **WHEN** a developer inspects the table documentation and executable gallery
- **THEN** every source cell has an identified representation and state evidence, every domain composition has a named example, and pagination has an explicit integration and ownership reference
- **AND** source files remain byte-identical and diagnostic states are distinguished from real interactions

### Requirement: Source-backed header controls

Production header and add-row text SHALL use the repository's existing accessible supporting-text role; explicitly inert source diagnostics SHALL retain original text paints. Headers SHALL render the two-arrow sorter in none, ascending and descending states and the funnel filter in default, hover and active states. Text and icon headers SHALL preserve source grouping and geometry. Active sorting SHALL be exposed by the column's aria-sort; filter applied state SHALL remain distinct from popup expanded state. Toggle filters SHALL use aria-pressed; dialog launchers SHALL use aria-haspopup="dialog", expose applied state through an accessible description, and use data-filter-active for visual state without aria-pressed. Native buttons SHALL support keyboard focus and activation and disabled controls SHALL not act.

#### Scenario: Sort and filter a live table

- **WHEN** the user activates the consumer's sort control and opens/applies/resets the header filter
- **THEN** row order and filter results change through consumer code, the corresponding header state reflects the applied data state, and dismissal returns focus to the initiating control

#### Scenario: Filter an edited value

- **WHEN** an editable row name changes to match the active filter
- **THEN** filtering and sorting read the same current cell value

#### Scenario: Announce the dialog filter

- **WHEN** a user focuses the workspace header filter before or after applying a condition
- **THEN** it announces a dialog launcher and an applied-filter description, retains source active paint, and does not announce a pressed toggle

#### Scenario: Observe independent header states

- **WHEN** a header is unsorted, ascending, descending, filtered or both sorted and filtered
- **THEN** its exact arrow/filter state is visible without substituting unrelated general-purpose icons or relying on color inheritance through an external image

### Requirement: Complete cell presentation and editing composition

Native tables SHALL support blank and filled text, empty cells, Status, Checkbox, priority, icon action, Switch, Button and Dropdown cells, including applicable default, hover, pressed and typing states from the source. Ordinary source cells SHALL be 50px high with 8px inline insets and a 1px bottom divider; intrinsic widths and expanded popup bounds SHALL not be promoted to global width/row-height tokens. Blank empty cells SHALL not require an invented dash. Editable cells SHALL expose source-backed active underline and compose existing popup/control semantics.

#### Scenario: Edit and choose a cell value

- **WHEN** a user focuses and edits a text cell or opens a status/dropdown choice
- **THEN** the actual focused/open cell displays its active presentation, a choice updates the consumer value, Escape dismisses the choice, and the table remains native tabular markup

#### Scenario: Exercise nested controls

- **WHEN** the user toggles a row checkbox or switch, invokes an icon action or adds a row
- **THEN** the consumer updates the corresponding state exactly once, preserves accessible names and focus, and disabled controls remain inert

### Requirement: Native table composition and stress

Tables SHALL retain caption, column header associations and native table semantics, without grid roles or a library data controller. Long content, numeric cells, action cells and narrow containers SHALL remain usable through wrapping/truncation decisions and a horizontal table wrapper. Popups SHALL remain usable at the viewport edges and in the scrolling wrapper. Row selection SHALL compose Checkbox and remain consumer-owned.

#### Scenario: Narrow and long content

- **WHEN** a table with long Cyrillic and Latin content, numeric data, selection and editing is viewed at a narrow viewport
- **THEN** overflow belongs to the table wrapper, controls remain accessible, and a popup choice is not clipped by the wrapper

#### Scenario: Pagination and empty recovery

- **WHEN** a table consumer composes native Pagination links or produces no matching rows
- **THEN** pagination retains its existing URL-owned navigation contract and the empty result offers working recovery without a new coupled Table data API

### Requirement: Component-specific completion evidence

Completion SHALL require classified occurrences, per-variant executable evidence, focused visual/state checks, keyboard and disabled behavior, a real consumer, and responsive/content stress. Existing nested-component contracts SHALL not be silently replaced. Unresolved deviations SHALL be recorded and SHALL not be represented as passed fidelity.

#### Scenario: Compare immutable baseline inputs

- **WHEN** the table contract oracle renders the pinned baseline
- **THEN** both table styles and token definitions come from the pinned commit, independent of current generated tokens

#### Scenario: Review the transfer

- **WHEN** the Table completion report is generated
- **THEN** it includes observed occurrence and variant counts, actual checks, source integrity, separate statuses for related families, limitations, CI and review findings
