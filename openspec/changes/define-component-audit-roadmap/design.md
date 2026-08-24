## Context

The schema-v2 project inventory at `docs/component-audits/project-inventory.json` records 35 `VERIFIED` families and four `INVENTORIED` application-composition families after Waves 1–8. `AGENTS.md` already loads the completion gate, but it has no pointer that gives a numbered future wave request a scope. See `proposal.md` for motivation and `specs/component-audits/wave-roadmap/spec.md` for behavior.

## Goals / Non-Goals

**Goals:**

- Give each remaining inventory family one stable wave identity.
- Make the short Wave N request sufficient to select scope and authorize bounded execution.
- Keep workflow mechanics single-sourced and preserve fail-closed discovery.

**Non-Goals:**

- Change the harness, component implementations, audit statuses, or design source.
- Predict findings or turn source-only compositions into public library APIs.
- Replace per-wave OpenSpec, evidence, review, or delivery artifacts.

## Decisions

### Use one roadmap document plus one always-loaded pointer

`docs/component-audit-roadmap.md` owns the mapping and entry contract. `AGENTS.md` receives a short trigger-oriented pointer for numbered component-audit wave requests. This keeps the full mapping out of always-loaded context while making lookup reliable. Embedding all entries in `AGENTS.md` was rejected because it raises context load and creates duplicate authority.

### Map the four remaining families to Waves 9–12 in inventory order

The families form four different composition boundaries and implementation dispositions, so each receives an independent wave:

1. Wave 9 — Sidebar / Application Shell;
2. Wave 10 — Card compositions;
3. Wave 11 — Upload / Document compositions;
4. Wave 12 — Messaging / History / Planner compositions.

Combining source-only families was rejected because the completion gate forbids combined component status and the source files express distinct composition domains. Reordering was rejected because inventory order already moves from an application-local live shell through bounded visual compositions to the broadest source-only application compositions.

### Treat roadmap scope as a selector, not cached pipeline mechanics

Each entry carries family names, source authority, starting disposition, inclusions, exclusions, and wave-specific done conditions. It links to `docs/component-audit-workflow.md`, `docs/openspec.md`, `docs/requirements-elicitation.md`, `docs/agent-execution.md`, and `docs/validation-workflow.md` for mechanics. This satisfies short-intent resolution without coupling the roadmap to harness commands.

### Fail closed on drift and unknown waves

Every wave begins by comparing its entry with the current inventory and repository census. Material drift requires a roadmap/OpenSpec update; an unmapped wave is never inferred. A looser “roadmap as suggestion” was rejected because it would recreate scope ambiguity.

## Risks / Trade-offs

- [The inventory evolves after this PR] → Require entry reconciliation before mutation when status, membership, source, or implementation surface drifts.
- [A source-only wave is mistaken for implementation authorization] → State that audit disposition may remain source-only and that new public/runtime contracts require current requirements and OpenSpec decisions.
- [The pointer becomes too broad] → Trigger it specifically on numbered component-audit wave requests.
- [Numbering is mistaken for a prerequisite] → State that numbering identifies roadmap order only; every mapped wave remains independently executable from current `origin/main` when its entry still matches the inventory.

## Migration Plan

Add the roadmap and pointer without changing existing Waves 1–8 evidence. Validate the OpenSpec delta and repository documentation. Rollback is deletion of the pointer, roadmap, and associated OpenSpec change; no runtime or data migration exists.
