# Date Field

## Status

`Executable behavior / visual layer in progress`. Date Field is the editable,
form-integrated part of the Date Picker family. It does not open or own a
Calendar; composition arrives through the separate Date Picker contract.

## Purpose

Date Field displays a locale-formatted civil date while preserving a stable
`YYYY-MM-DD` value for application state and native form submission. Values do
not contain a time or undergo timezone conversion.

## Setup and executable example

Import the framework-neutral controller from `@shlz/behaviors/date-field`.
The complete plain-HTML fixture is executable at
`tools/fixtures/date-field.html` and is covered by the focused browser contract.

```html
<form id="example-form">
  <div id="delivery-date"></div>
  <button type="reset">Сбросить</button>
  <button type="submit">Отправить</button>
</form>

<script type="module">
  import { DateFieldController } from "@shlz/behaviors/date-field";

  const field = new DateFieldController(
    document.querySelector("#delivery-date"),
    {
      label: "Дата доставки",
      name: "deliveryDate",
      value: "2026-08-28",
      locale: "ru-RU",
      description: "Введите дату полностью",
      error: "Введите доступную дату в указанном формате",
      min: "2026-08-01",
      max: "2026-12-31",
      required: true,
    },
  );

  field.root.addEventListener("shlz:date-field-change", (event) => {
    console.log(event.detail.value); // YYYY-MM-DD
  });

  field.root.addEventListener("shlz:date-field-trigger", () => {
    // An application or Date Picker composition may open a Calendar here.
  });
</script>
```

Call `field.destroy()` from the application teardown lifecycle.

## Public TypeScript contract

`DateFieldControllerOptions` accepts:

| Option           | Contract                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `label`          | Required visible label.                                                                                         |
| `name`           | Name of the hidden native form value; omit for a display-only field.                                            |
| `value`          | Initial empty string or strict `YYYY-MM-DD`.                                                                    |
| `locale`         | Explicit `Intl` locale. Falls back to document language, then the runtime locale.                               |
| `description`    | Optional persistent help text associated with the text input.                                                   |
| `error`          | Optional validation message revealed for invalid manual input.                                                  |
| `triggerLabel`   | Optional accessible name for the calendar trigger; defaults to Russian for `ru*` locales and English otherwise. |
| `disabled`       | Disables editing, trigger activation, and form submission.                                                      |
| `readOnly`       | Makes text read-only and disables the calendar trigger; the value still submits.                                |
| `required`       | Rejects an empty manual commit through native required semantics.                                               |
| `min`, `max`     | Inclusive strict ISO bounds.                                                                                    |
| `isDateDisabled` | Application predicate for unavailable ISO dates.                                                                |

The controller exposes `root`, `input`, `formInput`, `trigger`, `locale`,
`constraints`, `initialValue`, the current read-only `value`,
`setValue(value, { emit })`, and `destroy()`.

`setValue()` rejects malformed ISO values and values outside the configured
constraints. It updates visible and form values; it emits only when explicitly
called with `{ emit: true }` and the committed value changes.

## Values, editing, and validation ownership

- The visible text input uses the complete numeric `Intl.DateTimeFormat` pattern
  for the resolved locale.
- Manual input is strict: all pattern parts must be present, numeric, unambiguous,
  and form a real calendar date. Natural-language parsing is unsupported.
- Invalid, incomplete, impossible, out-of-bounds, and disabled dates remain
  visible for correction. They do not replace the last committed ISO value.
- The field sets `aria-invalid`, exposes the configured error through
  `aria-describedby`, and adds `.shlz-date-field--invalid`. The application owns
  message wording and any server or cross-field validation.
- Commit occurs on native `change` or Enter. Blur alone follows the browser's
  normal change behavior.

## Events and form semantics

A successful user commit dispatches bubbling `input` and `change` events from
the hidden form input, followed by one bubbling `shlz:date-field-change` event
from the root. Its `detail` is `{ value: string }` with an ISO value or `""`.
The trigger dispatches bubbling `shlz:date-field-trigger` without opening a
surface itself.

The visible localized input has no form name. The hidden input is the stable
form-value owner. Native `FormData` therefore receives `YYYY-MM-DD`. Native form
reset restores the initial visible text and ISO value and clears invalid state.

## Accessibility and framework boundary

The controller creates a native label/text-input relationship and native
disabled, read-only, and required semantics. The trigger is a native button with
an action-oriented accessible name. Framework adapters may wrap lifecycle and
event plumbing, but must not replace the ISO value, validation, or DOM behavior
contracts.

## Non-goals

Time selection, timezone conversion, recurrence, week numbers, presets,
natural-language parsing, popup positioning, Calendar selection, and range
composition are outside the standalone Date Field contract.
