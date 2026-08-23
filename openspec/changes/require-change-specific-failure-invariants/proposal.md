## Why

The failure-path review added in PR #33 proves only a fixed global invariant set. CodeRabbit still found contract-specific state, persistence, subprocess, and fixture-oracle failures because executable review had no obligation to derive and run invariants for the behavior newly promised by that change.

## What Changes

- Require applicable material reviews to declare change-specific failure invariants derived from Requirement/Scenario contracts in the current OpenSpec delta.
- Validate source linkage, concern coverage, unique stable identities, and red/green results for those invariants in addition to the existing baseline invariant set.
- Use the seven actionable and one nitpick CodeRabbit findings from PR #33 as a regression fixture, with an explicit classification of which contract-derived invariants the mechanism must catch before external review and which findings remain static/tooling concerns.
- Keep direct S and non-stateful review paths unchanged.

## Capabilities

### New Capabilities

- `harness/change-specific-failure-invariants`: Contract-derived invariant declaration, executable proof enforcement, and regression evidence for material failure-path review.

### Modified Capabilities

None.

## Impact

This changes the review-state/proof contract in `tools/lib/harness/core.mjs`, the harness review CLI, focused harness tests and fixtures, and agent-facing validation/execution guidance. It builds on the merged PR #33 capability without changing design-system runtime packages or `shlz-design-source/`. Existing review state remains version 1-compatible when no change-specific manifest is applicable; applicable material OpenSpec reviews acquire an additional required input and proof gate.
