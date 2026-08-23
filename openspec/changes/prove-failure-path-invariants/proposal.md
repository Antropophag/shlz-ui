## Why

PR #32 passed its internal tests and repeated fixed-base reviews while retaining real recovery and correctness defects. The harness proved review identity and artifact binding, but it did not require executable counterexamples for failure-path guarantees, so physically independent reviewers shared the same happy-path blind spots.

## What Changes

- Add a conditional failure-path proof to the existing independent review workflow for material changes that alter state machines, persisted recovery, or subprocess/stream boundaries.
- Require the proof to state executable invariants and demonstrate that its regression fixture rejects the known-bad revision and accepts the reviewed revision.
- Keep direct S and stateless low-risk changes on the existing target-diff path.
- Record capability degradation explicitly; require external diversity review only when the required proof cannot be executed or the reviewer lacks an independent method/source.

## Capabilities

### New Capabilities

- `harness/failure-path-proof`: Proportionate executable failure-path evidence for stateful or external-boundary changes.

### Modified Capabilities

None.

## Impact

The repo-local harness review state/CLI, harness tests and fixtures, and execution/review documentation change. Routing, bounded execution episodes, isolation policy, and application/design-system runtime APIs remain unchanged.
