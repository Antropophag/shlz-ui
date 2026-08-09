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
