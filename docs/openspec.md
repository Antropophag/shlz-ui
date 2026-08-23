# OpenSpec workflow

OpenSpec is the repository's spec-driven development foundation:

- `openspec/specs/` holds living behavioral contracts as they are established.
- `openspec/changes/` holds proposed changes and their planning artifacts.
- `docs/component-audits/` remains audit and evidence history; it is not a substitute for behavioral specs.
- `shlz-design-source/` remains the authoritative design source.

Brownfield contracts are added incrementally when a capability is changed or deliberately re-attested. Do not bulk-convert audit manifests or historical wave reports into OpenSpec specs.

## Impact routing

Inspect the request and affected code before choosing a workflow. OpenSpec is selected by change impact, not by the presence of implementation work. Record a compact version 1 route assessment with every closed-set material signal set to `true`, `false`, or `unknown`, then run `npm run harness -- route-check <assessment>` before implementation. OpenSpec assessments also bind the change name and every material decision identity the requirements state must contain. The harness validates semantic evidence supplied by the agent; it does not infer intent from keywords.

Impact routing decides whether contracts need OpenSpec. It does not decide execution size, sessions, packets, or review strategy. Assess the bounded execution episode, not the ancestry of its branch: a material parent PR does not make a local behavior-preserving follow-up material, while a one-line public-contract or security change remains material. After routing, resolve requirements through `docs/requirements-elicitation.md`; after synthesis and authorization, use `docs/agent-execution.md` for independent execution sizing and orchestration.

### Trivial or implementation-only

Use the direct workflow only when positive evidence establishes that the change is local, reversible, behavior-preserving, free of external effects and contract changes, and has no material ambiguity:

`inspect → route-check → episode preflight → implement → route-conformance → relevant validation → target-diff inspection → PR → delivery-check`

Typical cases include replacing or recoloring an existing asset, fixing a typo or formatting, correcting documentation without changing a contract, an obvious local fix whose contract is unchanged, and mechanical workflow maintenance that preserves triggers, permissions, and external behavior. Direct does not require `requirements.json`, but it does require positive route evidence. If any material signal is true or unknown, or discovery/diff reveals contract or external-effect impact, reclassify before implementation or completion.

### Contract-affecting

Use OpenSpec when component behavior, a public API, DOM or accessibility behavior, a consumer contract, an interaction model, responsive behavior, or design-system semantics changes. Follow the official lifecycle through the applicable installed `openspec-*` skills:

`explore → propose/update → specs/design/tasks → apply → validate → sync/archive`

Create only artifacts required by the resolved OpenSpec schema. OpenSpec is the sole normative workflow source; for requirements-gated work, `requirements.json` contains only the operational gate and recovery state defined by `docs/requirements-elicitation.md`, never mirrored requirements or acceptance content.

### Architectural or ambiguous

Use the full OpenSpec lifecycle for substantial new capabilities or components, package or token architecture, cross-component behavior, new interaction models, ambiguous requirements, and changes requiring an explicit design decision. Inspect first when classification is uncertain; do not create an OpenSpec change merely because the repository supports OpenSpec.

New capability, publishing/deployment/release behavior, external effects, public URL/domain, CI/CD deployment semantics, permissions/auth/security, destructive or irreversible action, new externally observable automation, public/component/API contract change, and unresolved material ambiguity are material signals. They exclude direct or remain `unknown` until inspection resolves them; they are semantic categories, not a keyword list.

Before proposing, classify material decisions as repo-owned, agent-owned, or user-owned using `docs/requirements-elicitation.md`. Repository facts and safe implementation choices do not become questions. OpenSpec creation waits only for unresolved blocking user-owned decisions; a fully specified contract change proceeds without interview.

Before the first implementation mutation on either route, persist the immutable execution baseline:

```bash
npm run harness -- implementation-preflight <route-assessment> \
  [--requirements <requirements-state>] --default main --base origin/main \
  --out docs/exec-plans/active/<work>/execution-baseline.json
```

Fetch first so `origin/main` is current. For new work, the current branch must be a task branch whose merge base and pre-implementation HEAD are that base. For a bounded follow-up on an existing PR, pass `--pull-request <url>`; preflight instead verifies the clean task branch, upstream, local head, remote head, open PR head, and default target agree, then records that PR head. If that follow-up is material, commit and push its synthesized planning artifacts to the same PR before preflight so its new head is clean and verifiable. This baseline provenance is not a remediation route and does not affect semantic classification. For new-work OpenSpec, readiness, authorization, intent/change linkage, required decision identities, and the absence of pre-existing changes outside that change's planning roots must also pass. Direct preflight permits no pre-existing changes.

An S OpenSpec change still synthesizes its normative contract but does not acquire an adaptive packet plan solely because SDD is required. Conversely, a behavior-preserving M/L/XL change remains direct while using the adaptive execution machinery its size needs.

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

Use the generated skill's own syntax and artifact mechanics. Requirements and authorization integration is repo-owned by `AGENTS.md` and `docs/requirements-elicitation.md`; `openspec update` owns and may replace `.agents/skills/openspec-{propose,apply-change,update-change}/SKILL.md`. Keep repository policy out of those generated files. In OpenSpec 1.10.0, `update` is the repository regeneration command; the CLI has no `install` command, package installation/upgrading does not itself rewrite repository files, and `doctor` is diagnostic. `npm run check:openspec` force-updates a disposable copy to prove the stable integration survives regeneration, byte-checks that `doctor` does not mutate the protected seam, and fails if repo policy drifts back into upstream-managed output.

Archive/sync integrity and Markdown metadata still have narrow local patches in their generated skills; review those patches whenever OpenSpec refreshes them.

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
