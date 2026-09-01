## 1. Contract and test seam

- [x] 1.1 Define representative valid and invalid ledger fixtures for record identity, disposition requirements, variant inheritance, family references, repository paths, and compatible-unit metrics.
- [x] 1.2 Add focused tests that fail on missing, duplicate, stale, or invented records; unsupported implementation/exclusion claims; unknown families or paths; and nondeterministic or unit-mixed summaries.

## 2. Matrix generation

- [x] 2.1 Add the authored source-record decision ledger outside `shlz-design-source/`, accounting for every current indexed record and retaining `unresolved` wherever available evidence cannot support a stronger claim.
- [x] 2.2 Implement a deterministic generator/validator that joins the ledger to the source index and project inventory, expands all indexed variants, validates typed references, and writes the committed machine-readable matrix.
- [x] 2.3 Expose focused generate/check commands through the repository scripts without changing runtime package APIs.

## 3. Audit semantics and documentation

- [x] 3.1 Generate the initial matrix and verify its record and variant summaries exactly match the indexed corpus while preserving the authoritative source tree byte-for-byte.
- [x] 3.2 Document the ledger/matrix maintenance workflow, disposition meanings, compatible denominators, and the independence of `audit_status: VERIFIED` from implementation and transfer status.

## 4. Validation and delivery

- [x] 4.1 Run focused matrix tests, source-index/audit tests, deterministic regeneration checks, and the proportionate repository validation suite.
- [x] 4.2 Inspect and report the exact initial disposition counts, unresolved gaps, exclusions, limitations, and source-integrity evidence without claiming implementation completeness.
- [x] 4.3 Run post-discovery route conformance and review/delivery guards, then push the task branch and open an unmerged pull request.
