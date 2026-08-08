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
];

test("popover behavior keeps native ownership and delegates positioning", async () => {
  const source = await readFile("packages/behaviors/src/popover.ts", "utf8");
  assert.match(source, /button\[data-shlz-popover-trigger\]/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /Escape/);
  assert.match(source, /positionFloating/);
  assert.match(source, /observeFloating/);
  assert.doesNotMatch(source, /customElements|Vue|innerHTML/);
});

test("popover and tooltip share only floating geometry infrastructure", async () => {
  const floating = await readFile(
    "packages/behaviors/src/internal/floating.ts",
    "utf8",
  );
  const tooltip = await readFile("packages/behaviors/src/tooltip.ts", "utf8");
  assert.match(floating, /autoUpdate/);
  assert.match(floating, /flip/);
  assert.match(floating, /shift/);
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
  assert.match(html, /shlz-notification" role="status"/);
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
