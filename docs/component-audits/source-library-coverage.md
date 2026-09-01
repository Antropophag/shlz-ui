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

The exact-provenance pass moved two records from `unresolved` to `implemented`:
`Priority` (3 variants) and `File type icon` (21 variants). Record coverage is
now 55 implemented and 140 unresolved out of 195; variant coverage is 467
implemented and 163 unresolved out of 630. The denominators did not change.

The remaining Basic Elements reusable component-set candidates are `Arrows`,
`Icon button`, `Input-Number`, `Badge/Count`, `Badge/Dot`, `Color`,
`Selection-Item`, `dropdown-btns`, `Pagination Btn`, `Sorter`, and `Filter`.
They remain actionable backlog rather than inferred coverage. In particular,
`Arrows` has related normalized glyphs but lacks exact geometry for every indexed
variant. The 110 unresolved standalone records and the unresolved Interface
Elements sets also remain unclassified until record-specific implementation,
evidence-only, or application-ownership proof exists.

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
