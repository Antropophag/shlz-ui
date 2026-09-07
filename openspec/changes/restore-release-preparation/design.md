## Context

Run 33957916744 at main b1cef24 passes release-policy validation but fails creating the version PR. The repository API reports default_workflow_permissions=read and can_approve_pull_request_reviews=false. The workflow already requests contents:write and pull-requests:write. PR #72 holds live activation planning with unresolved corporate inputs.

## Goals / Non-Goals

Restore the existing operation with one repository permission change and a replay of its original immutable source. Preserve package publication, source material, application code, main, merge ownership and the separate activation PR.

## Decisions

- Set only can_approve_pull_request_reviews=true through the repository API, then verify both returned settings. GitHub exposes one combined create/approve switch; no workflow approval or merge action is added. Raising default token permissions or introducing a personal access token is unnecessary.
- Retry run 33957916744 rather than creating a new publishing operation. Inspect the generated PR's versions and release notes, and record the immutable run/attempt and PR identities.
- Keep the implementation to maintainer documentation and external configuration. No local test can prove a repository permission has restored a live Actions operation; the original failing run and successful retry provide that proof. Existing release-policy/workflow tests protect the unchanged implementation. No new state machine, subprocess implementation or persistence code is introduced.
- Treat this as one bounded S episode. Independent Standards and Spec review covers the security boundary and documentary claims. No packet orchestration or component re-certification is needed.

## Risks / Trade-offs

- The combined GitHub switch also enables permitted workflows to approve reviews → retain read defaults, existing per-workflow permissions, no automatic approvals and human-owned merges; document the switch accurately.
- Another maintainer may update main or release state → retry the original run and bind observations to its exact head and attempt; never force-push or merge.
- Corporate GitLab configuration remains unavailable → keep activation and pilot pending and reference PR #72 without duplicating its implementation.

## Migration Plan

After route, requirements and branch baseline, change the single repository setting, verify it, replay preparation and inspect its output. A rollback sets the same boolean to false while preserving read defaults; it does not delete or merge the generated PR. Commit documentation and open a separate unmerged review PR.
