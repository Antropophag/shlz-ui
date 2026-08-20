# Wave 3 — Actions & Navigation audit

Baseline: `f5b48fdd0a1f904c973d5477fa1eebf93c88464d` (merged PR #16). Audit branch: `audit/wave3-actions-navigation`. The baseline worktree and `shlz-design-source/` were clean; no open PR existed. Old Pagination and Select worktrees and legacy remote branches were inventoried but no unfinished change was imported.

## Occurrence census

The built Showcase census at 1440×900 found the following styled DOM occurrences. Counts are observations, not guard thresholds; the shared guard classifies semantically stable executable/live roots and rejects a newly unclassified legacy selector.

| Family     | Total | Executable | Inert diagnostics | Live consumers | Data Workspace |
| ---------- | ----: | ---------: | ----------------: | -------------: | -------------: |
| Button     |   124 |         76 |                48 |              4 |              3 |
| Link       |    11 |          7 |                 4 |              3 |              3 |
| Segment    |     9 |          3 |                 6 |              0 |              0 |
| Tabs       |     7 |          4 |                 3 |              0 |              0 |
| Pagination |     3 |          3 |                 0 |              1 |              0 |

Repository-wide classification also records native ownership and local alternatives: component-owned close/menu/table/field buttons are not automatically Button; document/sidebar anchors are not automatically Link; inert `.shlz-segment__item` and static Tabs/Pagination typography matrices are diagnostics or style fixtures rather than executable behavior.

## Component conclusions

### Button — VERIFIED

Authority is `Buttons.svg`. Source facts cover 40/32/26px sizes, primary/secondary/text, label/icon composition, default/hover/active/disabled paint, padding, 8px icon gap, pill radius and recovered typography. Native `<button>` owns pointer, Enter, Space, disabled, programmatic click and form type; SHLZ adds no controller. Browser evidence counts exactly one click for each pointer, Enter, Space and `.click()` activation and zero for disabled. Data Workspace filter/reset/apply/bulk actions and overlay actions remain application-owned consumers.

Finding `button-narrow-content-overflow` (P2) was closed by a maximum inline constraint and emergency wrapping for long content; normal source geometry is unchanged. A post-review P1 regression, `button-primary-interaction-contrast`, exposed that the shared hover/active foreground overrode primary inverse text and produced blue text on blue fills. Primary hover and active now explicitly retain inverse text, proven through real pointer hover/press assertions. Focused evidence combines exact computed size/focus/state assertions with a local icon/state snapshot.

### Link — VERIFIED

Authority is `Link.svg`; its four observed states and 16/21 typography are source facts. Navigation remains native `<a href>`. Unavailable presentation is a non-anchor span, not a fake disabled link; no `div/span role=link` exists. Enter navigation and Data Workspace request links execute natively. Visited, external/download affordance and current-page policy are not claimed public variants. A long injected content-stress label wraps in a bounded component-local surface.

### Segment — VERIFIED

Authority is `Segment.svg`. The repository semantic model is a single-choice native radio group, not Tabs or navigation: SHLZ owns group/item visuals; the browser owns selection, Arrow/Space and events; consumers own persistence. Group/item facts cover 26/33/41px outer geometry, selected/unselected/disabled, optional icons, shell inset, dividers/radii and content-driven width. No selected+disabled source combination is synthesized.

Finding `segment-fieldset-min-content-overflow` (P2) was closed by removing the browser fieldset min-content floor and allowing labels to shrink/wrap only under constraint. Pointer plus Arrow selection emits exactly two input and two change events. Consumer integration is not applicable because no application/Data Workspace Segment consumer exists.

### Tabs — VERIFIED

Authority is `Tabs.svg`; underline/pill/boxed are separate 61/40/39px source families. `TabsController` owns automatic activation, roving tabindex and panel visibility; routing, persistence, dynamic insertion and overflow remain consumer-owned.

Finding `tabs-controller-lifecycle-and-aria-validation` (P1) was closed: repeated enhancement reuses the live controller, direct construction replaces prior ownership, destroy releases the root, initial selection excludes both native and ARIA-disabled tabs, detached trees validate within their own tree, foreign programmatic tabs are rejected, and missing/duplicate/cross-root tab↔panel IDs fail fast. Browser evidence covers click/ArrowLeft/ArrowRight/Home/End, disabled skip, one selected/tab-stop tab, root-owned programmatic activation, teardown, re-enhancement, duplicate tab IDs, duplicate panel IDs, panels outside the current root and two independent valid roots. Each malformed case proves `TypeError`; controller identity and post-destroy keyboard checks prove errors do not add controllers or listeners to valid roots. Consumer integration is not applicable because no application/Data Workspace Tabs consumer exists. Component responsive/content stress is not applicable because overflow and wrapping are consumer-owned; the narrow composition remains additional integration evidence only.

### Pagination — VERIFIED

Authority is `Pagination.svg` plus the two original standalone source exports already recorded by the repository. The framework-neutral contract remains a named `<nav>`, list, native href links, exactly one `aria-current=page`, non-anchor disabled Previous/Next, ellipsis and consumer-owned URL/current/totals/window/router/data. First/middle/last URL states and result ranges execute in the dedicated consumer; 240px evidence proves flex-wrap without clipping, hidden scroll, collapse or a generator.

The existing typography snapshot and its 1,750-pixel absolute budget are unchanged. The threshold was not broadened, the historical observed 1,722 stable glyph-edge delta is not called pixel-exact, and computed 15px/19.5px/400/-0.01em assertions remain separate from geometry/paint and focused first/middle/boundary/ellipsis evidence.

## Evidence matrix

| Family     | Source                 | Structural                       | Runtime/a11y                                | Focused visual                               | Consumer                  | Responsive/content                    |
| ---------- | ---------------------- | -------------------------------- | ------------------------------------------- | -------------------------------------------- | ------------------------- | ------------------------------------- |
| Button     | complete source matrix | native markup/CSS/package        | exact activation/events/disabled/focus      | new local snapshot + computed sizes          | Data Workspace + overlays | long label/icon bounded               |
| Link       | four source states     | native href/unavailable span     | Enter/Tab/focus/no fake role                | new normal/focus/long snapshot               | three Workspace links     | multiline narrow wrap                 |
| Segment    | group/item sets        | fieldset/legend/radios           | pointer/Arrow/events/disabled               | new states/sizes/icon snapshot               | N/A: no consumer          | narrow fieldset/labels bounded        |
| Tabs       | three source families  | ARIA relationships/export        | keyboard/idempotence/teardown/ID validation | new active/focus/variants snapshot           | N/A: no consumer          | N/A: overflow/wrapping consumer-owned |
| Pagination | primitive/composition  | nav/list/href/current/boundaries | native URL/focus/first-middle-last          | new local snapshot + unchanged raster budget | dedicated URL consumer    | 240px flex-wrap                       |

## Tests, changes and limitations

Old source/regex tests remain useful for traceability but were insufficient for exact Button event counts, Link navigation, Segment native event lifecycle, Tabs repeated enhancement/teardown/ARIA integrity, consumer ownership and component-local stress. The representative `components-next` screenshots were broad component-page evidence; they did not independently prove all materially distinct states. Static visual classes remain explicitly visual evidence, not runtime hover/focus evidence.

The three production changes are: Button narrow-content containment, Segment fieldset/content containment, and `TabsController` lifecycle/ARIA hardening. There is no new public API; `enhanceTabs()` is now idempotent and rejects markup already prohibited by its documented contract. Five audit manifests, stable root IDs, shared guard hardening, one focused browser spec and five reviewed snapshots were added. No pre-existing snapshot was updated; the Pagination typography snapshot and threshold are unchanged.

The focused Wave 3 suite passes 17/17 after review remediation. Final aggregate local checks, GitHub CI, SonarCloud/CodeRabbit, review state and mergeability are recorded in the PR/check handoff after the branch is pushed. Wave 1 foundations and Wave 2 Input/Textarea/Select/Checkbox/Radio/Switch remain blocking regression scope. `shlz-design-source/` has not been changed.
