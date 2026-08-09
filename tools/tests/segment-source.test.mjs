import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Segment keeps authoritative group and item models", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const group = components.find(
    ({ figmaNodeId }) => figmaNodeId === "424:36756",
  );
  const item = components.find(
    ({ figmaNodeId }) => figmaNodeId === "424:36728",
  );
  assert.equal(group.variants.length, 6);
  assert.deepEqual(
    [
      ...new Set(group.variants.map(({ dimensions }) => dimensions.height)),
    ].sort((a, b) => a - b),
    [26, 33, 41],
  );
  assert.equal(item.variants.length, 9);
  assert.ok(
    !item.variants.some(
      ({ properties }) =>
        properties.Selected === "true" && properties.Disabled === "true",
    ),
  );
});
