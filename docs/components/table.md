# Table

Framework-neutral native tables with source-backed cells and header controls.
Serve `@shlz/styles/shlz.css`; HTML and PHP consumers need no JavaScript for
presentation. Framework adapters emit the same markup. Sorting, filtering,
selection, edits, row actions and page state belong to the application.

## Source coverage

[Table source interpretation](table-source.md) and the
[machine-readable matrix](../component-audits/table-source-matrix.json) account
for 49 cell variants, three Sorter states, three Filter states and nine domain
families / 31 exported composition variants. The gallery distinguishes inert
source states from executable examples. Original `Table Cell.svg` and `Table.svg`
remain authoritative and unchanged.

Ordinary cells are 50px high, with 8px inline padding and a 1px bottom divider. Filled Status and Switch cells use the softer Blue 100 divider; active editing uses Blue 200.
Production header/add-row text uses the existing accessible supporting-text role; the inert source matrix retains the original gray text explicitly.

Body typography is 15px/19.5px with -1% tracking; uppercase headings are 12px/18px medium. Cell widths
40/48/54/110/140/167px are example geometry, not width enums. Three 154px content frames (200×188 SVGs including shadow padding)
include an open popup: the underlying row remains 50px. The appeals header metadata says 48px, but the original SVG masks and rendered export are 50px; the implementation follows the SVG.

## Native markup

```html
<div class="shlz-table-wrap" tabindex="0" role="region" aria-label="Заявки">
  <table class="shlz-table">
    <caption>
      Открытые заявки
    </caption>
    <thead class="shlz-table__head">
      <tr>
        <th class="shlz-table__cell" scope="col">Номер</th>
        <th class="shlz-table__cell" scope="col">Тема</th>
      </tr>
    </thead>
    <tbody>
      <tr class="shlz-table__row">
        <td class="shlz-table__cell shlz-table__cell--numeric">2418</td>
        <td class="shlz-table__cell">Замена оборудования</td>
      </tr>
    </tbody>
  </table>
</div>
```

Keep `caption`, `thead`, `tbody`, `th[scope=col]` and native `td`. Do not assign
`role=grid` or roving keyboard focus. An overflow region can be named and made
focusable when the application needs explicit keyboard scrolling. Long content
wraps naturally; opt into `.shlz-table__truncate` with a bounded column only when
truncation is appropriate. `.shlz-table__cell--numeric` aligns numbers to the end.

## Header sorter and filter

`.shlz-table__heading` groups the label and `.shlz-table__actions` without
stretching the controls to the other end of a wide column. The source group has
a 24px shell and 6px radius (26px in the ascending-only text variant); icon-only headers use `--icon` (18px / 4px radius).
Inactive controls are revealed by hover or focus within; active state remains
visible. Touch devices show controls without requiring hover.

Use native named buttons with `.shlz-table__affordance` plus
`.shlz-table__sorter` or `.shlz-table__filter`. Place inline SVG inside the button,
not an external `img`: the two arrow paths have independently controlled fills.
The copyable source paths and complete markup are in the
[table parts example](../../apps/showcase/src/table-parts.js).

```html
<th class="shlz-table__cell" scope="col" aria-sort="ascending">
  <span class="shlz-table__heading">
    <span>Тема</span>
    <span class="shlz-table__actions">
      <button
        class="shlz-table__affordance shlz-table__sorter"
        type="button"
        aria-label="Сортировать по теме"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            class="shlz-table__sort-down"
            d="M8.16294 12.7726L10.2743 9.81669C10.3689 9.68432 10.2742 9.50044 10.1116 9.50044H5.88883C5.72615 9.50044 5.63153 9.68432 5.72608 9.81669L7.83744 12.7726C7.91721 12.8843 8.08317 12.8843 8.16294 12.7726Z"
          />
          <path
            class="shlz-table__sort-up"
            d="M8.16294 3.22828L10.2743 6.18419C10.3689 6.31656 10.2742 6.50044 10.1116 6.50044H5.88883C5.72615 6.50044 5.63153 6.31656 5.72608 6.18419L7.83744 3.22828C7.91721 3.11661 8.08317 3.11661 8.16294 3.22828Z"
          />
        </svg>
      </button>
      <button
        class="shlz-table__affordance shlz-table__filter"
        type="button"
        aria-label="Фильтр по теме"
        aria-haspopup="dialog"
        aria-describedby="topic-filter-state"
        data-filter-active="false"
        aria-expanded="false"
        aria-controls="topic-filter"
      >
        <svg viewBox="0 0 16 18" aria-hidden="true" focusable="false">
          <path
            d="M9.79004 10.4521V12.6426C9.78998 12.8402 9.63109 12.9999 9.43457 13H6.50293C6.30632 13 6.14752 12.8403 6.14746 12.6426V10.4521H9.79004ZM12.0811 5C12.3548 5 12.5257 5.29816 12.3906 5.53613L9.91797 9.7373H6.02051L3.54883 5.53613C3.41142 5.29818 3.58181 5.0001 3.85547 5H12.0811Z"
          />
        </svg>
      </button>
    </span>
  </span>
</th>
```

Set `aria-sort` on the affected column: `none`, `ascending` or `descending`.
The application chooses the sort cycle and compares its own data. A toggle filter uses `aria-pressed`. A dialog launcher uses `aria-haspopup="dialog"`
and `aria-expanded` for its open UI, with no `aria-pressed`. Set
`data-filter-active="true"` for the applied visual state and describe the
applied condition in an `aria-describedby` target (for example,
`<span id="topic-filter-state">Фильтр не применён</span>`), updating its text
when applying or resetting the filter. A draft choice does not activate the applied indicator. Dismissal
returns focus to the opener. Native `disabled` prevents activation. The filter
hover is source gray-100, while active is blue-200. Sorter's inactive arrow stays
gray-200 even when the other arrow is active.

The old generic affordance and descending-rotation class remain compatible, but
new tables should use the two-path sorter rather than rotate a one-arrow icon.

## Cell contents and states

| Content                  | Composition and ownership                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text / empty             | Plain text, or genuinely blank `td`; a dash is a consumer content choice.                                                                                                                     |
| Checkbox                 | Native `.shlz-checkbox` (source 20px; the existing medium control remains available for consumer-specific density), named for its row; select-all and indeterminate state are consumer-owned. |
| Priority                 | `.shlz-table__priority` SVG with three source bars; a meaningful accessible name describes the value.                                                                                         |
| Icon action              | A named native button; decorative icon has empty alternative text.                                                                                                                            |
| Status                   | Existing `.shlz-status` variants, including green editable status examples.                                                                                                                   |
| Switch                   | Existing native Switch composition, including checked/unchecked state.                                                                                                                        |
| Button                   | Existing small text Button; the example actually adds a row.                                                                                                                                  |
| Editable text            | `.shlz-table__cell--editable` with a named `.shlz-table__editor`. Application owns save/cancel and suggestions.                                                                               |
| Status / dropdown choice | `.shlz-table__cell-choice` wraps an existing Dropdown controller and an unframed `.shlz-table__cell-choice-trigger`. Application owns the chosen value.                                       |

Ordinary hover uses the source muted surface. Active editing uses a blue bottom
divider and a transparent surface; it does not fill the whole cell blue.
`data-selected="true"` on a row reflects the consumer's selection and displays the
source active row surface. It does not create selection behavior or replace the
checkbox's accessible state. Focus-visible controls remain keyboard visible.

`--visual-hover`, `--visual-pressed`, `--typing`, heading `--visual-hover` and row
`--visual-active` are diagnostic state helpers. They cannot prove interaction.

## Popup composition inside scrolling tables

The table wrapper establishes a relative positioning context so absolutely positioned captions and visually hidden control labels remain inside its horizontal overflow boundary.

Existing Dropdown supplies menu semantics, keyboard navigation and dismissal.
Its default absolute positioning can be clipped by a scrolling table wrapper.
The executable table example positions its choice panel relative to the viewport,
clamps it to available space and updates position on scroll/resize. That placement
is application integration, not a new Table or Dropdown controller contract.
See [table cell examples](../../apps/showcase/src/table-cells.js). Consumers must
provide equivalent positioning when composing overlays inside an overflow region.

A popup must keep its accessible relationship to the trigger, remain reachable
at narrow viewport edges, and return focus after selection/Escape. Do not make a
154px source export into a 154px row to accommodate an overlay.

## Table compositions and pagination

Nine source domains (requests, statuses, organizations, profiles, linked profiles,
categories, fields, auto-assignment and directories) demonstrate reuse of these
parts. Their column schemas and sample data remain composition examples, not
nine public core APIs. Field management has both short and long layouts.

[Pagination](pagination.md) is an independent native-link primitive. The example
renders page-specific table rows and follows real URLs; the application owns
page windows, totals, filtering resets and destinations. Disabled ellipsis
exports exist in the source; the public Pagination contract deliberately uses
non-interactive gap markers. Empty result recovery composes Empty State and a
working reset action in Data Workspace.

## Limits and verification

No sorting/filtering/data controller, remote loading, virtualization, resizing,
sticky header, responsive card transformation or implicit business model is
shipped by Table. All source-backed nested content is composed through existing
components. This transfer does not redefine those components' independent
completion status.

Focused evidence is in `table-source.test.mjs`, `table-headers.spec.js`,
`table-cells.spec.js`, `table-compositions.spec.js` and existing consumer/overflow
checks. The audit manifest records current observed coverage and limitations;
source inventories or page screenshots alone are not runtime/fidelity evidence.
