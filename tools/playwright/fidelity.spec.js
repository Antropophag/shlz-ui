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
  ).toHaveCount(12);
  await expect(
    page.locator("#fidelity-dropdown .shlz-dropdown__menu"),
  ).toHaveCount(10);
  await expect(
    page.locator("#fidelity-modal .shlz-modal__surface").first(),
  ).toBeVisible();
  await expect(
    page.locator("#fidelity-drawer .shlz-drawer__surface"),
  ).toBeVisible();
});

test("source references render at their intrinsic one-to-one scale", async ({
  page,
}) => {
  const images = page.locator(".shlz-reference img");
  expect(
    await images.evaluateAll((items) =>
      items.every((item) => item.clientWidth === item.naturalWidth),
    ),
  ).toBe(true);
});

test("source-critical matrices and geometry remain complete", async ({
  page,
}) => {
  await expect(
    page.locator("#fidelity-pagination .shlz-pagination-matrix > span"),
  ).toHaveCount(24);
  await expect(page.locator("#fidelity-tag .shlz-tag")).toHaveCount(4);
  await expect(
    page.locator("#fidelity-segment .shlz-segment__item"),
  ).toHaveCount(39);
  await expect(
    page.locator("#fidelity-modal .shlz-modal__surface"),
  ).toHaveCount(5);

  for (const selector of [
    "#fidelity-tooltip .shlz-tooltip",
    "#fidelity-popover .shlz-popover",
    "#fidelity-notification .shlz-notification",
  ]) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box.width)).toBe(
      selector.includes("tooltip")
        ? 100
        : selector.includes("popover")
          ? 236
          : 384,
    );
    expect(Math.round(box.height)).toBe(
      selector.includes("tooltip")
        ? 37
        : selector.includes("popover")
          ? 90
          : 58,
    );
  }
});

test("notification exposes source-confirmed visual states", async ({
  page,
}) => {
  const fixture = page.locator("#fidelity-notification");
  await expect(fixture.locator(".shlz-notification--danger")).toHaveCount(1);
  await expect(fixture.locator(".shlz-notification__action")).toHaveCount(8);
  await expect(
    fixture.locator(".shlz-notification__leading-progress"),
  ).toHaveCount(7);
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
