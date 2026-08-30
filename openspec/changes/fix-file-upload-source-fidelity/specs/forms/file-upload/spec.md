## Purpose

Defines an accessible framework-neutral surface for selecting or dropping local files while preserving the authoritative SHLZ composition and leaving validation, queue state, transport, and persistence to consumers.

## ADDED Requirements

### Requirement: Native file selection foundation

File Upload SHALL use a consumer-authored native file input associated with a visible full-surface label. It SHALL preserve native `accept`, `multiple`, disabled, form, keyboard, and accessible-name behavior without rendering or retaining consumer files.

#### Scenario: User activates the drop surface

- **WHEN** a pointer or keyboard user activates the visible drop surface
- **THEN** the associated native file input receives ordinary platform activation and the consumer receives its native change event after selection

#### Scenario: Upload is disabled

- **WHEN** the native input is disabled
- **THEN** the complete visible surface communicates its disabled state and neither activation nor dropping emits a library file event

### Requirement: Source-backed visible composition

The default File Upload surface SHALL reproduce the `Documents.svg` Upload-Drag composition as one 467×102 dashed surface containing the cloud-upload mark and one centered instruction, with no visually separate action pill. The root SHALL remain fluid up to the source width, and narrow or enlarged-text presentation SHALL reflow without clipped text or focus indication.

#### Scenario: Default specimen is rendered

- **WHEN** File Upload has ordinary available inline space
- **THEN** its surface is 467px wide by 102px high, its icon and instruction are centered as one composition, and no separate button-shaped action is shown

#### Scenario: Available width is narrow

- **WHEN** the containing block is narrower than 467px or text is enlarged to 200 percent
- **THEN** the surface contracts to the container, the instruction wraps as needed, and activation and focus remain fully visible without horizontal overflow

### Requirement: Optional file-drop enhancement

The optional enhancement SHALL accept files from a real browser drop, expose a real drag-active visual state, and emit one bubbling file event containing the original `FileList`, source (`input` or `drop`), and input element. It MUST reject non-file drags and MUST NOT synthesize an input value, upload files, or replace the consumer's native change handler.

#### Scenario: Files are dropped

- **WHEN** a user drags files over an enabled enhanced surface and drops them
- **THEN** drag-active state is cleared and one bubbling file event exposes the dropped `FileList` with source `drop`

#### Scenario: Non-file data is dragged

- **WHEN** a drag contains no file item
- **THEN** the surface does not enter file drag-active state or emit a file event

#### Scenario: Enhancement is repeated and destroyed

- **WHEN** enhancement is requested repeatedly and later destroyed
- **THEN** duplicate listeners are not installed and destruction removes library listeners and transient state without deleting consumer markup

### Requirement: Consumer-owned file composition

Selected-file content SHALL remain consumer-authored and MAY compose File Row or Document Row beneath the drop surface. The component MUST NOT infer validation, deduplication, preview, removal, progress, retry, transport, cancellation, persistence, or announcement state.

#### Scenario: Consumer renders selected files

- **WHEN** a consumer handles selected or dropped files and renders classified file rows
- **THEN** the enclosing upload composition remains coherent without retaining a library queue or inventing upload lifecycle state

#### Scenario: Consumer displays an error

- **WHEN** a consumer marks the upload invalid and provides an identified error message
- **THEN** the surface exposes the error relationship and error treatment without replacing the consumer's validation text

### Requirement: File Upload verification gate

File Upload SHALL remain below `VERIFIED` until every repository occurrence is classified and source integrity, structural contract, runtime interaction, accessibility, focused visual fidelity, consumer integration, and responsive/content-stress evidence pass independently.

#### Scenario: Complete evidence permits verification

- **WHEN** source geometry, native activation, real file drag/drop, events, disabled/error/focus presentation, selected-file composition, narrow layout, enlarged text, plain HTML, and a real application consumer all pass without a blocking finding
- **THEN** the component may be recorded as `reusable / VERIFIED` with exact occurrence counts and limitations
