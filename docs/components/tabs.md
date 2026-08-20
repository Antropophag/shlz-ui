# Tabs

## Purpose

Tabs switch between related content panels without leaving the current context. Use them for peer sections of one workspace when only one panel is needed at a time. Use navigation for separate routes and Segment for choosing a form value.

## Dependencies

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

Tabs require the framework-agnostic behavior layer.

## Copyable usage

```html
<div class="shlz-tabs" data-shlz-tabs>
  <div class="shlz-tabs__list" role="tablist" aria-label="Карточка заявки">
    <button
      class="shlz-tabs__tab"
      id="details-tab"
      type="button"
      role="tab"
      aria-selected="true"
      aria-controls="details-panel"
    >
      Детали
    </button>
    <button
      class="shlz-tabs__tab"
      id="history-tab"
      type="button"
      role="tab"
      aria-selected="false"
      aria-controls="history-panel"
      tabindex="-1"
    >
      История
    </button>
  </div>
  <div
    class="shlz-tabs__panel"
    id="details-panel"
    role="tabpanel"
    aria-labelledby="details-tab"
    tabindex="0"
  >
    Содержимое заявки
  </div>
  <div
    class="shlz-tabs__panel"
    id="history-panel"
    role="tabpanel"
    aria-labelledby="history-tab"
    tabindex="0"
    hidden
  >
    История изменений
  </div>
</div>
```

```js
import { enhanceTabs } from "@shlz/behaviors/tabs";

const controllers = enhanceTabs();

// Connect this function to your page/application teardown lifecycle.
function destroyTabs() {
  for (const controller of controllers) controller.destroy();
}
```

## Public contract

- Root: `.shlz-tabs[data-shlz-tabs]`.
- Tablist: direct child `[role=tablist]` with an accessible name.
- Tabs: direct native buttons with `role=tab`, unique ids and `aria-controls`.
- Panels: `role=tabpanel` with matching id, `aria-labelledby`, conditional `tabindex` and `hidden` state.
- Enhancement: `enhanceTabs(scope?)` returns one `TabsController` per root;
  repeated enhancement reuses the live controller instead of adding listeners.
- Validation: enhancement and direct construction throw `TypeError` when a tab
  lacks `id` or `aria-controls`, an id is not unique in the root's tree, the
  panel is outside the same root, or `aria-labelledby` does not match the tab
  id. A validation error aborts enhancement of the remaining roots in that
  call; roots enhanced earlier in the call retain their controller.
- Programmatic activation: `activate(tab)` accepts only a direct tab owned by
  the controller's tablist and throws `TypeError` for a foreign element.
- Direct construction: constructing a replacement controller for an enhanced
  root destroys the prior controller before taking ownership.
- Lifecycle: `destroy()` removes behavior listeners and releases the root for a
  future enhancement; markup state remains as last activated.
- Visual families: default underline, `--pill` and `--boxed`.

The Basic Elements extraction contains three separate Component Sets and one standalone composition. `tab` (`52:3213`) has four State variants at 116–117×61. `Tab` (`58:5374`) has four State variants at 68×40 with a 20px pill radius. `Tab` (`185:15928`) has six observed Select/State combinations at 74–75×39 with 10px top corners. `Tab group` (`52:3256`) is a 581×61 standalone composition. All 14 variants exported without warnings.

## Accessibility and keyboard

The behavior implements automatic activation with roving `tabindex`:

- Arrow Left/Right move and wrap through enabled tabs.
- Home/End activate the first/last enabled tab.
- Click activates the clicked tab and leaves native button focus behavior intact.
- Native `disabled` or `aria-disabled="true"` tabs are skipped during keyboard navigation.

Every panel must remain inside the same Tabs root as its controlling tab. When a panel starts with plain text or otherwise has no immediately focusable content, give it `tabindex="0"` as in the example; omit that extra tab stop when focus can move directly into meaningful panel content. Keep DOM and visual order aligned.

## Limitations

Tabs do not manage URL routing, lazy loading, persistence, dynamic insertion or overflow. The keyboard contract is horizontal only and does not interpret `aria-orientation`. `destroy()` stops listeners but does not restore initial selected/hidden/tabindex values.

Automatic activation is a behavior-layer **DECISION**. Source exposes no icon axis, and missing Select/State combinations in the six-node boxed set are not synthesized.

## Traceability

- Authoritative archive: `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`
- Evidence map: `docs/evidence-map.md`
- Provenance: `packages/tokens/provenance.json`
- Tokens: `packages/tokens/tokens.json`
- Styles: `packages/styles/components/tabs.css`
- Behavior: `packages/behaviors/src/tabs.ts`
- Showcase: `apps/showcase/src/main.js`
- Snippet tests: `tools/tests/component-documentation.test.mjs`
- Source tests: `tools/tests/tabs-source.test.mjs`
- Behavior contract tests: `tools/tests/components.test.mjs`
- Browser tests: `tools/playwright/components-next.spec.js`
