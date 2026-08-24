## Why

The Showcase Sidebar / Application Shell is the last application-local composition before the source-only roadmap waves, but it remains `INVENTORIED`: its existing page-level implementation has only partial accessibility, keyboard, visual, responsive, and occurrence evidence. Wave 9 establishes a bounded, source-traceable contract for the actual Showcase shell without promoting it into a reusable design-system component.

## What Changes

- Audit `Sidebar.svg` and `Header.svg` directly and record facts, derived patterns, repository decisions, and unknowns separately.
- Reconcile the existing Showcase shell with opened/closed sidebar, active/default navigation item, header default/hover/typing/filled, desktop, and narrow/content-stress contracts.
- Census and classify every repository-local shell, sidebar, header, substitute, fixture, diagnostic, and live consumer occurrence.
- Add a dedicated manifest, source/structural/runtime/accessibility/focused-visual/consumer/responsive evidence, and a Wave 9 report; update the project inventory only when the bounded gate passes.
- Keep Button, Link, Avatar, Tooltip, and other verified primitives as regression dependencies.
- Exclude a reusable App Shell/Sidebar package, routing, authorization, portal-specific navigation, unsupported responsive semantics, or any change under `shlz-design-source/`.

## Capabilities

### New Capabilities

- `application-compositions/sidebar-application-shell`: Bounded Showcase shell composition, source-derived states, ownership boundaries, occurrence classification, and completion evidence.

### Modified Capabilities

None.

## Impact

The change may affect the application-local Showcase markup/styles/interaction seam, focused Playwright and source/census tests, audit manifest/inventory/reporting, and the Showcase navigation consumer. It adds no framework-neutral package export or reusable public API. The authoritative SVGs remain read-only, and verified primitives remain compatibility boundaries rather than re-audit targets.
