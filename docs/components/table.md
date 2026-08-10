# Table foundation

The generic contract is native `table`, `thead`, `tbody`, `tr`, `th` and `td` with `.shlz-table*` classes. Sort state belongs on `th[aria-sort]`; sort/filter controls are native buttons. Content types (text, checkbox, status, icon, priority, empty, switch, button and dropdown) are compositions, not business variants.

[observed] Source Table Cell geometry uses 50px cells, an 8px inline inset and a 1px visible bottom divider. Body text is 14px/20px; uppercase headers use the 12px/18px Medium treatment. Source examples include 40/48/54/110/140/167px widths.

[design-decision] Observed widths remain intrinsic or composition geometry rather than public width enums. Editable cells accept a consumer-owned native control; commit/cancel/data mutation are `CONSUMER_DEFINED`.

Validated fixtures: a simple text/status table; sorting/filtering headers; a mixed table using checks, status, priority/icon, avatar, editable text and button content. Virtualization, pagination, responsive cards, sticky behavior, resizing, selection models and drag/drop are `FUTURE_DECISION`.
