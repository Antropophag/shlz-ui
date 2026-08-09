import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Pagination separates its button set from composition", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const button = components.find(({ figmaNodeId }) => figmaNodeId === "46:999");
  const composition = components.find(
    ({ figmaNodeId }) => figmaNodeId === "49:1377",
  );
  assert.equal(button.variants.length, 20);
  assert.ok(
    button.variants.every(
      ({ dimensions }) => dimensions.width === 40 && dimensions.height === 40,
    ),
  );
  assert.deepEqual(composition.dimensions, { width: 320, height: 40 });
  assert.equal(button.extractionWarnings.length, 0);
});
