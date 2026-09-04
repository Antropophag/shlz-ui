import assert from "node:assert/strict";
import test from "node:test";

import {
  barChartNeighbor,
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
        series: Array.from({ length: 5 }, (_, index) => ({
          ...data.series[0],
          id: `s${index}`,
        })),
      }),
    /one through four/i,
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
