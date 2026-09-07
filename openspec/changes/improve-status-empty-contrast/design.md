## Context

Baseline main is f2a4882. Live Chromium measurement found six Status pairs below 4.5:1 (green 3.020, bright-green 3.125, orange 2.633, cyan 3.010, pink 4.226 and neutral 2.555), plus Empty/Simple title and Empty/Basic description at 2.785 on white. Source inspection confirms the paints in Status.svg and the three Basic-elements Empty component SVG entries; the Empty State manifest currently misidentifies Interface elements as authority.

## Goals / Non-Goals

Improve active text in these two bounded families without changing backgrounds, geometry, typography, public markup, controllers, Badge, source tokens or source archives. Cross-engine certification and a real external application pilot are later tasks. GitLab activation is deferred by the user.

## Decisions

### Status foregrounds

Add `semantic.color.status-foreground` with six paint-named roles. For each failing source foreground, multiply its sRGB channels by the largest whole percentage that produces at least 4.75:1 on all four supported composited backgrounds, rounding channels to integers. This engineering margin exceeds the public 4.5:1 requirement. Literal hex outputs avoid introducing a runtime color algorithm or a new CSS color-function dependency. The percentages and hues are repository decisions, not new source facts or global status meanings.

| Role         | Source  | Source share | Production | Minimum derived ratio |
| ------------ | ------- | ------------ | ---------- | --------------------- |
| green        | #57965C | 70%          | #3D6940    | 4.822                 |
| bright-green | #25983E | 72%          | #1B6D2D    | 4.780                 |
| orange       | #D47E2E | 65%          | #8A521E    | 4.824                 |
| cyan         | #4191B3 | 70%          | #2E667D    | 4.782                 |
| pink         | #A942A7 | 85%          | #90388E    | 4.794                 |
| neutral      | #939CA5 | 70%          | #676D74    | 4.795                 |

Status backgrounds remain source paints at 15% opacity over the containing surface, except opaque Gray 50 for neutral. Orange retains its independently observed #DE753D background. Blue, source-blue and purple keep their original foregrounds. Using one neutral foreground for every family was rejected because it would discard hue identity. Recoloring source tokens was rejected because they are immutable observed facts.

### Empty State supporting text

Reuse `semantic.color.text.supporting-accessible` (60% Dark Blue) for secondary titles and every description. Keep primary titles and illustration colors unchanged. Avoid adding a redundant global text role. Correct the source archive reference to Basic elements, including the inventory family.

### Verification and execution

One bounded M episode has two component slices followed by shared integration. The main agent owns source interpretation, semantic choices and implementation; a lighter read-only agent inventories occurrences. Independent review follows after the candidate is built. No packet graph is needed.

Test public seams: browser-computed foreground/background contrast using the distributed stylesheet; optional-region and native-action DOM behavior; generated token parity and immutable raw source evidence. Use red → green slices for each component. A purpose-built browser oracle must reject exact baseline paint overrides and accept the candidate; finite-set verification covers nine Status members and four Empty State members, each across all four surfaces. Existing focused component and consumer tests retain geometry/behavior evidence. Inspect focused desktop/narrow/text-scaled views in bounded visual passes and update only explainable snapshots.

## Risks / Trade-offs

- Source-versus-production visual comparisons will differ in foreground → disclose the semantic correction in component documentation and Showcase and keep the original SVG side intact.
- Consumers can override CSS variables or use unsupported surfaces → document their contrast-validation responsibility and verify normal cascade behavior.
- Existing snapshots and historical tests encode source deviations → update current assertions with independent semantic expectations and preserve dated historical reports.
- Long labels retain pre-existing bounded layout contracts → test existing narrow/content stress; do not claim new wrapping or responsive APIs.

## Migration Plan

Ship additive token roles and the foreground correction with a patch changeset for tokens/styles. Existing markup requires no migration. Validate each component gate independently, review the complete diff and deliver an unmerged PR.
