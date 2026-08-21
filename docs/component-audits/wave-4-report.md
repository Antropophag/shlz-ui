# Wave 4 — Status & Identity

Baseline: `9b46c9edd4502863ee0da15d7a3bb887839635d7` (merged PR #18). Branch: `audit/wave4-status-identity`.

## Family results

| Family     | Executable/content roots | Live roots | Data Workspace | Inert diagnostics | Result   |
| ---------- | -----------------------: | ---------: | -------------: | ----------------: | -------- |
| Status     |                       12 |          4 |              3 |                13 | VERIFIED |
| Badge      |                       12 |          0 |              0 |                 4 | VERIFIED |
| Tag        |                        3 |          0 |              0 |                 2 | VERIFIED |
| Person Tag |                        2 |          1 |              0 |                 2 | VERIFIED |
| Avatar     |                       13 |          2 |              0 |                 8 | VERIFIED |

Counts are observed DOM roots, not acceptance thresholds. The component manifests enumerate 16 Status, 12 Badge, 3 Tag, 3 Person Tag and 15 Avatar audit IDs. The shared occurrence guard fails on missing, duplicate or newly unclassified executable roots and on diagnostic-census drift; `#fidelity`, `.shlz-component-diagnostics` and `[inert]` are explicit diagnostic boundaries.

## Authority and boundaries

- Status is a persistent business-state label. `Status.svg` proves geometry and paint, not universal success/error semantics. Visible text and the consumer own meaning and live announcements.
- Badge is a contextual count or dot marker from Badge-Count/Badge-Dot. Parent actions own interaction and accessible naming.
- Tag is a non-interactive entity/category label with Filled and Stroke variants only.
- Person Tag is an identity composition with repeated decorative avatar, visible name and optional native remove button. It reuses Avatar presentation rather than duplicating its loader/initials contract.
- Avatar is a visual identity primitive: four circle sizes by image/text/icon. Identity naming changes by composition; no navigation, loader or extra tab stop is added.

These are repository decisions where stated. Exact dimensions, variants and paints are source facts; reusable paint families and content-driven widths are derived patterns. Domain mapping, initials generation, broken-image replacement and post-removal focus are consumer-owned assumptions/decisions, not source facts.

## Evidence

- `status-identity-wave4.spec.js` binds the five manifests to repository-wide occurrences, native semantics, exact Person Tag activation, Data Workspace composition, image/initial ownership and component-local stress.
- `interaction-evidence-wave35.spec.js` binds each manifest material-state ledger to computed paint. Status, Badge, Tag and Avatar use honest empty ledgers with concrete real-interaction/runtime N/A reasons; their default paint stays static evidence. Person Tag proves real hover, pointer-down active, keyboard focus-visible and disabled paint.
- Person Tag pointer click, Enter and Space each cause exactly one native click/removal. Disabled remains inert. The consumer owns state removal; no behavior package/controller was added.
- Long Cyrillic identity ellipsizes at 180px while Avatar/action remain fixed. Avatar sizes remain 24/32/40/64px and images retain `object-fit: cover`. Status remains a one-line label in narrow table context; Badge covers one, two and three-plus digits.
- Logical icons remain inherited presentation: remove paint follows its Button, status has no invented icon, and no Icons foundation change was required.

## Contrast and findings

The Wave 3.5 detector passes Badge count, Tag, Person Tag and Avatar initials. Exact Status source paints measure: blue 7.38, green 3.02, bright-green 3.13, orange 2.63, source-blue 5.85, purple 5.64, cyan 3.01, pink 4.23 and neutral 2.55. Six below-threshold pairs are recorded as `status-source-paint-contrast` (P3). They are source-backed, text still carries meaning, and Wave 4 does not silently recolor source authority. No P0/P1/P2 remains.

## Production/API/snapshots

Production CSS adds only bounded Person Tag label ellipsis plus remove active/disabled paint. Showcase adds one real consumer-owned removal flow and stable audit IDs. Public class additions: `.shlz-person-tag__label`; existing `.shlz-tag__remove` gains native `:active` and `:disabled` styling. There is no framework layer, controller, Avatar loader, generic Pill or semantic Status rename. Existing snapshots are unchanged.

Manual walk covered Status/Badge/Tag matrices, Data Workspace filtering, Avatar sizes/crop/flex pressure, Person Tag long name, pointer hover/down, Tab focus-visible, Enter, Space and disabled. Non-interactive families were not given fake interaction states.
