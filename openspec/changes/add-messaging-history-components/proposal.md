## Why

Wave 12 proved the source boundaries and repository absence for Messaging and History, but left both families without reusable implementations. The next safe product step is to introduce small framework-neutral presentation modules for message threads and activity history while keeping synchronization, persistence, editor behavior, audit policy, and domain actions consumer-owned.

## What Changes

- Add a semantic Message Thread module composed from generic message items, author metadata, timestamps, body content, attachment slots, delivery metadata, and empty/loading-safe presentation.
- Add a semantic History Timeline module for consumer-ordered activity entries with actor, timestamp, description, metadata, attachment slots, grouping labels, and empty/loading-safe presentation.
- Keep both modules CSS-first and usable from plain HTML, PHP, Vue, and future adapters without a JavaScript rendering runtime.
- Reuse existing Avatar, File Row, Document Row, Link, and typography primitives without inheriting their audit status.
- Add public styles, documentation, plain-HTML fixtures, Showcase fixtures, one real Data Workspace consumer per module, source traceability, audit manifests, occurrence guards, accessibility/browser coverage, content stress, and focused visual evidence.
- Exclude rich-text composition, message delivery/read semantics, synchronization, pagination, moderation, history ordering policy, filtering, persistence, live updates, and application shells.
- Keep `shlz-design-source/` unchanged.

## Capabilities

### New Capabilities

- `data-display/message-thread`: Framework-neutral semantic message thread and message-item presentation, consumer ownership, responsive behavior, and completion evidence.
- `data-display/history-timeline`: Framework-neutral semantic activity history timeline, consumer ownership, responsive behavior, and completion evidence.

### Modified Capabilities

None.

## Impact

The change adds independent CSS modules and package exports under `packages/styles`, documentation, Showcase and Data Workspace compositions, plain-HTML fixtures, component audit manifests, structural/source tests, and focused Playwright coverage. No behavior package export, framework adapter, network dependency, storage model, editor engine, notification mechanism, or application-domain API is introduced. Existing consumers remain compatible because the change is additive.
