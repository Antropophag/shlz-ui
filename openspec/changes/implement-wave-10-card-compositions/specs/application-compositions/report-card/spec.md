## ADDED Requirements

### Requirement: Report card presents a structured report summary

The styles package SHALL expose a `.shlz-report-card` composition with eyebrow, title, value, metadata, and trailing-decoration regions. Its source specimen SHALL be 314 by 230 pixels with a 16-pixel radius and SHALL support the white and `#EEF0F4` muted source surfaces.

#### Scenario: A report summary is rendered

- **WHEN** structured report content is placed in the documented regions
- **THEN** the value and title remain the primary reading order and decorative trailing geometry is hidden from assistive technology

#### Scenario: Muted source variant is selected

- **WHEN** `.shlz-report-card--muted` is applied
- **THEN** the surface uses the source-observed muted paint without changing semantics or inventing state behavior

### Requirement: Report card has no implied activation

The root SHALL remain non-interactive. An optional nested Link MAY be supplied by the consumer and SHALL be the only navigation target.

#### Scenario: No link is supplied

- **WHEN** the card contains only report data
- **THEN** it remains a readable article and does not expose pointer or keyboard activation

### Requirement: Report card supports bounded content stress

The fluid report card SHALL fit its container down to 240 pixels, wrap structured text, grow vertically when content needs more height, and reserve the trailing-decoration gutter across lower text regions.

#### Scenario: Fluid report content is stressed

- **WHEN** the fluid modifier is rendered at 240 pixels or with long content
- **THEN** text wraps, the card grows vertically, and content does not overlap the trailing decoration
