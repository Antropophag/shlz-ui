# Cover

Static semantic cover composition. Use `--source` for the exact 874×400 frame or `--fluid` for bounded layouts down to 320px that grow with content.

```html
<section class="shlz-cover shlz-cover--source">
  <p class="shlz-cover__eyebrow">Eyebrow</p>
  <h1 class="shlz-cover__title">Cover title</h1>
  <p class="shlz-cover__description">Supporting description</p>
  <p class="shlz-cover__meta">Metadata</p>
</section>
```

`__title` is required; `__eyebrow`, `__description`, and `__meta` are optional. DOM order supplies reading order, and the root owns no navigation or application lifecycle. Spacing and structured typography are repository decisions because the source text is outlined; the source frame and white surface remain source facts.
