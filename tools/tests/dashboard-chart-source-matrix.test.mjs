import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const matrixPath = "docs/component-audits/dashboard-chart-source-matrix.json";

test("Dashboard.svg chart source matrix is traceable and complete", async () => {
  const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
  const source = await readFile(matrix.authority.file);

  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    matrix.authority.sha256,
  );
  assert.equal(matrix.auditKind, "source-only");
  assert.equal(matrix.sourceAccounting.renderedChartWidgetFrames, 15);
  assert.equal(matrix.sourceAccounting.literal1304x515RectNodes, 17);
  assert.equal(matrix.sourceAccounting.clipPathOnlyRectNodes, 2);
  assert.equal(matrix.sourceAccounting.shadowFilterRegions1310x521, 12);

  assert.equal(matrix.barPrimitive.colorVariants.length, 9);
  assert.deepEqual(
    matrix.barPrimitive.states.map(({ id }) => id),
    ["default", "hover"],
  );
  assert.equal(matrix.axesAndPeriods.plot.horizontalGridLineCount, 6);
  assert.equal(matrix.tooltipPopover.standaloneVariants.length, 2);
  assert.equal(matrix.legendAndSeriesMapping.persistentLegend.observed, false);
  assert.equal(matrix.emptyState.instances, 3);
  assert.equal(matrix.filtersAndPeriodControls.familyVariants.length, 3);
  assert.equal(matrix.matrixLayout.familyColumns.length, 3);
  assert.equal(matrix.matrixLayout.stateRows.length, 5);

  const variants = matrix.composedVariantMatrix;
  assert.equal(variants.length, 15);
  assert.equal(new Set(variants.map(({ id }) => id)).size, variants.length);
  assert.equal(new Set(variants.map(({ family }) => family)).size, 3);
  assert.ok(variants.some(({ seriesCount }) => seriesCount === 2));
  assert.ok(variants.some(({ seriesCount }) => seriesCount === 3));
  assert.ok(variants.some(({ seriesCount }) => seriesCount === 8));
  assert.equal(matrix.coverage.singleSeries, "not observed");
  assert.equal(matrix.coverage.stackedBars, "not observed");

  const svgText = source.toString("utf8");
  for (const variant of matrix.barPrimitive.colorVariants) {
    assert.match(svgText, new RegExp(`fill="${variant.default}"`, "i"));
    assert.match(svgText, new RegExp(`fill="${variant.hover.fill}"`, "i"));
  }
  assert.match(svgText, /fill="#DE753D" fill-opacity="0\.15"/);
  assert.match(svgText, /fill="#F5F5F5"/);
});

test("source accounting does not count filters or clip paths as rendered frames", async () => {
  const [matrix, svg] = await Promise.all([
    readFile(matrixPath, "utf8").then(JSON.parse),
    readFile("shlz-design-source/raw/svg/Dashboard.svg", "utf8"),
  ]);

  assert.equal(
    svg.match(/width="1304" height="515"/g)?.length,
    matrix.sourceAccounting.literal1304x515RectNodes,
  );
  assert.equal(
    svg.split("<defs>", 1)[0].match(/width="1304" height="515"/g)?.length,
    matrix.sourceAccounting.renderedChartWidgetFrames,
  );
  assert.equal(
    svg.match(/width="1310" height="521"/g)?.length,
    matrix.sourceAccounting.shadowFilterRegions1310x521,
  );
  assert.notEqual(
    matrix.sourceAccounting.renderedChartWidgetFrames,
    matrix.sourceAccounting.literal1304x515RectNodes +
      matrix.sourceAccounting.shadowFilterRegions1310x521,
  );
});
