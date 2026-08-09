import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Notification and Snackbar preserve their extracted axes", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const notification = components.find(
    ({ figmaNodeId }) => figmaNodeId === "89:17043",
  );
  const snackbar = components.find(
    ({ figmaNodeId }) => figmaNodeId === "424:37565",
  );
  assert.equal(notification.variants.length, 3);
  assert.equal(snackbar.variants.length, 6);
  assert.ok(
    [...notification.variants, ...snackbar.variants].every(
      ({ dimensions }) => dimensions.width === 384 && dimensions.height === 58,
    ),
  );
  assert.deepEqual(
    snackbar.variants.map(({ properties }) => properties.Number),
    ["5", "4", "3", "2", "1", "0"],
  );
});
