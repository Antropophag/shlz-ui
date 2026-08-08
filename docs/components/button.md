# Button

## Purpose and contract

Native `<button>` for actions. Supported: `primary` and neutral default; sizes `xs` (26), `sm` (32), default (40); text, text+icon and `--icon`. Icon-only buttons require visible text or `aria-label`.

```html
<button class="shlz-button shlz-button--primary" type="button">
  Сохранить
</button>
```

## Evidence matrix

| Classification | Evidence                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FACT           | `Buttons.svg`: 26/32/40 px high pills; matching square icon-only controls; blue `#253D98`, `#425BA6`, `#162773`, `#7383BE`; neutral `#EEF0F4`, `#DFE2F0`, white; icon+text examples. |
| DERIVED        | Blue rows map to primary default/hover/active/disabled from repeated ordering and the existing semantic aliases. Neutral rows form the default variant.                              |
| DECISION       | Native disabled state; keyboard `focus-visible` outline; class API; no forced width, so long labels and narrow containers can reflow safely.                                         |
| UNKNOWN        | Typography; state labels lost to outlines; loading contract; whether every white example is a distinct public variant.                                                               |

Focus is an accessibility decision, not a recovered Figma state. The consumer must set `type` deliberately in forms. Known gap: no loading API.
