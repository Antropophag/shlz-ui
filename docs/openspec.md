# OpenSpec workflow

OpenSpec is the repository's spec-driven development foundation:

- `openspec/specs/` holds living behavioral contracts as they are established.
- `openspec/changes/` holds proposed changes and their planning artifacts.
- `docs/component-audits/` remains audit and evidence history; it is not a substitute for behavioral specs.
- `shlz-design-source/` remains the authoritative design source.

Brownfield contracts are added incrementally when a capability is changed or deliberately re-attested. Do not bulk-convert audit manifests or historical wave reports into OpenSpec specs.

## Impact routing

Inspect the request and affected code before choosing a workflow. OpenSpec is selected by change impact, not by the presence of implementation work.

Impact routing decides whether contracts need OpenSpec. It does not decide how many sessions or packets are needed. After routing, use `docs/agent-execution.md` for execution sizing and orchestration.

### Trivial or implementation-only

Use the direct workflow when the change preserves observable behavior, public APIs, accessibility and DOM/component contracts, design-system semantics, and architecture:

`inspect → implement → relevant validation → PR`

Typical cases include replacing or recoloring an existing asset, fixing a typo or formatting, correcting documentation without changing a contract, and an obvious local fix whose contract is unchanged. If inspection reveals contract impact, reclassify before implementation.

### Contract-affecting

Use OpenSpec when component behavior, a public API, DOM or accessibility behavior, a consumer contract, an interaction model, responsive behavior, or design-system semantics changes. Follow the official lifecycle through the applicable installed `openspec-*` skills:

`explore → propose/update → specs/design/tasks → apply → validate → sync/archive`

Create only artifacts required by the resolved OpenSpec schema. Keep OpenSpec as the sole workflow state instead of mirroring it in another format.

### Architectural or ambiguous

Use the full OpenSpec lifecycle for substantial new capabilities or components, package or token architecture, cross-component behavior, new interaction models, ambiguous requirements, and changes requiring an explicit design decision. Inspect first when classification is uncertain; do not create an OpenSpec change merely because the repository supports OpenSpec.

OpenSpec tasks describe executable outcomes, not individual assertions. Keep acceptance detail in specs/tests. More than 12 tasks, or several independently verifiable components/shared seams, requires an explicit regroup/decomposition check in the execution plan; one OpenSpec change may span multiple packets and sessions.

### Routing smoke examples

| Request                                | Route                                |
| -------------------------------------- | ------------------------------------ |
| Recolor an existing logo               | Direct workflow; no OpenSpec change  |
| Fix a documentation typo               | Direct workflow; no OpenSpec change  |
| Change Select keyboard behavior        | Contract-affecting OpenSpec workflow |
| Add a public Button variant            | Contract-affecting OpenSpec workflow |
| Change typography profile architecture | Full architectural OpenSpec workflow |

## Codex workflow

The installed core profile exposes these repo-local skills:

- `$openspec-explore` — investigate an idea without changing code;
- `$openspec-propose` — create a change and its planning artifacts;
- `$openspec-update-change` — revise existing change artifacts;
- `$openspec-apply-change` — implement the approved tasks;
- `$openspec-sync-specs` — merge delta specs into living specs without archiving;
- `$openspec-archive-change` — archive a completed change after verification.

Use the generated skill's own syntax and prompts. The integration lives in `.agents/skills/openspec-*`. This repository hardens generated archive/sync integrity and Markdown metadata locally; review those small patches whenever `openspec update` refreshes the upstream files.

## CLI checks

```bash
openspec --version
openspec list
openspec show <change-or-spec>
openspec validate --all --strict
openspec view
```

`openspec archive` updates OpenSpec state; it does not merge a GitHub pull request. The user makes every PR merge decision.

Run `npm run check:openspec` to verify the local OpenSpec/Codex integration.
