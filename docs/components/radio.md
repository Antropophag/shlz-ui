# Radio

## Purpose and contract

Native `<input type="radio">` for an exclusive choice. One 20 px CSS box represents the observed 18.5 px geometry plus its 1.5 px stroke.

```html
<fieldset>
  <legend>Режим</legend>
  <label class="shlz-choice"
    ><input class="shlz-radio" type="radio" name="mode" /> Первый</label
  >
</fieldset>
```

## Evidence matrix

| Classification | Evidence                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| FACT           | `Radio.svg`: repeated 18.5×18.5 circular paths, 1.5 px strokes in brand/disabled/neutral colors, selected inner marks. |
| DERIVED        | Neutral and brand-light rows are disabled-looking variants.                                                            |
| DECISION       | Native grouping by `name`; 20 px CSS outer box; focus-visible outline; fieldset/legend recommendation.                 |
| UNKNOWN        | Hover semantics, validation state, exact label gap and font.                                                           |

Do not replace radio grouping with application state. Use a shared `name`; describe the group with `fieldset`/`legend` when practical.
