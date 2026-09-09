export const barChartTones = [
  "blue",
  "green",
  "orange",
  "deep-blue",
  "violet",
  "turquoise",
  "pink",
  "bright-green",
  "gray",
] as const;
export type BarChartTone = (typeof barChartTones)[number];

export interface BarChartPresentation {
  density?: "default" | "source";
  scaleMaximum?: number;
  tooltipPlacement?: "above" | "below";
}

export interface BarChartCategory {
  id: string;
  label: string;
}

export interface BarChartValue {
  categoryId: string;
  value: number;
  displayValue: string;
}

export interface BarChartSeries {
  id: string;
  label: string;
  values: BarChartValue[];
  tone?: BarChartTone;
}

export interface BarChartData {
  categories: BarChartCategory[];
  series: BarChartSeries[];
  presentation?: BarChartPresentation;
}

export interface BarChartDatum extends BarChartValue {
  id: string;
  categoryLabel: string;
  seriesId: string;
  seriesLabel: string;
  categoryIndex: number;
  seriesIndex: number;
}

export interface BarChartModel {
  data: BarChartData;
  dataById: ReadonlyMap<string, BarChartDatum>;
  visibleSeriesIds: string[];
  maximum: number;
}

const key = (categoryId: string, seriesId: string) =>
  `${encodeURIComponent(categoryId)}::${encodeURIComponent(seriesId)}`;

function requireIdentity(
  value: unknown,
  kind: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "")
    throw new TypeError(`Bar Chart ${kind} must be a non-empty string.`);
}

export function validateBarChartData(data: BarChartData): BarChartData {
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.series))
    throw new TypeError("Bar Chart requires categories and series arrays.");
  if (data.categories.length === 0)
    throw new RangeError("Bar Chart requires at least one category.");
  if (data.series.length < 1 || data.series.length > 8)
    throw new RangeError("Bar Chart supports one through eight series.");

  const presentation = data.presentation;
  if (presentation) {
    if (
      presentation.density !== undefined &&
      !["default", "source"].includes(presentation.density)
    )
      throw new TypeError("Unknown Bar Chart density.");
    if (
      presentation.tooltipPlacement !== undefined &&
      !["above", "below"].includes(presentation.tooltipPlacement)
    )
      throw new TypeError("Unknown Bar Chart tooltip placement.");
    if (
      presentation.scaleMaximum !== undefined &&
      (!Number.isFinite(presentation.scaleMaximum) ||
        presentation.scaleMaximum <= 0)
    )
      throw new RangeError(
        "Bar Chart scale maximum must be finite and positive.",
      );
  }
  const categoryIds = new Set<string>();
  for (const category of data.categories) {
    requireIdentity(category.id, "category id");
    requireIdentity(category.label, "category label");
    if (categoryIds.has(category.id))
      throw new TypeError(`Duplicate Bar Chart category id: ${category.id}.`);
    categoryIds.add(category.id);
  }

  const seriesIds = new Set<string>();
  for (const series of data.series) {
    if (series.tone !== undefined && !barChartTones.includes(series.tone))
      throw new TypeError("Unknown Bar Chart tone.");
    requireIdentity(series.id, "series id");
    requireIdentity(series.label, "series label");
    if (seriesIds.has(series.id))
      throw new TypeError(`Duplicate Bar Chart series id: ${series.id}.`);
    seriesIds.add(series.id);
    if (!Array.isArray(series.values))
      throw new TypeError(`Bar Chart series ${series.id} requires values.`);
    const values = new Map<string, BarChartValue>();
    for (const datum of series.values) {
      requireIdentity(datum.categoryId, "datum category id");
      requireIdentity(datum.displayValue, "display value");
      if (!categoryIds.has(datum.categoryId))
        throw new TypeError(
          `Unknown Bar Chart category id: ${datum.categoryId}.`,
        );
      if (values.has(datum.categoryId))
        throw new TypeError(
          `Duplicate Bar Chart datum: ${datum.categoryId}/${series.id}.`,
        );
      if (!Number.isFinite(datum.value) || datum.value < 0)
        throw new RangeError(
          "Bar Chart values must be finite and non-negative.",
        );
      if (
        presentation?.scaleMaximum !== undefined &&
        datum.value > presentation.scaleMaximum
      )
        throw new RangeError("Bar Chart value exceeds scale maximum.");
      values.set(datum.categoryId, datum);
    }
    for (const category of data.categories)
      if (!values.has(category.id))
        throw new TypeError(
          `Missing Bar Chart datum: ${category.id}/${series.id}.`,
        );
  }
  return data;
}

export function createBarChartModel(
  data: BarChartData,
  requestedVisibleSeriesIds?: Iterable<string>,
): BarChartModel {
  validateBarChartData(data);
  const requested = requestedVisibleSeriesIds
    ? new Set(requestedVisibleSeriesIds)
    : null;
  let visibleSeriesIds = data.series
    .map(({ id }) => id)
    .filter((id) => !requested || requested.has(id));
  if (visibleSeriesIds.length === 0)
    visibleSeriesIds = data.series.map(({ id }) => id);
  const visible = new Set(visibleSeriesIds);
  const dataById = new Map<string, BarChartDatum>();
  let maximum = 0;
  data.series.forEach((series, seriesIndex) => {
    const values = new Map(
      series.values.map((datum) => [datum.categoryId, datum]),
    );
    data.categories.forEach((category, categoryIndex) => {
      const datum = values.get(category.id)!;
      const id = key(category.id, series.id);
      dataById.set(id, {
        ...datum,
        id,
        categoryLabel: category.label,
        seriesId: series.id,
        seriesLabel: series.label,
        categoryIndex,
        seriesIndex,
      });
      if (visible.has(series.id)) maximum = Math.max(maximum, datum.value);
    });
  });
  return { data, dataById, visibleSeriesIds, maximum };
}

export function setBarChartSeriesVisibility(
  model: BarChartModel,
  seriesId: string,
  visible: boolean,
): BarChartModel {
  if (!model.data.series.some(({ id }) => id === seriesId))
    throw new TypeError(`Unknown Bar Chart series id: ${seriesId}.`);
  const ids = new Set(model.visibleSeriesIds);
  if (visible) ids.add(seriesId);
  else if (ids.size > 1) ids.delete(seriesId);
  return createBarChartModel(model.data, ids);
}

export function barChartNeighbor(
  model: BarChartModel,
  datumId: string,
  keyName:
    "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End",
): string {
  const current = model.dataById.get(datumId);
  if (!current) return firstBarChartDatumId(model);
  const visibleSeries = model.data.series.filter(({ id }) =>
    model.visibleSeriesIds.includes(id),
  );
  const visibleIndex = visibleSeries.findIndex(
    ({ id }) => id === current.seriesId,
  );
  let categoryIndex = current.categoryIndex;
  let seriesIndex = visibleIndex;
  if (keyName === "ArrowLeft") categoryIndex -= 1;
  if (keyName === "ArrowRight") categoryIndex += 1;
  if (keyName === "ArrowUp") seriesIndex -= 1;
  if (keyName === "ArrowDown") seriesIndex += 1;
  if (keyName === "Home") categoryIndex = 0;
  if (keyName === "End") categoryIndex = model.data.categories.length - 1;
  if (
    categoryIndex < 0 ||
    categoryIndex >= model.data.categories.length ||
    seriesIndex < 0 ||
    seriesIndex >= visibleSeries.length
  )
    return datumId;
  return key(
    model.data.categories[categoryIndex].id,
    visibleSeries[seriesIndex].id,
  );
}

export function firstBarChartDatumId(model: BarChartModel): string {
  return key(model.data.categories[0].id, model.visibleSeriesIds[0]);
}

/** Source-specific group paint widths; never global spacing tokens. */
export function barChartLayout(model: BarChartModel) {
  const count = model.data.categories.length;
  const seriesCount = model.visibleSeriesIds.length;
  const source = model.data.presentation?.density === "source";
  const width = source
    ? 1276
    : Math.max(640, count * Math.max(88, seriesCount * 30 + 32));
  const plotWidth = width - 64;
  const plotHeight = 300;
  const groupWidth = plotWidth / count;
  const sourceGroups: Record<number, number> = {
    2: 530,
    5: 196,
    14: 84,
    23: 45,
  };
  const available = source
    ? Math.min(groupWidth - 2, sourceGroups[count] ?? groupWidth - 24)
    : groupWidth - 24;
  const gap = 4;
  const barWidth = source
    ? Math.max(1, (available - gap * (seriesCount - 1)) / seriesCount)
    : Math.min(96, Math.max(12, available / seriesCount - gap));
  const maximum =
    model.data.presentation?.scaleMaximum ?? (model.maximum || 10);
  return {
    width,
    height: 368,
    plotWidth,
    plotHeight,
    groupWidth,
    barWidth,
    gap,
    maximum,
    sparse: source && (count === 14 || count === 23),
  };
}
