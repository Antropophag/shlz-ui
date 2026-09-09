import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1100 });
  await page.goto("/#dashboard-source-gallery");
  await page.locator(".shlz-docs-content").evaluate((content) => {
    content.previousElementSibling.style.visibility = "hidden";
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
    ).toEqual(
      expect.arrayContaining(
        (ticks === 14 || ticks === 23
          ? [100, 80, 60, 40, 20, 0]
          : [10, 8, 6, 4, 2, 0]
        ).map(String),
      ),
    );
    await expect(bars.first()).toHaveAttribute(
      "clip-path",
      /^url\(#shlz-chart-/,
    );
  }
  await expect(page.locator(".shlz-chart-palette figure")).toHaveCount(9);
  const expectedPaint = [
    "rgb(37, 61, 152)",
    "rgb(87, 150, 92)",
    "rgb(212, 126, 46)",
    "rgb(36, 91, 153)",
    "rgb(129, 49, 167)",
    "rgb(65, 145, 179)",
    "rgb(169, 66, 167)",
    "rgb(37, 152, 62)",
    "rgb(147, 156, 165)",
  ];
  for (let index = 0; index < expectedPaint.length; index++) {
    const marks = page
      .locator(".shlz-chart-palette figure")
      .nth(index)
      .locator("svg > rect");
    await expect(marks).toHaveCount(2);
    await expect(marks.first()).toHaveCSS("fill", expectedPaint[index]);
    await expect(marks.last()).toHaveCSS(
      "fill",
      index === 2
        ? "rgb(222, 117, 61)"
        : index === 8
          ? "rgb(245, 245, 245)"
          : expectedPaint[index],
    );
    await expect(marks.last()).toHaveCSS("opacity", index === 8 ? "1" : "0.15");
  }

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
  await expect(bars.first()).toHaveAttribute(
    "aria-describedby",
    await chart.getByRole("tooltip").getAttribute("id"),
  );
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

test("finite large values retain finite scale labels", async ({ page }) => {
  await page.evaluate(() => {
    const controller = globalThis.__shlzBarChartControllers.find(
      ({ root }) => root.id === "bar-chart-reporting-consumer",
    );
    controller.update({
      categories: [{ id: "large", label: "Large" }],
      series: [
        {
          id: "large",
          label: "Large",
          values: [
            { categoryId: "large", value: 1e308, displayValue: "1e308" },
          ],
        },
      ],
    });
  });
  const labels = await page
    .locator("#bar-chart-reporting-consumer .shlz-bar-chart__axis-label")
    .allTextContents();
  expect(labels[0]).toBe("1e+308");
  expect(labels.join(" ")).not.toMatch(/Infinity|NaN/);
});

test("consumer tick labels and RTL arrow use the declared presentation", async ({
  page,
}) => {
  await page.evaluate(() => {
    const controller = globalThis.__shlzBarChartControllers.find(
      ({ root }) => root.id === "bar-chart-reporting-consumer",
    );
    controller.root.dir = "rtl";
    controller.update({
      categories: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      series: [
        {
          id: "s",
          label: "S",
          values: [
            { categoryId: "a", value: 5, displayValue: "5,0" },
            { categoryId: "b", value: 10, displayValue: "10,0" },
          ],
        },
      ],
      presentation: {
        scaleMaximum: 10,
        axisLabels: ["10,0", "8,0", "6,0", "4,0", "2,0", "0,0"],
        tooltipPlacement: "below",
      },
    });
  });
  const chart = page.locator("#bar-chart-reporting-consumer");
  expect(
    (
      await chart.locator(".shlz-bar-chart__axis-label").allTextContents()
    ).slice(0, 6),
  ).toEqual(["10,0", "8,0", "6,0", "4,0", "2,0", "0,0"]);
  await chart.locator(".shlz-bar-chart__bar").first().focus();
  const offsets = await chart
    .getByRole("tooltip")
    .evaluate((node) => ({
      actual: Number.parseFloat(getComputedStyle(node, "::after").left),
      expected: Number.parseFloat(
        node.style.getPropertyValue("--shlz-chart-arrow-x"),
      ),
    }));
  expect(offsets.actual).toBeCloseTo(offsets.expected, 1);
});
