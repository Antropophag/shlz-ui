import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Tabs preserve the three authoritative source families", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const tabs = components.filter(({ figmaNodeId }) =>
    ["52:3213", "58:5374", "185:15928"].includes(figmaNodeId),
  );
  assert.deepEqual(
    tabs.map(({ variants }) => variants.length),
    [4, 4, 6],
  );
  assert.deepEqual(
    tabs.map(({ variants }) => [
      ...new Set(variants.map(({ dimensions }) => dimensions.height)),
    ]),
    [[61], [40], [39]],
  );
  assert.ok(
    tabs.every(({ extractionWarnings }) => extractionWarnings.length === 0),
  );
});
