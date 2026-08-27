# Receipt validation and review

Use the ladder `cheapest relevant check → focused harness/product checks → affected integration → final repository checks`.

`validate` receives a candidate head, target, command, and explicit input closure. The closure includes source, tests/oracles, runner configuration, validation policy, and applicable dependency inputs that can change meaning. The receipt records only digests and outcome; raw output stays local or in CI. Reuse requires the same candidate and identical closure digest.

Material and review-risky work has two independent outcomes:

- Standards checks repository instructions and engineering quality.
- Spec checks the OpenSpec delta and acceptance criteria.

Both review outcomes bind the same contract digest and candidate but use distinct runtime identities. Neither axis substitutes for the other.

When the current delta marks state-machine, persistence, or subprocess failure invariants, run a purpose-built executable fixture against the candidate and a known-bad adapter. `failure-proof` passes only when every marked invariant discriminates candidate PASS from known-bad FAIL and matches the current contract/head.

After remediation, recreate every receipt whose candidate, contract, oracle, or validation closure changed. Finish with route conformance and delivery validation from the immutable execution baseline.

## Changed finite sets

When an episode introduces or changes a finite set of variants, states, weights, roles, enum values, or explicitly supported combinations:

1. Declare each changed set in post-implementation discovery as `closedSets: [{ id, members }]`. Use stable contract identities. A combination is one opaque member such as `size=large|state=disabled`; independent axes do not imply an undeclared Cartesian product.
2. In a relevant `validate` manifest, add `closedSetEvidence` with the exact `id` and `members`. Partition every member into either `covered` or `excluded`.
3. Give every covered member at least one executable evidence path from `inputs`. Give every excluded member a non-empty, reviewable reason. Independent Spec review decides whether an exclusion is acceptable.

Validation rejects missing, duplicate, undeclared, overlapping, or closure-free entries. Conformance binds the declaration, validation binds the proof, and delivery requires an exact proof for every declared set. An empty `closedSets` list preserves the ordinary validation path for changes with no finite-set impact.

The regression fixture in `tools/tests/fixtures/pr45-golos-closed-set.json` captures PR #45: declaring Golos Text weights 400/500/600/700 while testing only 400 fails with 500/600/700 unaccounted.
