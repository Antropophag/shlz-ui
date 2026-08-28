import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";

test.beforeEach(async ({ page }) => {
  await page.goto(fixtureUrl("date-picker.html"));
});

test("single picker synchronizes input/calendar, positions in viewport, commits, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const picker = page.locator("[data-single-picker]");
  const trigger = picker.getByRole("button", {
    name: "Открыть календарь для поля «Дата поездки»",
  });
  await trigger.click();
  const surface = picker.locator("[data-shlz-popover]");
  await expect(surface).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    surface.getByRole("button", { name: /12 августа 2026/ }),
  ).toBeFocused();
  await picker.evaluate((root) => {
    root.dataset.pickerChangeCount = "0";
    root.addEventListener("shlz:date-picker-change", () => {
      root.dataset.pickerChangeCount = String(
        Number(root.dataset.pickerChangeCount) + 1,
      );
    });
  });
  const box = await surface.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(352);

  await surface.getByRole("button", { name: /20 августа 2026/ }).click();
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(
    picker.getByRole("textbox", { name: "Дата поездки" }),
  ).toHaveValue("20.08.2026");
  await expect(picker.locator('input[name="travelDate"]')).toHaveValue(
    "2026-08-20",
  );
  await expect(picker).toHaveAttribute("data-picker-change-count", "1");

  const input = picker.getByRole("textbox", { name: "Дата поездки" });
  await input.fill("05.09.2026");
  await input.press("Enter");
  await trigger.click();
  await expect(surface.getByRole("heading", { level: 2 })).toContainText(
    /сентябрь 2026/i,
  );
  await expect(
    surface.getByRole("button", { name: "5 сентября 2026 г.", exact: true }),
  ).toBeFocused();
});

test("range stays provisional until its second endpoint and dismissal preserves committed values", async ({
  page,
}) => {
  const picker = page.locator("[data-range-picker]");
  const trigger = picker.getByRole("button", {
    name: "Открыть календарь для поля «Начало периода»",
  });
  const surface = picker.locator("[data-shlz-popover]");
  await trigger.click();
  await surface.getByRole("button", { name: /18 августа 2026/ }).click();
  await expect(surface).toBeVisible();
  await expect(
    surface
      .getByRole("button", { name: /18 августа 2026.*начало диапазона/ })
      .locator(".."),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Вне календаря" }).click();
  await expect(surface).toBeHidden();
  await expect(picker.locator('input[name="periodStart"]')).toHaveValue(
    "2026-08-12",
  );
  await expect(picker.locator('input[name="periodEnd"]')).toHaveValue(
    "2026-08-15",
  );

  await trigger.click();
  await surface.getByRole("button", { name: /18 августа 2026/ }).click();
  await surface.getByRole("button", { name: /10 августа 2026/ }).click();
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(picker.locator('input[name="periodStart"]')).toHaveValue(
    "2026-08-10",
  );
  await expect(picker.locator('input[name="periodEnd"]')).toHaveValue(
    "2026-08-18",
  );
});

test("Escape, disable-while-open, and reset-while-open restore committed state", async ({
  page,
}) => {
  const picker = page.locator("[data-range-picker]");
  const trigger = picker.getByRole("button", {
    name: "Открыть календарь для поля «Начало периода»",
  });
  const surface = picker.locator("[data-shlz-popover]");
  await trigger.click();
  await surface.getByRole("button", { name: /18 августа 2026/ }).click();
  await page.keyboard.press("Escape");
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await surface.getByRole("button", { name: /18 августа 2026/ }).click();
  await page.evaluate(() => window.__rangeDatePicker.setDisabled(true));
  await expect(surface).toBeHidden();
  await expect(trigger).toBeDisabled();
  await page.evaluate(() => window.__rangeDatePicker.setDisabled(false));

  await trigger.click();
  await surface.getByRole("button", { name: /18 августа 2026/ }).click();
  await page.getByRole("button", { name: "Сбросить диапазон" }).click();
  await expect(surface).toBeHidden();
  await expect(picker.locator('input[name="periodStart"]')).toHaveValue(
    "2026-08-12",
  );
  await expect(picker.locator('input[name="periodEnd"]')).toHaveValue(
    "2026-08-15",
  );
});

test("dynamic constraints report a committed-value mismatch without replacement", async ({
  page,
}) => {
  const picker = page.locator("[data-single-picker]");
  await page.evaluate(() => {
    const root = document.querySelector("[data-single-picker]");
    root.addEventListener("shlz:calendar-constraint-mismatch", (event) => {
      root.dataset.constraintMismatchEvent = JSON.stringify(event.detail);
    });
    window.__singleDatePicker.setConstraints({ max: "2026-08-10" });
  });

  await expect(picker.locator(".shlz-calendar")).toHaveAttribute(
    "data-constraint-mismatch",
    "true",
  );
  await expect(picker).toHaveAttribute(
    "data-constraint-mismatch-event",
    JSON.stringify({
      mode: "single",
      value: "2026-08-12",
      mismatch: true,
    }),
  );
  await expect(picker.locator('input[name="travelDate"]')).toHaveValue(
    "2026-08-12",
  );
});

test("reversed manual range endpoints commit as an ordered synchronized range", async ({
  page,
}) => {
  const picker = page.locator("[data-range-picker]");
  const end = picker.getByRole("textbox", { name: "Конец периода" });
  await end.fill("10.08.2026");
  await end.press("Enter");

  await expect(
    picker.getByRole("textbox", { name: "Начало периода" }),
  ).toHaveValue("10.08.2026");
  await expect(end).toHaveValue("12.08.2026");
  await expect(picker.locator('input[name="periodStart"]')).toHaveValue(
    "2026-08-10",
  );
  await expect(picker.locator('input[name="periodEnd"]')).toHaveValue(
    "2026-08-12",
  );
});
