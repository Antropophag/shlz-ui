# Tag

## Purpose and evidence

| Class    | Evidence / contract                                                                 |
| -------- | ----------------------------------------------------------------------------------- |
| FACT     | `Tag.svg` shows 29/30 px pill shells, neutral filled and outlined forms.            |
| FACT     | Person forms include a 24 px circular image and one example includes a close glyph. |
| DERIVED  | Tag supports plain, avatar and removable compositions.                              |
| DECISION | The container is a presentation `<span>`; removal uses a nested native button.      |
| UNKNOWN  | Hover/pressed/disabled states, semantic color meanings and removal behavior.        |

```html
<span class="shlz-tag">
  Александр Васильев
  <button
    class="shlz-tag__remove"
    type="button"
    aria-label="Удалить Александра Васильева"
  >
    ×
  </button>
</span>
```

Tag does not inherit Status semantics. The library does not remove DOM or own
application state; consumers handle the button activation.
