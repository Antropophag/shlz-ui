## Purpose

Present empty-content explanations with readable optional text and native actions without owning application state or data lifecycle.

## ADDED Requirements

### Requirement: Empty State supporting text is readable

Simple, Customize, Basic and fluid consumer-composed Empty States SHALL use text that reaches 4.5:1 on white, Gray 50, Blue 50 and page surfaces. Secondary titles and descriptions SHALL use the existing accessible supporting-text role. Primary Customize/Basic titles, illustration paints and source composition geometry MUST remain unchanged.

#### Scenario: A supported Empty State composition is rendered

- **WHEN** any supported composition is rendered on any supported surface
- **THEN** each present title and description reaches 4.5:1 and the component retains its source-specific typography and layout

### Requirement: Consumer state and native actions remain independent

The component SHALL preserve optional visual, title, description and action regions. It MUST NOT introduce a visibility controller, implicit alert/live-region behavior, loading/error ownership or new focus stops. Consumers SHALL continue to choose heading levels and empty-data conditions; nested buttons and links SHALL retain native behavior.

#### Scenario: A consumer reaches and clears an empty result

- **WHEN** Data Workspace search has no matching rows and the user activates its reset action with the keyboard
- **THEN** readable Empty State content appears for the empty condition and reset restores the rows through existing application behavior

### Requirement: Evidence identifies the actual Empty State source

The audit SHALL identify the Simple, Customize and Basic SVG entries in the Basic elements archive and preserve them byte-for-byte. The two components' audits MUST retain independent counts, checks and findings disposition. Custom foreground/background combinations remain consumer-validated.

#### Scenario: A maintainer traces the corrected text

- **WHEN** the maintainer follows the Empty State source and production evidence
- **THEN** the original Gray 200 source paint is discoverable in the Basic elements archive and the accessible text is explicitly identified as a repository semantic decision
