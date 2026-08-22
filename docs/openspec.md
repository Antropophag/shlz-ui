# OpenSpec workflow

OpenSpec is the repository's spec-driven development foundation:

- `openspec/specs/` holds living behavioral contracts as they are established.
- `openspec/changes/` holds proposed changes and their planning artifacts.
- `docs/component-audits/` remains audit and evidence history; it is not a substitute for behavioral specs.
- `shlz-design-source/` remains the authoritative design source.

Brownfield contracts are added incrementally when a capability is changed or deliberately re-attested. Do not bulk-convert audit manifests or historical wave reports into OpenSpec specs.

## Codex workflow

The installed core profile exposes these repo-local skills:

- `$openspec-explore` — investigate an idea without changing code;
- `$openspec-propose` — create a change and its planning artifacts;
- `$openspec-update-change` — revise existing change artifacts;
- `$openspec-apply-change` — implement the approved tasks;
- `$openspec-sync-specs` — merge delta specs into living specs without archiving;
- `$openspec-archive-change` — archive a completed change after verification.

Use the generated skill's own syntax and prompts. The integration lives in `.agents/skills/openspec-*` and is maintained with the OpenSpec CLI, not by hand.

## CLI checks

```bash
openspec --version
openspec list
openspec show <change-or-spec>
openspec validate --all --strict
openspec view
```

`openspec archive` updates OpenSpec state; it does not merge a GitHub pull request. The user makes every PR merge decision.
