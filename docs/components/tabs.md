# Tabs

## Purpose and evidence

| Class    | Evidence / contract                                                                        |
| -------- | ------------------------------------------------------------------------------------------ |
| FACT     | `Tabs.svg` shows an underline group and pill/outlined/boxed Type 2 forms.                  |
| FACT     | Type 1 examples are about 40 px high; Type 2 pill shells are 67×39/68×40 with pill radius. |
| FACT     | Brand, dark, neutral and disabled-looking colors are represented.                          |
| DERIVED  | Repeated active/inactive rows represent selection and disabled presentation.               |
| DECISION | Interactive tabs use tablist/tab/tabpanel, roving tabindex and automatic activation.       |
| UNKNOWN  | Whether all Type 2 rows are product variants or component states; vertical orientation.    |

## Contract

```html
<div class="shlz-tabs" data-shlz-tabs>
  <div class="shlz-tabs__list" role="tablist" aria-label="Разделы">
    <button
      class="shlz-tabs__tab"
      role="tab"
      aria-selected="true"
      aria-controls="panel-a"
      id="tab-a"
    >
      Первый
    </button>
    <button
      class="shlz-tabs__tab"
      role="tab"
      aria-selected="false"
      aria-controls="panel-b"
      id="tab-b"
      tabindex="-1"
    >
      Второй
    </button>
  </div>
  <section id="panel-a" role="tabpanel" aria-labelledby="tab-a">…</section>
  <section id="panel-b" role="tabpanel" aria-labelledby="tab-b" hidden>
    …
  </section>
</div>
```

`enhanceTabs()` provides automatic activation for ArrowLeft/ArrowRight,
Home/End and click. Disabled native buttons are skipped. Visual styles work
without JavaScript; the server may emit a selected static state. Vertical tabs
and dynamic add/remove APIs are unsupported.
