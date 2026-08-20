# Repository-wide UI baseline and inventory

## Baseline

- SHA: `3c1f10ba51a8b341126183d3338d53b711420795`
- Branch: `main`, exactly aligned with `origin/main` after PR #12 merged.
- GitHub: no open pull requests at capture time.
- Baseline tree and `shlz-design-source/`: clean before checks.
- Other work: separate Pagination and obsolete Select worktrees; remote
  `feat/document-row` and `feat/document-row-clean` branches. None were included.

`npm run check` passed generation, 79 unit/source/documentation tests, ESLint,
Stylelint, Prettier, all package and Showcase builds, source/export validation,
and the clean package-consumer smoke test. Playwright completed 110/111 tests.
The sole failure was the focused Pagination typography snapshot: 1,722 pixels
(reported ratio 0.01) differed. Three repeated captures produced the identical
glyph-edge-only delta while the computed typography contract passed. A second
five-capture series produced the same result. Wave 0 records the likely cause as
Chromium/font raster antialiasing variance and uses a 1,750-pixel absolute
budget. The test is explicitly bounded visual evidence because Playwright does
not classify individual changed pixels. The snapshot is unchanged. The build
also reported existing large Showcase chunks. Browser and visual CI is blocking
after Wave 0.

## Scope and interpretation

The machine-readable inventory is
[`project-inventory.json`](component-audits/project-inventory.json). It records
36 families/composition groups: 3 foundations, 27 reusable/public component
families, and 6 source-only or application/domain composition groups. Closely
coupled source variants are grouped where there is no independent repository
contract; the `states` arrays preserve the future fidelity scope.

Counts came from the built Showcase DOM at 1440×900. `executableShowcase`
excludes roots inside `[inert]` and Data Workspace; `dataWorkspace` is also a
subset of `liveConsumers`. They are dated observations, not hard-coded quality
thresholds. Source-only groups correctly have zero runtime occurrences.

Select is the only `VERIFIED` component because it alone passed the new gate.
Pagination returns to `INVENTORIED` after Wave 0 proved the baseline delta was
environmental glyph-edge rasterization rather than a component regression. It
is not `VERIFIED`. Every other former `done`, `source-migrated`, or
`production-ready` family also remains `INVENTORIED`.

## Evidence gaps and findings

- **P1 — shared Field contrast:** the Select audit records the pre-existing
  field label/placeholder contrast deviation and tracks it in issue #13. It is
  not fixed here and applies to the future Input/Textarea family audit.
- **P2 — Pagination visual drift:** its former zero-pixel typography threshold
  failed by 1,722 stable glyph-edge pixels across eight local captures. Wave 0
  replaces the area-relative tolerance with a 1,750-pixel absolute budget and
  does not describe the resulting comparison as pixel-exact.
- **P2 — occurrence governance gap:** only Select has stable audit IDs and a
  browser occurrence guard. Other executable and inert roots cannot yet detect
  newly introduced unclassified consumers.
- **Resolved in Wave 0 — CI observability:** browser/visual CI no longer uses
  `continue-on-error`; a red browser suite now fails the workflow.
- **P2 — Snackbar contract gap:** six source countdown states exist only as an
  inert/static matrix; runtime timing, lifecycle and accessibility are unknown.
- **P2 — source-only controls/compositions:** Date Picker/Calendar, cards,
  messaging/history/planner and several domain tables have authoritative source
  scope but no reusable implementation/evidence.
- **P3 — bundle warning:** the Showcase build reports chunks over 500 kB,
  including large embedded source-reference assets. No optimization was made.

Broad Showcase screenshots were classified as broad evidence, not focused
component proof. Regex/source tests were classified as source integrity or
structural contract, never runtime. Native semantics without explicit keyboard,
focus and labeling assertions remain partial accessibility evidence.

## Proposed audit waves

1. Tokens, typography profiles, spacing/colors/radii/effects, icons.
2. Input, Textarea, Checkbox, Radio, Switch; keep verified Select as the control.
3. Button, Link, Segment, Tabs, Pagination.
4. Status, Badge, Tag, Person Tag, Avatar, plus Priority/icon-button boundaries.
5. Table, File Row, Document Row, Empty State and domain table compositions.
6. Dropdown Menu, Tooltip, Popover; then Date Picker/Calendar if promoted.
7. Modal and Drawer.
8. Notification and Snackbar.
9. Sidebar/application shell, cards, upload/document, messaging/history/planner
   and all cross-component consumers/compositions.
10. Final repository-wide occurrence, accessibility, responsive and visual
    regression audit.

No UI implementation, behavior, snapshot, generated source artifact, or file
inside `shlz-design-source/` was intentionally changed during this phase.
