# Pagination

## Status

`Executable / Production` — framework-neutral CSS and native-link markup are
shipped. Pagination has no JavaScript controller, router integration, page-range
generator or data API.

## Purpose

Pagination navigates between application-defined pages of one result set. SHLZ
UI supplies the visual and semantic markup contract; the application or server
supplies destinations and the page model.

## Use when

- The result set is split into finite, addressable pages.
- Previous, next and selected direct page destinations have real URLs.
- The consumer can compute a short page window before rendering the component.

## Avoid when

- The total is unknown and only sequential loading is possible.
- The experience is infinite scroll, “load more”, a stepper or tabs.
- A URL cannot represent the destination. Do not replace navigation links with
  buttons merely to imitate SPA routing.

## Dependencies and setup

- Serve `@shlz/styles/shlz.css` at the stylesheet URL used by the page.
- Serve `@shlz/icons/icons/arrow-left-md.svg` and
  `@shlz/icons/icons/arrow-right-md.svg` at the URLs used by the markup.
- `@shlz/behaviors` is not required. No Pagination behavior export exists.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

The example deliberately uses real `href` values. A server-rendered application
can emit it directly. A client router may intercept these links, but it remains
responsible for preserving the destination URL and normal link behavior.

```html
<nav class="shlz-pagination" aria-label="Страницы заявок">
  <ul class="shlz-pagination__list">
    <li>
      <a
        class="shlz-pagination__item"
        href="/requests?page=5"
        aria-label="Предыдущая страница"
      >
        <img
          class="shlz-pagination__icon"
          src="/assets/icons/arrow-left-md.svg"
          alt=""
        />
      </a>
    </li>
    <li><a class="shlz-pagination__item" href="/requests?page=5">5</a></li>
    <li>
      <a
        class="shlz-pagination__item"
        href="/requests?page=6"
        aria-current="page"
        >6</a
      >
    </li>
    <li><a class="shlz-pagination__item" href="/requests?page=7">7</a></li>
    <li>
      <a
        class="shlz-pagination__item"
        href="/requests?page=7"
        aria-label="Следующая страница"
      >
        <img
          class="shlz-pagination__icon"
          src="/assets/icons/arrow-right-md.svg"
          alt=""
        />
      </a>
    </li>
  </ul>
</nav>
```

The current page remains a link. This preserves copy/open/reload behavior and
matches the shipped `[aria-current="page"]` styling.

## Ellipsis example

The consumer computed `1 … 5 6 7 … 42`; Pagination only renders that structure.
Ellipses are not destinations and therefore are not links.

```html
<nav class="shlz-pagination" aria-label="Страницы результатов поиска">
  <ul class="shlz-pagination__list">
    <li><a class="shlz-pagination__item" href="/search?page=1">1</a></li>
    <li>
      <span
        class="shlz-pagination__item shlz-pagination__item--ellipsis"
        aria-hidden="true"
        >…</span
      >
    </li>
    <li><a class="shlz-pagination__item" href="/search?page=5">5</a></li>
    <li>
      <a class="shlz-pagination__item" href="/search?page=6" aria-current="page"
        >6</a
      >
    </li>
    <li><a class="shlz-pagination__item" href="/search?page=7">7</a></li>
    <li>
      <span
        class="shlz-pagination__item shlz-pagination__item--ellipsis"
        aria-hidden="true"
        >…</span
      >
    </li>
    <li><a class="shlz-pagination__item" href="/search?page=42">42</a></li>
  </ul>
</nav>
```

## Boundary state

Unavailable Previous/Next controls are non-link spans. They have no `href` and
cannot enter the tab order.

```html
<nav class="shlz-pagination" aria-label="Страницы архива">
  <ul class="shlz-pagination__list">
    <li>
      <span
        class="shlz-pagination__item shlz-pagination__item--disabled"
        aria-disabled="true"
      >
        <img
          class="shlz-pagination__icon"
          src="/assets/icons/arrow-left-md.svg"
          alt=""
        />
        <span class="shlz-visually-hidden">Предыдущая страница недоступна</span>
      </span>
    </li>
    <li>
      <a
        class="shlz-pagination__item"
        href="/archive?page=1"
        aria-current="page"
        >1</a
      >
    </li>
    <li><a class="shlz-pagination__item" href="/archive?page=2">2</a></li>
    <li>
      <a
        class="shlz-pagination__item"
        href="/archive?page=2"
        aria-label="Следующая страница"
      >
        <img
          class="shlz-pagination__icon"
          src="/assets/icons/arrow-right-md.svg"
          alt=""
        />
      </a>
    </li>
  </ul>
</nav>
```

The last-page state is the inverse: Next becomes the disabled span and Previous
remains a real link.

## Public HTML contract

| Part                  | Contract                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Landmark              | `nav.shlz-pagination` with a purpose-specific `aria-label` or `aria-labelledby`.                         |
| List                  | `ul.shlz-pagination__list`; one `li` per item in visual and reading order.                               |
| Destination           | `a.shlz-pagination__item` with a consumer-generated `href`.                                              |
| Current page          | Exactly one destination link has `aria-current="page"`.                                                  |
| Previous / Next       | Destination links with explicit accessible names and decorative SHLZ icons.                              |
| Unavailable direction | Non-link `.shlz-pagination__item--disabled[aria-disabled="true"]` with visually hidden unavailable text. |
| Ellipsis              | Non-link `.shlz-pagination__item--ellipsis[aria-hidden="true"]`.                                         |
| Runtime               | Native link navigation. No SHLZ events, controller, state or lifecycle.                                  |

## Variants and states

- Source-backed item types: Previous, Next, Number, Ellipsis Previous and
  Ellipsis Next.
- Runtime states: default, native `:hover`, native `:active`, `:focus-visible`,
  `[aria-current="page"]` and non-link disabled.
- `.shlz-pagination__item--visual-hover` and
  `.shlz-pagination__item--visual-pressed` are diagnostic helpers, not public
  application state.
- There is one production size: the source-backed 40 px outer control. No compact
  or large modifier is shipped.

## Accessibility and keyboard behavior

- Give every Pagination landmark a name that identifies its result set. When
  several navigation landmarks exist, their names must distinguish their
  purposes.
- Apply `aria-current="page"` to exactly one current destination. This matches
  the W3C `aria-current` page technique.
- Previous and Next icon links need explicit accessible names. Their images use
  `alt=""` because the link already has a name.
- Ellipses are hidden from assistive technology because they neither identify a
  page nor perform an action.
- Disabled directions are non-links with visually hidden text such as
  “Предыдущая страница недоступна”. Do not keep an unusable anchor with a fake
  `href`, click suppression or `tabindex` workaround; do not try to name a
  generic span with `aria-label`.
- Keyboard behavior is native: Tab and Shift+Tab traverse available links, Enter
  follows the focused link, and browser focus styling uses `:focus-visible`.
  Pagination implements no roving tabindex or Arrow/Home/End shortcuts.

The [W3C `aria-current` technique](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA26)
and [USWDS Pagination accessibility guidance](https://designsystem.digital.gov/components/pagination/)
support these structural decisions. They are accessibility/DX references, not
sources for SHLZ visual values or variants.

## Responsive and overflow behavior

`.shlz-pagination__list` is a wrapping flex row. When the container becomes too
narrow, whole items move onto another row. The component does not clip them,
create a horizontal scroller or compute a smaller mobile window.

Long numeric values widen individual items through their minimum inline size and
padding. Long accessible labels on icon links do not affect geometry, but visible
text labels would. Consumers must choose a page window appropriate to their
container and content; SHLZ UI does not promise a single-line mobile layout.

## Consumer owns

- Current page state and validation of the requested page.
- Total-items and total-pages models, if the application has them.
- The page-window algorithm, including first/last pages and ellipses.
- Every `href`, query parameter, route and client-history update.
- Server rendering or client rerendering after navigation.
- API calls, caching, cancellation, loading, errors and synchronization.
- Reconciliation when filters or changing totals invalidate the current page.
- A product-specific alternative for unknown totals or infinite datasets.

Pagination does not accept `totalItems`, derive page count or retain hidden
state. It receives an already-formed list through consumer-authored HTML.

## Composition

Place Pagination next to the result region it navigates. A consumer may compose
it with a summary or page-size control, but those values, controls and resulting
data reload remain application-owned. Do not infer a coupled API from the visual
source's composed page-size row.

## Limitations

- Unknown/unbounded totals, infinite datasets and changing-total recovery have no
  SHLZ Pagination behavior contract.
- No responsive-collapse, overflow-scroll or automatic page-window variant is
  shipped.
- No buttons/API callback variant is shipped. An SPA may progressively enhance
  the native links, but the router integration remains outside the library.
- No loading, busy, error, visited-page or disabled-current state is defined.

## Traceability

```text
shlz-design-source/raw/svg/Pagination.svg
→ docs/components/pagination-source.md
→ packages/tokens/provenance.json + packages/tokens/tokens.json
→ packages/styles/components/pagination.css
→ behavior: Not applicable
→ docs/components/pagination.md
→ apps/showcase/src/main.js + apps/showcase/src/pagination-consumer.js
→ tools/tests/pagination-source.test.mjs
→ tools/tests/components.test.mjs
→ tools/tests/component-documentation.test.mjs
→ tools/playwright/pagination-contract.spec.js
→ tools/playwright/pagination-typography.spec.js
```

## Source interpretation

| Class    | Evidence / contract                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| FACT     | `Pagination.svg` contains the 40×40 Previous, Next, Number and ellipsis item family and a standalone composition.                 |
| FACT     | `Pagination (2).svg` repeats the composed family in a wider context.                                                              |
| FACT     | `Pagination (1).svg` is titled Placeholder and is excluded despite its filename.                                                  |
| DERIVED  | Main and `(2)` are one visual family; source states map to native link states plus explicit current/disabled markup.              |
| DECISION | Production navigation uses named `nav`, a list, native links, `aria-current="page"`, non-link disabled items and hidden ellipses. |
| UNKNOWN  | The source does not define URL construction, total/page models, page-window logic, unknown totals or responsive collapse.         |
