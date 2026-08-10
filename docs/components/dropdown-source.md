# Dropdown source contract

Dropdown menu is separate from Select (`36:1106`). Its source model comprises:

- Menu item (`43:769`): 16 observed Type/State variants. Text, Checkbox,
  Status and Avatar rows are 200×40; Switch rows are 180×35.
- Dropdown (`45:1204`): ten Items variants for 2–8 rows, source-spelled
  `Srollbar`, Status and Search. Widths are 200 or 216px; heights 100–352px.
- dropdown-btns (`110:15065`): Default/Search triggers at 200×36.

The menu retains 10px vertical padding, 12px radius and its local two-layer
shadow. Visual icon slots use normalized assets. Runtime menu keyboard behavior
is an engineering contract; product meanings of status/avatar rows remain
consumer-owned.

`Items=Srollbar` (`45:1203`, source spelling retained here) is the 200×340
scrollable composition. Apply `.shlz-dropdown__menu--scrollable` to the existing
menu, wrap its items in `.shlz-dropdown__scroll-region`, and add an `aria-hidden`
`.shlz-dropdown__scrollbar`. It retains 40px rows and 10px vertical padding. The
source exposes no painted track; its only scrollbar primitive is a 6×80px,
radius-3 `#D1D8DF` thumb at the initial scroll position, inset 10px from the
block start and 4px from the inline end. The inner region uses native scrolling
with platform paint hidden; the explicit thumb makes the source visual
deterministic across browsers.
