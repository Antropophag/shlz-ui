## 1. Contract grounding

- [x] 1.1 Add strict delta-spec marker parsing and change-specific manifest normalization, and verify focused tests reject missing, duplicate, out-of-change, nonexistent, mismatched, and uncovered sources.
- [x] 1.2 Extend review state initialization and context reporting with change/manifest bindings while preserving concern-free compatibility, and verify state/CLI tests cover both paths.

## 2. Executable proof enforcement

- [x] 2.1 Bind proof digest and staleness checks to the OpenSpec change, manifest digest, cited contract digest, and namespaced invariant results; verify mutation tests fail on every stale or incomplete binding.
- [x] 2.2 Require red/green discrimination for the union of baseline and change-specific invariants before two-axis completion, and verify baseline-only proof is rejected for an applicable manifested review.
- [x] 2.3 Bind guarded lifecycle and delivery to the current requirements revision, plan, and completed mandatory packet set; verify regression tests reject stale plans and pending/missing packet delivery.

## 3. PR #33 regression fixture

- [x] 3.1 Add a machine-readable inventory of all seven actionable and one nitpick CodeRabbit findings with immutable review URLs, ownership classification, contract sources, and expected catcher.
- [x] 3.2 Add an executable historical-revision fixture that proves the applicable dynamic findings red on `55c3eb38cd66c0dea1d9fe7f3419e19e8ca56133` and green on immutable known-good `32c2cdfdd213d4b5c0a7d27258ee13c49af02304`, while verifying non-runtime findings are explicitly assigned to their validation layers.

## 4. Workflow integration and delivery

- [x] 4.1 Update agent-facing validation/execution guidance and dogfood this change's own marked contracts through the new manifest/proof path; verify focused harness tests and strict OpenSpec validation pass.
- [x] 4.2 Run affected validation, route conformance, independent Standards/Spec review with bounded remediation and targeted re-review, then pass delivery guards and leave the separate PR unmerged.
