# Date Field, Calendar, and Date Picker

## Status

`Executable / Completion gate pending`. The family is framework-neutral and has three public
seams: editable Date Field, inline Calendar, and the Date Picker composition.
Public values are Gregorian date-only strings in `YYYY-MM-DD` form; JavaScript
`Date`, time, and timezone conversion are outside the contract.

Required CSS is `@shlz/styles/shlz.css`. Construct controllers after their host
elements exist and call `destroy()` during application teardown.

## Date Field

Date Field owns localized text editing, a stable hidden form value, validation
presentation, and the calendar trigger. Import it from
`@shlz/behaviors/date-field`.

```html
<form id="delivery-form">
  <div id="delivery-date"></div>
  <button type="submit">Сохранить</button>
</form>
```

```js
import { DateFieldController } from "@shlz/behaviors/date-field";

const field = new DateFieldController(
  document.querySelector("#delivery-date"),
  {
    label: "Дата поставки",
    description: "С 10 по 31 августа",
    error: "Введите доступную дату",
    name: "deliveryDate",
    value: "2026-08-12",
    locale: "ru-RU",
    min: "2026-08-10",
    max: "2026-08-31",
  },
);

// field.value is "2026-08-12"; the visible text is localized.
```

`size` is `large` by default or `medium`. `disabled` removes the hidden value
from successful form submission. `readOnly` remains focusable/readable and
disables the trigger. `required`, description, error association, form reset,
and strict Enter/change commits use native form semantics. Invalid, incomplete,
impossible, or constrained text is preserved visibly and does not replace the
last committed ISO value.

## Calendar

Calendar owns inline month presentation, selection state, constraints, and
roving keyboard focus. Import it from `@shlz/behaviors/calendar`.

```html
<div id="period-calendar"></div>
```

```js
import { CalendarController } from "@shlz/behaviors/calendar";

const calendar = new CalendarController(
  document.querySelector("#period-calendar"),
  {
    mode: "range",
    value: { start: "2026-08-12", end: "2026-08-15" },
    visibleMonth: "2026-08",
    label: "Календарь периода",
    locale: "ru-RU",
    monthCount: 2,
  },
);

calendar.root.addEventListener("shlz:calendar-change", ({ detail }) => {
  if (detail.committed) console.log(detail.value);
});
```

One month is the default. `monthCount: 2` requests two consecutive months and
collapses to one usable month when available width is insufficient. Single mode
commits one date. Range mode emits a provisional start, then an ordered committed
range after the second endpoint.

## Date Picker

Date Picker synchronizes Date Field and Calendar through the existing non-modal
Popover seam. Import only the public entry point
`@shlz/behaviors/date-picker`.

```html
<form id="trip-form">
  <div id="trip-date"></div>
  <button type="submit">Отправить</button>
</form>
```

```js
import { DatePickerController } from "@shlz/behaviors/date-picker";

const picker = new DatePickerController(document.querySelector("#trip-date"), {
  mode: "single",
  label: "Дата поездки",
  calendarLabel: "Календарь даты поездки",
  name: "travelDate",
  value: "2026-08-12",
  visibleMonth: "2026-08",
  locale: "ru-RU",
});

document.querySelector("#trip-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  console.log(data.get("travelDate")); // "2026-08-12"
});
```

Single selection commits and closes immediately. Range selection stays open
after its provisional start and closes after the endpoint. Escape and outside
interaction discard an incomplete range; Escape and committed selection restore
trigger focus. `setDisabled()` closes an open picker without committing a
provisional value. `setConstraints()` updates field and calendar policy together.

## Accessibility

- Supply visible field labels and a distinct `calendarLabel` for every instance.
- Calendar exposes a named region, labelled grids/months, weekday headings,
  selected/range/today/disabled states, and one enabled date in the Tab order.
- Arrow keys move by day/week; Home/End use locale week boundaries; Page Up/Down
  move by month; Enter and Space select.
- The trigger owns `aria-expanded`/`aria-controls`; the surface is non-modal and
  does not trap focus.
- Keep descriptions and errors concise. Do not remove native disabled,
  read-only, required, label, or hidden-input semantics.
- Automated WCAG A/AA checks complement, but do not replace, testing with the
  assistive technologies supported by the consuming application.

## Constraints and localization

`min` and `max` are inclusive ISO dates. `isDateDisabled(date)` is
application-owned policy and must be deterministic; it applies to typing,
pointer selection, and keyboard traversal. Changing constraints never silently
replaces a committed consumer value.

Formatting uses the explicit `locale`, then `document.documentElement.lang` as
fallback. Parsing accepts only the complete numeric pattern produced for that
locale. It does not guess alternate day/month order, natural language, or
calendar-impossible dates. Unsupported numbering systems fail instead of being
misparsed.

## Native forms and events

Named enabled Date Fields submit stable ISO values through hidden native inputs.
`DateFieldController` commits emit native bubbling `input` and `change` from
that hidden value owner, then `shlz:date-field-change` with `{ value }`.
Standalone form reset restores its initial visible text, ISO value, and
validity.

`CalendarController` selection emits `shlz:calendar-change` with
`{ mode, value, committed }`; it does not own a form. `DatePickerController`
composes the field and calendar lifecycles and emits one
`shlz:date-picker-change` with `{ mode, value }` for each committed picker
change. A composed form reset also restores Calendar state and closes an open
picker.

Invalid edits and provisional range starts do not emit committed-value changes.

## Non-goals and framework adapters

The family does not provide time/date-time selection, timezone conversion,
recurrence, week numbers, presets, natural-language parsing, scheduling policy,
remote availability, or confirmation footers. Vue and future adapters may map
framework props/events/lifecycle onto these controllers, but must not re-own
date arithmetic, parsing, constraints, focus, or commit rules. The framework-
neutral packages remain the source of executable behavior.

## Teardown and traceability

Call `field.destroy()`, `calendar.destroy()`, or `picker.destroy()` before a host
is discarded. See the authoritative/evidence boundary in
[`date-picker-calendar-contract.md`](../component-audits/date-picker-calendar-contract.md),
the audit manifest in
[`date-picker-calendar.json`](../component-audits/date-picker-calendar.json),
and the executable Showcase consumer in
`apps/showcase/src/date-picker-consumer.js`.
