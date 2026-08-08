import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#fidelity").scrollIntoViewIfNeeded();
});

test("every fidelity unit uses an SVG-derived source reference", async ({
  page,
}) => {
  const units = page.locator(".shlz-fidelity-unit");
  await expect(units).toHaveCount(17);
  for (const unit of await units.all()) {
    const images = unit.locator(".shlz-reference img");
    expect(await images.count()).toBeGreaterThan(0);
    expect(
      await images.evaluateAll((items) =>
        items.every((item) => item.complete && item.naturalWidth > 0),
      ),
    ).toBe(true);
  }
});

test("closed-by-default primitives expose static review states", async ({
  page,
}) => {
  await expect(
    page.locator("#fidelity-tooltip .shlz-static-tooltip"),
  ).toHaveCount(8);
  await expect(
    page.locator("#fidelity-popover .shlz-static-popover"),
  ).toHaveCount(6);
  await expect(
    page.locator("#fidelity-dropdown .shlz-dropdown__menu"),
  ).toHaveCount(2);
  await expect(
    page.locator("#fidelity-modal .shlz-modal__surface"),
  ).toBeVisible();
  await expect(
    page.locator("#fidelity-drawer .shlz-drawer__surface"),
  ).toBeVisible();
});

test("notification exposes source-confirmed visual states", async ({
  page,
}) => {
  const fixture = page.locator("#fidelity-notification");
  await expect(fixture.locator(".shlz-notification--danger")).toHaveCount(1);
  await expect(fixture.locator(".shlz-notification__action")).toHaveCount(1);
  await expect(fixture.locator(".shlz-notification__countdown")).toHaveCount(7);
  await expect(
    fixture.locator(".shlz-notification__countdown--loading"),
  ).toHaveCount(1);
});

for (const component of [
  "tooltip",
  "dropdown",
  "popover",
  "notification",
  "modal",
  "drawer",
]) {
  test(`fidelity review: ${component}`, async ({ page }) => {
    await expect(page.locator(`#fidelity-${component}`)).toHaveScreenshot(
      `fidelity-${component}.png`,
    );
  });
}
