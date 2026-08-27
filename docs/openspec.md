# OpenSpec workflow

OpenSpec is the normative behavior-contract source. Living specs are under `openspec/specs/`; proposed deltas and planning artifacts are under `openspec/changes/`. Audits and tests are evidence, not substitute requirements.

## Impact routing

Inspect the request and affected code, record every closed material signal as `true`, `false`, or `unknown`, and run:

```bash
npm run harness -- route <assessment.json> --out <route-receipt.json>
```

Direct is positively proven only when every signal is false and the work is local, reversible, behavior-preserving, free of external effects/contract changes, and unambiguous. Any true or unknown signal routes to requirements/OpenSpec. Material signals include new capability, publishing/release, external effects or automation, public URLs, deployment semantics, permissions/security, irreversible action, public contract changes, and material ambiguity.

Numbered wave assessments also carry a typed `wave` block. `workKind: product` requires a non-empty expected production delta before `baseline`; `source-only`, `discovery`, and `audit` select bounded evidence execution and are never product-roadmap eligible. The harness validates this semantic declaration and does not infer it from the intent text.

Direct flow:

`inspect → route → baseline → implement → validate → conformance → PR → delivery`

Material flow:

`inspect → route → requirements → OpenSpec synthesis/authorization → baseline → implement → contract/TDD → validate → review/failure-proof → conformance → PR → delivery`

Use installed `openspec-*` skills for proposal/update/apply/sync/archive mechanics. The repository requirements protocol controls decision ownership and authorization. A complete material request needs no interview but still needs OpenSpec. The user owns every PR merge decision.

## Baseline and completion

Fetch first. Planning artifacts are committed and pushed before `baseline`. New work starts on a clean task branch at current `origin/main`; an explicitly based open-PR episode may bind its verified clean head. The receipt fixes repository, branch, upstream, base, PR when applicable, and starting commit.

Before delivery, `conformance` compares the complete declared surface to the actual episode diff. Material discoveries on a direct route re-enter requirements/OpenSpec. `delivery` queries Git/GitHub and accepts only a coherent candidate-bound receipt chain on an open PR targeting `main`.

OpenSpec tasks describe outcomes, not individual assertions. More than twelve tasks or multiple genuinely independent seams requires a decomposition check, but normal S/M work does not acquire orchestration state solely because it uses OpenSpec.

Validate planning with:

```bash
openspec validate --all --strict
npm run check:openspec
```
