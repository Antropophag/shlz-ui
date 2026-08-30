## Context

See `proposal.md` and `specs/forms/file-upload/spec.md`. The repository already provides File Row and Document Row, while Wave 11 proves that the enclosing Upload / Document family has no production root. `Documents.svg` is the sole visual authority for the upload surface; its static frames do not define transport or validation behavior.

## Goals / Non-Goals

**Goals:**

- Preserve native input/form semantics and work in plain HTML, PHP, Vue templates, and other renderers.
- Hide drag-event filtering, active-state synchronization, idempotent enhancement, typed event construction, and teardown behind a small controller.
- Reuse existing file/document row contracts and complete every applicable component-gate evidence level.

**Non-Goals:**

- Network upload, queue rendering, validation policy, preview generation, progress, retry, cancellation, persistence, or a JavaScript rendering runtime.
- Programmatically assigning `input.files`, inventing source states, or modifying `shlz-design-source/`.

## Decisions

### Use consumer-authored native markup as the public seam

The external interface is a documented `.shlz-file-upload` composition containing a native file input, associated label/trigger, instructions, optional error, and consumer-rendered file list. CSS owns layout and paint.

Alternative: a custom element that renders the input and queue. Rejected because it would own templating, file state, form association, and framework reconciliation without a demonstrated need.

### Enhance only drag/drop and normalized notifications

`FileUploadController` validates one root/input relationship, listens for native input change and file-only drag events, synchronizes a transient data state, emits `shlz:file-upload-files`, and supports idempotent enhancement and destruction. It never assigns files to the input or retains them.

Alternative: CSS-only drop presentation. Rejected because correct file-only filtering, drop notification, teardown, and real interaction evidence require a bounded behavior seam.

### Keep queue and lifecycle consumer-owned

The consumer renders File Row / Document Row children and supplies error/status text. This keeps MIME/size policy, deduplication, progress, transport, cancellation, and persistence outside the design system.

Alternative: expose a mutable upload queue model. Rejected because static source supplies no lifecycle contract and the repository avoids application data ownership.

### Treat source states conservatively

Exact recoverable dashed geometry, spacing, surface paint, and represented empty/populated arrangements come from `Documents.svg`. Drag-active, disabled, error, responsive reflow, focus-visible, and accessibility behavior are repository decisions and are labeled accordingly in the audit contract.

## Risks / Trade-offs

- [Browser drag events are difficult to automate faithfully] → Test actual `DataTransfer` file payloads and read active computed styles within the same interaction flow.
- [Hidden native input can lose accessibility] → Keep it operable and label-associated using the repository's visually-hidden pattern; test keyboard activation and accessible naming.
- [Consumers may expect an uploader] → Name and document the lifecycle boundary prominently and expose only files-received notifications.
- [Long file content can overflow] → Compose existing stressed row primitives and add narrow/text-scale evidence for the enclosing surface.

## Migration Plan

This is additive. Existing consumers require no changes. Rollback removes the new exports, styles, fixtures, tests, and audit entries without changing existing row primitives or source material.
