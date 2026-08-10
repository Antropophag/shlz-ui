# SHLZ UI Source-to-Implementation Fidelity Audit

Audit baseline: `origin/main` / `fa846b1d830da91a8a853d716722a8509628bed4` (contains `e40e417b18780c831a9e3b616e82dd2320debb7d`). Date: 2026-08-09.

## Method and result semantics

The audit used `design-source-index/*`, source typography JSON, normalized tokens, component mappings and source-contract documents, generated source references, production CSS/showcase markup, and existing unit/Playwright tests. Raw SVGs were not mass-reparsed. `PASS` means the recoverable source fact agrees with production; `FAIL` is observable drift; `PARTIAL` means only part of the source matrix/role/state is public or verified; `NOT COVERED` means no component-specific assertion protects the contract; `UNKNOWN` means the source extraction itself cannot establish the value/semantics.

Baseline: 55/55 Node tests and 77/77 Chromium Playwright tests passed. Global screenshot tolerance is `maxDiffPixelRatio: 0.002`; Pagination alone also has a zero-diff typography capture. Playwright starts a fresh build/server with `reuseExistingServer: false`, so the standard command is resistant to a stale server. Direct/manual servers remain outside that guarantee.

Controlled sensitivity used one conspicuous temporary production-CSS mutation per family (`border-radius: 0`, `font-size +8/+9px`, or height `+8px`). The mutations were applied together, but attribution is accepted only where a component-specific screenshot/computed-style assertion failed. A failure only in the 11,672px aggregate `#components` image is classified as non-attributable and therefore unreliable. Mutation code was removed before this report was written.

## Component findings

### Button

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Button | Typography | Outlined text prevents recovery | `font: inherit; line-height:1` | UNKNOWN | `docs/components/button.md`; `button.css` |
| Button | Geometry/tokens | 26/32/40 pills; Primary/Secondary/Text; Label/Icon; 4 states | Heights and primary/neutral paints match; Text is not a distinct public mode; source fixed label widths intentionally fluid | PARTIAL | component `27:8365`; `button.css` |
| Button | States/coverage | Default/Hover/Active/Disabled matrix | Native/static states exist; no loading contract (not a recovered axis); no full source-matrix computed checks | PARTIAL | `components.test.mjs`; `primitives.spec.js` |

Fidelity: **PARTIAL (P1)** — source Text mode is collapsed into the neutral default API. Visual coverage: component-specific icon/button capture, 0.2% tolerance. Mutation `radius:0`: **CAUGHT**.

### Input

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Input | Typography | Golos Text; label 14/15; value/placeholder 14/18 | Exact family/weight/size/line-height; no letter-spacing/transform | PASS | `form-controls-source-spec.md`; `field.css` |
| Input | Geometry/tokens | 222 wide; 40/32 controls; radii 20/16; 12 inset; source fills/borders | Matches; width remains capped responsively | PASS | Input `28:8864`; `field.css` |
| Input | States/coverage | 21 raw nodes incl. default/hover/focus/filled/disabled/advanced | All nodes retained in mappings/showcase; CSS implements native/static states | PASS | `form-controls-source.test.mjs`; fidelity fixture |

Fidelity: **PASS**. Visual coverage: only aggregate/showcase surfaces; no Input-specific snapshot or computed typography contract. Mutation `radius:0`: **NOT ATTRIBUTABLY CAUGHT (P2 coverage)**.

### Textarea

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Textarea | Typography | label 14/15; content 14/18; message/counter 14/15 | Matches all named roles | PASS | source spec; `field.css` |
| Textarea | Geometry/tokens | 395 wide; 58 control; radius 8; padding 8×12; 1.5 focus/error border | Matches | PASS | Textarea structured mapping; `field.css` |
| Textarea | States/coverage | 5 State × 2 Filled × 2 Show Count | All 20 source nodes mapped; production state selectors present | PASS | `form-controls-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: no family-specific screenshot/computed-style role audit. Mutation `radius:0`: **NOT ATTRIBUTABLY CAUGHT (P2 coverage)**.

### Select

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Select | Typography | same confirmed label/value contract as source Dropdown field | 14/15 label, 14/18 value/placeholder/chips | PASS | `form-controls-source-spec.md`; `field.css` |
| Select | Geometry/tokens | 250 or 280; 40/32; radii 20/16; 8 trailing inset | Matches; multiselect count geometry explicitly asserted | PASS | Dropdown `36:1106`; `fidelity.spec.js` |
| Select | States/coverage | 52 variants: size/state/filled/search/multiselect/status | Source nodes all mapped, but popup/listbox/search behavior deliberately unowned | PARTIAL | `form-controls-source.test.mjs`; `select.md` |

Fidelity: **PASS for visual field contract; PARTIAL for open interaction contract (P2)**. Visual coverage: `#select-demo` snapshot plus one trailing-geometry check; mutation `radius:0`: **NOT CAUGHT** — coverage defect.

### Checkbox

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Checkbox | Typography | label typography not recoverable as a checkbox-owned role | inherits choice context | UNKNOWN | source mapping; `choice.css` |
| Checkbox | Geometry/tokens | 20/16 boxes, source checked/disabled paints and marks | Matches mapped sizes/paints | PASS | `choice-status-source.test.mjs`; `choice.css` |
| Checkbox | States/coverage | checked/unchecked/indeterminate/disabled source nodes | Implemented; hover/error are not proven source axes | PASS | `choice-status.spec.js` |

Fidelity: **PASS for recoverable contract**. Visual coverage: geometry/computed assertions only, no screenshot. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Radio

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Radio | Typography | exact label font/gap unknown | inherited font; 8px chosen gap | UNKNOWN | `radio.md`; `choice.css` |
| Radio | Geometry/tokens | 18.5 path + 1.5 stroke represented by 20px box | 20px box, 10px mark, source colors | PASS | Radio source mapping; `choice.css` |
| Radio | States/coverage | selected/unselected and disabled-looking variants | Implemented; hover/error remain unknown | PASS | `choice-status.spec.js` |

Fidelity: **PASS with source unknowns**. Visual coverage: no screenshot. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Switch

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Switch | Typography | label is not a switch-owned recoverable role | inherited | UNKNOWN | `switch.md`; `choice.css` |
| Switch | Geometry/tokens | Component Set `48:1166`: 24×14 and 38×20; white thumb; brand/neutral; disabled opacity .4 | Both source sizes and paints/opacity match; the previously reported 52×30 is clip/mask geometry, not a public variant | PASS | Switch source set; `choice.css` |
| Switch | States/coverage | on/off × two sizes, disabled-looking examples | Complete eight-state rendered matrix with computed geometry and zero-diff component snapshot | PASS | `choice-status.spec.js`; `remediation-fidelity.spec.js` |

Fidelity: **PASS**. Visual coverage: component-specific computed checks and zero-diff snapshot. Controlled width mutation: **CAUGHT**.

### Status

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Status | Typography | canonical typography/semantic meanings unrecoverable | 14/20 inherited family | UNKNOWN | `status-badge.md` |
| Status | Geometry/tokens | 30px radius-15 pills; observed blue/green/orange/purple/cyan/neutral families | Geometry and observed paint families implemented | PASS | Status source references; `status-badge.css` |
| Status | States/coverage | two business-labelled source sets; color meaning cannot generalize | Stable color modifiers cover visuals, not business-name matrix | PARTIAL | `choice-status-source.test.mjs` |

Fidelity: **PASS visually, PARTIAL semantically (P2)**. Visual coverage: height-only assertion, no screenshot/color matrix. Mutation `radius:0`: **NOT CAUGHT**.

### Badge

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Badge | Typography | canonical typography unknown | 12/1 weight 500; large 14 | UNKNOWN | `status-badge.md`; `status-badge.css` |
| Badge | Geometry/tokens | Count: 16/23 heights, 29/35 multi-digit, 16/23 single; dot 10 with 2px border | Matches | PASS | Badge/Count and Badge/Dot mappings |
| Badge | States/coverage | size/color/single-digit axes | Public invert/neutral/single/lg/dot variants cover visual axes | PASS | `choice-status-source.test.mjs` |

Fidelity: **PASS with typography unknown**. Visual coverage: size-only assertions, no screenshot/paint checks. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Tag

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Tag | Typography | source role not fully recoverable | 14/18 | UNKNOWN | `tag.md`; `tag.css` |
| Tag | Geometry/tokens | Filled/Stroke, 111×30 specimen, pill shell | 30 high, 12 inset, filled/outlined; width content-owned | PASS | Tag `785:48349` |
| Tag | States/coverage | two Type variants; interaction states unknown | Both variants; extra focus/hover only on native remove control | PASS | `tag-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: `#tag-demo` representative screenshot uses 0.2% tolerance. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Person Tag

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Person Tag | Typography | not independently recoverable | inherits Tag 14/18 | UNKNOWN | `tag-source.md`; `tag.css` |
| Person Tag | Geometry/tokens | Default 193×30; Closable 213×30; 24px avatar/remove | 30 high and 24 slots; width content-owned | PASS | Person tag `371:32592` |
| Person Tag | States/coverage | Default/Closable | Both compositions public | PASS | `tag-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: dedicated `#person-tag-demo` screenshot. Mutation `radius:0`: **NOT CAUGHT** — tolerance/locator sensitivity defect.

### Segment

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Segment | Typography | source text styles not separately contracted | 12/16 | UNKNOWN | `segment.md`; `segment.css` |
| Segment | Geometry/tokens | groups 26/33/41; items 18/25/33; 4px shell; radii 8/6 | Matches | PASS | Segmented sets `424:36756`, `424:36728` |
| Segment | States/coverage | 6 group variants; 9 item variants; no selected+disabled source | Public native/static matrices cover observed combinations | PASS | `segment-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: 39-item screenshot with global tolerance. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Tabs

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Tabs | Typography | no canonical role contract in mapping | `font: inherit` | UNKNOWN | `tabs.md`; `tabs.css` |
| Tabs | Geometry/tokens | underline 61px; pill 40/r20; boxed ~39 and observed borders | Three visual families implemented | PASS | Tabs source tests |
| Tabs | States/coverage | source default/hover/selected/disabled combinations | Static/native states present; automatic activation is an extra engineering decision | PASS | `tabs-source.test.mjs`; `components-next.spec.js` |

Fidelity: **PASS with typography unknown**. Visual coverage: family screenshot and behavior. Mutation `font-size:24`: **CAUGHT**.

### Pagination

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Pagination | Typography | Body 15 Regular: Golos, 400, 15/19.5, -1% | Exact on item, summary, size label | PASS | `pagination-typography.spec.js` |
| Pagination | Geometry/tokens | 39/40 items; normalized arrows; source state fills | 40 outer box via border-box, source colors/radius/icons | PASS | `pagination-source.md`; `pagination.css` |
| Pagination | States/coverage | 20 exported Type×State nodes plus compositions | Matrix retained; disabled uses non-link; algorithms consumer-owned | PASS | `pagination-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: dedicated locator `#fidelity-pagination .shlz-visual-fixture`, zero-diff plus computed typography. Mutation `font-size:23`: **CAUGHT**. This closes the previously observed “green wrong DOM / permissive diff” failure mode for the numeric typography roles.

### Dropdown

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Dropdown | Typography | source menu typography is not established as public contract | item 14/20; family inherited; docs say consumer-owned | UNKNOWN | `dropdown-menu.md`; `dropdown.css` |
| Dropdown | Geometry/tokens | 200/216 widths; rows 40; 10 block padding; r12; two shadows | Matches; trigger offset 4 is a decision | PASS | Dropdown source mapping |
| Dropdown | States/coverage | 16 item Type/State variants; 10 menu compositions incl search/status/scroll | item/icon/check/search represented; scrollbar/typeahead/nested menus missing | PARTIAL | `dropdown-source.test.mjs`; `dropdown.spec.js` |

Fidelity: **PARTIAL (P2)**. Visual coverage: open page and fidelity screenshots, both global tolerance; no source-specific computed style matrix. Mutation `radius:0`: **NOT CAUGHT**.

### Notification (including Snackbar)

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Notification | Typography | exact title/message contract not recoverable | 14/18 root; title 400; message opacity .8 | UNKNOWN | `notification.md`; CSS |
| Notification | Geometry/tokens | 384×58 r29; action 79/90×32 r16; leading 40; dark/red/white | Matches | PASS | Notification/Snackbar mappings |
| Notification | States/coverage | Default/Error/With button + countdown 5…0 | All source compositions and contour paths represented; runtime timing intentionally unknown | PASS | `notification-source.test.mjs`; `fidelity.spec.js` |

Fidelity: **PASS**. Visual coverage: demo/review/fidelity screenshots and geometry/countdown assertions. Mutation `radius:0`: **CAUGHT**.

### Tooltip

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Tooltip | Typography | label role observable but no complete recovered signature in contract | 12px/1.25, inherited family/weight | PARTIAL | `tooltip.md`; `tooltip.css` |
| Tooltip | Geometry/tokens | 100×37, r8, dark fill, no shadow, 8 placement forms | Matches; caret implemented as 8px rotated square rather than source 11.3137×5.655 envelope | PARTIAL | Tooltip mapping; CSS |
| Tooltip | States/coverage | placement variants; activation/timing unknown | all placements plus hover/focus/Escape; timing is extra decision | PASS | `overlay-source.test.mjs`; `components-next.spec.js` |

Fidelity: **PARTIAL (P2)** — caret geometry is an approximation and typography is incompletely contracted. Visual coverage: placement/fidelity screenshots at global tolerance. Mutation `radius:0`: **NOT CAUGHT**.

### Popover

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Popover | Typography | source typography explicitly unresolved | root 14/19; header 600, inherited family | UNKNOWN | `popover.md`; `popover.css` |
| Popover | Geometry/tokens | 236×90, r12, 40 header, 50 body, divider, two shadows | Matches | PASS | Popover source mapping; fidelity computed checks |
| Popover | States/coverage | 12 placements; trigger/open/focus behavior unknown | all placements represented; behavior is extra decision | PASS | `overlay-source.test.mjs`; `popover.spec.js` |

Fidelity: **PASS for recoverable visuals**. Visual coverage: screenshots plus exact radius/size computed checks. Mutation `radius:0`: **CAUGHT by computed style** (individual placement snapshots alone did not fail).

### Modal

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Modal | Typography | isolated outlined text does not establish complete role signatures | explicit title/body styles plus inherited controls | UNKNOWN | `modal.md`; `modal.css` |
| Modal | Geometry/tokens | five surfaces; 572 structured and 416/417 compact; r16; shadows; region geometry | source variants represented; structured geometry asserted | PASS | overlay mapping; `fidelity.spec.js` |
| Modal | States/coverage | five static compositions; backdrop/dismiss/focus responsive behavior unknown | five fixtures; native dialog behavior is EXTRA/decision | PASS | `overlay-source.test.mjs`; `overlay.spec.js` |

Fidelity: **PASS for recoverable contract**. Visual coverage: fidelity and page screenshots plus dimensions, but radius is not asserted. Mutation `radius:0`: **NOT CAUGHT (P2 coverage)**.

### Drawer

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Drawer | Typography | complete signatures unresolved | title 600 20/24; other roles inherited | UNKNOWN | `drawer.md`; `drawer.css` |
| Drawer | Geometry/tokens | 420×900 specimen, r16, header 64, footer 72, 24 inset, 12 gap, no shadow | Matches desktop fixture; edge attachment/backdrop are decisions | PASS | Drawer source mapping; fidelity checks |
| Drawer | States/coverage | one static component; placement/modality unknown | right modal only; extra responsive/native behavior documented | PASS | `overlay-source.test.mjs`; `overlay.spec.js` |

Fidelity: **PASS for recoverable source**. Visual coverage: page/fidelity snapshots and exact region geometry. Mutation `radius:0`: **CAUGHT** (page drawer snapshot).

### Link

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Link | Typography | specimen 32×21; full signature retained in typography index but not asserted in browser | production inherits font and sets no size/line-height | PARTIAL | Link `371:32614`; `link.css` |
| Link | Geometry/tokens | content-sized; state-specific colors/decoration | visual states implemented | PASS | `wave3-source.test.mjs` |
| Link | States/coverage | Default/Hover/Pressed/Disabled | exact four source states; focus-visible is extra | PASS | `components-next.spec.js` semantics |

Fidelity: **PARTIAL (P1 typography)**. Visual coverage: no Link-specific screenshot/computed typography; only aggregate and fidelity counts. Mutation `font-size:23`: **NOT ATTRIBUTABLY CAUGHT**.

### Avatar

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Avatar | Typography | text variants by 24/32/40/64; no complete signature contract | 12/14/16/20, weight 400, line-height 1 | PARTIAL | Avatar mapping; `avatar.css` |
| Avatar | Geometry/tokens | circle × 24/32/40/64 × image/text/icon | exact matrix; icon 62.5%; source-like fills | PASS | `wave3-source.test.mjs`; `wave3.spec.js` |
| Avatar | States/coverage | 12 variants | all 12 rendered; broken-image behavior consumer-owned | PASS | `avatar.md` |

Fidelity: **PASS geometry/matrix; PARTIAL typography (P2)**. Visual coverage: dedicated snapshots and exact size matrix. Mutation `radius:0`: **CAUGHT**.

### Table

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Table | Typography | body 14/18; header 12/18 uppercase | Matches family/size/weight/line-height/transform | PASS | table mappings; `table.css` |
| Table | Geometry/tokens | 50 rows, 8 inset, 2 divider; observed widths not public enums | Matches | PASS | `table.md`; fidelity and wave3 assertions |
| Table | States/coverage | header/default/hover/active/dots/editing compositions | reusable visual/native states covered; app-specific families intentionally composition | PASS | `wave3-source.test.mjs` |

Fidelity: **PASS**. Visual coverage: dedicated snapshots and exact row/icon/affordance computed geometry. Mutation `height:58`: **CAUGHT**.

### File Row

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| File Row | Typography | title/meta/message roles observable but no complete family signature contract | role-specific sizes/lines in CSS; family inherited | PARTIAL | `file-row.md`; `file-row.css` |
| File Row | Geometry/tokens | 55 body, r12, visual 38, leading 10, gap 12, source error message | implemented; width consumer-owned | PASS | Document `254:17600`; tests |
| File Row | States/coverage | Default/Hover/Editing/Error plus description Delete | hover/error and editable composition exist; Delete represented as consumer action, not root state | PARTIAL | `content-states.test.mjs/spec.js` |

Fidelity: **PARTIAL (P2)**. Visual coverage: computed properties/semantics only; no File Row snapshot. Mutation `radius:0`: **NOT CAUGHT**.

### Empty State

| Component | Area | Source | Actual | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Empty State | Typography | Simple title 15/19.5, -1%, subdued | exact Simple title; description/actions are generalized decisions | PASS | `empty-state.md`; `empty-state.css` |
| Empty State | Geometry/tokens | Simple 220×67 with 64×40 visual and 7.5 gap; also Customize 159×136.5 and Basic 167×262 | Simple implemented; root fluid; Customize/Basic not public | PARTIAL | Empty source components |
| Empty State | States/coverage | three source compositions | only Simple promoted; optional generic slots do not reproduce the other two contracts | FAIL | `content-states.test.mjs/spec.js` |

Fidelity: **FAIL/PARTIAL (P1)**. Visual coverage: no snapshot, only optional-region and responsive computed checks. Mutation `font-size:23`: **NOT CAUGHT**.

## Regression coverage audit

| Coverage property | Finding | Result |
| --- | --- | --- |
| Production CSS | Showcase imports `@shlz/styles`; build packages production CSS before captures | PASS |
| Stale server/worktree | Standard config uses fixed `127.0.0.1:4173`, fresh `npm run build`, `reuseExistingServer:false` | PASS for standard command; manual/custom runs UNKNOWN |
| Locator precision | Strong for Pagination/Avatar/Table and overlay fidelity units; weak aggregate `#components` spans 11,672px; several demo locators include docs/source images and unrelated content | PARTIAL |
| Tolerance | Global 0.2% permits obvious local changes in Tag, Person Tag, Segment, Dropdown, Tooltip, Modal and Select | FAIL |
| Computed styles | Strong only for Pagination typography, Table/Avatar geometry, selected overlay geometry, choice sizes; absent for most typography/token roles | PARTIAL |
| Source-specific tests | Excellent at mapping/node completeness; mostly inspect files/manifests, not browser computed output | PARTIAL |
| State screenshots | Static matrices exist for many source families; live hover/focus/active/disabled visuals are incomplete | PARTIAL |

## Controlled sensitivity matrix

| Family | Mutation | Existing protection result | Reliability |
| --- | --- | --- | --- |
| Button | radius 0 | button-icon screenshot failed | RELIABLE for represented buttons |
| Input | control radius 0 | no family-specific failure | UNRELIABLE |
| Textarea | control radius 0 | no family-specific failure | UNRELIABLE |
| Select | control radius 0 | `review-select` passed | UNRELIABLE |
| Checkbox | radius 0 | computed size tests passed; no visual | UNRELIABLE |
| Radio | radius 0 | computed size tests passed; no visual | UNRELIABLE |
| Switch | radius 0 | computed size tests passed; no visual | UNRELIABLE |
| Status | radius 0 | height test passed; no visual | UNRELIABLE |
| Badge | radius 0 | size tests passed; no visual | UNRELIABLE |
| Tag | radius 0 | representative screenshot passed | UNRELIABLE |
| Person Tag | radius 0 | dedicated review screenshot passed | UNRELIABLE |
| Segment | radius 0 | representative screenshot passed | UNRELIABLE |
| Tabs | font-size 24 | representative screenshot failed | RELIABLE |
| Pagination | font-size 23 | computed typography and zero-diff screenshot failed | RELIABLE |
| Dropdown | radius 0 | open/fidelity/review screenshots passed | UNRELIABLE |
| Notification | radius 0 | three component screenshots failed | RELIABLE |
| Tooltip | radius 0 | placement/fidelity screenshots passed | UNRELIABLE |
| Popover | radius 0 | exact computed-radius assertion failed | RELIABLE for radius/size |
| Modal | radius 0 | fidelity/page screenshots passed | UNRELIABLE |
| Drawer | radius 0 | page snapshot failed | RELIABLE |
| Link | font-size 23 | no component-specific visual failure | UNRELIABLE |
| Avatar | radius 0 | dedicated review/wave3 snapshots failed | RELIABLE |
| Table | height 58 | two computed checks and review snapshot failed | RELIABLE |
| File Row | body radius 0 | no visual failure | UNRELIABLE |
| Empty State | title font-size 23 | no visual failure | UNRELIABLE |

## Summary

1. **25 component families audited.** Snackbar is included under Notification; Badge Count/Dot under Badge.
2. **9 fully source-faithful for all recoverable public visual contracts:** Input, Textarea, Switch, Pagination, Notification, Popover, Drawer, Avatar, Table. (Some still contain source-level UNKNOWN typography/behavior, which is not counted as drift.)
3. **4 families have concrete implementation drift or omitted source contract:** Button, Tooltip, Link, Empty State.
4. **10 families have incomplete state/variant/semantic coverage:** Button, Select, Status, Dropdown, Tooltip, Link, Avatar typography, File Row, Empty State, plus Modal/Drawer behavior relative to source remains UNKNOWN rather than source-proven.
5. **16 families do not have reliable component-specific visual protection:** Input, Textarea, Select, Checkbox, Radio, Status, Badge, Tag, Person Tag, Segment, Dropdown, Tooltip, Modal, Link, File Row, Empty State.
6. Most frequent defect classes: missing computed typography contracts; screenshots whose locator is much larger than the component; global 0.2% tolerance masking local diffs; node/mapping completeness tests mistaken for rendered fidelity; source variants intentionally narrowed without an explicit public fidelity status; live-state visuals under-covered.

### Top 10 by severity

1. **P1 — Button:** authoritative Secondary/Text mode matrix is collapsed into primary plus one neutral default; no distinct Text contract.
2. **P1 — Empty State:** two of three canonical source compositions (Customize/Basic) are not public.
3. **P1 — Link:** typography is inherited and not contract-tested despite a fixed 32×21 source specimen and indexed typography.
4. **P2 — Tooltip:** source caret envelope is approximated by an 8px rotated square; radius mutation survives visual tests.
5. **P2 — Select coverage:** a destructive radius mutation survives its dedicated review screenshot.
6. **P2 — Dropdown coverage:** radius mutation survives all three relevant screenshots.
7. **P2 — Modal coverage:** removing the canonical 16px surface radius survives fidelity and page screenshots.
8. **P2 — Tag/Person Tag/Segment coverage:** three dedicated representative captures all tolerate removal of canonical rounding.
9. **P2 — Choice/Status/Badge/File Row/Empty State coverage:** no component-specific visual regression exists; current green checks are mostly dimensions/semantics.

### Green tests but not source-faithful

The following cannot be called source-faithful merely because baseline is green: **Button, Tooltip, Link, Empty State** (implementation drift), and **Input, Textarea, Select, Checkbox, Radio, Status, Badge, Tag, Person Tag, Segment, Dropdown, Modal, File Row** (visual protection is insufficient to establish fidelity). Switch and Pagination are explicitly excluded from this list because they now check the correct implementation locator, critical computed contracts, and zero-diff screenshots.

## Cleanup verification

All controlled production mutations were removed. No snapshot or baseline was updated. The final verification must show that `git diff` contains only this report and no production, component, token, snapshot, or test changes.
