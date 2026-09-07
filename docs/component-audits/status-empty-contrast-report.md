# Status and Empty State contrast correction

Baseline: main `f2a4882`; implementation worktree `fix/status-empty-contrast`.
The user approved this first development step while deferring GitLab activation.
The two component dispositions below are independent.

## Source and production boundary

Status.svg SHA-256 is `fa0e32fb188e7630fa8a06d566ec1a3d9eea6e1e6cfd8c1a6e8b157cadd5ee1f`.
Basic-elements ZIP SHA-256 is `1c468cc4c1246aabfd0932451dedd5126cce2d24597b3141b50f8437146e3cf8`.
Original paints and assets remain unchanged. Six Status foreground roles are
explicit semantic decisions described in the OpenSpec design; Empty State
reuses the existing accessible supporting-text role. Raw source colors remain
available for reference; the source side of comparisons is not recolored.

Empty State authority is corrected to the actual Basic-elements ZIP entries
`components/Empty-Simple/component.svg`, `Empty-Customize/component.svg` and
`Empty-Basic/component.svg`. The previous Interface-elements reference was
incorrect. No archive was edited.

## Status evidence

- Census: 19 roots — 11 executable fixtures, 3 content-stress fixtures and 5
  live consumers; 13 inert diagnostics; zero unclassified roots, legacy/native
  substitutes or local alternatives. Three live roots belong to Data Workspace.
- Nine public paints across four supported light surfaces yield 36 computed
  text/background checks. The minimum is 4.7807:1. Six formerly failing paints
  are corrected; blue, source-blue and purple retain their source foregrounds.
- Source backgrounds, orange's independent surface, 30px minimum height and
  nowrap contract remain unchanged. Badge retains its separate styling.
- The browser verifies static semantics, all classified visible occurrences,
  consumer filtering and normal semantic-variable overrides without changing
  source variables. No controller or interaction state is introduced.
- The focused paint snapshot preserves hue families and geometry. Narrow-table
  content retains the established nowrap behavior; no new wrapping API is claimed.

## Empty State evidence

- Census: 5 roots — 3 executable fixtures, 1 content-stress fixture and 1 live
  Data Workspace consumer; zero inert diagnostics, unclassified roots,
  legacy/native substitutes or local alternatives.
- Four compositions across four supported surfaces yield 32 title/description
  checks, with a minimum of 4.5750:1. Simple's title and Basic's description no
  longer use source Gray 200 in production. Primary titles remain unchanged.
- Focused source-composition and text-stress snapshots preserve illustration,
  typography and geometry. A 280px fluid composition contains long text at
  200 percent text size in a 360px viewport.
- Real Data Workspace filtering reveals readable empty content; the native
  reset action restores three rows through the existing application behavior.
  Heading and announcement ownership remain consumer-controlled.

## Walkthrough and validation

The additional agent-guided Chromium walkthrough used a 360px viewport and
real pointer hover/down/up, Tab focus-visible and Space activation of the live
reset action. Pointer and keyboard activation each restored all three rows;
the empty title measured 4.781:1 on its live surface. Across the 24 classified
Status/Empty roots, none acquired a role, live region or tabindex.

The independent browser tests first failed on old Status green (3.0195:1),
then passed for Status while Empty Simple still failed (2.7854:1), then passed
for both after their respective minimal fixes. The baseline-paint adapter
preserves these negative cases for the same browser oracle used on the candidate.

Current validation: 6/6 new focused browser tests; 43/43 affected component,
interaction and consumer browser tests; 14/14 focused source/foundation/census
tests. The Impeccable detector found zero issues in the two changed stylesheets.
All 234 Node tests, package builds, source/export validation and clean
installation of all four packed packages passed. The transient contrast probes
are test-only compositions created and removed by the browser matrix helper;
they are distinct from the 19/5 shipped occurrence counts above.

The initial full local browser run had 313/316 passes. One broad gallery
snapshot exposed an unnecessary 68px documentation shift; removing the added
paragraph restored gallery layout while retaining the accessible heading and
component documentation. Its existing snapshot then passed without a tolerance
or baseline change. The loaded-Input capture passed its isolated replay without
implementation changes. The third failure compared two captures with different
rendering lifecycles; diagnosis measured the first capture itself settling Tabs
height from 2766.8125 to 2775.8125px. The test now restores its original
same-document fixture-addition invariant (commit 4f000755), prepares both
captures identically and rejects any capture whose bounding box changes.
Strict buffer equality is retained, with PNG attachments on failure. This
setup passed 20/20 repetitions; the final three formerly failing tests passed
3/3 together. The new component-focused suite passed again, 6/6.

The full `npm run check` command stops at Prettier warnings for two unchanged
historical files: `docs/exec-plans/active/classify-existing-component-records/route-receipt.json`
and `docs/exec-plans/active/classify-source-extraction-diagnostics/route-receipt.json`.
They are identical to baseline and left outside this component change. ESLint,
Stylelint and formatting of every changed file pass; the remaining build,
source/export, packed-consumer and browser checks were executed separately.
Final full browser CI and independent review are assessed on PR #81's current
head before completion, rather than inferred from these partial runs.

Two repository bookkeeping updates accompany the new token roles and probe:
the generated foundation index now includes the six semantic values, and the
color audit counts 11 source aliases plus 8 accessible-production roles.
The historical Upload terminology census increases by one unrelated DOM
`document` reference in the new browser matrix helper (86 → 87 total paths,
72 → 73 unrelated paths). No Upload implementation or audit scope changes.

## Limits

This episode covers Chromium and the four documented light surfaces. Custom
foreground/background combinations require consumer validation. It makes no
Firefox/WebKit, assistive-technology certification, external application pilot,
GitLab activation or publishing claim. Status remains static text; Empty State
retains consumer-owned empty-data and native-action behavior. No additional
component inherits completion from these checks.
