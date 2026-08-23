## Why

The harness protects material work well, but its execution baseline and ceremony are shaped around an entire fresh task branch. A bounded follow-up on an existing pull request therefore inherits the parent change's semantic scope, context, planning, validation, and review cost even when the requested delta is local and behavior-preserving; the two PR #30 findings exposed this by consuming roughly 255K tokens and 45% context.

## What Changes

- Separate four decisions that currently bleed into one another: semantic impact, specification/requirements route, execution size, and orchestration strategy.
- Define a bounded execution episode with an explicit immutable baseline, so a clean task branch may start either from current `origin/main` or from the verified current head of its existing open PR.
- Scope route conformance, affected validation, and diff review to that episode delta while retaining positive direct evidence and deterministic material-risk floors.
- Require route escalation when discovery raises semantic impact; a small diff that changes security, external effects, or a public contract still enters requirements/OpenSpec.
- Add evaluation fixtures for tiny local, mechanical internal, both PR #30 findings, and small contract-affecting deltas, including observed before/after context behavior.
- Preserve requirements readiness, task-branch-to-PR delivery, delivery guards, and user-owned merge.

## Capabilities

### New Capabilities

- `harness/execution-routing`: Independent semantic routing, bounded execution baselines, proportionate orchestration, and discovery-time escalation for repository work.

### Modified Capabilities

None.

## Impact

The change affects `tools/harness.mjs`, `tools/lib/harness/core.mjs`, focused harness tests/fixtures, and repo-owned routing/execution/validation instructions. It changes no UI contracts, dependencies, GitHub settings, generated OpenSpec skills, or merge authority.
