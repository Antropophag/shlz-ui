# Component-audit scope map and product-wave gate: Waves 9–12

This is the durable scope map for the component-audit families recorded after Wave 8. A request of the form `Сделай Wave N` selects the complete entry for N below, but numbering alone does not make the work a product wave or authorize heavy execution. Before baseline, the route assessment must classify the entry explicitly:

- `product` requires a non-empty expected production delta: an observable production implementation, behavior, public interface, or real consumer outcome;
- `source-only`, `discovery`, and `audit` automatically use bounded evidence execution and set product-roadmap advancement to false.

Audit status, source knowledge, documentation, planning, test-only evidence, and a `VERIFIED` disposition are not production deltas. The requester does not need to repeat component names, but a short numbered intent cannot manufacture a production outcome that the source and current contract do not establish.

## Authority and provenance

The map was derived on `origin/main` commit `50bee6f6603e0e4d7b3f511fe610dc1522c233fd` from:

- the schema-v2 inventory in `docs/component-audits/project-inventory.json`, whose recorded census baseline is `b0be221855bf7a16181a797d39387cc77f3ae626`;
- the Wave 1–8 reports under `docs/foundation-audits/` and `docs/component-audits/`;
- the completion contract in `docs/component-audit-workflow.md`.

At the Wave 9 delivery baseline, 35 families were `VERIFIED` and the four rows below were the complete `INVENTORIED` remainder. Completed rows remain in this durable scope map; each still-unverified family appears exactly once.

| Wave | Inventory family                           | Starting disposition | Original source authority                               |
| ---- | ------------------------------------------ | -------------------- | ------------------------------------------------------- |
| 9    | Sidebar / Application Shell                | application-local    | `Sidebar.svg`; `Header.svg`                             |
| 10   | Card compositions                          | source-only          | `Card with button.svg`; `Reports card.svg`; `Cover.svg` |
| 11   | Upload / Document compositions             | composition-only     | `Documents.svg`; `Detailed appeals.svg`                 |
| 12   | Messaging / History / Planner compositions | source-only          | `Messages.svg`; `History of changes.svg`; `Planner.svg` |

Every source filename above is relative to `shlz-design-source/raw/svg/`. Those original SVGs remain read-only and override derived material.

## Resolving `Сделай Wave N`

1. Read the numbered entry and compare its family, audit status, source authority, and material implementation surfaces with the current project inventory and repository census.
2. If they still agree, use the entry's included scope, exclusions, and completion boundary as the task scope. Record the typed `wave` block in the harness route assessment. Use `workKind: product` only with an explicit expected production delta; otherwise use the matching bounded evidence kind. Wave numbering expresses map order, not permission to infer production scope.
3. Apply the current authorities in `docs/openspec.md`, `docs/requirements-elicitation.md`, `docs/agent-execution.md`, `docs/validation-workflow.md`, and `docs/component-audit-workflow.md`. This roadmap selects scope; it does not cache their commands or replace their gates.
4. Treat the short request as pre-authorization to execute only the classified path and open its separate PR. Bounded evidence work may update source/audit evidence but cannot mark a product wave delivered, exhaust a product-roadmap entry, or authorize the next wave. The request does not authorize a design-source change, an application-derived visual contract, an unsupported public/runtime API, accepting a new finding, merging a PR, or claiming one family complete because another passed.

Material drift in family membership, audit status, source authority, or implementation surface closes the gate: update this roadmap and the affected OpenSpec artifacts before implementation. Incidental count drift is recorded in the wave census and does not change scope by itself. A number outside Waves 9–12 is unplanned; report that no durable scope exists instead of extrapolating a new wave.

## Wave 9 — Sidebar / Application Shell

Included inventory family: `Sidebar / Application Shell`.

Audit the application-local Showcase shell against `Sidebar.svg` and `Header.svg`. The scope includes opened and closed sidebar compositions, active and default menu items, header default/hover/typing/filled states, desktop and narrow stress, the existing live Showcase composition, and every repository-local shell/sidebar/header alternative discovered by the census.

Keep application-shell composition ownership explicit. Reuse already verified Button, Link, Avatar, Tooltip, and other primitives as regression dependencies rather than re-certifying them. Exclude a new reusable App Shell/Sidebar package, routing, authorization, portal-specific navigation, and responsive behavior not established by source or an approved contract. Existing application-local implementation is evidence to audit, not visual authority.

Completion boundary: the family receives its own manifest, occurrence classification, source/contract ledger, applicable seven-level evidence, consumer/stress coverage, findings disposition, inventory update, and Wave 9 report. `VERIFIED` may be claimed only for the bounded application composition actually proven; a public reusable shell remains outside this wave.

## Wave 10 — Card compositions

Included inventory family: `Card compositions`.

Audit `Card with button.svg`, `Reports card.svg`, and `Cover.svg` as source-defined card/cover compositions. Record content, image, action, report-card, and cover variants; reconcile source geometry and typography; and prove the repository-wide absence or classification of production, consumer, diagnostic, native, and local alternatives.

The starting disposition is source-only. As Wave 6 did for Date Picker / Calendar, absence may be a valid verified audit outcome. Static exports do not establish click behavior, navigation, loading, media lifecycle, responsive reflow, data models, or a generic Card API. This wave excludes inventing those contracts and excludes re-certifying any verified primitive nested in the source frames.

Evidence boundary: Card compositions may receive an independent source/absence manifest, applicable evidence with reasoned `not-applicable` levels, inventory update, and report. PR #43 is the regression fixture for this case: its zero production implementations and source-only `VERIFIED` audit disposition are valid bounded evidence, but they did not deliver or advance a product Wave 10. A product Wave 10 requires a separate explicit expected production delta backed by a complete current requirements/OpenSpec contract; the short numbered intent supplies no missing semantics.

## Wave 11 — Upload / Document compositions

Included inventory family: `Upload / Document compositions`.

Audit the higher-level `Documents.svg` and `Detailed appeals.svg` compositions: Document, Upload-Drag, Description Files, Small document, Attached Document, and Drag and Drop Document. Census and classify composition roots and local alternatives, and determine precisely where the already verified File Row and Document Row primitives are reused versus where the source describes a distinct upload/document composition.

File Row and Document Row keep their Wave 5 status and are regression dependencies, not proxies for this family. Static source does not establish file selection, drag/drop events, validation, progress, retry, preview, removal, upload transport, persistence, or form integration. This wave excludes inventing that lifecycle or promoting screen-specific Detailed appeals layout into a generic library contract.

Completion boundary: the composition family receives its own manifest, source-to-primitive boundary, occurrence/alternative census, applicable runtime and consumer evidence or explicit absence reasons, inventory update, and Wave 11 report. Any newly justified interactive upload capability requires an explicit current contract and must pass the completion gate independently from File Row and Document Row.

## Wave 12 — Messaging / History / Planner compositions

Included inventory family: `Messaging / History / Planner compositions`.

Audit `Messages.svg`, `History of changes.svg`, and `Planner.svg`, covering their recorded history content, employees, events, text-editor, messages, and attachment compositions. Maintain separate evidence and findings dispositions for Messaging, History, and Planner within the inventory family; the parent family reaches `VERIFIED` only when all three dispositions are explicit and no sub-scope is inferred from another.

The starting disposition is source-only. The source does not establish editor commands, message delivery, read state, synchronization, chronology, event recurrence, scheduling/timezone rules, employee data, attachment lifecycle, persistence, or live-region policy. This wave excludes inventing those application behaviors, a rich-text editor, messaging service, planner engine, or generic domain model, and it does not re-certify verified Notification, Snackbar, File Row, Document Row, Avatar, or other nested primitives.

Completion boundary: each of Messaging, History, and Planner has a source/absence and occurrence ledger with independently stated applicable evidence, limitations, and findings; the family inventory row is reconciled; and the Wave 12 report preserves the three separate dispositions. Runtime implementation proceeds only for semantics established through current requirements/OpenSpec resolution.

## Product-roadmap advancement

Audit dispositions remain recorded in the inventory and reports, but do not consume product entries. A numbered entry advances only when its pre-execution route receipt records `workKind: product`, a non-empty expected production delta, and product-roadmap eligibility, and delivery proves that same delta. Completing or merging bounded evidence does not authorize the next numbered wave. After the current episode, stop unless the user separately requests another wave; agents never merge on the user's behalf.
