import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
]) {
  test(`showcase navigation fits ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/#input");
    await expect(page.locator("#input-demo")).toBeInViewport();
    await expect(
      page.locator('[data-shlz-docs-link][href="#input"]'),
    ).toHaveAttribute("aria-current", "location");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);

    await page.locator('[data-shlz-docs-link][href="#dropdown"]').click();
    await expect(page).toHaveURL(/#dropdown$/);
    await expect(page.locator("#dropdown-demo")).toBeInViewport();
  });
}

test("foundation and verification evidence use progressive disclosure", async ({
  page,
}) => {
  await page.goto("/#foundations");
  await expect(page.locator(".shlz-foundation-evidence")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".shlz-verification-harness")).not.toHaveAttribute(
    "open",
    "",
  );

  await page.locator('[data-shlz-docs-link][href="#typography"]').click();
  await expect(page.locator(".shlz-foundation-evidence")).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator("#typography")).toBeInViewport();
});

test("sidebar supports keyboard navigation", async ({ page }) => {
  await page.goto("/");
  const first = page.locator('[data-shlz-docs-link][href="#foundations"]');
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.locator('[data-shlz-docs-link][href="#colors"]'),
  ).toBeFocused();
});
