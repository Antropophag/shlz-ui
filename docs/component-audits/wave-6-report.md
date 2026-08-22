# Wave 6 — Menus, Hints & Date Selection

Baseline: `e893a7eb473d4c655a641ab984ed4c7b842d1723` (merged PR #20). Branch: `audit/wave6-menus-hints-date-selection`.

## Scope and authority

Dropdown Menu, Tooltip and Popover are reusable framework-agnostic CSS plus progressive-enhancement behavior families. Their only visual authorities are `Dropdown menu.svg`, `Tooltip.svg` and `Popover.svg`. Date Picker / Calendar is different: `Date-Picker.svg` and `Calendar.svg` are authoritative source material, but the repository has no production CSS, behavior, public export, documentation, Showcase fixture, Data Workspace consumer, application-local picker or native `input[type=date]`.

Date Picker / Calendar therefore remains **source-only**. The source index records a 20-variant Date-Picker Component Set (`Size`, `State`, `Filled`, `Ranged`) and a separate Calendar composition. No locale, timezone, parsing, formatting, selection, navigation, form-event or accessibility API is inferred from those static files. A reusable picker requires a separate scoped implementation PR.

## Audit disposition

- Dropdown Menu: repository-wide executable, stress, diagnostic and plain-HTML occurrences are classified; command-menu semantics remain distinct from Select and generic links.
- Tooltip: short non-interactive descriptions retain `role=tooltip` and a visible-only `aria-describedby` lifecycle; title attributes are not treated as Tooltip implementations.
- Popover: non-modal anchored content retains native trigger and nested-control semantics; focus entry remains consumer-owned.
- Calendar: source integrity and absence census are verified without a runtime claim.

The bounded production fixes add idempotent controller ownership, make the latest opened Tooltip/Popover the sole Escape owner, expose Dropdown active paint from the existing highlighted surface decision, allow Tooltip wrapping, and let Popover bodies grow beyond the source-default minimum. No framework adapter, portal, generic overlay manager, floating engine, date library or new public API was added.

## Evidence contract

`interaction-evidence-wave6.spec.js` records a material state only after its browser assertion succeeds, then exact-compares executed states with each manifest. Static source matrices and fake visual helpers are never runtime evidence. Calendar has an empty executable ledger with concrete not-applicable reasons.

Baseline and final command results, review findings, CI services, snapshot disposition and mergeability are reported in the PR handoff. `shlz-design-source/` remains read-only and unchanged.
