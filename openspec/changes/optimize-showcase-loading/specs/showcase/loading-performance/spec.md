## Purpose

Define how the SHLZ documentation showcase loads heavy component and fidelity material progressively while preserving navigation, accessibility, evidence availability, and measurable initial-load performance.

## ADDED Requirements

### Requirement: The initial showcase shell is independently usable

The showcase SHALL render its header, primary navigation, search control, and above-the-fold foundations without waiting for deferred component, consumer, or fidelity modules. The initial shell SHALL expose meaningful content and SHALL NOT substitute a blank page or full-screen loading gate.

#### Scenario: Open the showcase without a section hash

- **WHEN** a user opens the showcase root on an empty cache
- **THEN** the shell, navigation, search, and foundations become available before any deferred documentation section is required

#### Scenario: Use the initial shell with assistive technology

- **WHEN** a deferred section has not yet loaded
- **THEN** the initial document retains a valid heading structure, named navigation and search control, and no focusable inert placeholder controls

### Requirement: Requested sections load on demand

The showcase SHALL load and render a deferred section when it is requested through navigation, search, or a direct hash. A successful load SHALL preserve the existing section identifier and SHALL initialize that section's interactive examples exactly once.

#### Scenario: Follow a navigation link to a deferred section

- **WHEN** a user activates a showcase navigation link whose target is not loaded
- **THEN** the corresponding section is loaded, rendered, enhanced once, and brought into view without requiring a page reload

#### Scenario: Open a direct hash deep link

- **WHEN** the showcase starts with a hash that identifies a deferred section or a documented descendant within it
- **THEN** the owning section is loaded before hash-target reveal and the target remains addressable by its existing identifier

#### Scenario: Search for a deferred section

- **WHEN** a search result selects documentation that has not loaded
- **THEN** the owning section is loaded and the requested result receives the same navigation treatment as an already-rendered result

### Requirement: Deferred loading communicates progress and failure

The showcase SHALL expose a named, non-blocking loading state while a requested section is in flight and an actionable error state if the section cannot load. Retrying SHALL not duplicate successfully initialized content or event handlers.

#### Scenario: A requested section is loading

- **WHEN** a section request has not completed
- **THEN** the section boundary communicates its busy state without moving focus unexpectedly or hiding the usable shell

#### Scenario: A requested section fails and is retried

- **WHEN** a deferred module request fails and the user activates retry after the resource becomes available
- **THEN** the error is cleared, the section loads once, and its existing navigation target and interactive behavior are restored

### Requirement: Audit-only references stay outside the initial request set

The showcase SHALL NOT request generated source-reference SVGs or the complete fidelity-reference manifest during an empty-cache root load before a fidelity or source-reference section is requested. When such a section is requested, every reference and evidence fixture available before this change SHALL remain reachable.

#### Scenario: Load the root page without requesting fidelity evidence

- **WHEN** an empty-cache browser loads the showcase root and does not navigate to fidelity material
- **THEN** no network request is made for a generated source-reference SVG or the complete fidelity-reference manifest

#### Scenario: Request fidelity evidence

- **WHEN** a user opens a fidelity or source-reference section
- **THEN** the relevant source images, captions, provenance, and production comparison fixtures load without reducing the pre-change evidence inventory

### Requirement: Loading improvements are reproducible and budgeted

The repository SHALL generate a deterministic production-build report that distinguishes entry/initial assets from deferred assets and binds measurements to the candidate build. Relative to the clean current-main baseline captured before implementation, the candidate SHALL reduce uncompressed initial JavaScript by at least 30 percent, SHALL introduce no initial source-reference requests, and SHALL NOT increase initial CSS or font transfer bytes by more than 2 percent.

#### Scenario: Measure the clean baseline and candidate

- **WHEN** the measurement command runs against the recorded baseline and candidate production builds
- **THEN** it reports comparable asset identities and byte totals, verifies the required reduction and ceilings, and fails on missing, stale, or mismatched build evidence

#### Scenario: Build consumer packages

- **WHEN** the repository builds and packs the public SHLZ packages after the showcase optimization
- **THEN** their export surfaces and package-consumer smoke behavior remain unchanged because showcase-only chunks are not public package inputs

### Requirement: Progressive loading preserves showcase behavior

The showcase SHALL preserve keyboard navigation, focus behavior, typography switching, responsive layout, search, existing component interactions, and visual fidelity for loaded content. Loading a deferred section SHALL not cause an avoidable layout shift above its reserved boundary.

#### Scenario: Exercise representative behavior before and after loading

- **WHEN** automated browser checks use the shell and representative deferred interactive components across desktop, narrow viewport, keyboard-only, and enlarged-text conditions
- **THEN** the checks pass with stable focus, usable navigation, no duplicate enhancement, and no scope-local accessibility regression

#### Scenario: Compare focused visuals

- **WHEN** focused snapshots are captured for the initial shell, loading state, error state, and representative loaded documentation
- **THEN** source-backed component rendering remains unchanged and the shell does not shift unexpectedly when deferred content is inserted
