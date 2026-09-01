# Source extraction diagnostic classification

This audit classifies extraction evidence only. It does not prove or advance component implementation coverage.

## Census

- Errors: 9
- Warnings: 35
- Skipped instances: 47
- Classification units: 46 (44 node-level diagnostics and 2 archive cohorts)

## Cohorts

| Classification                       | Disposition         | Coverage impact    | Units | Instances |
| ------------------------------------ | ------------------- | ------------------ | ----: | --------: |
| basic-elements-skipped-instances     | source-ambiguity    | limits-conclusion  |     1 |        37 |
| domain-table-property-warnings       | harmless-diagnostic | no-coverage-effect |     4 |         4 |
| input-property-warnings              | source-ambiguity    | limits-conclusion  |    22 |        22 |
| interface-elements-skipped-instances | source-ambiguity    | limits-conclusion  |     1 |        10 |
| radio-property-warnings              | source-ambiguity    | limits-conclusion  |     9 |         9 |
| spacing-export-errors                | extraction-defect   | no-coverage-effect |     9 |         9 |

## Limitations

The committed extraction output preserves skipped instances only as archive counts of 37 and 10. No node-level identities are inferred for those 47 instances. A limited conclusion remains unresolved until a later authoritative extraction preserves finer evidence.
