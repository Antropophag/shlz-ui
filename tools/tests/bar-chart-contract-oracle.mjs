import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const knownBadPath = path.join(
  repositoryRoot,
  "tools/tests/fixtures/bar-chart-known-bad.json",
);
const targetArgument = process.argv[2];

if (targetArgument === knownBadPath) {
  const knownBad = JSON.parse(await readFile(knownBadPath, "utf8"));
  assert.equal(knownBad.stableIdentity, true);
  assert.equal(knownBad.maximumSeries, 4);
  assert.equal(knownBad.keyboardTooltip, true);
  assert.equal(knownBad.legendVisibility, true);
  assert.equal(knownBad.semanticTable, true);
  assert.equal(knownBad.localOverflow, true);
} else if (targetArgument === repositoryRoot) {
  assert.equal((await stat(repositoryRoot)).isDirectory(), true);
  const model = await import(
    pathToFileURL(
      path.join(repositoryRoot, "packages/behaviors/dist/bar-chart-model.js"),
    )
  );
  const controller = await readFile(
    path.join(repositoryRoot, "packages/behaviors/src/bar-chart.ts"),
    "utf8",
  );
  const css = await readFile(
    path.join(repositoryRoot, "packages/styles/components/bar-chart.css"),
    "utf8",
  );
  const sample = {
    categories: [
      { id: "same-a", label: "Same" },
      { id: "same-b", label: "Same" },
    ],
    series: [
      {
        id: "series",
        label: "Series",
        values: [
          { categoryId: "same-a", value: 0, displayValue: "0" },
          { categoryId: "same-b", value: 1, displayValue: "1" },
        ],
      },
    ],
  };
  assert.equal(model.createBarChartModel(sample).dataById.size, 2);
  assert.throws(
    () =>
      model.validateBarChartData({
        ...sample,
        series: Array.from({ length: 5 }, (_, index) => ({
          ...sample.series[0],
          id: `s${index}`,
        })),
      }),
    /one through four/i,
  );
  assert.match(controller, /ArrowLeft/);
  assert.match(controller, /aria-pressed/);
  assert.match(controller, /createElement\("table"\)/);
  assert.match(css, /overflow-x:\s*auto/);
} else {
  throw new TypeError("Bar Chart oracle target is not allowlisted.");
}
