# Receipt-based engineering execution

Run the smallest workflow that proves the work:

`route → requirements/OpenSpec when material → baseline → implementation → contract/TDD → validation → review/failure-proof when required → conformance → delivery`

Each harness command validates its inputs and emits one immutable, content-addressed receipt. OpenSpec owns normative behavior, Git owns code provenance, tests own executable correctness, and receipts bind those authorities without becoming a workflow engine.

## Before implementation

Fetch `origin`, work on a non-default task branch, and run `route`. Direct is valid only when every closed material signal is explicitly false. Material or unknown work uses the requirements protocol in `docs/requirements-elicitation.md`, synthesizes OpenSpec, and emits `requirements` before `baseline`.

`baseline` requires a clean, pushed branch and binds the repository, upstream, default target, starting commit, and optional open pull-request head. New implementation starts at current `origin/main`; explicitly based follow-up work may bind an already-open PR head. Planning artifacts are committed before baseline creation.

## Implementation and evidence

Normal S/M work runs inline and needs no packet graph, claim, capsule, ledger, handoff, or checked-in mutable state. Use ordinary tests while implementing.

Material behavior creates a `contract` receipt from current OpenSpec scenario identities and normative content. When test-first proof applies, `tdd` runs one symmetric oracle: RED must reject the immutable baseline or declared known-bad adapter and GREEN must accept the candidate with the same contract and oracle inputs.

A numbered `source-only`, `discovery`, or `audit` wave uses the bounded evidence path recorded by its route receipt. It retains requirements/OpenSpec, baseline, contract, focused validation, conformance, and delivery, but does not acquire product TDD or independent code review solely from its wave number. Explicit test-first/review-risk flags still require those receipts, and marked failure invariants always require failure proof. Its delivery cannot advance the product roadmap. A numbered product wave retains the full applicable chain and must declare its structured expected production delta before baseline.

`validate` hashes every configured meaning-changing input. A successful expensive result is reusable only for the same candidate and identical input closure.

Material or review-risky work records separate Standards and Spec outcomes with `review`. Material state-machine, persistence, or subprocess changes also record a discriminating `failure-proof` derived from marked current-change invariants.

## Optional isolated execution

Use `run-isolated` only when physical context separation materially helps L/XL work or independent review. Its manifest declares an objective, exact source paths, dependency receipt paths, and an optional positive byte budget. Immediately before launch the harness resolves every source, computes contributors/bytes/digest, validates dependencies, and either launches once or fails closed. It never drops sources to meet a budget.

The result requires runtime-issued identity, terminal completion, report digest, launch identity, manifest digest, and dependency digests. Retry the unchanged manifest to create a new immutable result; there is no mutable claim lifecycle. Concurrency remains an explicit external orchestration choice and requires genuinely disjoint work.

## Completion

`conformance` compares the declared surface with the actual diff from baseline and rejects missing, unexpected, or newly material direct-route work. Push the candidate, open or update a PR targeting `main`, then run `delivery`; it queries Git/GitHub and requires every applicable receipt to bind the same repository, branch, PR, contract, and candidate head.

The user owns merge. Report CI, review threads, checks, limitations, and residual risks; never merge the PR.

Runtime metrics are reported only when supplied by the runtime. Missing tokens and active context remain `unavailable`; bytes and file counts are labeled observations. Keep raw logs/streams local or in CI and retain no more than eight compact episode receipts in Git.
