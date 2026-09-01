# Source-to-library coverage matrix

The source-to-library coverage artifacts provide a complete accounting of the
records and variants in `design-source-index/components.json`. They answer a
different question from the project inventory: the inventory describes library
families, while this matrix records what is known about transferring each source
record into those families.

## Artifacts

- `source-library-coverage-ledger.json` is the authored decision seam. Each entry
  repeats the stable source identity as an assertion and declares one disposition,
  family edges, typed repository references, and variant inheritance or exceptions.
- `source-library-coverage.json` is generated. It joins the ledger to the source
  index and project inventory, expands every variant, carries source diagnostics,
  and calculates unit-specific totals.
- `tools/generate-source-library-coverage.mjs` validates and generates the matrix.
- `design-source-index/foundations.json#observed.normalizedIconComponentCoverage`
  records the narrow, reproducible join between indexed component variants and
  normalized icon sources. The join requires the same variant name, dimensions,
  and paint-independent geometry; partial records are omitted.

Do not edit the generated matrix by hand. Update the ledger, then run:

```bash
npm run generate:source-coverage
npm run check:source-coverage
```

Validation fails when a source identity is missing, duplicated, invented, or
stale; when a family or path cannot be resolved; when implementation points into
the protected source directory; or when a disposition lacks its required proof.
The generator only reads `shlz-design-source/` through the committed source index
and never writes to it.

## Dispositions

- `implemented`: the record maps to at least one canonical family and names both
  production implementation and evidence paths.
- `evidence-only`: the record maps to a family and contributes evidence, but makes
  no production implementation claim.
- `intentionally-excluded`: the record remains in the denominator and records a
  reason, ownership boundary, and supporting evidence for not implementing it.
- `unresolved`: the mapping decision or its support is incomplete. This is the
  required fail-safe state; it must not inherit a family from a similar name,
  shared archive, or audit status.

The initial ledger uses exact canonical names and narrowly reviewed aliases for
positive mappings. Archive membership alone is not accepted because the two
source archives contain many unrelated records and families. The initial matrix
therefore deliberately exposes unresolved work instead of manufacturing complete
transfer coverage.

## Current classification pass

The `classify-existing-component-records` episode reviews the exact baseline of
140 unresolved records and 163 variants. Its census is authored on the same
ledger decisions and emitted under `classificationEpisodes`; the generator
fails closed if a reviewed identity is omitted, duplicated, assigned to an
unknown episode, or lacks a named cohort and boundary.

| Reviewed cohort               | Records | Variants | Disposition or boundary           |
| ----------------------------- | ------: | -------: | --------------------------------- |
| Existing canonical family     |      10 |       49 | implemented                       |
| Composition support           |       4 |       11 | evidence-only                     |
| Consumer-owned domain tables  |       9 |       31 | intentionally excluded            |
| Missing component contract    |       9 |       42 | unresolved                        |
| Missing exact icon provenance |     103 |        0 | unresolved                        |
| Shared model decision         |       5 |       30 | unresolved through roadmap step 7 |
| **Total reviewed**            | **140** |  **163** | exact baseline census             |

The ten implemented records are the two Badge sets, Pagination Btn, all five
standalone Modal records, and the two Status sets. Each has a canonical family,
production path, direct source/variant evidence, and executable browser evidence.
Sorter and Filter support Table, while Description Files and Small document
support the audited Upload / Document composition boundary; none is claimed as
another public implementation. Nine domain-specific Table sets are explicitly
consumer-owned compositions.

Coverage changed from 55 implemented / 140 unresolved records to 65 implemented,
4 evidence-only, 9 intentionally excluded, and 117 unresolved records. Variant
coverage changed from 467 implemented / 163 unresolved to 516 implemented,
11 evidence-only, 31 intentionally excluded, and 72 unresolved variants. Both
denominators remain fixed at 195 records and 630 variants.

The residual backlog is deliberately explicit. One hundred three standalone
records require exact icon provenance; Divider and Bottom instead require a
component contract. Nine component candidates lack complete source,
production, and executable proof; and five product-composition records remain
deferred until the shared Timeline/Message model is explored. Extraction
diagnostics on `Table Управление организациями` are preserved for roadmap step 2
and do not change its independently proven application ownership.

## Metrics and `VERIFIED`

Record, variant, and family counts are not cardinality-equivalent. The generated
summary reports record dispositions over the record denominator and variant
dispositions over the variant denominator. Referenced-family implementation and
audit statuses are contextual counts only; they are never reported as corpus
transfer percentages.

`audit_status: VERIFIED` means the evidence declared by that family passed its
audit contract. It does not mean every source record is implemented, transferred,
or even mapped. A matrix can account for every source record while still containing
unresolved entries, and that is not implementation completeness.
