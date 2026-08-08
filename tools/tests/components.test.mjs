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
];

test("popover behavior keeps native ownership and delegates positioning", async () => {
  const source = await readFile("packages/behaviors/src/popover.ts", "utf8");
  assert.match(source, /button\[data-shlz-popover-trigger\]/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /Escape/);
  assert.match(source, /autoUpdate/);
  assert.match(source, /flip/);
  assert.match(source, /shift/);
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
