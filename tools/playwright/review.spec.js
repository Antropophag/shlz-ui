import { expect, test } from "@playwright/test";
import {
  expectStableShowcaseScreenshot,
  stabilizeShowcaseLayout,
} from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { display: none !important; }",
  });
});

for (const [name, selector] of [
  ["avatar", "#avatar-demo"],
  ["table", "#table-demo"],
  ["person-tag", "#tag-demo > section:nth-of-type(2)"],
  ["notification", "#notification-demo"],
]) {
  test(`production showcase review: ${name}`, async ({ page }) => {
    await expectStableShowcaseScreenshot(
      page,
      page.locator(selector),
      `review-${name}.png`,
    );
  });
}

test("production showcase review: select", async ({ page }) => {
  await expectStableShowcaseScreenshot(
    page,
    page.locator("#select-demo > [data-select-production-fixtures]"),
    "review-select.png",
  );
});

test("production showcase review: dropdown", async ({ page }) => {
  await stabilizeShowcaseLayout(page);
  await page
    .locator('#dropdown-demo [aria-controls="showcase-actions"]')
    .click();
  await expect(page.locator("#dropdown-demo")).toHaveScreenshot(
    "review-dropdown.png",
  );
});
