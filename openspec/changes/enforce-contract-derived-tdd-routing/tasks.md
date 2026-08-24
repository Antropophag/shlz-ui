## 1. Contract parser and RED fixtures

- [x] 1.1 Add the original Wave 9 plan/contract regression fixture and source-only, absence-only, and documentation-only fixtures; verify the focused probe reproduces the missing-TDD bypass before production changes.
- [x] 1.2 Implement a repository-owned delta-scenario semantics parser with stable identities, closed categories, duplicate/missing rejection, and normalized digest; verify focused parser tests cover every valid and invalid category path.

## 2. Plan enforcement

- [x] 2.1 Bind `harness plan` to the requirements-selected OpenSpec change and pass derived scenario semantics into plan construction; verify unavailable or malformed contracts fail before the plan file is written.
- [x] 2.2 Require exact enforced-slice coverage for all material behavior/state identities and persist the compact obligation binding; verify Wave 9 fails without TDD and succeeds only with complete enforced coverage.
- [x] 2.3 Preserve historical plan readability and allow evidence-only new plans without mandatory spec-driven TDD; verify source-only, absence-only, documentation-only, and legacy fixtures remain accepted.

## 3. Integration and delivery

- [x] 3.1 Update operator-facing execution and validation guidance at the contract-classification seam; verify documentation examples match the public harness behavior.
- [x] 3.2 Run focused harness probes, the complete repository validation selected by `harness affected`, strict OpenSpec validation, and the full repository validation suite; record exact results.
- [ ] 3.3 Run independent Standards and Spec reviews from the immutable execution baseline, remediate every blocking finding, re-run affected validation, satisfy delivery guards, and open an unmerged PR targeting `main`.
