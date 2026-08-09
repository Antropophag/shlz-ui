import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Tag and Person tag remain separate source families", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const tag = components.find(({ figmaNodeId }) => figmaNodeId === "785:48349");
  const person = components.find(
    ({ figmaNodeId }) => figmaNodeId === "371:32592",
  );
  assert.deepEqual(
    tag.variants.map(({ properties }) => properties.Type),
    ["Filled", "Stroke"],
  );
  assert.deepEqual(
    person.variants.map(({ properties }) => properties.State),
    ["Default", "Closable"],
  );
  assert.deepEqual(
    person.variants.map(({ dimensions }) => dimensions.width),
    [193.00018310546875, 213.00018310546875],
  );
});
