## 1. Diagnostic Contract and Data Model

- [ ] 1.1 Derive and document the canonical occurrence identity for every committed error, warning, and skipped instance; verify independent counts reconcile to 9 errors, 35 warnings, and 47 skipped instances.
- [ ] 1.2 Add the authored diagnostic-classification ledger with controlled dispositions, coverage impacts, rationales, and evidence; verify all 91 occurrences classify exactly once.

## 2. Generation and Fail-Closed Validation

- [ ] 2.1 Implement deterministic generation of occurrence-level JSON and cohort Markdown outputs; verify two consecutive generations are byte-identical.
- [ ] 2.2 Enforce closed-set identity, enum, evidence-path, contradiction, and repository-confinement rules; verify focused known-bad fixtures fail for missing, duplicate, stale, unknown, contradictory, and escaping claims.
- [ ] 2.3 Integrate generation and checking into repository scripts without changing runtime package interfaces; verify the focused generator/check commands pass.

## 3. Classification Evidence

- [ ] 3.1 Review every authored classification against the source index, raw SVG authority where needed, existing coverage evidence, and audit manifests; verify the generated report records explicit limitations and does not advance product implementation coverage.
- [ ] 3.2 Update the roadmap and audit documentation to point to the completed diagnostic classification; verify counts and terminology agree across generated and authored documentation.

## 4. Validation and Delivery

- [ ] 4.1 Run focused tests, deterministic generation, full repository tests, lint/format, package builds, OpenSpec strict validation, and protected-path comparison; record exact results and limitations.
- [ ] 4.2 Review the candidate against repository standards and the OpenSpec scenarios, resolve blocking findings, run route conformance and delivery guards, and open an unmerged PR targeting `main` with CI/review status reported.
