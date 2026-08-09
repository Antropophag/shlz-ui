import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const archive = "shlz-design-source/raw/svg/UI Kit – Basic elements.zip";

async function componentManifest(name) {
  const { stdout } = await execFileAsync("unzip", [
    "-p",
    archive,
    `components/${name}/manifest.json`,
  ]);
  return JSON.parse(stdout);
}

test("Input keeps all broken source nodes without inventing properties", async () => {
  const input = await componentManifest("Input");
  assert.equal(input.variants.length, 21);
  assert.equal(
    new Set(input.variants.map(({ figmaNodeId }) => figmaNodeId)).size,
    21,
  );
  assert.ok(
    input.variants.every(({ variantProperties }) => variantProperties === null),
  );
  assert.equal(
    input.variants.filter(
      ({ originalName }) =>
        originalName ===
        "Size=Large, State=Default, Filled=False, Type=Advanced",
    ).length,
    2,
  );
});

test("Textarea covers the structured 5 by 2 by 2 source matrix", async () => {
  const textarea = await componentManifest("Textarea");
  assert.equal(textarea.variants.length, 20);
  const signatures = new Set(
    textarea.variants.map(({ variantProperties }) =>
      JSON.stringify([
        variantProperties.State,
        variantProperties.Filled,
        variantProperties["Show Count"],
      ]),
    ),
  );
  assert.equal(signatures.size, 20);
  assert.deepEqual(
    new Set(textarea.variants.map(({ width }) => width)),
    new Set([395]),
  );
});

test("Select maps every structured Dropdown source variant", async () => {
  const select = await componentManifest("Dropdown");
  assert.equal(select.variants.length, 52);
  assert.equal(
    new Set(select.variants.map(({ figmaNodeId }) => figmaNodeId)).size,
    52,
  );
  for (const variant of select.variants) {
    assert.deepEqual(Object.keys(variant.variantProperties).sort(), [
      "Filled",
      "Multyselect",
      "Search",
      "Size",
      "State",
      "Status",
    ]);
  }
});

test("production fields use composition and exact Component Set references", async () => {
  const css = await readFile("packages/styles/components/field.css", "utf8");
  const references = await readFile("tools/source-references.mjs", "utf8");
  const fidelity = await readFile("apps/showcase/src/fidelity.js", "utf8");
  assert.match(css, /\.shlz-field__control/);
  assert.match(css, /block-size: 40px/);
  assert.match(css, /block-size: 58px/);
  assert.match(references, /componentSet: "Input"/);
  assert.match(references, /componentSet: "Textarea"/);
  assert.match(references, /componentSet: "Dropdown"/);
  assert.doesNotMatch(references, /\["input", "Select\.svg"/);
  assert.match(fidelity, /All 52 structured variants/);
  assert.match(fidelity, /id: "select"/);
});

test("showcase coverage and references include every form-control source node", async () => {
  const generated = JSON.parse(
    await readFile(
      "apps/showcase/generated/source-references/manifest.json",
      "utf8",
    ),
  );
  for (const [component, expected] of [
    ["input", 21],
    ["textarea", 20],
    ["select", 52],
  ]) {
    const entry = generated.find((item) => item.component === component);
    assert.equal(entry.sourceVariantCount, expected);
    assert.equal(entry.references.length, expected);
    assert.equal(
      new Set(entry.references.map(({ sourceNodeId }) => sourceNodeId)).size,
      expected,
    );
    assert.ok(
      entry.references.every(
        ({ cropViewBox }) => cropViewBox === "complete variant node",
      ),
    );
  }

  const fidelity = await readFile("apps/showcase/src/fidelity.js", "utf8");
  assert.match(fidelity, /<summary>Source &amp; fidelity details<\/summary>/);
  assert.match(fidelity, /<strong>Source coverage:<\/strong>/);
  assert.match(fidelity, /Individual Figma SVG exports/);
  assert.match(fidelity, /primaryComponentMarkup/);
  assert.match(fidelity, /data-shlz-input-size-panel="medium" hidden/);
  assert.doesNotMatch(fidelity, /formImplementationMarkup/);
});
