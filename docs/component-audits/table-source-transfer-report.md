# Table source transfer

Status: implementation and local evidence are recorded in draft PR #91. Table and
Domain table compositions remain `INVENTORIED` until independent review and CI
finish; this report does not certify other component families.

## Scope and source interpretation

- 49 exact Table Cell tuples; three Sorter states and three Filter states.
- Nine Table.svg domain families represented by ten native tables (short/long
  field management are separate), accounting for all 31 exported rows/headers.
- Source-backed two-arrow sorting, funnel filtering, grouped headings, cell
  hover/pressed/editing, blank/filled contents, priority/icon actions, Checkbox,
  Switch, Status, Button and popup choices. Data operations stay application-owned.
- Visible body/edit/popup and embedded Status typography is 15px/19.5px/-1%.
  The previous 14px interpretation came from non-rendered checkbox-label nodes.
- Ordinary source rows and headers are 50px. Original SVG masks override the
  conflicting 48px appeals-header metadata. Popup content is 140×154 with a
  50px row; actual SVG shadow bounds are 200×188.
- Source checkboxes are 20px, switches 38×20. Source decorative gutters/edit
  slots are folded into logical column geometry rather than fake data columns.
- Production header/add-row text uses the existing accessible supporting role;
  inert source paint and existing Status semantic corrections remain explicit.

Original Table Cell.svg, Table.svg and companion icon source bytes remain
unchanged. `table-source-matrix.json` and `table-source.test.mjs` record the exact
source identities, geometry and conflicts.

## Observed inventory

The full Showcase contains 112 native tables:

| Classification                                                          | Observed count |
| ----------------------------------------------------------------------- | -------------: |
| Executable/stress Table fixtures                                        |              3 |
| Live Table consumers (Data Workspace and URL Pagination)                |              2 |
| Inert Table diagnostics (49 cells, 10 compositions, 1 fidelity example) |             60 |
| Developer documentation metadata tables                                 |             34 |
| Foundation/source metadata tables                                       |              2 |
| Independent Calendar Grid diagnostic tables                             |              2 |
| Independent Bar Chart accessibility tables                              |              9 |

All 65 `.shlz-table` roots and the 47 native non-Table roots have explicit
classification. Source viewers keep a keyboard-scrollable wrapper outside the
inert/ARIA-hidden table. New live Checkbox/Switch/Status/Button contents are
classified through the editing table's group, including application-added rows.
Four new Dropdown occurrences retain their existing controller ownership.

## Evidence

- Source/structural checks pin original hashes, exact ZIP tuples, SVG/metadata
  conflicts, visible typography and companion icon path geometry.
- The component browser runs cover all cell geometry/state cases and all 31
  composition rows. A separate ledger exact-matches 12 real material states.
- Data Workspace exercises sort order, header filter draft/apply/reset,
  selection and empty recovery. URL Pagination changes rendered table rows.
- Editing exercises actual row creation, text suggestions, menu selection,
  Escape/focus restoration, native keyboard activation and disabled controls.
- Focused axe reports zero violations on the editing and Data Workspace tables;
  production active-text contrast checks pass. This is scoped evidence, not a
  blanket WCAG certification.
- At 320px the live popup is positioned outside the table's overflow clipping
  and remains reachable. Source viewers scroll with the keyboard. Desktop/mobile
  source and live surfaces were visually inspected.
- Three cell snapshots isolate header, typing and open status choice; existing
  table, Data Workspace and Fira stress snapshots reflect the source corrections.
- Four packed packages install and are consumed successfully in a clean project.
- The mechanical Impeccable detector reported no findings for the changed table
  surfaces. Source values and runtime checks remain the primary evidence.

Observed command results before review:

- Full unit suite: 277/277 passed.
- Source finite-set oracle: 86/86 passed (49 cells, 31 composition rows, 3 sorter and 3 filter states).
- Source/component browser run: 25 passed; consumer/census run: 31 passed with one diagnostic role collision subsequently fixed and covered by a 5-test regression run. Final fixture synchronization is covered by a further focused run.
- Existing OpenSpec integration and strict change validation pass.
- ESLint and Stylelint pass. Prettier reports only the five verified baseline receipt-format failures below.
- Package consumer smoke: 4/4 packed packages consumed successfully.

CI and independent review remain delivery gates. Earlier failing source/census
assertions were fixed rather than accepted as component evidence.

## Remaining gates and limitations

Early orchestration workers hit an account limit. Separate `codex exec` reviewers
subsequently completed both Standards and Spec reviews with PASS against
`64a2939`, using distinct runtime identities. Their follow-up review covers the
Sonar-driven rendering refactor and proof-tool target validation.

The refactor preserves byte-identical rendering output for table cells (63,204
characters), domain compositions (39,237), and the mixed examples (19,480).
The proof CLI now accepts only this checkout or its declared baseline adapter;
undeclared targets are rejected before filesystem reads. Focused keyboard/menu
and 12-state ledger checks passed after the refactor. The PR remains draft while
final CI and delivery receipts are completed.

Full lint is blocked by five pre-existing formatting failures in route receipts:
`add-cross-browser-smoke-review`, `add-cross-browser-smoke`,
`classify-existing-component-records`, `classify-source-extraction-diagnostics`,
and `fix-rounded-control-alignment`. All five were independently confirmed in
immutable base `194b3e6`; unrelated receipt files are unchanged in this PR.

Table ships no data engine, persistence, remote API, virtualization, resizing,
sticky mode or mobile-card transformation. Popup placement and data operations
are consumer integration. The standalone contracts of nested components remain
independent. Merge remains the user's decision.

## Host-page regression follow-up

The first full CI browser run exposed 51 failures: predominantly inherited
snapshot-origin shifts, plus page-wide overflow. The new source galleries had
been inserted before old fixtures, and a Switch's absolutely positioned hidden
label escaped the scrolling table (507px document width at a 390px viewport).
The galleries now follow existing Showcase surfaces, additive diagnostics are
marked for existing visual isolation, feedback reuses the original paragraph,
and the table wrapper contains positioned descendants. The Table navigation
link uses the existing table-demo target without adding a layout box.

Focused reproduction turned both the narrow-layout and existing Segment
snapshot checks green. Replaying the failed CI cases restored 49 existing
checks without changing their baselines; the isolated Bar Chart ledger case
requires its full spec file, and the broad component image is checked separately
with the corrected navigation layout. The full Bar Chart spec and broad component image subsequently passed. A 45-test integration run passed 40 checks and isolated five table-related snapshot updates; all five updated checks then passed. All 278 unit tests passed. Final CI remains a delivery gate.
