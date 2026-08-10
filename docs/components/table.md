# Table foundation

The generic contract is native `table`, `thead`, `tbody`, `tr`, `th` and `td` with `.shlz-table*` classes. Sort state belongs on `th[aria-sort]`; sort/filter controls are native buttons. Content types (text, checkbox, status, icon, priority, empty, switch, button and dropdown) are compositions, not business variants.

Cells are 50px high with source-backed 8px inline inset and 1px visible bottom divider. Body text uses the generic Table Cell source contract at 14px/20px; uppercase headers use the source 12px/18px Medium treatment. Observed 40/48/54/110/140/167px widths are intrinsic or composition geometry, not public width enums. Editable cells accept a consumer-owned native control; commit/cancel/data mutation are `CONSUMER_DEFINED`.

Validated fixtures: a simple text/status table; sorting/filtering headers; a mixed table using checks, status, priority/icon, avatar, editable text and button content. Virtualization, pagination, responsive cards, sticky behavior, resizing, selection models and drag/drop are `FUTURE_DECISION`.
