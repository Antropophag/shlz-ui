## Why

SHLZ UI ships reusable file and document rows, but `Documents.svg` also defines an enclosing upload/drop composition that has no public implementation. Consumers therefore lack a consistent, accessible framework-neutral seam for selecting or dropping files while preserving ownership of validation and upload lifecycle.

## What Changes

- Add a framework-neutral File Upload / Drop Zone built around a native file input and source-backed empty, drag-active, populated, disabled, and error presentation.
- Add a small progressive-enhancement controller for drag state and typed file-selection/drop notifications without owning transport, persistence, validation policy, or queue data.
- Compose existing File Row / Document Row primitives for consumer-rendered selected files rather than duplicating their contracts.
- Add documentation, package exports, Showcase and plain-HTML fixtures, a real application consumer, audit inventory, occurrence guards, and focused runtime/accessibility/visual/responsive evidence.
- Do not modify `shlz-design-source/`, implement network upload, invent progress semantics, or create a framework adapter.

## Capabilities

### New Capabilities

- `forms/file-upload`: Native-input markup, drop-zone presentation, progressive enhancement, event contract, accessibility, consumer ownership, and component-gate acceptance.

### Modified Capabilities

None.

## Impact

Adds styles under `packages/styles`, optional behavior and exports under `packages/behaviors`, component documentation and audit manifests, Showcase/Data Workspace/plain-HTML consumers, structural tests, and focused Playwright coverage. The change is additive and has no external dependency or breaking migration.
