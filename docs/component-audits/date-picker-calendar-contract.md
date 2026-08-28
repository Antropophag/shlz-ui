# Date Picker / Calendar source and acceptance contract

This contract re-attests the source family before implementation. Files below
`shlz-design-source/` are evidence only and remain read-only.

## Directly observed source facts

| Authority                                                                          | Integrity and canvas                                                                             | Observed component facts                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shlz-design-source/raw/svg/Date-Picker.svg`                                       | SHA-256 `80417fdd69bf2c20853a35f7c94926436ee097ff7db865605e3f09c2562b190f`; SVG canvas 932×2541  | The indexed `Date-Picker` component set has 20 variants over `Size`, `State`, `Filled`, and `Ranged`. Normal Large variants are 250×63 and Medium variants are 250×55; focused exports add 2 px to height. The source contains the spelling anomaly `Hove`, which is evidence rather than a public state name. |
| indexed `Picker-Dropdown` components in `design-source-index/components.json`      | Figma nodes `89:5792` and `89:13142`                                                             | One-month composition is 280×274.001; two-month composition is 560×274.001. These are separate component records, not variants of a component set.                                                                                                                                                             |
| indexed `Picker-Cell/Month` component set in `design-source-index/components.json` | Figma node `82:10764`; set bounds 296×168                                                        | Fourteen exported 30×30 variants cover observed combinations of in-view, today, selected, range start/in-range/range end, hovered, and disabled axes. The exported combinations are examples, not a claim that only those combinations may exist at runtime.                                                   |
| `shlz-design-source/raw/svg/Calendar.svg`                                          | SHA-256 `da5c97cd453930458634ec3317452dced33b8de41c418d744bf253ed75af8714`; SVG canvas 2081×2386 | The reference-screen index classifies this as `ADDITIONAL_REFERENCE` with metadata-only analysis. It is a visual reference canvas, not the indexed `Interface / Calendar` icon.                                                                                                                                |
| indexed `Interface / Calendar`                                                     | Figma node `155:46338`; 24×24                                                                    | This is the field icon only. It is not evidence for Calendar layout or behavior.                                                                                                                                                                                                                               |

The hashes, canvases, node identities, axes, variant counts, and dimensions in
this section are guarded by `tools/tests/date-picker-calendar-readiness.test.mjs`.

## Design-system decisions

These decisions come from the approved `add-date-picker-calendar` OpenSpec,
not directly from the SVG exports:

- public date values are strict `YYYY-MM-DD` strings with no time or timezone conversion;
- Date Field, standalone Calendar, and composed Date Picker are separate public seams;
- single and range selection are supported; range selection commits and closes after the second date;
- display uses `Intl` with application locale and document-language fallback, while manual parsing is strict and preserves invalid input;
- minimum, maximum, and disabled-date constraints apply consistently to input and calendar interaction;
- one month is the default; two months require an explicit option and collapse to one when the container is too narrow;
- no confirmation footer, time, timezone, recurrence, week numbers, presets, or natural-language parsing is included.

The source dimensions are fidelity targets, not automatically promoted global
tokens. Responsive collapse, semantic roles, keyboard behavior, form behavior,
parsing, and event contracts are repository decisions because the static source
does not establish them.

## Pre-implementation repository census

On the planning baseline `1020fde125aa208792cc1569c230bccb25d1511a`, the
executable roots `apps/`, `packages/`, and `tools/fixtures/` contain:

| Classification           | Count | Entries |
| ------------------------ | ----: | ------- |
| executable fixture       |     0 | none    |
| live composition         |     0 | none    |
| inert diagnostic         |     0 | none    |
| legacy/native substitute |     0 | none    |

The census recognizes `.shlz-calendar`, `.shlz-date-picker`, their
`data-shlz-*` hooks, the audit root prefix, and native `input[type=date]`.
Every future executable occurrence must receive a stable audit ID and one of
the manifest classifications before the census can pass.

## Acceptance matrix

| Surface     | State and size coverage                                                                                                   | Content/responsive stress                                                                           | Accessibility and runtime                                                                                     | Real consumer                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Date Field  | Medium/Large; empty, filled, hover, focus, invalid, disabled, read-only; single/range                                     | long localized value, primary locale plus contrasting day/month locale, narrow form width           | label/name, described invalid state, strict editing, form submit/reset, stable ISO value and committed change | application-owned native form flow through public API                                   |
| Calendar    | one month; single/range; today, selected, range boundaries/interior, hover, focus, outside month, disabled; min/max edges | long month/weekday labels, month/year boundaries, narrow container, all-disabled interval           | semantic grid and labels, roving focus, arrows, Home/End, Page Up/Down, Enter/Space, disabled-date skipping   | exercised both standalone and through Date Picker                                       |
| Date Picker | Medium/Large field; single/range; open/closed, invalid, constrained, disabled while open                                  | explicit two-month layout at wide width and one-month collapse without page overflow; locale stress | Popover positioning/dismissal, focus restoration, field/calendar synchronization, reset while open            | application-owned form accepts typing and calendar selection using only package exports |

Focused source comparisons must cover the authoritative field states and the
applicable Calendar cell/range states. Browser evidence must cover runtime,
keyboard/focus, automated accessibility, responsive/content stress, and the
real consumer separately; a page-level screenshot cannot substitute for a
component-focused comparison.
