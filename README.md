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

Start with the [evidence map](docs/evidence-map.md) and [source-of-truth policy](docs/source-of-truth.md) before changing visual contracts.

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
