# Empty State

## Purpose

Empty State explains the absence of content with an optional visual, title, description, and actions. The consumer owns the condition that displays it.

Use it for empty collections or zero-result content regions. Do not use it as loading, error, data-fetching, or retry state ownership; this component does not define generic Error State or Loading State behavior.

## Markup contract

```html
<div class="shlz-empty-state">
  <span class="shlz-empty-state__visual" aria-hidden="true">…</span>
  <h2 class="shlz-empty-state__title">No documents</h2>
  <p class="shlz-empty-state__description">Add the first document.</p>
  <div class="shlz-empty-state__actions">
    <button class="shlz-button shlz-button--primary" type="button">
      Add document
    </button>
  </div>
</div>
```

All regions are optional, though consumers should provide meaningful text. Actions compose existing buttons or links. No JavaScript or state attributes are required.

## Layout and responsiveness

Content is centered and owns no surrounding surface, border, radius, or container padding. `Empty/Simple` uses a 64×40px visual, a 7.5px composition gap, and 15/19.5px subdued text. The root remains fluid so its container is consumer-owned. The source also contains richer `Empty/Customize` and `Empty/Basic` compositions, but they are not promoted to public variants in this wave.

## Accessibility

Use the heading level appropriate to the surrounding page. Decorative visuals are hidden from assistive technology; meaningful illustrations need an accessible name. Actions keep their native semantics and focus behavior. Do not announce an ordinary empty state as an error or live status unless application behavior specifically requires it.

## Source basis

The canonical Basic-elements components `Empty/Simple` (220×67), `Empty/Customize` (159×137), and `Empty/Basic` (167×262) explicitly describe empty states. `Employees / Type=Empty` and `Event / Type=Empty` contain scaled `Empty/Simple` instances. The showcase reproduces the exact `Empty/Simple` illustration paths; the illustration is embedded in the component SVG rather than exported as a normalized icon. Separate title, description, and action regions generalize the three source compositions without owning application state.
