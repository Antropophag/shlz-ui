import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Dropdown menu families stay separate from Select", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const ids = ["43:769", "45:1204", "110:15065"];
  const families = ids.map((id) =>
    components.find(({ figmaNodeId }) => figmaNodeId === id),
  );
  assert.deepEqual(
    families.map(({ variants }) => variants.length),
    [16, 10, 2],
  );
  assert.ok(
    families.every(({ extractionWarnings }) => extractionWarnings.length === 0),
  );
  assert.equal(
    components.find(({ figmaNodeId }) => figmaNodeId === "36:1106").variants
      .length,
    52,
  );
});
