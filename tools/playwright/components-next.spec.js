import { expect, test } from "@playwright/test";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("tooltip follows hover, focus, Escape and description semantics", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Tooltip top",
    exact: true,
  });
  const tooltip = page.locator("#tooltip-top");
  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-describedby", "tooltip-top");
  const boxes = await Promise.all([
    trigger.boundingBox(),
    tooltip.boundingBox(),
  ]);
  expect(boxes[1].y + boxes[1].height).toBeLessThanOrEqual(boxes[0].y);
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await page.mouse.move(0, 0);
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await page
    .getByRole("button", { name: "Tooltip bottom start", exact: true })
    .focus();
  await expect(tooltip).toBeHidden();
});

test("tooltip visual placements remain source-shaped", async ({ page }) => {
  await page.evaluate(() => {
    for (const controller of window.__shlzTooltipControllers) controller.open();
  });
  await expectStableShowcaseScreenshot(
    page,
    page.locator("#tooltip-demo"),
    "tooltip-placements.png",
  );
});

test("tabs use automatic activation and roving tabindex", async ({ page }) => {
  const tablist = page.getByRole("tablist", { name: "Разделы" });
  const first = tablist.getByRole("tab", { name: "Первый" });
  const second = tablist.getByRole("tab", { name: "Второй" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Второй" })).toBeVisible();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "Первый" })).toBeVisible();
});

for (const [id, snapshot] of [
  ["tabs-demo", "tabs.png"],
  ["pagination-demo", "pagination.png"],
  ["tag-demo", "tag.png"],
  ["segment-demo", "segment.png"],
  ["notification-demo", "notification.png"],
]) {
  test(`${id} representative visual`, async ({ page }) => {
    await expectStableShowcaseScreenshot(
      page,
      page.locator(`#${id}`),
      snapshot,
    );
  });
}

test("CSS-only components retain native semantics", async ({ page }) => {
  await expect(page.locator("#link-demo a.shlz-link")).toHaveCount(3);
  const unavailableLink = page.locator("#link-demo .shlz-link--disabled");
  await expect(unavailableLink).not.toHaveAttribute("href");
  await expect(unavailableLink).not.toHaveAttribute("aria-disabled");
  await expect(page.locator("#avatar-demo .shlz-avatar")).toHaveCount(12);
  await expect(page.locator("#table-demo table")).toHaveCount(1);
  await expect(
    page.locator("#table-demo th[aria-sort='ascending']"),
  ).toHaveCount(1);
  const pagination = page.getByRole("navigation", {
    name: "Пагинация примера",
  });
  await expect(pagination.getByRole("link", { name: "1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    pagination.locator('[aria-disabled="true"]'),
  ).not.toHaveAttribute("href");

  const remove = page.getByRole("button", { name: "Удалить Анну Петрову" });
  await remove.focus();
  await expect(remove).toBeFocused();

  const month = page.getByRole("radio", { name: "Месяц" });
  await month.check();
  await expect(month).toBeChecked();
  const notificationMatrices = page.locator(
    "#notification-demo [data-notification-visual-matrix]",
  );
  await expect(notificationMatrices.locator("[role='status']")).toHaveCount(1);
  await expect(notificationMatrices.locator("[role='alert']")).toHaveCount(1);
});
