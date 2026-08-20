# Developer documentation clean replay — 2026-08-20

## Outcome

The developer-facing documentation work was replayed onto a clean branch from the current authoritative `origin/main`. The mixed historical commit `f3946cf` and unrelated shared-working-tree work were not included.

- Branch: `chore/developer-docs-clean-20260820`
- Base: `41e91d225437c78ccf3b359df84c15e93b10937a`
- Source documentation range: `0f5db25..0806a52` (12 logical commits)
- Additional replay adaptations: four commits for visual isolation, current Select truthfulness, browser coverage, and formatting
- Push, merge, and PR creation: not performed

The original session scope and component list remain documented in [developer-docs-session-report-2026-08-20.md](developer-docs-session-report-2026-08-20.md). The per-iteration evidence remains in [work-log-2026-08-20.md](work-log-2026-08-20.md).

## Replay adaptations

The replay preserved the intent of the 12 documentation commits rather than restoring their stale base verbatim.

1. Conflicts in `apps/showcase/src/main.js` retained both the current upstream typography-profile behavior and the developer-documentation insertion.
2. The aggregate visual fixture retained upstream isolation for existing additive content and added isolation for developer-documentation panels.
3. Select documentation was rewritten to match current `origin/main`. Current main ships the native Select styling contract but does not export `@shlz/behaviors/select`; therefore the clean branch does not advertise the unpublished custom popup, initialization, or teardown API from the dirty shared tree.
4. The stale Select browser check was replaced with assertions for the current native, labeled, single-select production contract.

No public component API, source mapping, token, or visual value was changed.

## Visual isolation

Developer-documentation panels are additive Showcase content and are hidden only while component visual fixtures are captured. A shared `hideDeveloperDocumentation(page)` helper is used where tests perform direct screenshots outside the existing stabilization helper.

| Component | Forensic result | Clean-branch result | Action |
| --- | --- | --- | --- |
| Document Row | `INTRODUCED_BY_DOCS_BRANCH` | Pass | Hide additive docs before the existing fixture capture. |
| Button | `INTRODUCED_BY_DOCS_BRANCH` | Pass | Hide additive docs before the source-backed fixture capture. |
| Empty State | `PRE-EXISTING` | Pass | No duplicate fix or snapshot update; current main stabilization is retained. |
| Select | `INTRODUCED_BY_DOCS_BRANCH` | Pass | Capture the first production fixture section rather than the surrounding article. |

The Select snapshot changed because the former baseline represented the whole article, while the corrected baseline represents the component fixture. The same scoped image was generated independently on clean `origin/main` and on this branch; both files had SHA-256 `9fd30a6a50ff86dfd35dbaa36cb2d713c050e5d218b9f8b30253cc7570340cf9`.

A full Chromium run exposed the same additive-layout coupling in Pagination typography and the Fira stress fixture. Both now use the same narrow isolation helper. This is test-boundary hardening, not screenshot masking: normal Showcase tests still require all developer-documentation panels to be visible.

## Verification

Final checks on the clean branch:

- `npm run check`: pass.
  - generated artifact consistency: pass;
  - unit/source/contract tests: 73/73;
  - ESLint, Stylelint, and Prettier: pass;
  - packages and Showcase builds: pass;
  - repository validation: pass;
  - Chromium Playwright suite: 89/89.
- Focused Document Row, Button, Empty State, and Select visual run: 4/4.
- Focused follow-up for Pagination, native Select, and Fira stress: 3/3.
- Package smoke was not run because current `origin/main` has no `test:packages` script; the unpublished quality-gate work was deliberately not imported.
- A Firefox CLI override was not runnable because the current Playwright config defines projects and rejects `--browser`. No test or product failure was observed; expanding the browser matrix belongs to the separately classified compatibility workstream.
- Snapshots were not broadly regenerated. Only the Select baseline was replaced after the fixture boundary was proven identical on base and branch.

## Scope audit

The diff against `origin/main` contains component documentation, its Showcase renderer, documentation validation, narrowly related browser tests, and one evidence-backed Select fixture snapshot.

It contains none of the following:

- `f3946cf` or historical Document Row implementation work;
- Takt or Profile Lab;
- IC registry-screen or request-status modifiers;
- old four-snapshot drift from the shared tree;
- review screenshots or generated icon-audit artifacts;
- typography implementation already present upstream;
- repository workflow/package-smoke/compatibility work;
- files under `shlz-design-source/`.

## Recovery relationship

The dirty shared working tree was not used as the replay base and was not cleaned. Its full-state checkpoint is documented in `docs/recovery-checkpoint-2026-08-20.md` in that shared tree; the external artifacts are at `/home/antropophag/recovery/shlz-ui-20260820T120831+0300/`.

The checkpoint protects tracked binary changes, all 123 boundary-time nonignored untracked files, Git refs, Takt unpublished deltas, Profile Lab sources, and request-status evidence. Selective semantic recovery of those old workstreams remains future work; it was not mixed into this branch.

## Commit structure

The branch keeps the 12 logical documentation batches, followed by small adaptation commits:

- visual fixture isolation;
- Select alignment with current exports;
- native Select and remaining docs-sensitive visual coverage;
- formatting.

This preserves reviewable component batches without retaining the obsolete mixed base. Squashing is not required for correctness; a reviewer may optionally group adjacent component-documentation commits during PR preparation.

## Cleanup boundary

No old branch, worktree, stash, untracked file, screenshot, snapshot, Takt file, or Profile Lab file was removed. Cleanup remains blocked on explicit user approval and should follow the recovery document's restore verification and the forensic classification.

## Readiness

Subject to independent final review, this branch is a PR candidate. The recommended next action is review/push of this branch as an isolated developer-documentation PR; recovery and cleanup should remain separate workstreams.
