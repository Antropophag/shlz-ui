# Source transfer and fidelity audit

Date: 2026-09-01  
Audited implementation: `origin/main@70d7bbb`  
Authoritative source: `shlz-design-source/raw/svg/`  
Audit type: repository-wide, read-only evidence audit

## Executive summary

The reusable design-system foundation is substantially transferred. All explicitly extracted foundation values, the normalized icon set, and most reusable component families have production implementations and automated evidence. The repository cannot, however, support a truthful claim that the complete design source has been transferred or pixel-matched.

The repository inventory contains 48 audited families or groups:

- 39 reusable families (81.3%);
- 7 composition-only groups;
- 1 application-local group;
- 1 source-only group.

Forty-seven of the 48 inventory entries have some implementation-level disposition (97.9%), but this is not equivalent to 97.9% of the raw design corpus. The source index contains 195 component records and 630 variants, while the implementation inventory uses a coarser family taxonomy. There is no machine-readable mapping that provides a valid denominator between those levels.

The implementation is coherent and source-specific. No blocking P0/P1 product regression was found. The most material audit weaknesses are the ambiguous completion status, incomplete source-to-library traceability, extraction errors and skipped instances, and the weight of the documentation showcase.

## Audit scope and method

The audit covered:

- the complete `shlz-design-source/` index and raw-source inventory without modifying it;
- generated tokens and icon normalization results;
- the machine-readable component audit inventory;
- framework-agnostic styles and browser behaviors;
- the showcase, plain-HTML fixtures, and real consumer compositions;
- source/contract tests, package builds, packed-package consumption, and Chromium runtime/visual tests;
- accessibility, responsive/content stress, theming, performance, and implementation integrity.

This is a complete repository evidence audit, not a manual pixel-by-pixel comparison of every one of the 630 indexed variants. Visual evidence is focused on representative and contract-critical matrices.

## Source volume

| Source measure                                   | Count |
| ------------------------------------------------ | ----: |
| Files at `shlz-design-source/raw/svg/` top level |    74 |
| Files under `shlz-design-source/raw/`            |   297 |
| Indexed component sets                           |    69 |
| Indexed standalone components                    |   126 |
| Indexed variants                                 |   630 |
| Reference screens                                |    34 |
| Service Desk reference screens                   |    24 |
| Text nodes                                       | 2,193 |
| Raw typography signatures                        |    48 |
| Merged typography signatures                     |    36 |
| Referenced text styles                           |    18 |
| Mixed-style text nodes                           |    15 |

Source-quality diagnostics reported:

- 9 errors;
- 35 warnings;
- 47 skipped instances;
- 13 duplicate or near-duplicate name groups.

These diagnostics limit any claim of exhaustive source extraction until each affected item is classified by impact.

## Transfer coverage

### Foundations

| Foundation                   | Extracted | Implemented/verified | Result                                                   |
| ---------------------------- | --------: | -------------------: | -------------------------------------------------------- |
| Colors                       |        40 |                   40 | Complete for extracted facts                             |
| Spacing values               |         9 |                    9 | Complete for extracted facts                             |
| Radii                        |         5 |                    5 | Complete for extracted facts                             |
| Merged typography signatures |        36 |  36 indexed/profiled | Complete extraction; semantic naming is repository-owned |
| Logical icons                |       119 |                  119 | Complete normalized set                                  |

Fresh icon generation produced 133 source SVGs normalized into 119 logical glyphs. Fourteen duplicate or variant files were collapsed. Ninety-seven icons use `currentColor`; 22 preserve source color. Five icon names remain explicitly uncertain, and six near-duplicate groups remain recorded.

### Reusable families

The 39 reusable inventory entries are:

- Tokens, Colors, Spacing, Radii, Typography, and Icons;
- Button, Input, Textarea, Select, Checkbox, Radio, Switch, and Link;
- Segment, Tabs, Pagination, Status, Badge, Tag, Person Tag, and Avatar;
- Table, File Row, Document Row, and Empty State;
- Dropdown Menu, Tooltip, Popover, Modal, and Drawer;
- Notification and Snackbar;
- Date Picker, Calendar Grid, File Upload, Planner Schedule, Message Thread, and History Timeline.

The framework boundary is sound: core styling and browser behavior do not depend on Vue. A clean external consumer successfully installed and consumed all four packed SHLZ packages.

### Composition-only and application-local scope

Seven groups intentionally remain composition-only rather than becoming generic public APIs:

- Effects;
- aggregate card compositions;
- Card with action;
- Report card;
- Cover;
- Upload / Document compositions;
- domain table compositions.

Sidebar / Application Shell is classified as application-local. This is consistent with the repository architecture: consumer-specific layout, routing, authorization, and persistence should not be promoted into the framework-agnostic core without a reusable contract.

### Source-only scope at the audited baseline

The remaining source-only inventory group is the higher-level Messaging / History / Planner composition. Its reusable subfamilies are implemented, but full application roots and application-owned behavior are deliberately absent.

Other bounded or consumer-owned areas include:

- message composition, synchronization, read state, transport, and persistence;
- timezone, recurrence, drag-and-drop, and server policy for Planner;
- upload progress, retry, preview, transport, and persistence;
- full Upload / Document compositions;
- a generic Card API;
- domain screens such as Service Desk, dashboards, and form-constructor flows.

The 34 reference screens are indexed validation material, not automatically 34 missing reusable components.

### Baseline caveat

This report records the audited state at `70d7bbb`. During persistence of the report, `origin/main` advanced to `0c2a161`, merging the Rich Text Composer work. Therefore Composer / Rich Text Toolbar is a point-in-time gap in the audited baseline, not a claim about the newer main branch. All other quantitative conclusions in this document remain tied to the stated audit commit and must be refreshed before being used as current-main release evidence.

## Fidelity assessment

### Strong evidence

Source fidelity is strongest for contracts that can be recovered directly from SVG geometry and paint:

- deterministic generation and source-hash validation;
- exact foundation values in production consumers;
- source-derived geometry, sizing, color, and state matrices;
- real hover, focus, active, open, selected, checked, mixed, invalid, and disabled states;
- component-focused visual snapshots;
- narrow viewport, long content, and enlarged-text stress;
- plain HTML and application consumer compositions;
- production icon sprite resolution for every canonical icon.

### Evidence boundaries

The following claims are not supported:

- exhaustive pixel equality for all 630 variants;
- behavior inferred directly from static SVGs;
- source-defined accessibility or responsive rules;
- source-defined semantic typography names;
- complete extraction of skipped or erroneous source instances.

Behavior, focus ownership, keyboard navigation, ARIA, responsive containment, and consumer state boundaries are design-system decisions introduced by the repository. They are tested, but they are not literal Figma facts.

### Known fidelity/accessibility tensions

Two source-exact color decisions remain documented accessibility deviations:

- six Status foreground/background pairs are below 4.5:1 for normal text;
- the Empty State Simple title is approximately 2.79:1 against white.

The repository preserves the source paint and records both as P3 deviations. This maximizes source fidelity but does not produce full WCAG AA conformance for those surfaces.

Pagination has a bounded raster difference of 1,722 glyph-edge pixels against a 1,750-pixel budget. Its computed typography contract passes; the related P2 finding is resolved, but the evidence should not be described as absolute pixel equality.

## Audit health score

|         # | Dimension                |     Score | Key finding                                                                                         |
| --------: | ------------------------ | --------: | --------------------------------------------------------------------------------------------------- |
|         1 | Accessibility            |       3/4 | Strong semantic and keyboard coverage; two accepted contrast deviations                             |
|         2 | Performance              |       2/4 | Consumer packages are bounded, but the showcase ships heavy reference assets and a large main chunk |
|         3 | Responsive design        |       4/4 | Broad narrow-width, content-stress, and text-scaling evidence                                       |
|         4 | Theming                  |       4/4 | Extracted source foundations are comprehensively tokenized and verified                             |
|         5 | Implementation integrity |       3/4 | Coherent architecture; transfer status and source traceability remain ambiguous                     |
| **Total** |                          | **16/20** | **Good**                                                                                            |

### Implementation integrity verdict

Pass. The implementation expresses a coherent SHLZ-specific system, respects the framework-agnostic architecture, and maintains a clear distinction between reusable primitives and consumer-owned application behavior. The main integrity weakness is audit semantics: `VERIFIED` includes implemented, composition-only, application-local, and source-only dispositions, so it cannot serve as a standalone completion claim.

## Findings by severity

### P2 — `VERIFIED` is not an implementation status

- **Category:** Implementation integrity
- **Location:** machine-readable component audit inventory
- **Impact:** Stakeholders can interpret all 48 verified entries as fully transferred even though only 39 are reusable and one remains source-only.
- **Recommendation:** Split classification and evidence into explicit fields such as `indexed`, `classified`, `implemented`, `sourceFidelityVerified`, `runtimeVerified`, and `intentionallyExcluded`.
- **Suggested command:** `$impeccable clarify`

### P2 — No source-record-to-library-family traceability

- **Category:** Implementation integrity
- **Location:** `design-source-index/components.json` and component audit inventory
- **Impact:** The project cannot calculate an honest corpus-level transfer percentage or automatically identify merged, fixture-only, excluded, and missing source records.
- **Recommendation:** Add a generated mapping from every indexed record/variant to its family, disposition, implementation root, and evidence.
- **Suggested command:** `$impeccable document`

### P2 — Source extraction has unresolved coverage limits

- **Category:** Implementation integrity
- **Location:** generated source manifest and quality diagnostics
- **Impact:** Nine extraction errors and 47 skipped instances may hide unclassified source states or families.
- **Recommendation:** Classify every diagnostic by affected source, reason, expected disposition, and whether it changes the transfer denominator.
- **Suggested command:** `$impeccable harden`

### P2 — Showcase bundle includes heavy audit assets

- **Category:** Performance
- **Location:** `apps/showcase` production build
- **Impact:** The main showcase JavaScript is 1.08 MB minified (200 KB gzip), and individual source-reference SVG assets reach approximately 2.1 MB. This increases documentation load and parse cost, although it does not represent the size of consumer packages.
- **Recommendation:** Lazy-load documentation sections and source references, and separate audit-only assets from the initial production route.
- **Suggested command:** `$impeccable optimize`

### P3 — Source-exact Status colors miss normal-text contrast

- **Category:** Accessibility / source fidelity
- **Location:** Status color pairs
- **Impact:** Six exact source paint combinations are below the WCAG 2.x 4.5:1 normal-text threshold.
- **Recommendation:** Decide explicitly whether accessible production overrides may differ from source, then record the resolution in both tokens and fidelity evidence.
- **Suggested command:** `$impeccable colorize`

### P3 — Empty State Simple title has low contrast

- **Category:** Accessibility / source fidelity
- **Location:** Empty State Simple
- **Impact:** Approximately 2.79:1 contrast can make the title difficult to read.
- **Recommendation:** Resolve the same source-versus-accessibility policy before changing the authoritative paint.
- **Suggested command:** `$impeccable colorize`

## Positive findings

- The source directory remained immutable throughout generation and testing.
- Foundations are unusually well quantified and verified.
- Icon normalization preserves multi-color intent and makes monochrome assets themeable.
- The design-system core remains framework-agnostic and works in plain HTML.
- Runtime tests exercise real native behavior rather than only static markup.
- Occurrence guards distinguish executable fixtures, diagnostics, and live consumer roots.
- Accessibility ownership and application-owned state are documented rather than silently absorbed into generic components.
- Responsive and content-stress coverage is broad and component-focused.

## Validation evidence

The clean audit worktree at `70d7bbb` passed:

- source generation;
- 178 of 178 source and contract tests;
- formatting and lint checks;
- all package builds;
- validation of 68 source SVGs, 3 token groups, 119 canonical icons, and 42 aliases;
- packed-package smoke consumption from a clean project;
- 271 of 271 Chromium tests in 16.7 minutes;
- the Impeccable static detector with no additional output.

The showcase build completed with a chunk-size warning. Its main JavaScript asset was 1.08 MB minified / 200 KB gzip. The browser tests included source-derived geometry and paint, keyboard/ARIA behavior, responsive/content stress, visual snapshots, plain HTML, and real consumer compositions.

## Recommended actions

1. **P2 — `$impeccable clarify`:** separate implementation state from verification/disposition in the audit schema.
2. **P2 — `$impeccable document`:** create the source-record-to-family transfer matrix and compute metrics only from compatible units.
3. **P2 — `$impeccable harden`:** classify the 9 extraction errors and 47 skipped instances.
4. **P2 — `$impeccable optimize`:** split the showcase and lazy-load source-reference assets.
5. **P3 — `$impeccable colorize`:** resolve the explicit accessibility-versus-source policy for Status and Empty State.
6. **Final — `$impeccable polish`:** re-run the complete audit after the transfer matrix and source diagnostics are resolved.

Re-run `$impeccable audit` after fixes and after rebasing the audit baseline to current `origin/main`.
