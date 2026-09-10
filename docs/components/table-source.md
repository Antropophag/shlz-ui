# Table source coverage

Table presentation is grounded in the original `shlz-design-source/raw/svg/Table Cell.svg`; `Table.svg` supplies composition evidence. The original SVGs are visual authority. Their text is outlined, so readable variant names and Figma node IDs come from the byte-preserved ZIP extraction and remain derived evidence.

## Original SVG facts

- `Table Cell.svg` is 2580×1626, SHA-256 `07ce2976671d2c74fdd0afb7058a5fe162bbf3ecf8e7c8c7920f160796ba69c5`. Its matrix shows 50px ordinary cells, 8px inline insets and a 1px bottom divider: normally `#D1D8DF`; filled Status and Switch variants #12/#13/#37–#41 use `#DFE2F0`, while active editing #26/#30/#42/#43/#49 uses `#253D98`.
- `Table.svg` is 2042×3886, SHA-256 `3d9c6eca8a31a12e1e9de448acf5c28f1e04c6819f04e7bb4cbb7f0d1df2714a`. It shows nine application compositions. All original row/header cell masks are 50px, including Обращения. Its Figma metadata reports 48px, which conflicts with both original SVG masks and the exported SVG; the original 50px geometry wins.
- Observed paints are primary text `#0B1623`, secondary text `#939CA5`, hover `#EEF0F4`, active row `#F4F6F9`, primary `#253D98`, selected soft fill `#DFE2F0`, and priority greens `#45B64E`/`#57965C`.

These values describe the table family. Intrinsic widths and popup bounds are component geometry and are not global tokens.

## Derived extraction evidence

The Basic elements ZIP manifest names 49 Table Cell variants at node `52:3360`: Text 16, Status 7, Check 6, Icon 6, Dropdown 4, Button 3, Switch 3, Empty 2 and Priority 2. Ordinary widths observed in those variants are 40, 48, 54, 110, 140 and 167px. Three open Text Typing, Status Pressed and Dropdown Pressed components have 140×154 content bounds in Figma metadata. Their actual SVG export bounds are 200×188 including shadow padding. Neither 154px nor 188px is a row height.

The same extraction contains Sorter Inactive/Ascending/Descending (16×16) and Filter Default/Hover/Active (16×18). The Interface elements ZIP names 31 variants across nine application tables: Обращения 4, Управление статусами 4, Управление организациями 3, Управление профилями 3, Привязанные профили 2, Управление категориями 3, Управление полями 6, Автоназначение 3 and Справочники 3. The two Управление организациями defaults have the same exported name; they remain separate source occurrences.

Pagination stays an independent primitive composed beside a table. Its ZIP source has 20 40×40 buttons: Prev, Next and Number in four states each, plus Ellipsis Prev and Ellipsis Next in four states each. The standalone group is 320×40. The disabled ellipsis variants are present in source.

## Repository contract and limitations

Native `table`, `thead`, `tbody`, `tr`, `th` and `td` preserve table semantics. Sort state belongs to `th[aria-sort]`; selection, data changes and paging remain consumer-owned. Status, Checkbox, Switch, Button, Dropdown and Pagination retain their own contracts. The nine named tables are inert source specimens and composition recipes, not nine public components.

The source matrix identifies every cell as `table-cell-source-1` through `table-cell-source-49`. Ten native table specimens transfer the nine Table.svg families; Управление полями is rendered as separate short and long tables so both column contracts remain legible. Each extracted family variant maps to an actual header or body row through `data-table-composition-variant`; labels sit in figure captions rather than replacing source data. Static hover, pressed, typing, open-popup and application-row states are explicitly diagnostic. Runtime examples must use actual native controls and must not infer behavior from the SVG. The source does not establish resizing, sticky headers, virtualization, responsive cards, remote loading or a reusable data controller.

Production header/add-row text uses the existing accessible supporting-text role instead of the low-contrast source Gray 200. Inert source diagnostics retain the original paint. This is an explicit repository decision following the established semantic-contrast approach, not a claim that the source SVG changed. Existing Status semantic foreground corrections also remain in force.

Visible body/edit/popup text and embedded Status use Golos Text Regular 15px,
130% line height and -1% tracking. Header and add-row text use Medium 12px/18px
with zero tracking. The recovered `sourceReferences` identify the actual text
nodes; the 14px/20px typography signature belongs to non-rendered checkbox-label
nodes and must not be used as the body contract. The outlined SVG glyph heights
corroborate the 15px visible-text metadata. Table scopes embedded Status typography;
its existing semantic foreground and standalone typography stay independent.
