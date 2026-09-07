## Why

Release preparation on main fails because GitHub Actions cannot create the Changesets version pull request. The development roadmap also still lists release policy as future work despite its merged contract and pipeline.

## What Changes

- Restore the repository permission required by the existing version-PR workflow, retaining read-only default token permissions and human-owned merge decisions.
- Replay the failed preparation run and record its outcome and the resulting unmerged version PR.
- Document the permission prerequisite and reconcile the roadmap with merged release work, remaining activation work in PR #72, and the approved development priorities.

## Capabilities

### New Capabilities

- `release/preparation-operations`: Repository permission, verification and recovery boundaries for version-PR preparation.

### Modified Capabilities

None. The existing package release, GitLab activation and consumer-pilot gates remain intact.

## Impact

GitHub Actions repository permissions, a preparation workflow rerun, the generated release branch/PR, and maintainer documentation. No package API, dependency, source SVG, publishing workflow or registry state changes. The GitHub permission combines PR creation and review approval; enabling it does not authorize any workflow or agent to approve or merge a PR. Live GitLab activation remains the separate, already-open PR #72.
