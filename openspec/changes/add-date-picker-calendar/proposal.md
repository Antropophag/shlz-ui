## Why

SHLZ applications need a reusable date-selection family, while the repository currently records Date Picker and Calendar only as source-backed audit material with no production styles, behavior, public contract, documentation, or consumer proof. The next project needs this capability, so the Figma-exported visual evidence must be promoted through an explicit framework-neutral behavioral and accessibility contract rather than reimplemented inside one application.

## What Changes

- Add a standalone inline Calendar supporting date-only single and range selection, month navigation, one- and explicitly requested two-month presentation, and date constraints.
- Add a Date Field that displays and accepts localized manual date input while exposing stable `YYYY-MM-DD` date-only values without timezone conversion.
- Add a Date Picker composition that connects Date Field and Calendar through the existing Popover infrastructure and closes after a single-date selection or a completed range.
- Define native-form participation, reset and change behavior, invalid-input presentation, locale fallback, disabled/read-only behavior, and application-owned disabled-date policy.
- Define keyboard navigation, focus movement, accessible naming and announcements, dismissal, and focus restoration for inline and popover use.
- Implement source-backed framework-neutral styles and behavior first; keep Vue and other framework adapters outside the foundation.
- Add exhaustive Showcase fixtures, a real application-owned consumer flow, source-integrity checks, unit/structural/runtime/accessibility/visual/responsive evidence, documentation, and component-audit reconciliation.
- Preserve `shlz-design-source/` unchanged and distinguish source-observed visuals from behavioral design-system decisions.

Non-goals are date-time selection, timezone conversion, recurrence, week numbers, presets, natural-language parsing, application-specific scheduling rules, and a framework-specific foundation.

## Capabilities

### New Capabilities

- `forms/date-field`: Localized date-only display and manual input, stable form values, validation, constraints, and form lifecycle.
- `date-selection/calendar`: Inline calendar presentation, navigation, single/range selection, constraints, keyboard interaction, accessibility, and one/two-month layout.
- `forms/date-picker`: Popover composition of Date Field and Calendar, synchronized selection/input state, commit and dismissal behavior, and focus lifecycle.

### Modified Capabilities

None. The repository has no living OpenSpec capability for this family.

## Impact

Implementation is expected to add public framework-neutral CSS and behavior exports, Date Picker and Calendar documentation, Showcase fixtures and a consumer flow, component manifests/audit evidence, and focused automated tests. It will reuse the existing Popover positioning and lifecycle seam without changing Popover's public contract unless implementation discovery proves a separately routed requirement. The principal risks are ambiguous parsing, locale-dependent behavior, timezone leakage, inaccessible grid interaction, range-state complexity, and visual overfitting to incidental SVG geometry; the new specs make these boundaries explicit.
