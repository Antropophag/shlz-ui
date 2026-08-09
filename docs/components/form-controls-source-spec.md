# Composite form controls: source specification

Authoritative source: Full design-system extraction `UI Kit – Basic elements.zip`. The dimensions and metadata below come from component-set manifests; SVG geometry is not normalized. Raw names are metadata, not reconstructed structured properties.

## Input

- Component Set: `Input` (`28:8864`), 21 source variants, width 222.
- Full composition: label (15 px high), 8 px gap, pill control; one Advanced source node adds a 33 px secondary action row.
- Control: Large 40 px / radius 20; Medium 32 px / radius 16; 12 px horizontal inset.
- Empty/filled text and Advanced trailing/secondary actions are present. Default `#F5F5F5`; hover/focus `#EEF0F4`; focus border `#253D98`.
- Typography: Golos Text, 14/18 control text and 14/15 label as confirmed by typography/source outlines.
- Structured `variantProperties` and component definitions are unavailable because Figma reports source errors. Therefore Size/State/Filled/Type-looking name fragments remain raw metadata, not API-confirmed axes.
- UNKNOWN: semantic purpose of the two distinct nodes with the same raw Advanced name; exact product action labels; focused empty node's extra 2 px outer bounds.

Raw source order (duplicates intentionally retained):

1. `Size=Large, State=Default, Filled=False, Type=Default` — 222×63
2. `Size=Large, State=Default, Filled=False, Type=Advanced` — 222×63
3. `Size=Large, State=Default, Filled=False, Type=Advanced` — 222×96
4. `Size=Large, State=Hover, Filled=False, Type=Default` — 222×63
5. `Size=Large, State=Hover, Filled=False, Type=Advanced` — 222×63
6. `Size=Medium, State=Default, Filled=False, Type=Default` — 222×55
7. `Size=Medium, State=Hover, Filled=False, Type=Default` — 222×55
8. `Size=Large, State=Focused, Filled=False, Type=Default` — 222×65
9. `Size=Large, State=Focused, Filled=False, Type=Advanced` — 222×65
10. `Size=Medium, State=Focused, Filled=False, Type=Default` — 222×57
    11–21. The remaining source nodes are the raw Filled/Focused/Default/Hover/Disabled Large and Medium names, preserved one-to-one in the component manifest and coverage test.

## Textarea

- Component Set: `Textarea` (`51:1615`), 20 variants, width 395.
- Confirmed structured axes: `State` = Default/Hover/Focused/Disabled/Error, `Filled` = True/False, `Show Count` = True/False. All 5×2×2 combinations exist and their raw names are the comma-joined axis values in source order.
- Full composition: 15 px label, 8 px gap, 58 px textarea control, then optional error/counter row. Total height 81.001 without secondary row and 104.001 with it.
- Control: radius 8, 12 px horizontal and 8 px vertical inset; default `#F5F5F5`; hover/focus/error `#EEF0F4`; focused/error border 1.5 px brand/red.
- Error message and counter are sibling secondary content, not native textarea content.
- UNKNOWN: product max length, resize policy, and exact browser caret/resize rendering.

## Select

- Authoritative Component Set: `Dropdown` (`36:1106`), 52 variants. The old `Select.svg` sheet is not authoritative for Input.
- Confirmed structured axes: `Size` (Large/Medium), `State` (Default/Hover/Focused/Typing/Disabled), `Filled`, `Search`, source-spelled `Multyselect`, and `Status`. The 52 raw names are preserved verbatim in the manifest; coverage validates every node against these structured values.
- Full composition: label + 8 px gap + independent control. Single width 250; multiselect/status width 280. Large total/control 63/40; Medium 55/32; radii 20/16.
- Single-select uses value/placeholder plus arrow; Search uses a search icon and editable text; multiselect/status use chips and a clear action. Existing normalized `@shlz/icons` assets provide arrow, search, and clear geometry.
- Fill/border/typography follow the same source facts as Input, but component structure and axes remain independent.
- UNKNOWN: popup/listbox behavior, status semantics, async search, chip removal policy, and why Status changes source width.

## Coverage rule

Each Figma node remains a source variant identified by node ID. Textarea and Dropdown map from structured API properties. Input maps by source node/order only; no properties are parsed from its raw name. Visually identical variants may share a reusable DOM fixture, but are never removed from coverage.
