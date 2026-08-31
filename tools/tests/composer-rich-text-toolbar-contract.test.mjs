import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("public styles export independent Composer and Toolbar roots", async () => {
  const [bundle, generator, composer, toolbar] = await Promise.all([
    read("packages/styles/shlz.css"),
    read("tools/generate.mjs"),
    read("packages/styles/components/composer.css"),
    read("packages/styles/components/rich-text-toolbar.css"),
  ]);
  assert.match(bundle, /components\/composer\.css/);
  assert.match(bundle, /components\/rich-text-toolbar\.css/);
  assert.match(generator, /components\/composer\.css/);
  assert.match(generator, /components\/rich-text-toolbar\.css/);
  assert.match(composer, /\.shlz-composer\b/);
  assert.match(toolbar, /\.shlz-rich-text-toolbar\b/);
  assert.match(toolbar, /:focus-visible/);
  assert.match(toolbar, /\[aria-pressed="true"\]/);
  assert.match(toolbar, /:disabled/);
  assert.match(composer, /:focus-within/);
  assert.match(composer, /\[aria-invalid="true"\]/);
  assert.match(composer, /\[data-readonly="true"\]/);
});

test("showcase markup uses native semantic controls and state hooks", async () => {
  const source = await read("apps/showcase/src/composer-showcase.js");
  assert.match(source, /role="toolbar"/);
  assert.match(source, /role="group"/);
  assert.match(source, /aria-label=/);
  assert.match(source, /pressed: consumer/);
  assert.match(source, /<button[^>]+type="button"/);
  assert.match(source, /<textarea/);
  assert.match(source, /auditId: "composer-/);
  assert.match(source, /toolbarAuditId: "rich-text-toolbar-/);
});

test("library does not own an editor or command controller", async () => {
  const packageIndex = await read("packages/behaviors/src/index.ts");
  assert.doesNotMatch(
    packageIndex,
    /(?:Composer|RichText|Editor|Formatting)(?:Controller|Command)/,
  );
  const docs = await read("docs/components/composer-rich-text-toolbar.md");
  assert.match(docs, /consumer-owned/i);
  assert.match(docs, /non-goals/i);
});
