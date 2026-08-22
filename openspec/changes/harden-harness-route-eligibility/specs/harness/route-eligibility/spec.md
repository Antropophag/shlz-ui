## Purpose

Defines deterministic repository guards that make direct implementation a positively evidenced narrow route and keep material work behind requirements, specification, branch, and pull-request gates.

## ADDED Requirements

### Requirement: Direct eligibility is positively established before mutation

Before the first repository implementation mutation, the workflow SHALL evaluate structured semantic routing evidence. Direct SHALL be eligible only when the work is affirmatively behavior-preserving, local, reversible, free of material external effects or contract decisions, and has no unresolved material uncertainty. Unknown material state MUST require re-routing to requirements and OpenSpec.

#### Scenario: Typo or local fix remains direct

- **WHEN** evidence establishes a typo, local bug fix, or mechanical refactor preserves observable behavior and contracts and has no material external effect
- **THEN** the guard permits direct implementation without an interview or OpenSpec

#### Scenario: Fully determined contract change skips ritual interview

- **WHEN** a contract-affecting request resolves every blocking user-owned decision
- **THEN** the guard forbids direct, selects OpenSpec, and permits synthesis without an interview

#### Scenario: Publishing intent cannot enter direct

- **WHEN** the intent is exactly `Опубликуй showcase этого проекта на GitHub Pages.`
- **THEN** the guard forbids direct and requires unresolved user-owned `release-policy` and `public-url` decisions before implementation

#### Scenario: Material uncertainty is conservative

- **WHEN** semantic evidence identifies a new capability, external effect, publishing or release behavior, public URL, deployment semantics, elevated permission, security choice, destructive action, externally observable automation, public contract change, or unresolved material ambiguity
- **THEN** the guard requires requirements and OpenSpec rather than treating direct as a fallback

#### Scenario: Harmless workflow maintenance remains narrow

- **WHEN** workflow maintenance is affirmatively mechanical and preserves triggers, permissions, deployment or release semantics, and other external behavior
- **THEN** the guard may permit direct without classifying it as a new capability

### Requirement: Route conformance is checked against discovered changes

Before direct work can complete, the workflow SHALL evaluate the target-relevant changed-file and semantic diff surface against the route evidence. A material surface incompatible with direct MUST block completion and require requirements/OpenSpec re-routing; path presence alone MUST NOT make harmless maintenance material.

#### Scenario: Deployment surface discovered on direct route

- **WHEN** direct work creates or materially changes deployment, publishing, Pages, CNAME, release automation, deployment triggers, or write/id-token permissions
- **THEN** completion is rejected with a re-route-required result

#### Scenario: Harmless workflow typo is not escalated

- **WHEN** a workflow diff only corrects behavior-preserving text or formatting and semantic evidence confirms triggers, permissions, and external behavior are unchanged
- **THEN** route conformance permits direct completion

### Requirement: Implementation delivery uses a task branch and pull request

Normal repository implementation SHALL begin from a clean current `origin/main`, continue on a non-default task branch or approved task worktree, and finish by creating a pull request. Mutation and push guards MUST reject implementation on the default branch and MUST reject a direct push target of the default branch. The user retains merge authority.

#### Scenario: Implementation starts on main

- **WHEN** implementation preflight observes the current branch is the default branch
- **THEN** repository mutation is rejected until execution is redirected to a task branch

#### Scenario: Successful implementation delivery

- **WHEN** implementation validation and review pass on a task branch
- **THEN** completion requires a pull request targeting the default branch and does not merge it
