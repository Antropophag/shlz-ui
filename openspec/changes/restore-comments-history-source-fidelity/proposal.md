## Why

The current showcase presents a generic Message Thread as comments and reduces History Timeline to an avatar rail, even though the authoritative Figma exports define a distinct Comments feed and a structured change-history composition. The component contracts and evidence must be corrected against the raw SVGs instead of treating an internally plausible implementation as proof of source fidelity.

## What Changes

- Establish `shlz-design-source/raw/svg/Комментарии.svg` as the sole visual authority for a new framework-neutral Comment Feed capability, independent from the existing Message Thread whose authority remains `Messages.svg`.
- Implement the source-observed Comment Feed anatomy and seven exported screen states: one left-aligned chronological stream, author/avatar/date presentation, comment text, mention treatment and suggestions, file-card composition, attachment summary/action, bottom composer shell, own-comment Edit/Delete affordance, other-comment Reply affordance, and composed add/delete/undo feedback.
- Correct History Timeline presentation against `shlz-design-source/raw/svg/History of changes.svg`, making the source-observed event content—creation, status transition, quoted comment, before/after field value, tags, employee chips with disclosure, and attachment card—the primary visible structure.
- Preserve native list semantics, DOM order, keyboard access, framework neutrality, and consumer ownership for data, chronology, mutations, uploads, replies, filtering, persistence, and business actions.
- Replace broad “looks similar” evidence with frame-bound source contracts, computed geometry/style assertions, focused desktop snapshots, responsive/content-stress evidence for repository decisions, and a complete repository-wide occurrence classification.
- Revoke the affected components' `VERIFIED` status while the mismatch is open and restore it independently only after each component completion gate passes.
- Keep `shlz-design-source/` read-only and record every non-source responsive or accessibility behavior explicitly as a design-system decision rather than a Figma fact.

## Capabilities

### New Capabilities

- `data-display/comment-feed`: Framework-neutral comments presentation derived specifically from the authoritative Comments SVG, separate from direct or asynchronous messaging.

### Modified Capabilities

- `data-display/history-timeline`: Replace the generic rail-first presentation contract with the structured event-content contract directly observed in the authoritative History of changes SVG while preserving semantic and consumer-owned boundaries.

## Impact

- Public styles and documentation: new Comment Feed selectors/docs/export; additive History Timeline event-part selectors and source-backed presentation corrections.
- Showcase and plain-HTML fixtures: distinct Comment Feed, Message Thread, and History Timeline examples with no source-role substitution.
- Existing consumers: current semantic History Timeline markup remains readable; source-specific structured variants are additive unless exact source reproduction proves a conflicting requirement that must be surfaced before implementation.
- Audit/evidence: component manifests, Wave 12 report/census, occurrence ledger, focused Playwright snapshots, accessibility/runtime checks, and consumer composition evidence.
- Design source: `Комментарии.svg` and `History of changes.svg` are read-only primary authority; `Messages.svg` remains authority only for Message Thread.
- Risks: conflating application-shell behavior with reusable presentation, inventing responsive geometry absent from desktop exports, overfitting a full screen instead of extracting a reusable composition, or preserving a generic abstraction that contradicts the source.
- Out of scope: messaging transport, editor commands, upload lifecycle, comment submission/reply behavior, change-log generation or filtering, application navigation/header/sidebar, and copying implementation from an existing corporate application.
