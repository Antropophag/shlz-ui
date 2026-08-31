import { expect, test } from "@playwright/test";
import { expectStablePreexistingShowcaseScreenshot } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/#date-picker-demo");
});

test("authoritative Date Picker size and state matrix has component-focused evidence", async ({
  page,
}) => {
  const matrix = page.locator(".shlz-date-picker-showcase__matrix");
  const variants = matrix.locator("[data-date-picker-source-variant]");
  await expect(variants).toHaveCount(20);

  for (const variant of await variants.all()) {
    const field = variant.locator(".shlz-date-field").first();
    await expect(field).toHaveCSS("width", "250px");
    const key = await variant.getAttribute("data-date-picker-source-variant");
    const expectedHeight = key?.startsWith("large-") ? 63 : 55;
    expect((await field.boundingBox())?.height).toBe(expectedHeight);
    await expectStablePreexistingShowcaseScreenshot(
      page,
      field,
      `date-picker-${key}.png`,
    );
  }
});

test("Calendar one/two-month responsive surfaces have component-focused evidence", async ({
  page,
}) => {
  const wide = page.locator('[data-date-picker-scenario="two-month"]');
  await wide
    .locator(".shlz-date-field")
    .first()
    .getByRole("button", { name: /Открыть календарь/ })
    .click();
  const wideSurface = wide.locator(".shlz-calendar");
  await expect(wideSurface).toHaveCSS("width", "560px");
  await expect(
    wideSurface.locator(".shlz-calendar__month:visible"),
  ).toHaveCount(2);
  await expect(wideSurface).toHaveScreenshot("calendar-two-month-wide.png");

  const narrow = page.locator('[data-date-picker-scenario="narrow"]');
  await narrow
    .locator(".shlz-date-field")
    .first()
    .getByRole("button", { name: /Открыть календарь/ })
    .click();
  const narrowSurface = narrow.locator(".shlz-calendar");
  await expect(narrowSurface).toHaveCSS("width", "280px");
  await expect(
    narrowSurface.locator(".shlz-calendar__month:visible"),
  ).toHaveCount(1);
  await expectStablePreexistingShowcaseScreenshot(
    page,
    narrowSurface,
    "calendar-one-month-narrow.png",
  );
});
