# Text input

## Purpose and contract

Native `<input>` with optional, non-mandatory field wrapper. Supported sizes: 32 and 40 px; default, hover, focus, disabled, readonly and error.

```html
<div class="shlz-field">
  <label class="shlz-field__label" for="title">Название</label>
  <input
    class="shlz-input"
    id="title"
    name="title"
    aria-describedby="title-help"
  />
  <span class="shlz-field__message" id="title-help">Подсказка</span>
</div>
```

## Evidence matrix

| Classification | Evidence                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FACT           | `Select.svg` and `Input Number.svg`: 32/40 px pill input-like shells, white/subtle/muted fills, brand outline; `Textarea.svg`: brand and red 1.5 px outlines. |
| DERIVED        | Shared text-entry geometry can style a plain text input without importing Select/Input Number behavior.                                                       |
| DECISION       | Native `<input>`; `aria-invalid="true"` selects error visual; labels use `for`/`id`; `focus-visible` remains keyboard-usable.                                 |
| UNKNOWN        | Canonical font metrics; success semantics; exact label/help spacing; autocomplete policy.                                                                     |

Readonly and disabled remain native attributes. Error text should be referenced with `aria-describedby`; color alone is insufficient.
