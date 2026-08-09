import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const components = JSON.parse(
  await readFile("design-source-index/components.json", "utf8"),
).components;
const family = (name) => components.find((item) => item.name === name);

test("Link exposes exactly four source states", () => {
  assert.deepEqual(
    family("Link").variants.map(({ properties }) => properties.State),
    ["Default", "Hover", "Pressed", "Disabled"],
  );
});

test("Avatar contract is four circle sizes by three content types", () => {
  const variants = family("Avatar").variants;
  assert.equal(variants.length, 12);
  assert.deepEqual(
    [...new Set(variants.map((item) => Math.round(item.dimensions.width)))],
    [24, 32, 40, 64],
  );
  assert.deepEqual(
    [...new Set(variants.map((item) => item.properties.Type))].sort(),
    ["icon", "image", "text"],
  );
  assert.ok(
    variants.every(
      (item) =>
        item.properties.Shape === "circle" && item.properties.Badge === "none",
    ),
  );
});

test("Table primitives retain reusable source axes and geometry", () => {
  const cells = family("Table Cell").variants;
  assert.equal(cells.length, 49);
  assert.ok(
    cells.every(
      (item) => item.dimensions.height === 50 || item.dimensions.height === 154,
    ),
  );
  assert.equal(family("Sorter").variants.length, 3);
  assert.equal(family("Filter").variants.length, 3);
});
