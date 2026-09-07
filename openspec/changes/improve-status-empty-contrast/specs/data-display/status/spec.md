## Purpose

Provide compact, readable textual state labels while preserving source color-family identity and consumer ownership of business meaning.

## ADDED Requirements

### Requirement: All supported Status paints have readable production text

Status SHALL support blue, green, bright-green, source-blue, orange, purple, cyan, pink and neutral paints. Normal-size text MUST reach at least 4.5:1 against the effective composited background on the white, Gray 50, Blue 50 and page surfaces. The six corrected foregrounds SHALL be semantic production roles; source values, pill backgrounds and already-compliant blue, source-blue and purple foregrounds MUST remain unchanged.

#### Scenario: A supported paint appears on a supported light surface

- **WHEN** any of the nine paint families is rendered on any of the four supported surfaces
- **THEN** computed text contrast is at least 4.5:1 and the source background and 30px minimum pill geometry are retained

### Requirement: Status remains a static consumer-neutral label

Existing Status markup and modifier names SHALL remain compatible. The component MUST NOT introduce focusability, interaction states, events or live-region semantics. Visible text and consumer context SHALL continue to own meaning; a color modifier MUST NOT establish a business-state enum.

#### Scenario: Consumer filters rows containing Status labels

- **WHEN** a user filters and resets Data Workspace rows
- **THEN** surviving labels use the accessible paints and remain plain unfocusable text with no implicit announcement or control semantics

### Requirement: Source and production decisions remain distinguishable

Original Status SVGs and source tokens MUST remain unchanged. Documentation SHALL identify the six semantic foreground corrections and the consumer responsibility for validating custom colors or unsupported backgrounds. Badge styling MUST remain unchanged.

#### Scenario: A consumer customizes a corrected foreground

- **WHEN** the consumer overrides the documented semantic foreground variable
- **THEN** Status uses that override through the normal CSS cascade and source tokens and Badge paint remain unchanged
