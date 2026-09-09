import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1100 });
  await page.goto("/#dashboard-source-gallery");
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { visibility: hidden; }",
  });
  await page.evaluate(() => document.fonts.ready);
});

test("six density families match source geometry and numeric axes", async ({
  page,
}) => {
  for (const [id, count, width, ticks, labels] of [
    ["five-eight", 40, 21, 5, 11],
    ["five-two", 10, 96, 5, 11],
    ["fourteen-eight", 112, 7, 14, 9],
    ["twenty-three-three", 69, 37 / 3, 23, 9],
    ["two-eight", 16, 62.75, 2, 8],
    ["five-three", 15, 188 / 3, 5, 11],
  ]) {
    const chart = page.locator(`#bar-chart-density-${id}`);
    const bars = chart.locator(".shlz-bar-chart__bar");
    await expect(bars).toHaveCount(count);
    expect(Number(await bars.first().getAttribute("width"))).toBeCloseTo(
      width,
      2,
    );
    await expect(chart.locator(".shlz-bar-chart__tick")).toHaveCount(ticks);
    await expect(chart.locator(".shlz-bar-chart__axis-label")).toHaveCount(
      labels,
    );
    expect(
      await chart.locator(".shlz-bar-chart__axis-label").allTextContents(),
    ).toEqual(expect.arrayContaining(["10", "8", "6", "4", "2", "0"]));
    await expect(bars.first()).toHaveAttribute(
      "clip-path",
      /^url\(#shlz-chart-/,
    );
  }
  await expect(page.locator(".shlz-chart-palette figure")).toHaveCount(9);
  await expect(page.locator(".shlz-chart-palette")).toHaveScreenshot(
    "dashboard-palette.png",
  );
  await expect(page.locator("#bar-chart-density-five-eight")).toHaveScreenshot(
    "dashboard-eight-series.png",
  );
});

test("grouped inspection preserves source palette including muted exceptions", async ({
  page,
}) => {
  const chart = page.locator("#bar-chart-density-five-eight");
  const bars = chart.locator(".shlz-bar-chart__bar");
  await bars.first().hover();
  await expect(chart.locator(".shlz-bar-chart__tooltip-row")).toHaveCount(8);
  await expect(bars.nth(7)).toHaveCSS("opacity", "1");
  await expect(bars.nth(8)).toHaveCSS("opacity", "0.15");
  await expect(
    chart
      .locator(".shlz-bar-chart__bar--muted.shlz-bar-chart__tone-orange")
      .first(),
  ).toHaveCSS("fill", "rgb(222, 117, 61)");
  await expect(chart.locator(".shlz-bar-chart__guide")).toHaveAttribute(
    "visibility",
    "visible",
  );
  await expect(chart.locator(".shlz-bar-chart__active-period")).toHaveAttribute(
    "visibility",
    "visible",
  );
  await bars.first().focus();
  await expect(chart.getByRole("tooltip")).toBeVisible();
  await expect(chart).toHaveScreenshot("dashboard-period-above.png");
  await bars.first().focus();
  await page.keyboard.press("Escape");
  await expect(chart.getByRole("tooltip")).toBeHidden();
  await page.keyboard.press("ArrowRight");
  await expect(chart.getByRole("tooltip")).toBeVisible();
  await expect(bars.nth(8)).toBeFocused();
  const below = page.locator("#bar-chart-tooltip-below");
  await below.locator(".shlz-bar-chart__bar").first().focus();
  await expect(
    below
      .locator(".shlz-bar-chart__tone-gray.shlz-bar-chart__bar--muted")
      .first(),
  ).toHaveCSS("fill", "rgb(245, 245, 245)");
  await expect(
    below
      .locator(".shlz-bar-chart__tone-gray.shlz-bar-chart__bar--muted")
      .first(),
  ).toHaveCSS("opacity", "1");
  await expect(below.getByRole("tooltip")).toHaveAttribute(
    "data-placement",
    "below",
  );
  await expect(below).toHaveScreenshot("dashboard-period-below.png");
});

test("invalid updates and replacement preserve mounted interactions", async ({
  page,
}) => {
  const chart = page.locator("#bar-chart-reporting-consumer");
  const result = await page.evaluate(async () => {
    const controller = globalThis.__shlzBarChartControllers.find(
      ({ root }) => root.id === "bar-chart-reporting-consumer",
    );
    const before = controller.root.innerHTML;
    let failures = 0;
    const invalid = {
      categories: [{ id: "a", label: "A" }],
      series: [
        {
          id: "s",
          label: "S",
          tone: "bad",
          values: [{ categoryId: "a", value: 1, displayValue: "1" }],
        },
      ],
    };
    try {
      controller.update(invalid);
    } catch {
      failures++;
    }
    try {
      new controller.constructor(controller.root, invalid);
    } catch {
      failures++;
    }
    return { failures, unchanged: before === controller.root.innerHTML };
  });
  expect(result).toEqual({ failures: 2, unchanged: true });
  await chart.getByRole("button", { name: /Новые/ }).click();
  await expect(chart.locator(".shlz-bar-chart__bar")).toHaveCount(10);
});

test("dense narrow inspection and below tooltip remain contained and accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 420, height: 900 });
  const chart = page.locator("#bar-chart-tooltip-below");
  await chart.locator(".shlz-bar-chart__bar").first().focus();
  await page.keyboard.press("End");
  const tooltip = chart.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const parent = await chart.boundingBox();
  const box = await tooltip.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(parent.x);
  expect(box.x + box.width).toBeLessThanOrEqual(parent.x + parent.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(parent.y + parent.height + 1);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBe(0);
  const violations = (
    await new AxeBuilder({ page }).include("#bar-chart-tooltip-below").analyze()
  ).violations;
  expect(violations).toEqual([]);
  await expect(chart).toHaveScreenshot("dashboard-narrow-below.png");
});
