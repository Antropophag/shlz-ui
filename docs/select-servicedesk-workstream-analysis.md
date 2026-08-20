# Select behavior and ServiceDesk consumer analysis

## Scope and evidence

This analysis compares the verified recovery checkpoint from 2026-08-20 with
current `main`. ServiceDesk is consumer evidence, never visual authority; raw
SHLZ/Figma source retains precedence.

## Recovered inventory

| Recovered element                       | Purpose and old contract                                                                                                                                                    | Evidence/tests                                                               | Current disposition                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/behaviors/src/select.ts`      | Progressive enhancement over `.shlz-field__control > select.shlz-select`; generated combobox/listbox, typeahead, disabled-option skipping, native events, reset and destroy | Static regex test; about three Chromium workspace scenarios exercised Select | Do not restore. It changes popup ownership without a confirmed capability gap.                               |
| `packages/styles/components/select.css` | Custom trigger, option and popup paint                                                                                                                                      | Bundle-presence assertions and workspace CSS checks                          | Do not restore. Open native popup paint is not a current SHLZ contract.                                      |
| Package/export/generator hunks          | Published `@shlz/behaviors/select` and bundled custom Select CSS                                                                                                            | Package-smoke additions                                                      | Do not restore; current public contract intentionally has no Select behavior export.                         |
| `consumer-workspace.js`                 | Framework-neutral ServiceDesk list: tabs, table search/sort/selection, column popover, filter drawer and empty state                                                        | Five Chromium scenarios                                                      | Salvage the composition and application state logic, replacing custom Select assumptions with native Select. |
| ServiceDesk evidence README/manifest    | Records audited application workflows and selected file hashes without copying React/Ant implementation                                                                     | Hash manifest and prior privacy/provenance review                            | Preserve as non-authoritative documentation.                                                                 |

The recovered implementation was an experimental custom single-select
prototype. Search, multiselect and status-chip variants were explicitly absent,
not partially implemented. Its evidence was limited: no semantic unit tests,
assistive-technology audit or multi-engine runtime coverage; option/optgroup
mutations and runtime disabled changes were not synchronized; teardown did not
remove an ID injected onto the associated label. The five workspace browser
scenarios also included two general composition/layout checks rather than five
independent Select behavior tests.

## Capability comparison

| Capability                    | Native single-select | Old prototype                         | Available consumer evidence                                  |
| ----------------------------- | -------------------- | ------------------------------------- | ------------------------------------------------------------ |
| One value and form submission | Yes                  | Preserved through hidden native owner | Status filtering is confirmed; exact control is unknown      |
| Four static status labels     | Yes                  | Yes                                   | Recovered fixture assumption                                 |
| Keyboard navigation/typeahead | Browser/OS owned     | Reimplemented                         | No non-native requirement is proven                          |
| Disabled options              | Native               | Reimplemented                         | Prototype capability; not exercised by the recovered fixture |
| No-JS fallback                | Complete             | Native control restored/unhidden      | Repository architecture requirement                          |
| Search within options         | No                   | No                                    | Production requirement is unknown                            |
| Multiselect/status chips      | No                   | No                                    | Production requirement is unknown                            |
| Custom option rendering/color | Platform-limited     | Text-only                             | Production requirement is unknown                            |
| Remote/dynamic options        | Application-owned    | No mutation observer/data API         | Production requirement is unknown                            |
| Custom open-popup fidelity    | Platform-owned       | Partial custom paint                  | Not proven as a consumer requirement                         |

## ServiceDesk requirements

The preserved audit confirms dense table composition, status values, filters,
sorting, column visibility, selection and bulk actions. Empty recovery and
narrow horizontal containment are repository validation choices, not confirmed
details of that production workflow. The recovered fixture chose a four-option
text status filter and separate free-text record search. It does not prove the
production option count, data volume, dynamic-source behavior, searchable
Select, multiselect, custom status option paint, async loading or virtualization
requirements.

Supported production browsers/devices, assistive-technology policy and
application-specific accessibility constraints are not recorded in the
preserved evidence. The conservative validation choice is therefore a labeled
native Select: application code listens to its value while Drawer owns the
modal interaction. The repository scenario can prove focus, native change,
filter application/reset, disabled options and narrow containment for its
bounded fixture without claiming SHLZ ownership of platform popup geometry or
production ServiceDesk suitability.

## Decision and implementation boundary

[ADR 0009](adr/0009-native-select-boundary.md) keeps Select native-only. Core
packages and public exports do not change. The safe implementation work is:

1. preserve the ServiceDesk provenance inventory;
2. add a real framework-neutral Data Workspace validation fixture using current
   production components;
3. test native Select integration and the composed workflow;
4. leave old behavior/CSS/package hunks in the recovery checkpoint.

No extension package is justified. Future richer Select work requires a new,
bounded consumer problem and separate contract decision.
