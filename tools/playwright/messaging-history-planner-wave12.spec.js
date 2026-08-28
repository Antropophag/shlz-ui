import { expect, test } from "@playwright/test";

test("Wave 12 higher-level composition roots remain absent", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator(
      "[data-shlz-messaging], [data-shlz-change-history], [data-shlz-planner], shlz-messages, shlz-change-history, shlz-planner",
    ),
  ).toHaveCount(0);
});
