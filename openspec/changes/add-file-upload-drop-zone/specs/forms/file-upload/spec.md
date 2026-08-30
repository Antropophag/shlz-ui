## Purpose

Defines an accessible framework-neutral surface for selecting or dropping local files while leaving validation policy, upload transport, queue state, and persistence to consumers.

## ADDED Requirements

### Requirement: Native file selection foundation

The component SHALL use a consumer-authored native file input with an associated visible trigger and instructions. It SHALL preserve native `accept`, `multiple`, disabled, form, and accessible-name behavior without rendering or storing consumer files.

#### Scenario: Keyboard user selects files

- **WHEN** a keyboard user activates the visible upload trigger
- **THEN** the associated native file input receives ordinary platform activation and the consumer receives the resulting native change event

#### Scenario: Upload is disabled

- **WHEN** the native input is disabled
- **THEN** the trigger and drop surface communicate the disabled state and neither selection nor dropping emits a library file event

### Requirement: Optional drop enhancement

The optional enhancement SHALL accept files from a real browser drop, expose the real drag-active visual state, and emit one bubbling file event containing the original `FileList`, source (`input` or `drop`), and input element. It MUST reject non-file drags and MUST NOT synthesize an input value, upload files, or override the consumer's native change handler.

#### Scenario: Files are dropped

- **WHEN** a user drags files over an enabled enhanced zone and drops them
- **THEN** drag-active state is cleared and one bubbling file event exposes the dropped `FileList` with source `drop`

#### Scenario: Non-file data is dragged

- **WHEN** a drag contains no file item
- **THEN** the component does not enter the file drag-active state or emit a file event

#### Scenario: Enhancement is repeated and destroyed

- **WHEN** enhancement is requested repeatedly and later destroyed
- **THEN** duplicate listeners are not installed and destruction removes library listeners and transient state without deleting consumer markup

### Requirement: Source-backed presentation and composition

The component SHALL provide source-backed empty and populated presentation, dashed drop-surface geometry, drag-active, disabled, error, long-content, and narrow-container states. Selected-file content SHALL be consumer-authored and MAY compose existing File Row or Document Row primitives; the upload component MUST NOT duplicate their item contract.

#### Scenario: Consumer renders selected files

- **WHEN** a consumer handles selected or dropped files and renders File Row or Document Row children
- **THEN** the enclosing upload surface remains coherent and does not infer upload progress or file status

#### Scenario: Error is displayed

- **WHEN** a consumer provides an identified error message and marks the upload invalid
- **THEN** the surface exposes the error relationship and source-compatible error treatment without replacing the consumer's validation text

#### Scenario: Content is narrow or enlarged

- **WHEN** instructions, filenames, or errors are long at a narrow viewport or enlarged text scale
- **THEN** content wraps without clipping the native trigger, file actions, or focus indicators

### Requirement: Consumer lifecycle ownership

Consumers SHALL own file acceptance policy, validation, deduplication, previews, removal decisions, upload progress, retry, transport, cancellation, persistence, announcements, and rerendering. The library SHALL retain no file or queue state after emitting its documented event.

#### Scenario: Consumer rejects a file

- **WHEN** a consumer rejects a selected file by its own policy
- **THEN** the consumer can render its error and queue state without mutating undocumented library state

### Requirement: File Upload audit acceptance

The component SHALL remain below `VERIFIED` until every repository occurrence is classified and source integrity, structural contract, real runtime interaction, accessibility, focused visual fidelity, consumer integration, and responsive/content-stress evidence pass independently.

#### Scenario: Complete evidence permits verification

- **WHEN** source traceability, native selection, real file drag/drop, events, disabled/error behavior, focus, composition, narrow layout, long content, plain HTML, and a real application consumer all pass without a blocking finding
- **THEN** the component may be recorded as `reusable / VERIFIED` with exact occurrence counts and limitations
