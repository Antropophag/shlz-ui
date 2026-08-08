# Textarea

## Purpose and contract

Native multiline `<textarea>`, sharing field colors and states with input while preserving its distinct geometry.

```html
<label class="shlz-field">
  <span class="shlz-field__label">Комментарий</span>
  <textarea class="shlz-textarea" rows="4"></textarea>
</label>
```

## Evidence matrix

| Classification | Evidence                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FACT           | `Textarea.svg`: approximately 395×58 px examples, 8 px outer radius, 1.5 px brand/error outlines, white/neutral fills, disabled-looking opacity treatments. |
| DERIVED        | Input and textarea share visual state colors and border treatment, but not radius or height.                                                                |
| DECISION       | Minimum 58 px, fluid width, vertical native resize; native disabled/readonly; keyboard focus outline.                                                       |
| UNKNOWN        | Intended row count, maximum height, font/line-height, resize policy in product contexts.                                                                    |

Associate a label and use `aria-invalid` plus described error text when invalid.
