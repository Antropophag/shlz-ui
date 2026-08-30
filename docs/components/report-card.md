# Report card

Presentational report summary. Use `--source` for the exact 314×230 specimen, `--muted` for the source `#EEF0F4` surface, and `--fluid` for containers down to 240px.

```html
<article class="shlz-report-card shlz-report-card--source">
  <p class="shlz-report-card__eyebrow">Eyebrow</p>
  <h2 class="shlz-report-card__title">Report title</h2>
  <p class="shlz-report-card__value">128</p>
  <p class="shlz-report-card__meta">Supporting metadata</p>
  <a class="shlz-link shlz-report-card__link" href="/report">Open report</a>
  <svg class="shlz-report-card__decoration" aria-hidden="true">
    <!-- decorative geometry -->
  </svg>
</article>
```

`__title` and `__value` are required. `__eyebrow`, `__meta`, the nested native `__link`, and `__decoration` are optional. The root remains noninteractive; the Link alone owns navigation. Data fetching, loading, empty, and error states remain consumer-owned. Spacing and structured typography are repository decisions because the source text is outlined; geometry, radius, surfaces, shadow, and decoration dimensions remain source facts.
