# Reporting dashboard

Dashboard and Chart Widget are framework-neutral presentation contracts derived from `Dashboard.svg` and `Дашборды.svg`. Dashboard owns content layout; Chart Widget owns the repeated 1304×515 white, radius-16 surface and semantic slots for a heading, controls, actions, plot, description, or empty state.

```html
<main class="shlz-dashboard">
  <section class="shlz-dashboard__section" aria-labelledby="reporting-title">
    <h1 class="shlz-dashboard__heading" id="reporting-title">Дашборды</h1>
    <div class="shlz-dashboard__grid">
      <article class="shlz-chart-widget" aria-labelledby="requests-title">
        <header class="shlz-chart-widget__header">
          <h2 class="shlz-chart-widget__title" id="requests-title">
            Заявки по статусам
          </h2>
        </header>
        <div class="shlz-chart-widget__controls">
          <!-- native SHLZ controls -->
        </div>
        <div class="shlz-chart-widget__plot">
          <!-- Bar Chart or consumer plot -->
        </div>
      </article>
    </div>
  </section>
</main>
```

The widget root is not interactive. Buttons and links in its action/control regions retain native ownership. The optional Bar Chart capability can now fill the plot region and owns its marks, legend, tooltip, and accessible table. Chart Widget still does not infer those semantics and does not own fetching, filters, periods, export, editing, drag/resize, or persistence. Report summaries continue to use the existing Report Card; the source does not establish a separate Metric Card family.
