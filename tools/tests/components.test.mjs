import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentFiles = [
  "button",
  "field",
  "choice",
  "status-badge",
  "dropdown",
  "popover",
  "tooltip",
  "tabs",
  "pagination",
  "tag",
  "segment",
  "notification",
  "modal",
  "drawer",
  "file-row",
  "document-row",
  "empty-state",
  "card-with-action",
  "report-card",
  "cover",
  "reporting-dashboard",
];

test("modal and drawer compose the native dialog lifecycle", async () => {
  const [shared, modal, drawer] = await Promise.all([
    readFile("packages/behaviors/src/internal/native-dialog.ts", "utf8"),
    readFile("packages/behaviors/src/modal.ts", "utf8"),
    readFile("packages/behaviors/src/drawer.ts", "utf8"),
  ]);
  assert.match(shared, /showModal\(\)/);
  assert.match(shared, /dialog\.close/);
  assert.match(shared, /addEventListener\(\s*"close"/);
  assert.match(shared, /pointerdown/);
  assert.match(shared, /pointerup/);
  assert.match(modal, /dialog\[data-shlz-modal\]/);
  assert.match(drawer, /dialog\[data-shlz-drawer\]/);
  assert.doesNotMatch(
    `${shared}${modal}${drawer}`,
    /focusTrap|inert\s*=|customElements|Vue|OverlayController|ModalManager/,
  );
});

test("popover behavior keeps native ownership and delegates positioning", async () => {
  const source = await readFile("packages/behaviors/src/popover.ts", "utf8");
  assert.match(source, /button\[data-shlz-popover-trigger\]/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /Escape/);
  assert.match(source, /positionFloating/);
  assert.match(source, /observeFloating/);
  assert.doesNotMatch(source, /customElements|Vue|innerHTML/);
});

test("floating controllers share bounded geometry and Escape ownership", async () => {
  const [floating, active, dropdown, popover, tooltip] = await Promise.all([
    readFile("packages/behaviors/src/internal/floating.ts", "utf8"),
    readFile("packages/behaviors/src/internal/active-floating.ts", "utf8"),
    readFile("packages/behaviors/src/dropdown.ts", "utf8"),
    readFile("packages/behaviors/src/popover.ts", "utf8"),
    readFile("packages/behaviors/src/tooltip.ts", "utf8"),
  ]);
  assert.match(floating, /autoUpdate/);
  assert.match(floating, /flip/);
  assert.match(floating, /shift/);
  assert.match(active, /WeakSet<Event>/);
  assert.match(active, /claimActiveFloatingEscape/);
  for (const controller of [dropdown, popover, tooltip])
    assert.match(controller, /\bclaimActiveFloatingEscape\s*\(/);
  assert.match(tooltip, /role='tooltip'/);
  assert.match(tooltip, /aria-describedby/);
  assert.match(tooltip, /pointerenter/);
  assert.doesNotMatch(
    tooltip,
    /aria-expanded|role=['"]dialog|customElements|Vue/,
  );
});

test("tabs controller synchronizes the ARIA tabs pattern", async () => {
  const source = await readFile("packages/behaviors/src/tabs.ts", "utf8");
  for (const contract of [
    "aria-selected",
    "tabIndex",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "tabpanel",
  ]) {
    assert.ok(source.includes(contract), `Tabs is missing ${contract}`);
  }
  assert.doesNotMatch(source, /customElements|Vue|innerHTML/);
});

test("dropdown behavior stays framework-agnostic and native-first", async () => {
  const source = await readFile("packages/behaviors/src/dropdown.ts", "utf8");
  assert.match(source, /button\[aria-haspopup="menu"\]\[aria-controls\]/);
  assert.match(source, /:disabled/);
  assert.match(source, /ArrowDown/);
  assert.match(source, /Escape/);
  assert.doesNotMatch(source, /customElements|Vue|innerHTML/);
});

test("standalone stylesheet contains every component source", async () => {
  const bundle = await readFile("packages/styles/dist/shlz.css", "utf8");
  for (const name of componentFiles) {
    const source = await readFile(
      `packages/styles/components/${name}.css`,
      "utf8",
    );
    assert.ok(bundle.includes(source), `${name}.css was not bundled`);
  }
  assert.doesNotMatch(bundle, /@import/);
});

test("all global token references in component CSS resolve", async () => {
  const bundle = await readFile("packages/styles/dist/shlz.css", "utf8");
  const definitions = new Set(
    [...bundle.matchAll(/(--shlz-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
  );
  for (const reference of bundle.matchAll(
    /var\((--shlz-[a-z0-9-]+)(,[^)]+)?\)/g,
  )) {
    if (!reference[2])
      assert.ok(definitions.has(reference[1]), `Unknown token ${reference[1]}`);
  }
});

test("plain HTML fixture keeps accessibility-critical native contracts", async () => {
  const html = await readFile("tools/fixtures/plain-html.html", "utf8");
  assert.match(html, /<button[^>]+type="button"/);
  assert.match(html, /<input[^>]+type="checkbox"[^>]+checked/);
  assert.match(html, /<input[^>]+type="radio"[^>]+name=/);
  assert.match(html, /type="checkbox" role="switch"/);
  assert.match(html, /<label[^>]+for="fixture-title"/);
  assert.match(html, /<fieldset>[\s\S]*<legend>/);
  assert.match(html, /packages\/styles\/dist\/shlz\.css/);
  assert.match(html, /packages\/behaviors\/dist\/browser\.js/);
  assert.match(html, /data-shlz-popover-trigger="fixture-popover"/);
  assert.match(html, /aria-controls="fixture-popover"/);
  assert.match(html, /role="tooltip"/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /<nav class="shlz-pagination"[^>]+aria-label=/);
  assert.match(html, /aria-current="page"/);
  assert.match(
    html,
    /shlz-tag__remove"[\s\S]*?type="button"[\s\S]*?aria-label=/,
  );
  assert.match(html, /shlz-segment__input" type="radio" name=/);
  assert.match(
    html,
    /class="shlz-notification"[\s\S]*?role="status"[\s\S]*?data-component-audit-id="notification-plain-html"/,
  );
  assert.match(html, /<dialog[\s\S]+data-shlz-modal/);
  assert.match(html, /<dialog[\s\S]+data-shlz-drawer/);
  assert.match(
    html,
    /<(?:section|div)[^>]*class="[^"]*\bshlz-dashboard\b[^"]*"[^>]*data-component-audit-id="dashboard-plain-html"[^>]*>/,
  );
  assert.match(
    html,
    /<article[^>]*class="[^"]*\bshlz-chart-widget\b[^"]*"[^>]*data-component-audit-id="chart-widget-plain-html"[^>]*>/,
  );
  assert.match(html, /enhanceModals\(\)/);
  assert.match(html, /enhanceDrawers\(\)/);
  assert.match(html, /enhanceTooltips\(\)/);
  assert.match(html, /enhanceTabs\(\)/);
});

test("interactive selectors include native states and keyboard focus", async () => {
  const css = await Promise.all(
    componentFiles.map((name) =>
      readFile(`packages/styles/components/${name}.css`, "utf8"),
    ),
  ).then((parts) => parts.join("\n"));
  for (const selector of [
    ":hover",
    ":active",
    ":focus-visible",
    ":disabled",
    ":checked",
    ":indeterminate",
    '[aria-invalid="true"]',
  ]) {
    assert.ok(css.includes(selector), `Missing ${selector} state`);
  }
});

test("Button retains the complete source-backed mode contract", async () => {
  const css = await readFile("packages/styles/components/button.css", "utf8");
  const showcase = await readFile("apps/showcase/src/fidelity.js", "utf8");
  assert.match(css, /\.shlz-button--primary/);
  assert.match(css, /\.shlz-button--text/);
  assert.match(css, /font-size: 15px/);
  assert.match(css, /line-height: 19\.5px/);
  assert.match(css, /font-size: 14px/);
  for (const state of [":hover", ":active", ":disabled"])
    assert.match(css, new RegExp(`\\.shlz-button--text[\\s\\S]*${state}`));
  assert.match(showcase, /data-shlz-button-source-matrix/);
});
