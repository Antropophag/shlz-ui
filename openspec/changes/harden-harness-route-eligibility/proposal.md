## Why

A production Codex run bypassed requirements ownership by declaring a new GitHub Pages publishing capability implementation-only, then committed and pushed directly to `main`. The harness currently validates readiness only after semantic routing and accepts `direct` without positive evidence, so the failure path has no deterministic guard.

## What Changes

- Add a repo-owned route-eligibility seam that permits direct work only from positive behavior-preserving evidence and treats unknown or material scope as requiring OpenSpec.
- Require a pre-mutation route check and branch-state check for implementation work.
- Add a change-aware conformance guard that blocks direct completion when the discovered diff exposes material external-effect or contract surfaces.
- Require normal implementation delivery through a task branch and pull request, never direct implementation push to `main`; do not change GitHub settings or merge PRs.
- Turn the existing GitHub Pages retrospective fixture into executable regression input while preserving lightweight direct routes for typos, local fixes, mechanical refactors, and harmless workflow maintenance.

## Capabilities

### New Capabilities

- `harness/route-eligibility`: Positive direct eligibility, pre-mutation execution safety, post-discovery conformance, and branch/PR delivery guards.

### Modified Capabilities

- `harness/requirements-readiness`: Requirements ownership must precede any implementation opportunity for substantial, new-capability, contract-affecting, or material external-effect work.

## Impact

The change affects the repo-local harness CLI/core, harness fixtures and tests, routing/requirements/execution documentation, agent-facing repository instructions, and operational execution-plan records. It does not modify Pages configuration, published content, GitHub repository settings, generated OpenSpec skills, or sizing calibration.
