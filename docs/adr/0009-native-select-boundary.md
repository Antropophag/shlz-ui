# ADR 0009: Keep the core Select native until richer requirements are proven

Status: accepted.

## Context

An unpublished prototype replaced the visible native single-select with a
button/listbox while retaining a hidden `<select>` as the value and form owner.
It implemented Arrow/Home/End navigation, typeahead, disabled options,
input/change synchronization, reset and teardown. It did not implement search,
multiselect, status options, remote data or virtualization.

The preserved ServiceDesk evidence confirms a dense data workspace with table
filters and status values. The recovered validation fixture modeled one of
those filters as a native-compatible, four-option status Select; that exact
option count and interaction are a fixture assumption, not a production fact.
No preserved evidence proves a need for searchable options, multiselect,
custom option rendering, remote data or another capability missing from a
native single-select.

## Decision

Keep the core SHLZ Select contract native-only. Do not restore or export the
prototype as `@shlz/behaviors/select`.

Use a bounded ServiceDesk-inspired Data Workspace as framework-neutral
validation of the existing native Select composed with Drawer, Table, search,
selection and filtering. This validates a repository-owned assumption rather
than claiming to reproduce the delivered application. Application code owns
filter state and option data.

A richer Select requires a new decision backed by at least one requirement that
native Select cannot satisfy. Search, multiselect, status rendering and async
data remain separate candidate contracts and must not be combined implicitly.

## Alternatives

- **Restore the core behavior:** rejected because no preserved consumer
  evidence demonstrates a capability gap that justifies duplicating native
  popup and accessibility behavior.
- **Create an extension:** rejected because no reusable specialized contract is
  currently proven. An empty extension boundary would be architecture on
  growth.
- **Keep the old behavior in ServiceDesk:** not supported by the available
  evidence. Consumer-owned richer behavior remains possible if a future
  application proves it needs one.

## Consequences

- Core Select keeps native value, submission, popup, keyboard and no-JS
  behavior with no lifecycle API.
- Open-popup visual fidelity remains platform-owned; SHLZ owns the closed field
  shell derived from the authoritative source.
- The old behavior code and its custom-popup CSS/tests are recovery evidence,
  not production code.
- A future proposal must name one bounded contract, demonstrate consumers and
  accessibility across supported engines, and preserve a clear form owner.
