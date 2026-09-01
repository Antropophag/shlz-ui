## Why

The source exports contain a recurring composer and rich-text-toolbar visual language, and the normalized editor icons already exist, but consumers have no framework-neutral production component for composing formatted content. This change supplies that missing UI boundary without promoting static artwork into an unsupported editor engine or messaging model.

## What Changes

- Add a framework-neutral Rich Text Toolbar with source-backed command groups, native button semantics, pressed/disabled states, and documented keyboard ownership.
- Add a Composer shell that composes the toolbar with a consumer-provided editing surface and optional attachment/action regions.
- Reuse normalized editor icons and existing Button/File Row/Document Row primitives where their contracts apply.
- Add semantic Showcase fixtures, one real consumer, documentation, audit manifests, repository-wide occurrence classification, and runtime/accessibility/visual/responsive evidence.
- Exclude an editor engine, document model, command execution, sanitization, mentions, undo/redo, collaboration, persistence, upload lifecycle, message delivery, and framework adapters.

## Capabilities

### New Capabilities

- `forms/rich-text-toolbar`: Presentational toolbar and command-control contract for consumer-owned rich-text editing surfaces.
- `forms/composer`: Structured composer shell that combines the toolbar, a consumer-provided editing surface, and optional supporting regions.

### Modified Capabilities

None.

## Impact

The public `@shlz/styles` contract gains additive component selectors and documentation. Showcase, one real application consumer, audit manifests, focused structural tests, and Playwright evidence gain classified occurrences. Existing normalized icons are reused; no dependency, behavior package, source asset, existing selector, or framework adapter changes.
