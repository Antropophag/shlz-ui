import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createHash } from "node:crypto";

const components = async () =>
  JSON.parse(await readFile("design-source-index/components.json", "utf8"))
    .components;

test("Tooltip and Popover preserve their complete authoritative placement sets", async () => {
  const source = await components();
  const tooltip = source.find(({ name }) => name === "Tooltip");
  const popover = source.find(({ name }) => name === "Popover");

  assert.equal(tooltip.kind, "COMPONENT_SET");
  assert.deepEqual(Object.keys(tooltip.propertyDefinitions), ["Direction"]);
  assert.equal(tooltip.variants.length, 8);
  assert.ok(
    tooltip.variants.every(({ dimensions }, index) =>
      [3, 4].includes(index)
        ? Math.abs(dimensions.width - 114.34) < 0.001 &&
          dimensions.height === 37
        : dimensions.width === 100 &&
          Math.abs(dimensions.height - 51.314) < 0.005,
    ),
  );

  assert.equal(popover.kind, "COMPONENT_SET");
  assert.deepEqual(Object.keys(popover.propertyDefinitions), ["Placement"]);
  assert.equal(popover.variants.length, 12);
  assert.deepEqual(
    new Set(popover.variants.map(({ dimensions }) => dimensions.width)),
    new Set([236, 244]),
  );
  assert.deepEqual(
    new Set(popover.variants.map(({ dimensions }) => dimensions.height)),
    new Set([90, 97.0710678100586]),
  );
  assert.ok(
    [...tooltip.variants, ...popover.variants].every(
      ({ extractionWarnings }) => extractionWarnings.length === 0,
    ),
  );
});

test("Modal remains five standalone source components and Drawer remains one", async () => {
  const source = await components();
  const modalNames = [
    ".Modal/Basic(Legacy)",
    "Modal/Info",
    "Modal/Success",
    "Modal/Warning",
    "Modal/Error",
  ];
  const modal = modalNames.map((name) =>
    source.find((component) => component.name === name),
  );
  assert.ok(modal.every(({ kind }) => kind === "COMPONENT"));
  assert.deepEqual(
    modal.map(({ dimensions }) => [dimensions.width, dimensions.height]),
    [
      [572, 196],
      [416, 165],
      [416, 165],
      [417, 165],
      [416, 165],
    ],
  );
  assert.ok(modal.every(({ variants }) => variants.length === 0));
  assert.ok(
    modal.every(
      ({ propertyDefinitions }) =>
        Object.keys(propertyDefinitions).length === 0,
    ),
  );
  assert.ok(
    modal.every(({ extractionWarnings }) => extractionWarnings.length === 0),
  );

  const drawer = source.find(({ name }) => name === "Sidebar/Drawer");
  assert.equal(drawer.kind, "COMPONENT");
  assert.deepEqual(drawer.dimensions, { width: 420, height: 900 });
  assert.deepEqual(drawer.propertyDefinitions, {});
  assert.equal(drawer.variants.length, 0);
  assert.equal(drawer.extractionWarnings.length, 0);

  const hash = async (path) =>
    createHash("sha256")
      .update(await readFile(path))
      .digest("hex");
  assert.equal(
    await hash("shlz-design-source/raw/svg/Modal.svg"),
    "62b0686f4ea17ecb8bb0bf25fe9020ee3a1512728e4271fd6fc734595e2b7fed",
  );
  assert.equal(
    await hash("shlz-design-source/raw/svg/Drawer.svg"),
    "a7ff3b75584ad5782bb2e3b2bc6b2dd62baec589c32edb334d619a65dbf49e8e",
  );
});

test("overlay production CSS retains component-local source geometry and effects", async () => {
  const [tooltip, popover, modal, drawer] = await Promise.all(
    ["tooltip", "popover", "modal", "drawer"].map((name) =>
      readFile(`packages/styles/components/${name}.css`, "utf8"),
    ),
  );
  assert.match(tooltip, /inline-size: 100px/);
  assert.match(tooltip, /min-block-size: 37px/);
  assert.match(tooltip, /border-radius: var\(--shlz-source-radius-min\)/);
  assert.doesNotMatch(tooltip, /box-shadow/);

  assert.match(popover, /inline-size: min\(236px/);
  assert.match(popover, /0 4px 15px rgb\(11 22 35 \/ 10%\)/);
  assert.match(popover, /0 1px 1\.5px rgb\(11 22 35 \/ 8%\)/);

  assert.match(modal, /inline-size: min\(572px/);
  assert.match(modal, /inline-size: min\(416px/);
  assert.match(modal, /0 4px 30px rgb\(0 0 0 \/ 8%\)/);
  assert.match(modal, /0 1px 3px rgb\(0 0 0 \/ 5%\)/);

  assert.match(drawer, /inline-size: min\(420px/);
  assert.match(drawer, /min-block-size: 64px/);
  assert.match(drawer, /min-block-size: 72px/);
  assert.doesNotMatch(drawer, /box-shadow/);
});

test("generated diagnostics retain every overlay source node losslessly", async () => {
  const generated = JSON.parse(
    await readFile(
      "apps/showcase/generated/source-references/manifest.json",
      "utf8",
    ),
  );
  for (const [component, count] of [
    ["tooltip-variants", 8],
    ["popover-variants", 12],
    ["modal-basic", 1],
    ["modal-info", 1],
    ["modal-success", 1],
    ["modal-warning", 1],
    ["modal-error", 1],
    ["drawer-source", 1],
  ]) {
    const entry = generated.find((item) => item.component === component);
    assert.equal(entry.sourceVariantCount, count);
    assert.equal(entry.references.length, count);
    assert.equal(entry.sourceHasErrors, false);
  }
});
