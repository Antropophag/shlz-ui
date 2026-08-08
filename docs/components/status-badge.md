# Status and badge

## Purpose and contract

Presentation-only `<span>` primitives. Status is a 30 px text pill. Badge is a compact count/marker at 16 or 23 px. They are intentionally separate contracts.

```html
<span class="shlz-status shlz-status--green">Активен</span>
<span class="shlz-badge" aria-label="3 уведомления">3</span>
```

## Evidence matrix

| Classification | Evidence                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FACT           | `Status.svg`: 30 px pills with radius 15 and blue/green/orange/purple/cyan/neutral fills. `Bage.svg`: 16×16/29 and 23×23/35 pills, blue/neutral/white forms. |
| DERIVED        | Status carries textual metadata; Bage represents compact counters/markers. Color meaning cannot be recovered reliably from outlined labels.                  |
| DECISION       | Stable color-family modifiers instead of invented business meanings; neutral badge variant; plain inline elements and no runtime.                            |
| UNKNOWN        | Semantic meaning of each Status color; canonical typography; announcement/live-region policy; maximum badge count formatting.                                |

Do not encode meaning only in color. Provide visible text or an accessible text equivalent. Add `aria-live` only when the application truly needs an announcement.
