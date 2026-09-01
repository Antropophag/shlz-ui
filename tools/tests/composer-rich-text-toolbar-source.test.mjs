import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const contractPath =
  "docs/component-audits/composer-rich-text-toolbar-source.json";
const contract = JSON.parse(await readFile(contractPath, "utf8"));

test("Composer and Rich Text Toolbar source authority remains exact", async () => {
  for (const authority of contract.authoritativeSources) {
    const bytes = await readFile(authority.path);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      authority.sha256,
    );
    assert.match(
      bytes.toString("utf8"),
      new RegExp(
        `width="${authority.canvas.width}" height="${authority.canvas.height}" viewBox="0 0 ${authority.canvas.width} ${authority.canvas.height}"`,
      ),
    );
  }
});

test("source contract distinguishes facts, patterns, decisions, and assumptions", () => {
  assert.deepEqual(
    new Set(contract.claims.map(({ classification }) => classification)),
    new Set([
      "source-fact",
      "derived-pattern",
      "repository-decision",
      "assumption",
    ]),
  );
  assert.ok(contract.boundaries.sizes.length > 0);
  assert.ok(contract.boundaries.states.length > 0);
  assert.ok(contract.boundaries.contentStress.length > 0);
});

test("the normalized editor inventory contains the complete 17-glyph set", async () => {
  const names = (await readdir("packages/icons/normalized/editor"))
    .filter((name) => name.endsWith(".svg"))
    .map((name) => name.replace(/\.svg$/, ""))
    .sort();
  assert.deepEqual(names, [
    "align-center",
    "align-left-editor",
    "align-right",
    "bold-type",
    "bulleted-list",
    "caret-up-down",
    "file",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "image",
    "italic",
    "monotone-add",
    "numbered-list",
    "underline",
  ]);
});

test("source contract rejects unsupported behavior ownership", () => {
  const forbidden = contract.unsupportedBehaviorClaims.join(" ");
  for (const claim of [
    "formatting execution",
    "selection preservation",
    "keyboard shortcuts",
    "document schema",
    "HTML sanitization",
    "upload lifecycle",
    "submission",
    "persistence",
  ])
    assert.match(forbidden, new RegExp(claim, "i"));
});
