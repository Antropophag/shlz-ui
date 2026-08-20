import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const productionField = (page, label) =>
  page
    .locator("#select-demo [data-select-production-fixtures] .shlz-field")
    .filter({ hasText: label });

test("closed native Select matches the source-backed size and paint contract", async ({
  page,
}) => {
  const placeholder = productionField(page, "Статус заявки").first();
  const hover = productionField(page, "Наведение");
  const focus = productionField(page, "Фокус");
  const disabled = productionField(page, "Недоступно");
  const medium = productionField(page, "Компактный размер");

  await expect(placeholder).toHaveCSS("width", "250px");
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "height",
    "40px",
  );
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "border-radius",
    "20px",
  );
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 245)",
  );
  await expect(placeholder.locator(".shlz-field__label")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(placeholder.locator(".shlz-field__label")).toHaveCSS(
    "line-height",
    "15px",
  );
  await expect(placeholder.locator("select")).toHaveCSS("font-size", "14px");
  await expect(placeholder.locator("select")).toHaveCSS("line-height", "18px");
  await expect(placeholder.locator("select")).toHaveCSS(
    "color",
    "rgba(11, 22, 35, 0.25)",
  );

  await expect(hover.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(238, 240, 244)",
  );
  await expect(focus.locator(".shlz-field__control")).toHaveCSS(
    "border-color",
    "rgb(37, 61, 152)",
  );
  await expect(focus.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(238, 240, 244)",
  );
  await expect(disabled.locator(".shlz-field__control")).toHaveCSS(
    "opacity",
    "0.5",
  );
  await expect(medium.locator(".shlz-field__control")).toHaveCSS(
    "height",
    "32px",
  );
  await expect(medium.locator(".shlz-field__control")).toHaveCSS(
    "border-radius",
    "16px",
  );

  const trailingGeometry = await placeholder.evaluate((field) => {
    const control = field.querySelector(".shlz-field__control");
    const indicator = field.querySelector(".shlz-field__indicator");
    const controlBox = control.getBoundingClientRect();
    const indicatorBox = indicator.getBoundingClientRect();
    return {
      rightInset: Math.round(controlBox.right - indicatorBox.right),
      indicatorWidth: Math.round(indicatorBox.width),
    };
  });
  expect(trailingGeometry).toEqual({ rightInset: 8, indicatorWidth: 20 });
});

test("production fixture is functional while unsupported families stay collapsed", async ({
  page,
}) => {
  const production = page.locator(
    "#select-demo [data-select-production-fixtures]",
  );
  const sourceDiagnostics = page.locator(
    "#select-demo [data-select-source-fixtures]",
  );
  const select = production.locator("select").first();
  await select.evaluate((element) => {
    window.__selectFixtureChanges = [];
    element.addEventListener("change", () => {
      window.__selectFixtureChanges.push(element.value);
    });
  });

  await expect(sourceDiagnostics).not.toHaveAttribute("open", "");
  await expect(sourceDiagnostics.locator(".shlz-component-grid")).toBeHidden();
  await select.selectOption("example");
  expect(await page.evaluate(() => window.__selectFixtureChanges)).toEqual([
    "example",
  ]);
  await expect(select).toHaveValue("example");
  expect(await select.evaluate((element) => element.checkValidity())).toBe(
    true,
  );
});

test("closed Select remains contained on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 240, height: 700 });
  const field = productionField(page, "Статус заявки").first();
  const containment = await field.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      viewport: document.documentElement.clientWidth,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });
  expect(containment.left).toBeGreaterThanOrEqual(0);
  expect(containment.right).toBeLessThanOrEqual(containment.viewport);
  expect(containment.scrollWidth).toBe(containment.clientWidth);
});
