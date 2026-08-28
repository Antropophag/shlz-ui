## Context

See `proposal.md` for motivation. The repository has source-only Date Picker and Calendar evidence in read-only raw SVGs, an established CSS package, framework-neutral TypeScript behaviors, a reusable Popover behavior, plain-HTML Showcase fixtures, and a component-audit completion workflow. The source establishes visual variants but not date arithmetic, parsing, accessibility, form, commit, or responsive behavior; those are explicit design-system decisions captured by the delta specs.

## Goals / Non-Goals

**Goals:**

- Keep the public date domain stable and timezone-free.
- Make Calendar independently usable inline and make Date Picker a shallow composition over Date Field, Calendar, and Popover.
- Put date arithmetic, selection, parsing/formatting, and interaction behind small framework-neutral interfaces that plain HTML and future adapters can reuse.
- Reuse existing repository conventions for CSS, behaviors, Showcase, source integrity, browser evidence, and audit manifests.
- Make source observations, derived implementation choices, and public behavioral decisions traceable in tests and documentation.

**Non-Goals:**

- A general temporal API, scheduling engine, or timezone abstraction.
- A Vue-first component implementation or adapter work before the core contract is proven.
- Extending Popover's public contract unless discovery produces a separately routed change.
- Mutating or regenerating any file under `shlz-design-source/`.

## Decisions

### Use ISO date-only strings at the public seam

Public values use `YYYY-MM-DD` strings (or empty values) and internal operations use explicit year/month/day parts. Native `Date` objects may be used only behind conversion helpers that prevent local/UTC rollover from entering public behavior.

This is preferred to exposing JavaScript `Date`, whose time and timezone semantics can change the calendar day, and to adopting Temporal as a new dependency before repository support and browser requirements justify it.

### Split the family into three deep modules

Date Field owns text editing, format/parse, validation presentation, trigger semantics, and form lifecycle. Calendar owns month matrices, focus navigation, selection state, constraints, and inline accessibility. Date Picker owns synchronization, Popover composition, commit/dismissal, and focus restoration.

This keeps standalone Calendar useful and prevents floating-surface details from contaminating date logic. A single monolithic picker was rejected because it would make inline use, testing, and future adapters dependent on hidden DOM and lifecycle assumptions.

### Keep behavior framework-neutral and DOM-adaptable

Pure date helpers and state transitions expose typed inputs and outputs without requiring a framework. The interactive layer binds those transitions to semantic HTML and repository behavior conventions. CSS targets documented component classes/data states and does not encode business rules.

This follows the existing behaviors/styles layering and avoids a custom element or Vue component becoming the only usable API. A framework adapter can later translate its value/events to this contract without owning calendar rules.

### Parse only the active complete display format

Formatting uses `Intl.DateTimeFormat` with an explicit consumer locale or `document.documentElement.lang` fallback. The module derives a numeric day/month/year entry pattern from `formatToParts`, accepts only a complete exact pattern, then validates the resulting Gregorian date and constraints. It does not guess alternative formats.

Strict parsing trades convenience for determinism and avoids silent day/month inversion. Natural-language parsing and locale-specific free-form heuristics remain outside scope.

### Model selection as committed and provisional state

Single mode has one committed date. Range mode distinguishes the last committed ordered range from a provisional start. Choosing the second endpoint orders and commits the range; dismissing before that restores the last committed range. A new selection after a complete range starts a new provisional range.

This makes cancellation and form events predictable. Emitting each range click as a committed form change was rejected because consumers would receive incomplete values that cannot satisfy the range contract.

### Use roving focus in a semantic calendar grid

The visible month uses grid semantics, accessible weekday headings, one tabbable enabled day, and programmatic date/today/selection/range/disabled states. Arrow, Home/End, Page Up/Page Down, Enter, and Space follow the specs. Focus navigation may move the presented month and skips dates that cannot be selected.

A grid of independently tabbable buttons was rejected because it creates an excessive tab sequence. Native date input alone was rejected because it cannot represent the source-backed calendar, range selection, or consistent cross-browser interaction.

### Treat two months as an explicit responsive enhancement

One month is the default. A consumer may request two; a container-level layout rule collapses to one when the documented minimum width is unavailable. Month state remains continuous so collapse does not alter selection or duplicate a month.

Automatic two-month expansion was rejected because it would make layout changes surprising and consumer screenshots unstable.

### Reuse Popover through composition

Date Picker supplies the trigger, surface, dismissal callbacks, and focus policy to the existing Popover seam. Calendar remains unaware of positioning. Discovery that Popover cannot meet viewport, dismissal, or focus requirements must be documented and re-routed rather than patched implicitly.

### Prove each layer independently before audit promotion

Pure tests cover ISO validation, leap years, month matrices, constraints, selection, keyboard transitions, locale part parsing, and form reset. Structural/source tests cover selectors, exports, and raw-SVG facts. Focused browser tests cover runtime events, native forms, accessibility, keyboard/focus, dismissal, viewport placement, responsive fallback, and content/locale stress. Focused screenshots cover authoritative states and sizes. Showcase supplies exhaustive fixtures plus one application-owned consumer flow. Only then may the audit manifest move from `source-only`.

## Risks / Trade-offs

- [Localized numeric parsing can differ by numbering system] → document the supported `Intl` contract and test at least the repository's primary locale plus a contrasting day/month order; unsupported digit systems must fail explicitly rather than misparse.
- [Disabled-date callbacks can be expensive across rendered months and focus traversal] → evaluate once per generated date per render/state transition and keep the initial surface bounded to at most two months.
- [Range visuals can overfit incidental SVG geometry] → record which dimensions/states are directly observed and require focused comparisons against the raw source.
- [Roving focus across constrained month boundaries has many edge cases] → isolate it as pure state transitions with leap-year, all-disabled, min/max, and month-boundary tests before DOM integration.
- [Popover reuse may reveal a missing shared capability] → stop and route any public Popover contract change separately; Date Picker may only adapt through its existing seam in this change.
- [A broad first capability increases completion-gate cost] → implement and validate vertical slices in the task order, while retaining separate completion evidence for Date Field, Calendar, and Date Picker.

## Migration Plan

This is additive and has no existing production API to migrate. Land new exports, styles, docs, fixtures, and evidence without changing current component selectors. If validation fails, remove the additive exports and files while leaving source material and existing consumers untouched. Delivery ends at an unmerged PR for user review.
