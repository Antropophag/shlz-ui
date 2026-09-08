# SHLZ UI

Framework-agnostic foundation of the SHLZ corporate design system, reconstructed from the read-only Figma SVG evidence in `shlz-design-source/`.

```sh
npm install
npm run dev
npm run check
```

Browser regression tests require the repository's pinned Playwright browser:

```sh
npx playwright install chromium
npm run test:e2e
```

The full browser and visual suite runs in Chromium. A separate functional
smoke suite runs the same seven existing scenarios in Chromium, Firefox, and
WebKit: Input, Checkbox, Select, Modal, Popover, Date Picker, and File Upload.
It has no screenshot comparisons and does not establish complete browser
compatibility or component audit completion.

```sh
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e:smoke
# Optional: run one engine
npm run test:e2e:smoke -- --project=firefox
# List/check selection without launching browsers (requires built packages)
npm run generate && npm run build:packages
npm run test:e2e:smoke -- --list
npm run check:e2e:smoke
```

CI installs browser binaries and Linux host dependencies in a separate smoke
job. A missing local WebKit host dependency requires installation or validation
on the CI runner; it is not a reason to skip that browser. Keep the `@smoke`
metadata on these shared test bodies; the discovery check enforces seven
scenarios per engine.

Start with the [evidence map](docs/evidence-map.md) and [source-of-truth policy](docs/source-of-truth.md) before changing visual contracts.
The bounded Windows/NVDA procedure and support limits are documented in [browser and screen-reader evidence](docs/accessibility-support.md).
Typography profiles are documented in [Typography profiles](docs/typography-profiles.md).

The generated `@shlz/styles/shlz.css` distribution is standalone and can be
served directly to framework-free consumers:

```html
<link rel="stylesheet" href="/assets/shlz.css" />
<body class="shlz-scope">
  <button class="shlz-button shlz-button--primary" type="button">
    Создать
  </button>
</body>
```
