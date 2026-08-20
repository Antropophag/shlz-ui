# Select consumer validation workstream report

## Outcome

The recovered custom Select behavior was not restored. [ADR 0009](adr/0009-native-select-boundary.md)
keeps the core contract native-only because preserved consumer evidence does not
demonstrate a capability gap that warrants replacing the platform popup.

The useful recovered result is a bounded, framework-neutral Data Workspace in
the Showcase. It composes the existing native Select, Drawer, Table, Input,
Checkbox, Button, Link and Status contracts. Search, filter data, draft/apply
state, sorting, selection and teardown remain application-owned.

Detailed evidence and capability comparison are in
[the workstream analysis](select-servicedesk-workstream-analysis.md). The
delivered application is recorded separately as
[non-authoritative consumer evidence](consumer-evidence/servicedesk/README.md).

## Intentionally not recovered

- `@shlz/behaviors/select` and its custom combobox/listbox DOM;
- custom popup CSS and package exports;
- search, multiselect, status-chip, async or virtualization APIs;
- React, Ant Design, Effector or ServiceDesk application implementation;
- application dimensions or colors as new SHLZ source facts.

## Validation

- `npm run check`: pass — 76 Node/source/contract tests and 94 Chromium browser
  tests, including all existing visual baselines and the new focused consumer
  composition baseline.
- Focused consumer browser suite: 5/5 pass. It covers native change, disabled
  option, Drawer focus restoration, transactional Apply/cancel/reset, search,
  empty recovery, sorting, selection, teardown, narrow containment and visual
  regression.
- Firefox: native Select + Drawer cancellation, Apply, filtering and focus
  restoration passed in a direct Playwright smoke run. The repository's main
  Playwright project remains Chromium-only, so this was not added as a new test
  infrastructure layer.
- `git diff --check`: pass.

An initial full run exposed a 1px Fira screenshot shift caused by placing the
additive consumer fixture before the typography stress fixture. The same
typography test passed on a clean `origin/main`; moving the independently tested
consumer fixture after typography removed the positional coupling. No existing
snapshot, tolerance, CSS value or assertion was changed.

## Reviews

The architecture batch initially received one P2 evidence-calibration finding
and two P3 precision findings. The documents were corrected to distinguish
preserved production evidence, recovered fixture assumptions, repository
validation choices and unknown requirements. Re-review: no unresolved P1/P2/P3.

The implementation batch received two P2 findings: inconsistent Drawer filter
draft state and missing composition-level visual regression. Both were fixed
and covered by tests. A P3 provenance concern was resolved by documenting that
the original delivered application is not vendored and remains required for
hash verification. Final independent re-review: no unresolved P1/P2/P3.

## Scope

No file under `shlz-design-source/` changed. No production package, public
export, component visual value or framework dependency changed. The old shared
working tree and recovery checkpoint were not modified.
