# Planner Schedule source contract

`shlz-design-source/raw/svg/Planner.svg` is the primary authority. Its SHA-256 is `3f23135cbccf6cd8d1054feef90990d94ec647d8ef12de091ee6b76a022f2ed7`, canvas is 3646×6729, and the audited sheet contains seven dashed composition frames. `Планировщик для сотрудника.svg` is full-screen supplemental evidence with SHA-256 `fd681f4338fb2b4850e2516f3856fee6813e4faaaae9baedac562405a6412af5`, canvas 14840×2723.

## Classification

Runtime paint is exact and testable: accent events use `#253d98` on `#dfe2f0`, accent hover uses `#eef0f4`, focus-visible uses a 2px `#253d98` outline, and every tone/state hover adds a one-pixel inset `currentcolor` keyline.

Event block height is the exact declared duration multiplied by slot height, less the shared four-pixel track gap; no minimum height rewrites short durations.

- `source-fact`: meeting cards appear in New, Done, and Canceled families; Default and Hover rows are shown; 30-minute top/bottom, paired 30-minute, 1-hour, 1.5-hour top/bottom, paired 1.5-hour, and 2-hour cells are represented; empty and hatched unavailable cells are shown.
- `source-fact`: event-detail frames show title/description, time/date, location, participants, optional comment and file content, and actions; none proves persistence or field requirements.
- `source-fact`: current-time examples use a red line, time label, and circular marker.
- `derived-pattern`: duration changes block height against a repeated time scale; full-screen employee compositions align events beneath dated day headers and hatch unavailable weekend columns.
- `repository-decision`: semantic day regions, normalized placement indices, contained scrolling, sticky context, generic tones, supported bounds, and Popover composition form the reusable interface.
- `assumption`: sticky positioning degrades to ordinary flow when browser containment prevents it; unsupported placement indices are consumer errors and are not normalized.

Application shell, people, addresses, organization names, business statuses, filters, editing, recurrence, timezone policy, permissions, drag/drop, persistence, and statistics remain outside the reusable contract.
