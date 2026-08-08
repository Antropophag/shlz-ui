# Switch

## Purpose and contract

Native `<input type="checkbox" role="switch">`; checked remains the single state source. Sizes: 24×14, 38×20 and 52×30.

```html
<label class="shlz-switch">
  <input class="shlz-switch__input" type="checkbox" role="switch" />
  <span>Включено</span>
</label>
```

## Evidence matrix

| Classification | Evidence                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| FACT           | `Switch.svg`: 24×14, 38×20, 52×30 tracks; white thumbs; brand on and neutral off; opacity 0.4 examples.    |
| DERIVED        | Repeated on/off rows support three sizes and disabled-looking opacity.                                     |
| DECISION       | Checkbox with `role="switch"`; CSS motion only; focus outline; reduced-motion override; label is required. |
| UNKNOWN        | Whether switching has immediate persistence, async failure behavior, or an additional loading state.       |

No JavaScript state machine is supplied. Application behavior listens to native `change`.
