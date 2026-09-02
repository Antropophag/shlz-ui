import { expect, test } from "@playwright/test";
import { stabilizeShowcaseLayout } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

test("dropdown keyboard navigation skips disabled items and restores focus", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Действия" });
  const menu = page.locator("#showcase-actions");

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Создать" })).toBeFocused();

  await page.keyboard.press("End");
  await expect(
    page.getByRole("menuitem", {
      name: "Длинный пункт меню для проверки ширины",
    }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Создать" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("dropdown preserves native disabled and has a visual snapshot", async ({
  page,
}) => {
  await stabilizeShowcaseLayout(page);
  const trigger = page.getByRole("button", { name: "Действия" });
  await trigger.click();
  await expect(
    page.getByRole("menuitem", { name: "Недоступно" }),
  ).toBeDisabled();
  const box = await page.locator("#dropdown-demo").boundingBox();
  expect(box).not.toBeNull();
  await expect(page).toHaveScreenshot("dropdown-open.png", {
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: 420,
    },
  });
});
