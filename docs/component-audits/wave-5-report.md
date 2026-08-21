# Wave 5 — Data & Content Surfaces

Baseline: `170494b030800276524162418572c241b092e4c7` (merged PR #19). Branch: `audit/wave5-data-content-surfaces`.

## Census and status

| Family                    | Executable/stress | Live | Data Workspace | Inert diagnostics |             Local/source alternatives | Status   |
| ------------------------- | ----------------: | ---: | -------------: | ----------------: | ------------------------------------: | -------- |
| Table                     |                 2 |    1 |              1 |                 1 |         3 documentation-native tables | VERIFIED |
| File Row                  |                 6 |    0 |              0 |                 0 |                                     0 | VERIFIED |
| Document Row              |                 7 |    0 |              0 |                 0 |                                     0 | VERIFIED |
| Empty State               |                 4 |    1 |              1 |                 0 |                                     0 | VERIFIED |
| Domain table compositions |                 0 |    1 |              1 |                 0 | 9 source-observed application layouts | VERIFIED |

Counts are current DOM/repository observations, not acceptance thresholds. Each executable, stress and live root has a stable semantic audit ID. The shared guard rejects missing, duplicate and unclassified roots, including nested family compositions; the Table fidelity specimen is the single declared inert diagnostic. Documentation/foundation tables are native local documentation surfaces rather than public `.shlz-table` occurrences. The nine domain layouts are source-observed application-specific compositions, not nine reusable implementations.

## Authority and boundaries

- **Table** is a native tabular presentation primitive. `Table Cell.svg` is primary authority; `Table.svg` shows compositions. It owns geometry, typography, dividers, row paint, modifiers and horizontal wrapper. Consumers own sorting, filters, pagination, selection, loading/error/empty data, columns and row actions.
- **File Row** is the source-backed `Documents.svg` file identity composition: fixed visual, filename/metadata and independent native targets. It is not a whole-row button, uploader, previewer or Document Row.
- **Document Row** is a separate repository extension informed by document source signatures. It adds compact/metadata-rich list composition and stable columns; it is not claimed as a literal Figma component.
- **Empty State** is presentation for no content. Simple, Customize and Basic are distinct source compositions. Consumer state owns visibility/announcement; nested Button/Link owns activation.
- **Domain tables** are consumer/application compositions over Table, Status, Link, Button and Checkbox. No `DataTable`, `SmartTable`, controller, router or state layer was added.

These semantic boundaries are repository decisions except where a manifest labels an exact source fact or derived pattern.

## Evidence and findings

Table preserves `table/thead/tbody/tr/th/td`, captions and `scope=col`; no redundant grid roles exist. Computed evidence covers 50px cells, 1px divider, end-aligned tabular numbers, real row hover and real wrapper overflow at 360px. Visual truncation retains the full DOM/title value in audited examples.

File Row roots remain inert. Native filename anchors and separately named buttons are siblings; decorative file visuals are hidden. Real hover changes source-backed paint. Long, extensionless and multi-action stress keeps the 38px visual and actions fixed while the title ellipsizes.

Document Row roots remain inert. Native title links and actions are siblings. Real hover and focus-within paint, 48/minmax/40 columns, long Cyrillic/Latin titles and 230px containment are executable evidence. The existing focused metadata-rich snapshot remains reviewed.

Empty State has no implicit alert/status/live-region semantics. Source-specific dimensions and typography for Simple/Customize/Basic are computed. Long/narrow composition and nested action focus are covered. Data Workspace now reuses the public Empty State regions for its application-owned zero-result condition.

Data Workspace proves draft/apply/reset filtering, rendered rows, sort state, selection/teardown, empty recovery, Status/Link/Checkbox/Button composition and narrow horizontal overflow. Its behavior is not attributed to Table.

Material ledgers are exact: Table `row-hover`; File Row `row-hover`; Document Row `row-hover` and `row-focus-within`; Empty State empty with concrete N/A reasons; domain composition `filtered`, `sorted`, `empty-result` as application-owned runtime states with independent-paint N/A. Fake hover fixtures remain static evidence only.

The alpha-aware contrast guard passes meaningful Table body, File Row filename and Document Row title pairs. Exact Empty/Simple subdued title paint measures about 2.79:1 on white; `empty-state-simple-source-contrast` records this source-backed P3 deviation. Source fidelity and contrast are separate claims, so no source-backed color was changed. No P0/P1/P2 Wave 5 finding remains.

## Changes and limitations

Production changes are limited to end-aligning the existing Table numeric modifier and composing Data Workspace's existing zero-result UI from Empty State regions. Public API adds no class or behavior; `.shlz-table__cell--numeric` now fulfills its documented alignment contract. Audit IDs, five manifests, the focused Wave 5 browser suite and this report are audit infrastructure.

Baseline Standards review found a pre-existing Wave 4 Badge/Tag diagnostic-count reporting mismatch and a duplicated census registry smell. Browser census confirmed manifests as authority; the Wave 4 report/project inventory now record Badge 4 and Tag 2, and census enforcement uses ordered Wave 4+ manifests rather than a second component-name registry.

Two reviewed snapshots were regenerated: Fira typography stress reflects the accessible Table caption and end-aligned numeric modifier, and Data Workspace reflects the audited consumer composition. The existing Document Row snapshot remains unchanged. File/Document Row have no real application consumer in this repository; their manifests state consumer integration N/A rather than relabeling Showcase. Mobile cards, data grids, virtualization, sorting controllers, preview/upload behavior and dynamic empty announcements remain unsupported or consumer-owned.

Manual state/content walk: Table and File/Document real hover; nested Tab focus; long Cyrillic/Latin/no-extension values; numeric/action cells; 230/360px containment; Empty State variants/action; Data Workspace filter apply/reset, sort, selection, empty recovery and wrapper overflow. No Wave 6 work was started.
