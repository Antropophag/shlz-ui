# Dropdown menu

## Purpose

Progressively enhanced menu of application commands. This contract is not a
select/listbox: choosing an item invokes an action and does not update a form
value. `Dropdown menu.svg` is the only visual authority used here.

## Evidence matrix

| Classification | Observation | Evidence / consequence |
| --- | --- | --- |
| FACT | Menus are predominantly 200 px wide; a 216 px family is also present | Raw rectangles and component fingerprint: `200×100…352`, `216×340` |
| FACT | Menu item rows are 40 px high | 63 raw `200×40` rows and seven `216×40` rows |
| FACT | Menu surfaces are white with 12 px corners | 13 raw surface rectangles with `rx=12` |
| FACT | Eight represented rows use `#EEF0F4`; most use white | Raw fills; this proves a highlighted-looking state, not its event cause |
| FACT | Leading icon/mark slots repeatedly use 20×20; some avatar examples use 24×24 | Raw geometry and fingerprints |
| FACT | The sheet contains menu heights corresponding to different item counts | 100/140/180/220/260/300/340 px surfaces |
| FACT | A 352 px scrollable-looking example and 6×80 scrollbar track are represented | Raw geometry; scrollbar behavior is not recoverable |
| FACT | The menu surface uses two-layer shadow filters | Raw filters: y=4/blur=15 and y=1/blur=1.5 |
| DERIVED | A base menu is a vertical stack of 40 px items with 10 px outer block padding | Surface heights equal `items × 40 + 20` across repeated examples |
| DERIVED | `#EEF0F4` is suitable for hover/current-item presentation | Repeated highlighted rows; exact state labels are outlined and not machine-recoverable |
| DECISION | Trigger is a native `<button>` with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` | Progressive enhancement and keyboard accessibility contract |
| DECISION | Menu uses `role="menu"`; command items are native `<button role="menuitem">` | Keeps activation native while adding composite-widget navigation |
| DECISION | Separators use `<hr role="separator">` and are not focusable | Semantic boundary; separator geometry is not reliably isolated in extraction |
| DECISION | Disabled items use native `disabled` plus `aria-disabled="true"` | Native click suppression with explicit composite-widget state |
| DECISION | A selected command may use `aria-current="true"`; this is visual metadata, not selection state | Avoids inventing menuitemradio/menuitemcheckbox semantics |
| UNKNOWN | Whether highlighted raw rows mean hover, focus, selected, or a mixture | Static SVG cannot establish interaction cause |
| UNKNOWN | Exact separator inset and all item label/icon combinations | Outlined text and heterogeneous examples prevent a canonical rule |
| UNKNOWN | Collision/viewport placement behavior | Static component sheet provides no positioning algorithm |

## Supported contract

- one native button trigger;
- one menu controlled by that trigger;
- command items, optional leading/trailing content, separators;
- highlighted/current and disabled presentation;
- click, ArrowUp/ArrowDown, Home/End, Escape, Tab and outside-click behavior;
- focus restoration to the trigger when Escape closes the menu.

Submenus, checkbox/radio menu items, typeahead, collision-aware floating
placement and selectable listbox behavior are outside this iteration.

## HTML

```html
<div class="shlz-dropdown" data-shlz-dropdown>
  <button
    class="shlz-button"
    type="button"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="actions-menu"
  >
    Действия
  </button>
  <div class="shlz-menu" id="actions-menu" role="menu" hidden>
    <button class="shlz-menu__item" type="button" role="menuitem">
      Редактировать
    </button>
    <hr class="shlz-menu__separator" role="separator" />
    <button
      class="shlz-menu__item"
      type="button"
      role="menuitem"
      aria-disabled="true"
      disabled
    >
      Архивировать
    </button>
  </div>
</div>
```

Without JavaScript the trigger remains a button and the menu remains hidden.
The controller enhances only roots marked with `data-shlz-dropdown`.

## Accessibility

The controller moves focus into the menu on keyboard/open activation, skips
disabled items, closes on Escape and restores trigger focus. Tab closes the
menu but retains normal document tab order. Consumers must provide meaningful
item text and must not encode destructive/current meaning only by color.

## Known gaps

Typography remains consumer-owned. Viewport collision, nested menus, typeahead
and menuitemcheckbox/menuitemradio contracts require separate evidence and API
work.
