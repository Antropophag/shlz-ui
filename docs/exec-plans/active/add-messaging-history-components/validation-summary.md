# Validation summary

Candidate validation is relative to immutable implementation baseline
`3b37002e6ea95c6000a6daa5bcf56d997262ddf4`.

## Cross-component visual baseline investigation

The full browser run initially passed 264 of 269 tests and failed five focused
legacy visuals: Calendar Grid header/source, Card with action narrow, Date
Picker two-month, and Planner Schedule source. The same failures reproduced
locally. A detached clean `origin/main` worktree at `c36576e` passed the five
tests, proving branch causality.

Commit-by-commit reproduction isolated the integration effects:

- `18e0b54` and `d672865` failed only Card with action narrow after the new
  Messaging/History Showcase sections changed the page's downstream scroll
  placement.
- `aa69647` introduced the remaining four failures when the real consumers
  moved into the earlier Data Workspace surface, changing downstream element
  screenshot placement without changing those components' DOM, CSS, or test
  contracts.

The resulting diffs are stable raster/one-pixel geometry changes caused by the
required page-level integration, not semantic or interaction regressions. The
nine affected baselines were regenerated together because the Planner source
test walks source, hover, focus, detail-open, and narrow states sequentially.
Calendar Grid, Card, Date Picker, and all five Planner images were inspected:
content and geometry remain coherent; text, actions, focus/hover/detail states,
overflow, and clipping remain correct. Planner success/completed event text now
matches the current dark-text production CSS rather than the stale green-text
rasters.

The focused legacy set passes 5/5 after the refresh. Message Thread and History
Timeline retain their own independent focused snapshots and browser evidence.

## PR #57 review follow-up

The review follow-up is scoped to the nine CodeRabbit line threads opened
against implementation commit `77c14c`. The remediation adds an explicit live
status region, restores the shipped Link and Button classes without string
rewriting, gives attachment links real in-page targets, and binds History
period labels to their following entries with native list semantics plus
`aria-describedby`. The timeline connector now terminates at the adjacent
marker edges. Planning provenance and rollback text were corrected, the final
task remains open until delivery, and the structural opening-tag checks no
longer permit cross-element matches.

Restoring the shared Link and Button classes exposed three Link occurrences
(two executable fixtures and one live consumer) and one Button occurrence (one
live consumer) to the repository-wide component guards. All four are now
explicitly classified in their canonical manifests. No diagnostic or
legacy/native substitute was introduced. The consumer screenshot was refreshed
to record the intended shared-component paint.

Validation on the resulting working tree passes OpenSpec health, deterministic
generation, 178/178 Node tests, ESLint, Stylelint, Prettier, all workspace
builds, validation of 68 source SVGs / 3 token groups / 119 canonical icons / 42
aliases, clean consumption of four packed packages, and 270/270 Chromium tests.
The focused remediation set separately passes 24/24 Link/Button and Data
Workspace checks; the Messaging/History suite is included in the aggregate and
passes all 10 tests. Four component-focused Messaging/History snapshots and the
Data Workspace consumer snapshot were inspected after regeneration.

The immutable review-follow-up candidate is
`a99e577d1bff0a85c674ed76ac63981091ae4a95`. Its receipt-bound full gate passed,
post-discovery conformance passed, and independent Standards and Spec reviews
both returned PASS with no findings. The delivery guard verified that this exact
candidate was pushed to the open, unmerged PR. A prior GitHub browser run on the
planning-only SHA `91bbf6a` failed one unrelated Date Picker accessibility test
after 268 other tests passed; that stale run is not evidence for the final
candidate, whose replacement CI run was triggered by the implementation push.
