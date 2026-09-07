# Release preparation operations

Release preparation produces an ordinary version pull request. It does not
publish packages or pass the separate corporate GitLab activation gate.

## Repository prerequisite

The existing `.github/workflows/release-prepare.yml` requests `contents: write`
and `pull-requests: write`. GitHub must additionally allow Actions to create
pull requests through its repository workflow-permissions setting:

```sh
gh api repos/Antropophag/shlz-ui/actions/permissions/workflow
```

The required state is `default_workflow_permissions: read` and
`can_approve_pull_request_reviews: true`. GitHub combines creation and review
approval in this switch. The SHLZ workflow creates a version PR; it contains no
approval or merge action. Maintainers retain every merge decision.

An authorized repository administrator can change only the required switch:

```sh
gh api --method PUT repos/Antropophag/shlz-ui/actions/permissions/workflow \
  -F can_approve_pull_request_reviews=true
```

Read the setting again to verify that default permissions remain `read`.
Reverting the same boolean to `false` restores the previous setting without
deleting or merging the version PR. Do not raise default token permissions or
introduce a personal token to work around this configuration failure.

## Recovery evidence: 2026-09-07

- Source: main `b1cef24b70822c01de9a84a4f3bc14a09c12feaf`.
- [Run 33957916744, attempt 1](https://github.com/Antropophag/shlz-ui/actions/runs/33957916744/attempts/1)
  passed release-policy validation but failed at `Create or update version pull
request`: GitHub Actions was not permitted to create or approve pull requests.
- The repository permission was observed as `false`, changed to `true`, and
  read back successfully; default workflow permissions remained `read`.
- [Attempt 2](https://github.com/Antropophag/shlz-ui/actions/runs/33957916744/attempts/2)
  replayed the same source and completed successfully.
- It created [version PR #80](https://github.com/Antropophag/shlz-ui/pull/80),
  head `847b9e16ee4eb75dfa6607cbd0e3dca6dcbc2b4f`, targeting `main`. The four
  packages are proposed at `0.1.1`, with package changelogs and the internal
  styles → tokens dependency at the same exact version. The PR remains unmerged
  at this observation; `0.1.1` is a proposal, not an activated release version.
- Focused release-policy and workflow tests passed 16/16. This validates the
  unchanged implementation; the real failed/successful attempts prove recovery
  of the external repository setting.

The live verification oracle at
`tools/tests/fixtures/release-preparation-oracle.mjs` checks immutable attempt
identities and the generated release files through read-only GitHub APIs. Its
known-bad input selects the original failed attempt. It is an explicit
maintainer check requiring authenticated GitHub access, not part of offline CI.

The generated PR's checks must be assessed independently before a human merges
it. A successful preparation run alone does not prove that PR CI, package
publication or the application pilot has passed.

## Remaining activation gate

[PR #72](https://github.com/Antropophag/shlz-ui/pull/72) owns live activation.
At this inspection the only GitHub environment was `github-pages`; `release`
was absent, and no GitHub package-release records were listed. The approved
registry coordinates, restricted reviewers, separate read/publish credentials,
maintenance window and baseline/candidate/rollback versions still need to be
resolved through that change. Supply credentials through protected environment
secrets, never this document or PR comments.

Activation must prove partial-publication recovery, exact four-package
installation, promotion and rollback before the separate real-consumer pilot.
This preparation repair changes no GitLab state and does not advance that gate.
