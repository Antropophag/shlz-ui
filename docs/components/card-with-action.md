# Card with action

Presentational promotional composition. The root is never clickable. Use `--source` for the exact 314×230 specimen or `--fluid` for a bounded container down to 240px.

```html
<article class="shlz-card-with-action shlz-card-with-action--source">
  <div class="shlz-card-with-action__content">
    <h2 class="shlz-card-with-action__title">Title</h2>
    <p class="shlz-card-with-action__description">Description</p>
  </div>
  <div class="shlz-card-with-action__actions">
    <button class="shlz-button" type="button">Action</button>
  </div>
  <svg class="shlz-card-with-action__visual" aria-hidden="true">
    <!-- decorative geometry -->
  </svg>
</article>
```

`__content`, `__title`, and `__actions` form the public structure. `__description` and `__visual` are optional. A nested native `.shlz-button` or `.shlz-link` owns focus and activation. Spacing and structured typography are repository decisions because the SVG text is outlined; source dimensions, radius, surface paint, and action width remain source facts.
