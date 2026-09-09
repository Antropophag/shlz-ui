// Deliberately retain the pre-extension four-series ceiling for the symmetric oracle.
export * from "../../../packages/behaviors/dist/bar-chart-model.js";
import { createBarChartModel as current } from "../../../packages/behaviors/dist/bar-chart-model.js";
export function createBarChartModel(data) {
  if (data.series.length > 4) throw new RangeError("Old four-series ceiling");
  return current(data);
}
