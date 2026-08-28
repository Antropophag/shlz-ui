import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";

test.beforeEach(async ({ page }) => {
  await page.goto(fixtureUrl("date-field.html"));
});

test("Date Field separates localized text from stable ISO form value", async ({
  page,
}) => {
  const field = page.getByRole("textbox", { name: "Дата поставки" });
  await expect(field).toHaveValue("28.08.2026");
  await expect(
    page.locator('input[type="hidden"][name="deliveryDate"]'),
  ).toHaveValue("2026-08-28");

  const data = await page
    .locator("[data-date-field-form]")
    .evaluate((form) => Object.fromEntries(new FormData(form)));
  expect(data).toEqual({ deliveryDate: "2026-08-28" });
});

test("invalid or constrained manual text is preserved without committing", async ({
  page,
}) => {
  const field = page.getByRole("textbox", { name: "Дата поставки" });
  const hidden = page.locator('input[type="hidden"][name="deliveryDate"]');
  const output = page.locator("[data-date-field-events]");

  await field.fill("31.02.2026");
  await field.press("Enter");
  await expect(field).toHaveValue("31.02.2026");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription(
    /Введите дату поставки.*Введите доступную дату/,
  );
  await expect(hidden).toHaveValue("2026-08-28");
  await expect(output).toHaveText("");

  await field.fill("01.09.2026");
  await field.press("Enter");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(hidden).toHaveValue("2026-08-28");
});

test("valid manual input commits once and emits the stable value", async ({
  page,
}) => {
  const field = page.getByRole("textbox", { name: "Дата поставки" });
  await field.fill("05.09.2026");
  await field.press("Enter");
  await expect(field).toHaveAttribute("aria-invalid", "false");
  await expect(
    page.locator('input[type="hidden"][name="deliveryDate"]'),
  ).toHaveValue("2026-09-05");
  await expect(page.locator("[data-date-field-events]")).toHaveText(
    JSON.stringify({ value: "2026-09-05" }),
  );
});

test("disabled and read-only states preserve native semantics and block the trigger", async ({
  page,
}) => {
  const disabled = page.getByRole("textbox", { name: "Отключённая дата" });
  await expect(disabled).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Открыть календарь для поля «Отключённая дата»",
    }),
  ).toBeDisabled();
  await expect(
    page.locator('input[type="hidden"][name="disabledDate"]'),
  ).toBeDisabled();

  const readOnly = page.getByRole("textbox", {
    name: "Дата только для чтения",
  });
  await expect(readOnly).toHaveAttribute("readonly", "");
  await expect(readOnly).not.toBeEditable();
  await expect(
    page.getByRole("button", {
      name: "Открыть календарь для поля «Дата только для чтения»",
    }),
  ).toBeDisabled();
  await expect(
    page.locator('input[type="hidden"][name="readonlyDate"]'),
  ).toBeEnabled();
});

test("native form reset restores visible value, committed value, and validity", async ({
  page,
}) => {
  const field = page.getByRole("textbox", { name: "Дата поставки" });
  await field.fill("05.09.2026");
  await field.press("Enter");
  await field.fill("bad");
  await field.press("Enter");
  await page.getByRole("button", { name: "Сбросить" }).click();
  await expect(field).toHaveValue("28.08.2026");
  await expect(field).toHaveAttribute("aria-invalid", "false");
  await expect(
    page.locator('input[type="hidden"][name="deliveryDate"]'),
  ).toHaveValue("2026-08-28");
});
