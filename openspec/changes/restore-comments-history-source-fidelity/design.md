## Context

`add-messaging-history-components` shipped a generic Message Thread and History Timeline and was merged in PR #57. Its Message Thread manifest correctly names `Messages.svg`, but the showcase currently stands in for the product's comments experience even though `Комментарии.svg` is a separate authoritative export. History Timeline names the correct source file but its current rail/avatar composition omits the structured event treatments visible in that source.

The primary inputs are immutable raw SVG exports: `Комментарии.svg` (8480×2830, SHA-256 `20e2dc809b8fa832cc73bd078abd57678c9614a70da7dbf376ab1a1f25458a88`) and `History of changes.svg` (873×1558, SHA-256 `83d8c9ab89fa7c3677ed6d4105a150f55676bcf732160892b06773d6d4ac0e76`). Derived inventories help locate frames but cannot override the SVG. The source sheets are desktop/static evidence and do not by themselves define data behavior, mutations, responsive layout, or accessibility semantics.

## Goals / Non-Goals

**Goals:**

- Recover the exact reusable visual grammar represented by Comments and History without copying their surrounding application shell.
- Keep Comments, Messages, and History as independently sourced and independently auditable capabilities.
- Preserve framework-neutral HTML/CSS consumption and existing verified primitives at composition seams.
- Make every fidelity claim traceable to a named SVG frame and every extrapolation visibly classified as a repository decision.

**Non-Goals:**

- Improving or modernizing the Figma design.
- Treating the critique, existing screenshots, or an application implementation as visual authority.
- Recreating navigation, ticket header/tabs, search orchestration, or other full-screen chrome from `Комментарии.svg`.
- Inferring comment submission, attachment upload, history generation, filtering, sorting, permissions, or persistence from static artwork.
- Converting incidental screen geometry into global tokens.

## Decisions

### 1. Comment Feed is new; Message Thread is not repurposed

The repository keeps `data-display/message-thread` and its `Messages.svg` authority intact. A new `data-display/comment-feed` capability owns only the reusable comment-list/composer presentation extracted from `Комментарии.svg`. Showcase navigation and documentation name both explicitly so a consumer cannot mistake chat/message directionality for case comments.

Changing Message Thread's authority to Comments was rejected because it would erase the distinct Messages source and silently redefine an existing public contract. Styling Message Thread until it resembles Comments was rejected for the same reason.

### 2. A frame contract is produced before component code

Before changing CSS or markup, implementation records a compact source contract for each selected frame: source hash, frame identity/crop, component boundary, observed bounding boxes, spacing, typography, fills/strokes/radii, content variants, and composed primitives. Each entry is classified as `source-fact`, `derived-pattern`, `repository-decision`, or `unknown`.

Measurements come from the raw SVG/XML and visually checked crops. Derived JSON may locate candidates but never supplies the final value when it conflicts with SVG. The contract excludes page coordinates, application-shell dimensions, and one-off connector geometry outside the reusable boundary.

Implementing from a screenshot by eye was rejected because it cannot distinguish exact source values from scaling artifacts. Promoting every repeated number to a token was rejected because repetition in a screen export does not prove system semantics.

### 3. Comment Feed extracts the white content-panel composition, not the screen

The reusable boundary begins with the ordered comments content and includes source-observed author/avatar/date rows, bodies, mentions, file-card groups, attachment summary/action, and composer shell states. Header tabs, ticket identity, global navigation, user profile, and page search remain application-owned even when visible in the source.

Markup uses native lists, `article`, `time`, links, form fields, and buttons. Existing Avatar, File Row/Document Row, Textarea, Button, Link, Tag, and icon assets are composed when their own source contracts fit; this change does not duplicate or inherit their audits. A mismatch at a primitive seam is recorded rather than locally restyled into a hidden fork.

### 4. History is content-led and variant-driven

History entries expose additive presentation hooks for the source-observed content kinds: creation, status transition, quoted comment, field transition, tag collection, employee collection/disclosure, and attachment. Actor/action phrasing and time remain visible metadata, while the event payload keeps its native source structure.

The current native list and consumer-owned DOM order remain. Existing generic entry markup stays readable as a fallback, but it no longer serves as the focused source fixture. The rail/current-dot/avatar design is removed from the source fixture unless raw SVG inspection proves the corresponding element inside the selected reusable frame; compatibility selectors are retained only when they do not distort the corrected presentation.

A domain-specific JavaScript event renderer was rejected because the design system does not own audit data or event generation. One undifferentiated description slot was rejected because it cannot reproduce the source's visible value structures.

### 5. Desktop fidelity and responsive decisions are tested separately

Focused desktop fixtures use the source content and component boundary at the authoritative frame size. Tests compare exact computed geometry/style for stable source facts and take component-level snapshots; broad showcase screenshots cannot pass this gate.

Narrow layout, 200% text, long localization, missing optional content, and focus treatment remain required, but their values are repository decisions derived from accessibility and containment needs. Tests and manifests label them separately from Figma evidence. Responsive rules preserve order, grouping, and visual hierarchy without claiming a mobile source that does not exist.

### 6. Audit status is revoked and restored per component

At implementation start, Comment Feed is `INVENTORIED` and History Timeline becomes `FINDINGS` with the exact mismatch recorded. The repository-wide census classifies executable fixtures, consumers, inert diagnostics, native/legacy substitutes, and any remaining Message Thread use. Completion requires each manifest's exact counts, source integrity, structural contract, runtime/native actions, accessibility, focused visuals, stress behavior, and at least one real consumer.

Message Thread remains independently assessed; finishing Comment Feed or History cannot alter its status. Existing PR #57 snapshots are retained only when useful as regression history and are replaced as current evidence where they prove the wrong composition.

## Risks / Trade-offs

- **[Full-screen geometry leaks into the library]** → Freeze the component boundary in the frame contract before coding and exclude navigation/header/tab coordinates.
- **[Comments and Messages are conflated again]** → Give each its own public name, source file, docs, manifest, fixtures, and occurrence IDs; reject cross-family evidence reuse.
- **[History variants become a domain model]** → Export semantic presentation slots and native markup examples, not event parsing, storage, or mutation logic.
- **[A shared primitive conflicts with the source]** → Record the seam and route a separate shared-contract correction if needed; do not create a local visual fork or waive the discrepancy.
- **[Responsive choices are presented as Figma facts]** → Label every non-exported narrow/zoom rule as a repository decision in the contract, tests, and manifest.
- **[Compatibility fallback preserves the wrong look]** → Keep old markup readable, but make the corrected structured fixture and consumer the fidelity authority; document migration to richer slots where visual equivalence needs them.

## Migration Plan

1. Inventory all repository occurrences and mark current History focused-visual evidence as a finding without changing `shlz-design-source/`.
2. Extract and review the exact Comments and History frame contracts from the raw SVGs.
3. Add Comment Feed markup/styles/docs and update History Timeline with additive structured event parts, composing existing primitives where contracts agree.
4. Migrate showcase, plain-HTML fixture, and Data Workspace consumer examples while keeping Message Thread as a separate Messages-derived example.
5. Run focused desktop fidelity, runtime/accessibility, narrow/content-stress, occurrence, package, and clean-consumer checks; inspect desktop and narrow snapshots in one bounded pass.
6. Update manifests and the Wave 12 report with exact counts, facts, decisions, findings, limitations, CI, and review status. Restore each component's status only if its own completion gate passes.

Rollback removes the new Comment Feed export/fixtures and restores the prior History implementation and evidence from Git. No source asset or consumer data migration is involved.
