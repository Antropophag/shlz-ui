## 1. Episode census and contracts

- [x] 1.1 Capture all 140 baseline unresolved records in an exact source-identity census, assign each an in-scope cohort or named roadmap defer reason, and verify record/variant totals match the baseline matrix.
- [x] 1.2 Add focused failing tests for census completeness, disposition-specific proof, valid ownership boundaries, and deterministic residual-backlog reporting; verify the tests fail for the missing step-1 behavior.

## 2. Existing reusable component classification

- [x] 2.1 Review Basic Elements candidates against canonical family manifests, source contracts, production paths, and executable evidence; update only fully proven ledger decisions and verify focused tests after each cohort.
- [x] 2.2 Review Interface Elements candidates against the same proof threshold; retain incomplete or variant-incompatible relationships as unresolved with a concrete missing-proof reason and verify focused tests.

## 3. Composition classification

- [x] 3.1 Review nested and composition-support records for evidence-only relationships, record exact supported families and evidence, and verify every reference exists and satisfies the ledger contract.
- [x] 3.2 Review domain/application compositions for intentional exclusion, record explicit ownership plus exclusion evidence, and verify ambiguous reusable candidates remain unresolved.
- [x] 3.3 Confirm source diagnostics, remaining icon-provenance questions, File Upload, Timeline/Message, Composer, and Card records retain their named deferred boundary and are not silently reclassified.

## 4. Generation and reporting

- [x] 4.1 Regenerate the JSON and Markdown coverage outputs with exact before/after record and variant metrics plus separate reviewed, deferred, and residual reusable cohorts; verify all 195 records and 630 variants remain accounted for.
- [x] 4.2 Run generation twice and verify byte-identical outputs, valid implementation/evidence paths, valid family references, preserved source hashes, and no runtime-package diff.
- [x] 4.3 Update the roadmap and step-1 report with observed counts, limitations, and unresolved records; verify classification is not described as new implementation.

## 5. Validation and delivery

- [x] 5.1 Run focused audit tests, proportionate full validation, and `openspec validate classify-existing-component-records --strict`; record exact results.
- [ ] 5.2 Complete independent Standards and Spec review, then resolve or explicitly disposition every finding.
- [ ] 5.3 Run post-discovery route-conformance and delivery guards, push the task branch, and open an unmerged pull request without changing or deleting pre-existing user work.
