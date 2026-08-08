# Pagination

## Purpose and evidence

| Class    | Evidence / contract                                                                           |
| -------- | --------------------------------------------------------------------------------------------- |
| FACT     | `Pagination.svg` contains 39×39 outlined/white items and 40×40 current/pressed circles.       |
| FACT     | It shows previous, next, number, ellipsis and first/last icons plus a composed page-size row. |
| FACT     | `Pagination (2).svg` repeats the same composed 39/40 px pattern in a horizontal context.      |
| FACT     | `Pagination (1).svg` is titled Placeholder and depicts empty states, not pagination.          |
| DERIVED  | Main and `(2)` are one pagination family; `(1)` is excluded despite its filename.             |
| DECISION | Navigation uses `<nav>`, links, `aria-current="page"`, and non-link disabled spans.           |
| UNKNOWN  | Page-window algorithm, responsive collapse and application URL construction.                  |

The library provides CSS and expected markup, not a page-range generator.
Ellipses are non-interactive and hidden from assistive technology. Previous and
next links require accessible labels; unavailable controls are spans with
`aria-disabled="true"`, never fake disabled anchors.
