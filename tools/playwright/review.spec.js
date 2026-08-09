import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { display: none !important; }",
  });
});

for (const [name, selector] of [
  ["select", "#select-demo"],
  ["avatar", "#avatar-demo"],
  ["table", "#table-demo"],
  ["person-tag", "#tag-demo section:nth-of-type(2)"],
  ["notification", "#notification-demo"],
]) {
  test(`production showcase review: ${name}`, async ({ page }) => {
    await expect(page.locator(selector)).toHaveScreenshot(`review-${name}.png`);
  });
}

test("production showcase review: dropdown", async ({ page }) => {
  await page
    .locator('#dropdown-demo [aria-controls="showcase-actions"]')
    .click();
  await expect(page.locator("#dropdown-demo")).toHaveScreenshot(
    "review-dropdown.png",
  );
});
