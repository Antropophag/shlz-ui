# Switch

## Purpose and contract

Native `<input type="checkbox" role="switch">`; checked remains the single state source. The authoritative Component Set exposes Small 24×14 and source-spelled Meduim 38×20. A 52×30 rectangle observed in the legacy sheet belongs to mask/clip geometry and is not a public Switch variant.

```html
<label class="shlz-switch">
  <input class="shlz-switch__input" type="checkbox" role="switch" />
  <span>Включено</span>
</label>
```

## Evidence matrix

| Classification | Evidence                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| FACT           | Component Set `48:1166`: 24×14 and 38×20 tracks; white thumbs; brand on and neutral off; disabled variant roots have opacity 0.4. |
| DERIVED        | Repeated on/off rows support two sizes and disabled-looking opacity.                                                              |
| DECISION       | Checkbox with `role="switch"`; CSS motion only; focus outline; reduced-motion override; label is required.                        |
| UNKNOWN        | Whether switching has immediate persistence, async failure behavior, or an additional loading state.                              |

No JavaScript state machine is supplied. Application behavior listens to native `change`.
