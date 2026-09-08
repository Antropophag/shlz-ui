## Why

The published Showcase reproduces thirteen groups of rounded-control defects: a visibly raised Small Switch thumb, incorrectly placed Select diagnostic text, inherited compact-tab heights, clipped localized labels, and consumer CSS that changes component geometry or typography. The user approved correcting the complete audited set in one unmerged PR.

## What Changes

- Restore source-backed sizes and centering for Switch, diagnostic Field/Select content, compact Tabs, and Badge specimens.
- Make Notification actions, short narrow notifications, Empty State buttons, and History labels retain readable content within their shells at 320/390/768/1440px and in both shipped typography profiles.
- Prevent Showcase headings/grid cells and native button defaults from overriding component typography or dimensions; include Advanced Input actions and Comment Feed text actions.
- Add browser regressions against the same rendered seams used by the audit, update affected occurrence/evidence manifests, and retain source/consumer distinctions.
- Preserve native semantics, runtime APIs, source assets, supported variants, interaction paints, and source-specific optical typography. Global font recentering and speculative Medium Advanced Input variants are outside scope.

## Capabilities

### New Capabilities

- `rounded-control-layout`: Source-backed geometry, text containment, profile inheritance, and Showcase isolation across the audited rounded-control seams.

### Modified Capabilities

None. Existing behavior and lifecycle specifications remain normative; the new visual-layout contract adds cross-component acceptance without replacing them.

## Impact

CSS in `packages/styles/components/{choice,field,tabs,notification,empty-state,history-timeline,comment-feed}.css`, Showcase layout CSS and bounded fixtures, focused browser/source tests, component documentation and audit manifests. Responsive/content behavior is explicit repository-owned policy layered over the immutable SVG geometry. No new dependency, framework coupling, data behavior, release policy, source edit, or application-specific UI authority is introduced.
