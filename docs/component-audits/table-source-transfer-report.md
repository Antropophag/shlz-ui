# Table source transfer

Table and Domain table compositions are `VERIFIED` for the scope below.
Implementation commit: `d1a47a60923ed2a3e506da98a2729505bb6af88f`.
[PR #91](https://github.com/Antropophag/shlz-ui/pull/91) remains unmerged.
This report does not certify other component families.

## Source scope

- 49 exact Table Cell tuples; three Sorter states and three Filter states.
- Nine Table.svg domain families represented by ten native tables, including
  short/long field management, accounting for all 31 exported rows/headers.
- Source-backed header groups, two-arrow sorting, funnel filtering, cell
  hover/pressed/editing, blank/filled content, priority/icon actions, Checkbox,
  Switch, Status, Button and popup choices. Data operations stay consumer-owned.
- Visible body/edit/popup and embedded Status text is 15px/19.5px/-1%.
  The old 14px interpretation came from non-rendered checkbox-label nodes.
- Original row/header masks are 50px and override conflicting 48px metadata.
  Popup content bounds are 140×154; SVG bounds are 200×188 including shadows.
- Source checkboxes are 20px and switches 38×20. Decorative gutters/edit slots
  fold into logical column geometry rather than fake data columns.
- Production header/add-row text uses the existing accessible supporting role;
  inert source paint and existing Status semantic corrections remain explicit.

Original Table Cell.svg, Table.svg and companion icon source bytes are unchanged.
`table-source-matrix.json` and `table-source.test.mjs` trace exact source identities,
geometry, typography and metadata conflicts.

## Observed inventory

The full Showcase contains 112 native tables:

| Classification                                                         | Observed count |
| ---------------------------------------------------------------------- | -------------: |
| Executable/stress Table fixtures                                       |              3 |
| Live Table consumers: Data Workspace and URL Pagination                |              2 |
| Inert Table diagnostics: 49 cells, 10 compositions, 1 fidelity example |             60 |
| Developer documentation metadata tables                                |             34 |
| Foundation/source metadata tables                                      |              2 |
| Independent Calendar Grid diagnostic tables                            |              2 |
| Independent Bar Chart accessibility tables                             |              9 |

All 65 `.shlz-table` roots and 47 native non-Table roots are classified. Source
viewers keep keyboard-scrollable wrappers outside inert/ARIA-hidden tables.
Dynamic Checkbox/Switch/Status/Button rows are classified through the editing
table group; four new Dropdown occurrences retain existing controller ownership.

## Validation and review

- **278/278 unit tests passed** on the delivered implementation.
- **368/368 browser/visual CI tests passed**, including all existing components.
  [Completed CI run](https://github.com/Antropophag/shlz-ui/actions/runs/34473966905).
- **86/86 finite source members passed** the executable oracle: 49 cells,
  31 composition rows, three Sorter and three Filter states.
- An exact ledger covers **12 real material states**. Focused axe reports zero
  violations on the editing and Data Workspace tables; active-text contrast,
  keyboard, Escape/focus restoration and disabled controls are checked.
- Data Workspace proves sort/filter draft/apply/reset, selection and empty
  recovery. Editing proves actual row creation and text/choice updates.
  Pagination follows native URLs and changes rendered rows.
- Narrow/content stress proves reachable popups and containment of positioned
  hidden labels. The host-page overflow regression is covered at enlarged text.
- Three focused cell snapshots cover header, typing and open Status choice;
  Table, Data Workspace and Fira snapshots reflect source corrections.
- Desktop/mobile surfaces and native hover/down, Tab, Enter/Space, editing,
  suggestions, disabled controls and narrow overflow were walked and inspected.
- **Four packed packages** install and are consumed in a clean project.
- Source/package validation, release intent, strict OpenSpec validation,
  Required checks, Cross-browser smoke and SonarCloud all passed.
- Independent **Standards PASS** and **Spec PASS** re-attest the complete episode
  from `1c142df` through `d1a47a6` using distinct Codex runtime identities.
- TDD, finite-set validation, review, conformance and delivery receipts passed
  for `d1a47a6`; material delivery digest:
  `afb802819d700447948bba36919d546ea95e34446fd7ecfdf56ec35ce1c1a401`.
- No unresolved PR review threads were present at the completion check.

## Resolved host-page findings

The first full CI run exposed snapshot-origin shifts and page-wide overflow.
Source galleries had been inserted before old fixtures, and an absolutely
positioned Switch label escaped its table scroller, creating a 507px document
at a 390px viewport. Galleries now follow existing surfaces, visual-isolation
markers identify additions, feedback reuses its original paragraph, and the
wrapper contains positioned descendants. Existing unrelated baselines were
restored rather than regenerated. The final complete CI run is green.

## Limits

Table supplies native HTML/CSS, not a data engine, remote API, persistence,
virtualization, resizing, sticky mode or mobile-card transformation. Popup
placement and data operations are consumer integration. Standalone nested
component contracts remain independent; scoped axe is not blanket WCAG certification.

Local full Prettier still reports five pre-existing route-receipt format failures:
`add-cross-browser-smoke-review`, `add-cross-browser-smoke`,
`classify-existing-component-records`, `classify-source-extraction-diagnostics`,
and `fix-rounded-control-alignment`. All were verified in immutable main base
`194b3e6`; those unrelated files are unchanged. All changed files are formatted.

The completion-record follow-up changes documentation/checklist state only.
GitHub may rerun checks for that metadata commit; implementation evidence above
is bound to the fully green implementation commit. Merge remains user-owned.
