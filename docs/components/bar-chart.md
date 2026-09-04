# Bar Chart

Bar Chart is a framework-neutral grouped vertical chart for one through four series. It combines a validated data model, SVG plot, keyboard/pointer tooltip, toggle-button legend, and an expandable semantic table. `Dashboard.svg` is visual authority; `docs/component-audits/dashboard-chart-source-matrix.json` distinguishes source facts from product decisions.

```html
<div
  data-shlz-bar-chart
  data-plot-label="Requests by status"
  data-legend-label="Request statuses"
  data-table-label="Show chart data"
  data-table-caption="Requests by week and status"
  data-category-label="Week"
>
  <script type="application/json" data-shlz-bar-chart-data>
    {
      "categories": [{ "id": "week-1", "label": "1–7 Sep" }],
      "series": [
        {
          "id": "new",
          "label": "New",
          "values": [
            { "categoryId": "week-1", "value": 4, "displayValue": "4" }
          ]
        }
      ]
    }
  </script>
</div>
```

Call `enhanceBarCharts()` for declarative roots or construct `BarChartController(root, data)`. `update(data)` replaces prepared display data while reconciling visibility and focus by stable IDs; `destroy()` removes generated markup and listeners. Legend changes emit `shlz:bar-chart-visibility-change` with `{ visibleSeriesIds }`.

Data is rectangular: every series supplies exactly one finite, non-negative value for every category. Category and series IDs are unique stable strings; labels may repeat. Empty categories, missing values, negative/non-finite values, and more than four series are rejected. `value` drives geometry; consumer-owned `displayValue` is shown in the tooltip and table.

Keyboard map: Tab enters the single roving bar target; Left/Right move between categories in the same series; Up/Down move between visible series in one category; Home/End move to the first/last category. Navigation does not wrap. Legend buttons use `aria-pressed`, and the last visible series cannot be hidden.

At narrow widths, only the labelled plot viewport scrolls horizontally. Legend and table disclosure remain outside it, and focused bars reveal themselves locally. Full labels remain accessible even when an axis label is visually shortened.

Consumers own fetching, filtering, aggregation, period controls, sorting, locale/number-format policy, empty/loading/error states, query state, and business interpretation. A zero-category result uses the Chart Widget empty region instead of constructing Bar Chart. Unsupported modes include sparse/negative data, stacked/horizontal/line charts, zoom, animation contracts, streaming, export, and editable marks.
