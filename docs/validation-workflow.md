# Receipt validation and review

Use the ladder `cheapest relevant check → focused harness/product checks → affected integration → final repository checks`.

`validate` receives a candidate head, target, command, and explicit input closure. The closure includes source, tests/oracles, runner configuration, validation policy, and applicable dependency inputs that can change meaning. The receipt records only digests and outcome; raw output stays local or in CI. Reuse requires the same candidate and identical closure digest.

Material and review-risky work has two independent outcomes:

- Standards checks repository instructions and engineering quality.
- Spec checks the OpenSpec delta and acceptance criteria.

Both review outcomes bind the same contract digest and candidate but use distinct runtime identities. Neither axis substitutes for the other.

When the current delta marks state-machine, persistence, or subprocess failure invariants, run a purpose-built executable fixture against the candidate and a known-bad adapter. `failure-proof` passes only when every marked invariant discriminates candidate PASS from known-bad FAIL and matches the current contract/head.

After remediation, recreate every receipt whose candidate, contract, oracle, or validation closure changed. Finish with route conformance and delivery validation from the immutable execution baseline.
