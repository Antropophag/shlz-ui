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
