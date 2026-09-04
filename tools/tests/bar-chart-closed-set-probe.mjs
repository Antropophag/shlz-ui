import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [evidence, setId, member] = process.argv.slice(2);
assert.ok(evidence && setId && member);

if (setId === "bar-chart-supported-series-count") {
  const { validateBarChartData } =
    await import("../../packages/behaviors/dist/bar-chart-model.js");
  const count = Number(member);
  const category = { id: "category", label: "Category" };
  const series = Array.from({ length: count }, (_, index) => ({
    id: `series-${index + 1}`,
    label: `Series ${index + 1}`,
    values: [
      { categoryId: category.id, value: index, displayValue: String(index) },
    ],
  }));
  assert.doesNotThrow(() =>
    validateBarChartData({ categories: [category], series }),
  );
} else if (setId === "bar-chart-material-state") {
  const source = await readFile(evidence, "utf8");
  assert.match(
    source,
    new RegExp(
      `verifyMaterialState\\(\\s*["']bar-chart["']\\s*,\\s*["']${member}["']`,
    ),
  );
} else {
  throw new TypeError(`Unknown closed set: ${setId}`);
}
