# Bar Chart

Bar Chart is a framework-neutral grouped vertical chart for one through eight series. It combines a validated data model, SVG plot, keyboard/pointer tooltip, toggle-button legend, and an expandable semantic table. `Dashboard.svg` is visual authority; `docs/component-audits/dashboard-chart-source-matrix.json` distinguishes source facts from product decisions.

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

Data is rectangular: every series supplies exactly one finite, non-negative value for every category. Category and series IDs are unique stable strings; labels may repeat. Empty categories, missing values, negative/non-finite values, and more than eight series are rejected. `value` drives geometry; consumer-owned `displayValue` is shown in the tooltip and table.

Keyboard map: Tab enters the single roving bar target; Left/Right move between categories in the same series; Up/Down move between visible series in one category; Home/End move to the first/last category. Navigation does not wrap. Legend buttons use `aria-pressed`, and the last visible series cannot be hidden.

At narrow widths, only the labelled plot viewport scrolls horizontally. Legend and table disclosure remain outside it, and focused bars reveal themselves locally. Full labels remain accessible even when an axis label is visually shortened.

Consumers own fetching, filtering, aggregation, period controls, sorting, locale/number-format policy, empty/loading/error states, query state, and business interpretation. A zero-category result uses the Chart Widget empty region instead of constructing Bar Chart. Unsupported modes include sparse/negative data, stacked/horizontal/line charts, zoom, animation contracts, streaming, export, and editable marks.

## Source presentation

`series[].tone` optionally selects `blue`, `green`, `orange`, `deep-blue`, `violet`, `turquoise`, `pink`, `bright-green`, or `gray`. These map respectively to #253D98, #57965C, #D47E2E, #245B99, #8131A7, #4191B3, #A942A7, #25983E, and #939CA5 in Dashboard.svg. Explicit tones are independent of series order. Without a tone the first four positional CSS custom properties retain their previous colors; positions 5–8 add green, orange, deep blue and violet. IDs carry identity, not implied business color.

`presentation` optionally accepts:

- `density: "source"`: a 1212×300 plot using source group widths for 2, 5, 14 and 23 categories; other category counts use a derived layout. At original series counts this yields 62.75 px (2×8), 21 px (5×8), 96 px (5×2), approximately 62.67 px (5×3), 7 px (14×8), and approximately 12.33 px (23×3). Hiding series redistributes the group's paint width. Fourteen and twenty-three categories display three regular labels while retaining every tick and accessible name.
- `scaleMaximum`: a positive finite ceiling, at least every supplied value. Omit it to scale to the visible maximum (10 for all-zero data). Six numeric Y labels share the same scale as the bars.
- `tooltipPlacement: "above" | "below"`: period disclosure above the plot or below the axis. The latter reserves space inside the chart so widget clipping cannot hide it. Long tooltip content grows beyond source specimen heights.

The chart highlights a whole period and lists every visible series with a color key. Other periods use 15% paint; explicit orange changes to #DE753D and explicit gray uses opaque #F5F5F5. The active period has a guide and axis badge; the tooltip retains the full category name when the badge is shortened. Escape dismisses inspection; moving focus to another datum reopens it. Zero values retain transparent inspection geometry and zero quantitative paint.

Source facts (palette, source widths, plot dimensions, top-only corners and period presentation) are distinct from repository decisions (arbitrary data geometry, responsive overflow, keyboard behavior, legend and accessible table). The Showcase `#dashboard-source-gallery` presents nine default/muted color pairs, six populated density specimens and a below-axis gray-series example. These are reusable presentation demonstrations, not business filters.

The source-completeness extension supersedes the original four-series restriction and single-datum tooltip presentation in the unarchived initial Bar Chart change. Existing data, event and lifecycle calls remain compatible. Invalid presentation, tones or replacement data are rejected before changing an existing controller.
