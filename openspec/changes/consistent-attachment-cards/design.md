## Context

See proposal.md for motivation. The affected templates are apps/showcase/src/composer-showcase.js and file-upload-showcase.js. The accepted comparison uses existing shlz-file-row markup with real SVG visuals and bounded flex cards in comment-feed.css. Composer currently omits the visual; File Upload uses an emoji and both attachment containers use growing grid tracks. Metadata is overridden to primary text in both scoped styles.

## Goals / Non-Goals

**Goals:** Reuse existing framework-neutral File Row styles and icon assets; align the two affected compositions and their dynamic rendering.

**Non-Goals:** No new framework adapter, global File Row sizing change, Comment Feed redesign, editor feature, upload service or replacement source asset.

## Decisions

- Keep the base File Row contract intact; scope compact wrapping to Composer and File Upload attachment containers. Global width changes could regress unrelated rows; adding a new package or public component is unnecessary.
- Reuse source-derived SVG icons, resolving the final extension case-insensitively with a generic fallback. Share a small showcase-local resolver only if both affected templates need it; do not introduce a public renderer API. Preserve safe text insertion for dynamic names.
- Retain current actions and metadata meaning. Use the established accessible supporting text color to restore secondary hierarchy, with measured contrast during validation. Do not add removal actions to Composer merely because another fixture has them.
- Source facts: Комментарии.svg contains stroked rectangles at x=524.5/y=740.496 and x=762.5/y=740.496, each width=229, height=54, rx=11.5. These are SVG stroke-center geometry, not CSS outer dimensions. Current Comment Feed CSS uses 229px card width; reproducing that width in the affected compositions is a repository decision, not a claim that it exactly equals the source outer border. Documents.svg confirms a 230×55 filled hover body at (100,641), rx=12, and inset 229×54 stroke rectangles; its SHA-256 is b2be2ccea150ae49fb8363eae648bede428cace071d9783ce30f15c9c338bfdb.
- Raw sources are available in /home/antropophag/code/shlz-ui/shlz-design-source/, but absent in the new worktree. Read the originals there without modifying or regenerating them. Capture relevant source crops for implementation validation.

## Risks / Trade-offs

- [Long names become ellipsized sooner] → Preserve complete text in DOM and verify localized/unbroken names at 320px and desktop widths.
- [Actions or icons shrink] → Bound text flex sizing and check focused component crops with existing actions.
- [Static examples improve but live selections drift] → Exercise runtime selection and removal in the actual File Upload consumer.
- [Empty placeholder mistaken for an attachment] → Preserve existing empty-state meaning; do not assign a known file type to placeholder copy.

## Migration Plan

No public API migration or dependency changes. Apply scoped CSS and fixture/consumer markup together; rollback together if regressions occur. Inventory repository-wide occurrences and update affected Composer, File Upload and nested File Row audit evidence. Validate runtime, accessibility, focused visual/source fidelity, responsive content stress and at least one live consumer per affected composition. Record exact counts, limitations and independent review results before an unmerged PR is delivered.
