import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("every executable Showcase Select uses the reusable contract", async ({
  page,
}) => {
  await expect(
    page.locator(
      "#select-demo [data-select-production-fixtures] [data-shlz-select]",
    ),
  ).toHaveCount(6);
  await expect(
    page.locator("#workspace-filter-drawer [data-shlz-select]"),
  ).toHaveCount(1);
  await expect(
    page.locator("#typography-compatibility [data-shlz-select]"),
  ).toHaveCount(1);
  await expect(
    page.locator(
      "#select-demo [data-select-production-fixtures] select, #workspace-filter-drawer select, #typography-compatibility select",
    ),
  ).toHaveCount(0);
  const interactiveNativeSelects = await page
    .locator("select")
    .evaluateAll(
      (selects) =>
        selects.filter((select) => !select.closest("[inert]")).length,
    );
  expect(interactiveNativeSelects).toBe(0);
});

const productionField = (page, label) =>
  page
    .locator("#select-demo [data-select-production-fixtures] .shlz-field")
    .filter({ hasText: label });

test("Select trigger and chevron match the source-backed size and paint contract", async ({
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
  await expect(placeholder.locator(".shlz-select__trigger")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(placeholder.locator(".shlz-select__trigger")).toHaveCSS(
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
    const indicator = field.querySelector(".shlz-select__chevron");
    const controlBox = control.getBoundingClientRect();
    const indicatorBox = indicator.getBoundingClientRect();
    return {
      rightInset: Math.round(controlBox.right - indicatorBox.right),
      indicatorWidth: Math.round(indicatorBox.width),
    };
  });
  expect(trailingGeometry).toEqual({ rightInset: 8, indicatorWidth: 24 });
});

test("opened Select uses the SHLZ surface and emits one value change", async ({
  page,
}) => {
  const production = page.locator(
    "#select-demo [data-select-production-fixtures]",
  );
  const sourceDiagnostics = page.locator(
    "#select-demo [data-select-source-fixtures]",
  );
  const root = production.locator("[data-shlz-select]").first();
  const trigger = root.locator(".shlz-select__trigger");
  const input = root.locator('input[type="hidden"]');
  await input.evaluate((element) => {
    window.__selectFixtureChanges = [];
    element.addEventListener("change", () => {
      window.__selectFixtureChanges.push(element.value);
    });
  });

  await expect(sourceDiagnostics).not.toHaveAttribute("open", "");
  await expect(sourceDiagnostics.locator(".shlz-component-grid")).toBeHidden();
  await page.evaluate(() => {
    window.__shlzEnhanceSelects();
    window.__shlzEnhanceSelects();
  });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(root.locator(".shlz-select__listbox")).toBeVisible();
  await expect(root.locator(".shlz-select__chevron")).toHaveCSS(
    "transform",
    "matrix(-1, 0, 0, -1, 0, 0)",
  );
  await root.locator('[role="option"][data-value="В работе"]').click();
  expect(await page.evaluate(() => window.__selectFixtureChanges)).toEqual([
    "В работе",
  ]);
  await expect(input).toHaveValue("В работе");
  await expect(trigger).toContainText("В работе");
  await expect(trigger).toBeFocused();
  await expect(root.locator(".shlz-select__listbox")).toBeHidden();
});

test("Select keyboard lifecycle opens, navigates, selects and restores focus", async ({
  page,
}) => {
  const root = page.locator("#select-demo [data-shlz-select]").first();
  const trigger = root.locator(".shlz-select__trigger");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(root.locator('[role="option"]').last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.locator('input[type="hidden"]')).toHaveValue("Новая");
  await expect(trigger).toBeFocused();
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
