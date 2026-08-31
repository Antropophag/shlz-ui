## Purpose

Provides a structured, framework-neutral composer shell around a consumer-owned editing surface, toolbar, supporting content, and actions.

## ADDED Requirements

### Requirement: Composer provides structured regions without owning an editor

The styles package SHALL support a Composer root with optional label/help, toolbar, editing-surface, attachments, status, and actions regions. The editing-surface region SHALL accept a consumer-provided textarea, contenteditable element, or editor mount point without changing that surface's value or document model.

#### Scenario: A consumer mounts its editor

- **WHEN** a labelled editing surface is placed in the Composer editing-surface region
- **THEN** the Composer supplies layout and visual containment while the consumer retains editor semantics and behavior

### Requirement: Composer states remain semantic and externally controlled

Composer SHALL visually support focus-within, invalid, disabled, and read-only presentations only when the consumer supplies the corresponding native or ARIA state on the editing surface and documented state hook on the root. Styling SHALL NOT imply that a nested editor engine has enforced those states.

#### Scenario: Consumer reports invalid content

- **WHEN** the editing surface exposes `aria-invalid="true"` and references an error message
- **THEN** the Composer displays its invalid presentation and preserves the programmatic relationship to the message

#### Scenario: Consumer makes the surface read-only

- **WHEN** the consumer applies the editing surface's supported read-only semantics and the documented Composer state hook
- **THEN** the Composer displays the read-only presentation without disabling unrelated actions implicitly

### Requirement: Supporting regions compose existing controls

The attachments and actions regions SHALL accept existing SHLZ primitives or semantic consumer controls. Composer SHALL NOT own file selection, upload lifecycle, attachment removal, submit/send behavior, pending state, validation rules, persistence, or error recovery.

#### Scenario: Attachments and submit action are provided

- **WHEN** a consumer places classified attachment rows and a native submit button in their documented regions
- **THEN** each nested control retains its existing semantics and behavior contract

### Requirement: Composer preserves content at bounded narrow widths

Composer SHALL fit its container, permit editing content and supporting copy to wrap, allow the editing region to grow to its documented maximum before consumer-owned overflow behavior applies, and stack supporting regions when their inline layout no longer fits.

#### Scenario: Composer is rendered with long content in a narrow container

- **WHEN** labels, help text, attachments, or actions exceed the available inline space
- **THEN** content remains visible, controls remain operable, and the component introduces no horizontal page overflow
