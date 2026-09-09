# Guard against duplicated census counts

User requested prevention after PR 86 failed on a stale browser expectation. Baseline is the clean, pushed open-PR head ba6b30ab451b400c80b848372913d36c394b898f. The direct follow-up changes local test/lint maintenance only; product contracts and CI triggers, permissions and workflow steps are unchanged.

## Ownership

The Wave 11 Node census independently discovers reference paths and compares the exact path set and measured cardinality with the manifest. Those assertions remain intact. Browser coverage retains source-only runtime occurrence classification and material-state checks. Redundant literal dependency counts are removed from both suites so a legitimate reference addition requires updating only the manifest, not additional numeric expectations.

The existing ESLint step now rejects numeric expectations against primitiveDependencies cardinality and primitiveDependencyPathCount. It handles the actual Playwright and Node assertion forms that caused this failure; it does not ban source-derived sizes or deliberate fixed interaction contracts.

## Regression evidence

- Tests exercise the real ESLint configuration. Before the rule, the old pattern was accepted and the regression failed (0 diagnostics instead of 1). After the rule, numeric expectations in five representative forms are rejected; six independently measured or unrelated fixed-contract assertions remain accepted.
- Running ESLint against the two unchanged old assertions reported exactly two errors before they were removed.
- Replaying the independent filesystem census against a missing reference, a substituted path with unchanged cardinality and a stale metadata count rejects all three. The manifest was restored byte-for-byte after each bounded probe.
- Wave 12 records one additional unrelated terminology path for the lint rule's required ESLint meta.messages field; it remains tooling, not a messaging component.

Final validation and the complete GitHub CI result are reported for the pushed candidate. Passing a focused test alone is not treated as evidence that the complete CI run passed.
