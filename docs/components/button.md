# Button

## Purpose and contract

Native `<button>` for actions. Source modes are `primary`, the compatible neutral default (Secondary), and `--text`; sizes are `xs` (26), `sm` (32), default (40). Label buttons exist in all three sizes; icon-only source variants exist at 32 and 40. Icon-only buttons require an accessible name.

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
| FACT           | Label typography is Golos Text Regular: 15/19.5 with -1% tracking at 40px, and 14/18.2 with -1% tracking at 32/26px.                                                                 |
| UNKNOWN        | Loading contract; no Loading axis exists in the authoritative Component Set.                                                                                                         |

Focus is an accessibility decision, not a recovered Figma state. The consumer must set `type` deliberately in forms. Loading remains outside the source-backed API.
