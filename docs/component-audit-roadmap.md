# Component-audit scope map, product-wave gate, and promoted capabilities

This is the durable scope map for the component-audit families recorded after Wave 8. A request of the form `Сделай Wave N` selects the complete entry for N below, but numbering alone does not make the work a product wave or authorize heavy execution. Before baseline, the route assessment must classify the entry explicitly:

- product execution requires a structured, non-empty expected production delta whose closed kind is `implementation`, `behavior`, `public-interface`, or `consumer`;
- an `evidenceKind` of `source-only`, `discovery`, or `audit` automatically uses bounded evidence execution and sets product-roadmap advancement to false;
- `evidenceKind` and expected production delta are mutually exclusive, so evidence work cannot promote itself by changing a work label.

Audit status, source knowledge, documentation, planning, test-only evidence, and a `VERIFIED` disposition are not production deltas. The requester does not need to repeat component names, but a short numbered intent cannot manufacture a production outcome that the source and current contract do not establish.

## Authority and provenance

The map was derived on `origin/main` commit `50bee6f6603e0e4d7b3f511fe610dc1522c233fd` from:

- the schema-v2 inventory in `docs/component-audits/project-inventory.json`, whose recorded census baseline is `b0be221855bf7a16181a797d39387cc77f3ae626`;
- the Wave 1–8 reports under `docs/foundation-audits/` and `docs/component-audits/`;
- the completion contract in `docs/component-audit-workflow.md`.

At the Wave 9 delivery baseline, 35 families were `VERIFIED` and the four rows below were the complete `INVENTORIED` remainder. Completed rows remain in this durable scope map; each still-unverified family appears exactly once.

| Wave | Inventory family                           | Starting disposition | Original source authority                                                            |
| ---- | ------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------ |
| 9    | Sidebar / Application Shell                | application-local    | `Sidebar.svg`; `Header.svg`                                                          |
| 10   | Card with action                           | composition-only     | `Card with button.svg`; implemented with independent Report card and Cover contracts |
| 11   | Upload / Document compositions             | composition-only     | `Documents.svg`                                                                      |
| 12   | Messaging / History / Planner compositions | source-only          | `Messages.svg`; `History of changes.svg`; `Planner.svg`                              |

Every source filename above is relative to `shlz-design-source/raw/svg/`. Those original SVGs remain read-only and override derived material.

## Resolving `Сделай Wave N`

1. Read the numbered entry and compare its family, audit status, source authority, and material implementation surfaces with the current project inventory and repository census.
2. If they still agree, use the entry's included scope, exclusions, and completion boundary as the task scope. Record the typed `wave` block in the harness route assessment. Supply either the structured expected production delta or the matching bounded `evidenceKind`, never both. Wave numbering expresses map order, not permission to infer production scope.
3. Apply the current authorities in `docs/openspec.md`, `docs/requirements-elicitation.md`, `docs/agent-execution.md`, `docs/validation-workflow.md`, and `docs/component-audit-workflow.md`. This roadmap selects scope; it does not cache their commands or replace their gates.
4. Treat the short request as pre-authorization to execute only the classified path and open its separate PR. Bounded evidence work may update source/audit evidence but cannot mark a product wave delivered, exhaust a product-roadmap entry, or authorize the next wave. The request does not authorize a design-source change, an application-derived visual contract, an unsupported public/runtime API, accepting a new finding, merging a PR, or claiming one family complete because another passed.

Material drift in family membership, audit status, source authority, or implementation surface closes the gate: update this roadmap and the affected OpenSpec artifacts before implementation. Incidental count drift is recorded in the wave census and does not change scope by itself. A number outside Waves 9–12 is unplanned; report that no durable scope exists instead of extrapolating a new wave.

## Wave 9 — Sidebar / Application Shell

Included inventory family: `Sidebar / Application Shell`.

Audit the application-local Showcase shell against `Sidebar.svg` and `Header.svg`. The scope includes opened and closed sidebar compositions, active and default menu items, header default/hover/typing/filled states, desktop and narrow stress, the existing live Showcase composition, and every repository-local shell/sidebar/header alternative discovered by the census.

Keep application-shell composition ownership explicit. Reuse already verified Button, Link, Avatar, Tooltip, and other primitives as regression dependencies rather than re-certifying them. Exclude a new reusable App Shell/Sidebar package, routing, authorization, portal-specific navigation, and responsive behavior not established by source or an approved contract. Existing application-local implementation is evidence to audit, not visual authority.

Completion boundary: the family receives its own manifest, occurrence classification, source/contract ledger, applicable seven-level evidence, consumer/stress coverage, findings disposition, inventory update, and Wave 9 report. `VERIFIED` may be claimed only for the bounded application composition actually proven; a public reusable shell remains outside this wave.

## Wave 10 — Card compositions

Included inventory families: `Card with action`, `Report card`, and `Cover`.

Audit `Card with button.svg`, `Reports card.svg`, and `Cover.svg` as source-defined card/cover compositions. Record content, image, action, report-card, and cover variants; reconcile source geometry and typography; and prove the repository-wide absence or classification of production, consumer, diagnostic, native, and local alternatives.

The starting disposition is source-only. As Wave 6 did for Date Picker / Calendar, absence may be a valid verified audit outcome. Static exports do not establish click behavior, navigation, loading, media lifecycle, responsive reflow, data models, or a generic Card API. This wave excludes inventing those contracts and excludes re-certifying any verified primitive nested in the source frames.

Evidence boundary: Card compositions may receive an independent source/absence manifest, applicable evidence with reasoned `not-applicable` levels, inventory update, and report. PR #43 is the regression fixture for this case: its zero production implementations and source-only `VERIFIED` audit disposition are valid bounded evidence, but they did not deliver or advance a product Wave 10. A product Wave 10 requires a separate explicit expected production delta backed by a complete current requirements/OpenSpec contract; the short numbered intent supplies no missing semantics.

## Wave 11 — Upload / Document compositions

Included inventory family: `Upload / Document compositions`.

Audit the higher-level `Documents.svg` compositions: Document, Upload-Drag, Description Files, Small document, Attached Document, and Drag and Drop Document. Attached Document and Drag and Drop Document are represented inside the Upload-Drag frame rather than as separate top-level frames. Census and classify composition roots and local alternatives, and determine precisely where the already verified File Row and Document Row primitives are reused versus where the source describes a distinct upload/document composition.

File Row and Document Row keep their Wave 5 status and are regression dependencies, not proxies for this family. Static source does not establish file selection, drag/drop events, validation, progress, retry, preview, removal, upload transport, persistence, or form integration. `Detailed appeals.svg` was inspected during Wave 11 and classified outside this family; this wave excludes inventing an upload lifecycle or promoting that unrelated screen-specific layout into a generic library contract.

Completion boundary: the composition family receives its own manifest, source-to-primitive boundary, occurrence/alternative census, applicable runtime and consumer evidence or explicit absence reasons, inventory update, and Wave 11 report. Any newly justified interactive upload capability requires an explicit current contract and must pass the completion gate independently from File Row and Document Row.

## Wave 12 — Messaging / History / Planner compositions

Included inventory family: `Messaging / History / Planner compositions`.

Audit `Messages.svg`, `History of changes.svg`, and `Planner.svg`, covering their recorded history content, employees, events, text-editor, messages, and attachment compositions. Maintain separate evidence and findings dispositions for Messaging, History, and Planner within the inventory family; the parent family reaches `VERIFIED` only when all three dispositions are explicit and no sub-scope is inferred from another.

The starting disposition is source-only. The source does not establish editor commands, message delivery, read state, synchronization, chronology, event recurrence, scheduling/timezone rules, employee data, attachment lifecycle, persistence, or live-region policy. This wave excludes inventing those application behaviors, a rich-text editor, messaging service, planner engine, or generic domain model, and it does not re-certify verified Notification, Snackbar, File Row, Document Row, Avatar, or other nested primitives.

Completion boundary: each of Messaging, History, and Planner has a source/absence and occurrence ledger with independently stated applicable evidence, limitations, and findings; the family inventory row is reconciled; and the Wave 12 report preserves the three separate dispositions. Runtime implementation proceeds only for semantics established through current requirements/OpenSpec resolution.

## Product-roadmap advancement

Audit dispositions remain recorded in the inventory and reports, but do not consume product entries. A numbered entry advances only when its pre-execution route receipt derives product execution from a structured expected production delta, records product-roadmap eligibility, and delivery proves that same delta. Completing or merging bounded evidence does not authorize the next numbered wave. After the current episode, stop unless the user separately requests another wave; agents never merge on the user's behalf.

## Promoted capability — Date Picker / Calendar

Date Picker / Calendar is the first explicitly promoted capability after the source-only audit waves. Its authoritative visual sources are `Date-Picker.svg` and `Calendar.svg`. The independently verified production implementation is recorded as `reusable` / `VERIFIED` in the project inventory after passing the component completion gate under `add-date-picker-calendar`.

The intended family has three independently testable modules behind small interfaces:

- Date Field owns date text entry, display, trigger, validation presentation, disabled/read-only state, and form participation;
- Calendar owns month presentation, date navigation, single/range selection, constraints, and keyboard interaction without requiring a floating surface;
- Date Picker composes Date Field, Calendar, and the existing Popover positioning/lifecycle infrastructure.

The durable work sequence is:

1. **Complete:** resolve the product contract: selection modes, date-only value model, locale/formatting, manual input and validation, constraints, closing/confirmation behavior, and one/two-month responsive policy. The user-confirmed contract is recorded in requirements state.
2. **Complete:** synthesize and validate the OpenSpec proposal, behavioral specs, design, and executable tasks. `add-date-picker-calendar` is ready for implementation review.
3. **Complete:** re-attest `Date-Picker.svg`, `Calendar.svg`, Picker Dropdown, and Picker Cell source facts without modifying `shlz-design-source/`.
4. **Complete:** define the framework-neutral public interfaces and ownership seams for Date Field, Calendar, and Date Picker.
5. **Complete:** implement source-backed CSS for fields, calendar surface/header/grid/cells, range paint, navigation, sizes, and narrow layouts.
6. **Complete:** implement Calendar month arithmetic, navigation, selection, range, today, and date constraints.
7. **Complete:** implement and prove the keyboard, focus, naming, announcement, disabled, and dismissal accessibility contract.
8. **Complete:** compose Date Picker with Popover, manual input, parsing/formatting, form events/reset, and viewport-edge positioning.
9. **Complete:** add exhaustive Showcase fixtures and at least one real application-owned consumer flow.
10. **Complete:** add unit, structural, runtime-browser, accessibility, focused-visual, responsive/content-stress, consumer, and source-integrity evidence.
11. **Complete:** publish component documentation and reconcile the audit manifest, occurrence census, and project inventory.
12. **Complete:** the component gate, manual state walk, independent review, conformance, CI, and unmerged PR delivery are recorded for `add-date-picker-calendar`; merge remains user-owned.

Initial non-goals unless step 1 explicitly promotes them are date-time selection, timezone conversion, recurrence, week numbers, presets, natural-language parsing, and application-specific scheduling rules. Vue or other framework adapters follow the framework-neutral contract and cannot become the foundation of the family.
