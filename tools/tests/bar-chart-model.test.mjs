import assert from "node:assert/strict";
import test from "node:test";

import {
  barChartNeighbor,
  barChartLayout,
  barChartTones,
  createBarChartModel,
  setBarChartSeriesVisibility,
  validateBarChartData,
} from "../../packages/behaviors/dist/bar-chart-model.js";

const data = {
  categories: [
    { id: "a", label: "Повтор" },
    { id: "b", label: "Повтор" },
  ],
  series: [
    {
      id: "first",
      label: "Series",
      values: [
        { categoryId: "a", value: 0, displayValue: "0" },
        { categoryId: "b", value: 10, displayValue: "10" },
      ],
    },
    {
      id: "second",
      label: "Series",
      values: [
        { categoryId: "a", value: 4, displayValue: "4" },
        { categoryId: "b", value: 8, displayValue: "8" },
      ],
    },
  ],
};

test("stable ids distinguish repeated labels and retain zero values", () => {
  const model = createBarChartModel(data);
  assert.equal(model.dataById.size, 4);
  assert.equal(model.dataById.get("a::first").value, 0);
  assert.equal(model.maximum, 10);
});

test("invalid rectangular and unsupported series data is rejected", () => {
  assert.throws(
    () => validateBarChartData({ categories: [], series: [] }),
    /category/i,
  );
  assert.throws(
    () =>
      validateBarChartData({
        ...data,
        categories: [...data.categories, data.categories[0]],
      }),
    /duplicate/i,
  );
  assert.throws(
    () =>
      validateBarChartData({
        ...data,
        series: [{ ...data.series[0], values: data.series[0].values.slice(1) }],
      }),
    /missing/i,
  );
  assert.throws(
    () =>
      validateBarChartData({
        ...data,
        series: [
          {
            ...data.series[0],
            values: data.series[0].values.map((datum) => ({
              ...datum,
              value: -1,
            })),
          },
        ],
      }),
    /non-negative/i,
  );
  assert.throws(
    () =>
      validateBarChartData({
        ...data,
        series: Array.from({ length: 9 }, (_, index) => ({
          ...data.series[0],
          id: `s${index}`,
        })),
      }),
    /one through eight/i,
  );
});

test("visibility projection rescales and protects the final series", () => {
  const model = createBarChartModel(data);
  const hidden = setBarChartSeriesVisibility(model, "first", false);
  assert.deepEqual(hidden.visibleSeriesIds, ["second"]);
  assert.equal(hidden.maximum, 8);
  assert.deepEqual(
    setBarChartSeriesVisibility(hidden, "second", false).visibleSeriesIds,
    ["second"],
  );
  assert.deepEqual(
    setBarChartSeriesVisibility(hidden, "first", true).visibleSeriesIds,
    ["first", "second"],
  );
});

test("focus navigation follows category and visible-series axes without wrapping", () => {
  const model = createBarChartModel(data);
  assert.equal(barChartNeighbor(model, "a::first", "ArrowRight"), "b::first");
  assert.equal(barChartNeighbor(model, "a::first", "ArrowDown"), "a::second");
  assert.equal(barChartNeighbor(model, "a::first", "ArrowLeft"), "a::first");
  assert.equal(barChartNeighbor(model, "b::second", "End"), "b::second");
  assert.equal(barChartNeighbor(model, "b::second", "Home"), "a::second");
});

test("all source tones and eight series are accepted independently of ids", () => {
  for (const tone of barChartTones) {
    const series = Array.from({ length: 8 }, (_, i) => ({
      ...data.series[0],
      id: `s${i}`,
      tone,
    }));
    assert.equal(createBarChartModel({ ...data, series }).dataById.size, 16);
  }
  assert.throws(
    () =>
      createBarChartModel({
        ...data,
        series: [{ ...data.series[0], tone: "unknown" }],
      }),
    /tone/,
  );
});

test("source density reproduces all six populated geometry families", () => {
  for (const [categories, series, expected] of [
    [5, 8, 21],
    [5, 2, 96],
    [14, 8, 7],
    [23, 3, 37 / 3],
    [2, 8, 62.75],
    [5, 3, 188 / 3],
  ]) {
    const categoryData = Array.from({ length: categories }, (_, i) => ({
      id: `c${i}`,
      label: `C${i}`,
    }));
    const model = createBarChartModel({
      categories: categoryData,
      series: Array.from({ length: series }, (_, i) => ({
        id: `s${i}`,
        label: `S${i}`,
        values: categoryData.map((c) => ({
          categoryId: c.id,
          value: 10,
          displayValue: "10",
        })),
      })),
      presentation: { density: "source", scaleMaximum: 100 },
    });
    const layout = barChartLayout(model);
    assert.ok(Math.abs(layout.barWidth - expected) < 0.005);
    assert.equal(layout.plotWidth, 1212);
    assert.equal(layout.plotHeight, 300);
    assert.equal(layout.maximum, 100);
  }
});

test("invalid presentation cannot change quantitative meaning", () => {
  for (const presentation of [
    { scaleMaximum: 0 },
    { scaleMaximum: 5 },
    { scaleMaximum: Infinity },
    { density: "invented" },
    { tooltipPlacement: "left" },
  ])
    assert.throws(() => createBarChartModel({ ...data, presentation }));
});
