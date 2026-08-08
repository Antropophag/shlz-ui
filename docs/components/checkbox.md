# Checkbox

## Purpose and contract

Native `<input type="checkbox">`; 16 and 20 px sizes; unchecked, checked, indeterminate and disabled.

```html
<label class="shlz-choice">
  <input class="shlz-checkbox" type="checkbox" />
  <span>Согласен</span>
</label>
```

## Evidence matrix

| Classification | Evidence                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FACT           | `Checkbox.svg`: 16/20 px frames, 4/6 px radii, 1.5 px neutral outlines, brand checked fills, white check marks, disabled-looking brand/neutral rows and an indeterminate-looking mark. |
| DERIVED        | `#7383BE` and `#EEF0F4` rows represent disabled treatment; checked and indeterminate use the same brand container.                                                                     |
| DECISION       | Native checked/disabled/focus behavior; CSS-drawn mark; `--sm` for 16 px; keyboard focus outline.                                                                                      |
| UNKNOWN        | Whether indeterminate changes accessible policy beyond the native property; exact hover mapping; typography.                                                                           |

Set indeterminate with `element.indeterminate = true`; it is a property, not an HTML attribute. Always provide a programmatic label.
