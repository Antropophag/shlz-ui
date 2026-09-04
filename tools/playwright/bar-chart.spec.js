import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  inspectComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/bar-chart.json",
    import.meta.url,
  ),
);
const executedMaterialStates = new Set();
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedMaterialStates.add(`${component}:${state}`);
};
const expectMaterialStates = (component) => {
  expect(
    manifest.interactionEvidence.materialStates.every((state) =>
      executedMaterialStates.has(`${component}:${state}`),
    ),
  ).toBe(true);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/#reporting-dashboard-demo");
});

test("classifies occurrences and exposes one shared accessible model", async ({
  page,
}) => {
  const showcaseInventory = await inspectComponentOccurrences(page, manifest);
  expect(showcaseInventory.unclassifiedLegacy).toEqual([]);
  const chart = page.locator("#bar-chart-showcase-source");
  await expect(chart.locator(".shlz-bar-chart__bar")).toHaveCount(15);
  await expect(chart.getByRole("button", { name: /Новые/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await verifyMaterialState("bar-chart", "table-expanded", async () => {
    await chart.getByText("Показать данные диаграммы").click();
  });
  const table = chart.getByRole("table", {
    name: "Обращения по неделям и статусам",
  });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(4);
  await expect(table.getByRole("rowheader")).toHaveCount(5);
  await expect(
    table.getByRole("cell", { name: "0", exact: true }),
  ).toBeVisible();
  const sourcePaint = await chart.evaluate((root) => {
    const bar = root.querySelector(".shlz-bar-chart__series-1");
    const grid = root.querySelector(".shlz-bar-chart__grid-line");
    const tooltip = root.querySelector(".shlz-bar-chart__tooltip");
    return {
      bar: globalThis.getComputedStyle(bar).fill,
      grid: globalThis.getComputedStyle(grid).stroke,
      radius: globalThis.getComputedStyle(tooltip).borderRadius,
    };
  });
  expect(sourcePaint).toEqual({
    bar: "rgb(37, 61, 152)",
    grid: "rgb(209, 216, 223)",
    radius: "12px",
  });
  const results = await new AxeBuilder({ page })
    .include("#bar-chart-showcase-source")
    .analyze();
  expect(results.violations).toEqual([]);
  await page.goto(fixtureUrl("plain-html.html"));
  const plainInventory = await inspectComponentOccurrences(page, manifest);
  expect(plainInventory.unclassifiedLegacy).toEqual([]);
  expect(
    [...showcaseInventory.occurrences, ...plainInventory.occurrences].sort(),
  ).toEqual(manifest.occurrences.map(({ id }) => id).sort());
});

test("hover and roving keyboard focus expose equivalent datum details", async ({
  page,
}) => {
  const chart = page.locator("#bar-chart-showcase-source");
  const bars = chart.locator(".shlz-bar-chart__bar");
  const first = bars.first();
  await verifyMaterialState("bar-chart", "pointer-hover", async () => {
    await first.hover();
    await expect(chart.getByRole("tooltip")).toContainText("1–7 сентября");
    await expect(bars.nth(1)).toHaveCSS("opacity", "0.15");
  });
  await expect(chart.getByRole("tooltip")).toContainText("Новые: 4");
  await verifyMaterialState("bar-chart", "keyboard-focus", async () => {
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(bars.nth(3)).toBeFocused();
  });
  await expect(chart.getByRole("tooltip")).toContainText("8–14 сентября");
  await page.keyboard.press("ArrowDown");
  await expect(bars.nth(4)).toBeFocused();
  await expect(chart.getByRole("tooltip")).toContainText("В работе: 5");
  await page.keyboard.press("End");
  await expect(bars.nth(13)).toBeFocused();
  await bars.first().hover();
  await expect(chart.getByRole("tooltip")).toContainText("В работе: 7");
  await chart.getByRole("button", { name: /Новые/ }).focus();
  await expect(chart.getByRole("tooltip")).toBeHidden();
  await expect(chart.locator('[tabindex="0"]')).toHaveCount(1);
});

test("legend visibility updates plot, table and notification but protects last series", async ({
  page,
}) => {
  const chart = page.locator("#bar-chart-showcase-source");
  await chart.getByText("Показать данные диаграммы").click();
  const events = await chart.evaluate((root) => {
    const values = [];
    root.addEventListener("shlz:bar-chart-visibility-change", (event) =>
      values.push(event.detail.visibleSeriesIds),
    );
    root.dataset.eventSink = "ready";
    globalThis.__barChartEvents = values;
    return values;
  });
  expect(events).toEqual([]);
  await verifyMaterialState("bar-chart", "series-hidden", async () => {
    await chart.getByRole("button", { name: /Новые/ }).click();
    await expect(chart.locator(".shlz-bar-chart__bar")).toHaveCount(10);
  });
  await expect(chart.getByRole("columnheader")).toHaveCount(3);
  await chart.getByRole("button", { name: /В работе/ }).click();
  const final = chart.getByRole("button", { name: /Выполнено/ });
  await expect(final).toBeDisabled();
  await expect(chart.locator(".shlz-bar-chart__bar")).toHaveCount(5);
  expect(await page.evaluate(() => globalThis.__barChartEvents)).toEqual([
    ["in-work", "completed"],
    ["completed"],
  ]);
});

test("consumer period owns prepared replacement data", async ({ page }) => {
  const consumer = page.locator("#bar-chart-reporting-consumer");
  await consumer.getByText("Показать данные диаграммы").click();
  await expect(
    consumer.getByRole("cell", { name: "4", exact: true }).first(),
  ).toBeVisible();
  await page.getByLabel("Квартал").check();
  await expect(
    consumer.getByRole("cell", { name: "12", exact: true }).first(),
  ).toBeVisible();
});

test("destroy removes generated chart and listeners", async ({ page }) => {
  const chart = page.locator("#bar-chart-reporting-consumer");
  await page.evaluate(() => {
    const controller = globalThis.__shlzBarChartControllers.find(
      ({ root }) => root.id === "bar-chart-reporting-consumer",
    );
    controller.destroy();
  });
  await expect(chart).not.toHaveAttribute("data-shlz-bar-chart-ready", "true");
  await expect(chart).toBeEmpty();
});

test("narrow plot contains overflow and focus reveal locally", async ({
  page,
}) => {
  await page.setViewportSize({ width: 420, height: 900 });
  const chart = page.locator("#bar-chart-showcase-source");
  const viewport = chart.getByRole("region", {
    name: "Сгруппированная диаграмма обращений",
  });
  const dimensions = await viewport.evaluate((node) => ({
    client: node.clientWidth,
    scroll: node.scrollWidth,
    body:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  await verifyMaterialState("bar-chart", "narrow-overflow", async () => {
    expect(dimensions.scroll).toBeGreaterThan(dimensions.client);
    expect(dimensions.body).toBe(0);
  });
  await chart.locator(".shlz-bar-chart__bar").first().focus();
  await page.keyboard.press("End");
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  expectMaterialStates("bar-chart");
});
