import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const [target, set, member, evidence] = process.argv.slice(2);
if (set)
  assert.ok(
    ["series", "tones", "density", "layout-mode", "placement"].includes(set),
    "Unknown finite set",
  );
if (evidence) assert.ok((await readFile(evidence)).length > 0);
const model = await import(
  pathToFileURL(
    target.endsWith(".mjs")
      ? path.resolve(target)
      : path.resolve(target, "packages/behaviors/dist/bar-chart-model.js"),
  )
);
const exercise = (categories, count, tone = "blue", source = false) => {
  const data = Array.from({ length: categories }, (_, i) => ({
    id: `c${i}`,
    label: `C${i}`,
  }));
  return model.createBarChartModel({
    categories: data,
    series: Array.from({ length: count }, (_, i) => ({
      id: `s${i}`,
      label: `S${i}`,
      tone,
      values: data.map((c) => ({
        categoryId: c.id,
        value: 1,
        displayValue: "1",
      })),
    })),
    presentation: { density: source ? "source" : "default" },
  });
};
if (!set || set === "series") {
  for (const count of member ? [Number(member)] : [1, 2, 3, 4, 5, 6, 7, 8])
    assert.equal(exercise(2, count).dataById.size, count * 2);
}
if (!set || set === "tones") {
  for (const tone of member ? [member] : model.barChartTones)
    assert.equal(exercise(2, 8, tone).data.series[0].tone, tone);
}
if (!set || set === "density") {
  const cases = {
    "5x8": [5, 8, 21],
    "5x2": [5, 2, 96],
    "14x8": [14, 8, 7],
    "23x3": [23, 3, 37 / 3],
    "2x8": [2, 8, 62.75],
    "5x3": [5, 3, 188 / 3],
  };
  for (const key of member ? [member] : Object.keys(cases)) {
    const [categories, count, width] = cases[key];
    assert.ok(
      Math.abs(
        model.barChartLayout(exercise(categories, count, "blue", true))
          .barWidth - width,
      ) < 0.005,
    );
  }
}

if (set === "layout-mode") {
  assert.ok(["default", "source"].includes(member));
  assert.equal(
    model.barChartLayout(exercise(5, 8, "blue", member === "source")).plotWidth,
    member === "source" ? 1212 : 1296,
  );
}
if (set === "placement") {
  assert.ok(["above", "below"].includes(member));
  execFileSync(
    process.execPath,
    [
      path.resolve("node_modules/@playwright/test/cli.js"),
      "test",
      "tools/playwright/bar-chart-source.spec.js",
      "--grep",
      "grouped inspection",
    ],
    { stdio: "inherit" },
  );
}
