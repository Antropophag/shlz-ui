import { expect, test } from "@playwright/test";

const consumer = (page) => page.locator("[data-date-picker-consumer]");

test.beforeEach(async ({ page }) => {
  await page.goto("/#date-picker-demo");
});

test("application consumer submits manual input through native FormData", async ({
  page,
}) => {
  const app = consumer(page);
  const input = app.getByRole("textbox", {
    name: "Дата поставки для фильтра",
  });
  await input.fill("05.09.2026");
  await input.press("Enter");
  await app.getByRole("button", { name: "Применить дату" }).click();
  await expect(app.locator("[data-date-picker-consumer-result]")).toHaveText(
    "Дата поставки: 2026-09-05",
  );
});

test("application consumer submits a calendar selection through the public controller", async ({
  page,
}) => {
  const app = consumer(page);
  await app.scrollIntoViewIfNeeded();
  await app
    .getByRole("button", {
      name: "Открыть календарь для поля «Дата поставки для фильтра»",
    })
    .click();
  await app.getByRole("button", { name: /20 августа 2026/ }).click();
  await app.getByRole("button", { name: "Применить дату" }).click();
  await expect(app.locator("[data-date-picker-consumer-result]")).toHaveText(
    "Дата поставки: 2026-08-20",
  );
});
