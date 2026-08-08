# Segment

## Purpose and evidence

| Class    | Evidence / contract                                                                         |
| -------- | ------------------------------------------------------------------------------------------- |
| FACT     | `Segment.svg` shows groups on `#EEF0F4` surfaces and white selected items.                  |
| FACT     | Group heights are 26, 33 and 41 px; item examples are 18, 25 and 33 px high.                |
| FACT     | Radius 6/8 containers, text-only and repeated 14 px leading-icon slots are shown.           |
| DERIVED  | Exactly one item is visually selected in each represented group.                            |
| DECISION | A value-selection Segment uses native radios in a fieldset; CSS follows `:checked`.         |
| UNKNOWN  | Whether every usage is form selection versus navigation/filtering; disabled group behavior. |

The public primitive is a radio group, not tabs or an ARIA toggle-button state
machine. Consumers needing navigation must use ordinary links and must not
apply the radio contract. Sizes are small (26), medium (33) and large (41).
