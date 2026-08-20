# ServiceDesk consumer evidence

## Status

This directory records evidence observed in the delivered ServiceDesk frontend.
It is **not** a design authority and does not change the authority order in
`AGENTS.md`:

1. original SVG exports in `shlz-design-source/raw/svg/`;
2. other derived Figma evidence;
3. repository design-system decisions;
4. consumer applications such as this ServiceDesk stand.

The delivered application is useful for discovering real integration and
composition requirements. Its React, Ant Design and Effector implementation
must not be copied into the framework-agnostic core.

## Delivered material

- Source label: delivered Windows Downloads folder
  `ЩЛЗ - фронт ServiceDesk`
- Audited on: 2026-08-20
- Package: `shlzcnf-configurator` 0.0.1, React 18, Ant Design 5
- Source files: 1,757
- Direct `shared/ui` groups: 65 directories / 245 files in the full subtree
- Inline shared SVG components: 56 TSX files (58 files in the icon directory)
- Public file-type images: 21 SVG files

The download contains a second identical project tree under a same-name nested
directory and a `__MACOSX` metadata tree. Only the outer tree was audited.

## What it confirms

The implemented Ant Design theme corroborates, but does not originate, several
existing Figma-derived contracts:

- Golos Text;
- primary `#253D98`, text `#0B1623`, layout `#F4F6F9`;
- control heights 32, 40 and 48;
- pill-shaped controls and 40px pagination items;
- the need for dense tables, statuses, filters and application workspaces.

## Highest-value validation cases

1. **Data workspace**: tabs, search, saved filters, column settings, sortable and
   selectable table, bulk actions.
2. **Schema-driven long form**: collapsible sections, varied controls,
   multiselect tags, validation, attachments and sticky actions.
3. **Record detail workspace**: counters, contextual actions, read/edit mode,
   messages, comments, history and files.
4. **Corporate app shell**: role-aware nested navigation, collapsible sidebar,
   header and avatar menu.
5. **Async state matrix**: loading, empty, error, forbidden and populated.

These should first become framework-neutral showcase fixtures and contracts.
They do not justify promoting application dimensions such as a 260px sidebar or
96px header into design-system tokens.

## Material intentionally not copied

- Six Golos Text TTF files: no font license or notice accompanied the delivery.
- File-type SVGs: they differ from the Figma-derived assets already in
  `@shlz/icons`, including some older 38×39 geometry.
- TSX icons: the application mixes local vectors with `@ant-design/icons`, so
  individual provenance is ambiguous.
- SCSS and Ant Design overrides: application/framework-specific implementation.
- API code, mocks, environment files, CI/deploy configuration, Excel files,
  duplicate tree and `__MACOSX` metadata.

No source binary or application implementation was imported into a public SHLZ
UI package. `manifest.json` records hashes of the selected inspected evidence so
a future review can verify that evidence set.
