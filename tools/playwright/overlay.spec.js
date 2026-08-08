import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function openModal(page) {
  const trigger = page.getByRole("button", { name: "Открыть Modal" });
  const dialog = page.locator("#showcase-modal");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect
    .poll(() => dialog.evaluate((element) => element.matches(":modal")))
    .toBe(true);
  return { trigger, dialog };
}

async function openDrawer(page) {
  const trigger = page.getByRole("button", { name: "Открыть Drawer" });
  const dialog = page.locator("#showcase-drawer");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

test("modal uses native focus containment, Escape and return focus", async ({
  page,
}) => {
  const { trigger, dialog } = await openModal(page);
  await expect(page.locator("#modal-autofocus")).toBeFocused();

  const focusDidNotReachBackground = async () =>
    page.evaluate(() => {
      const modal = document.querySelector("#showcase-modal");
      const active = document.activeElement;
      return active === document.body || modal.contains(active);
    });
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    expect(await focusDidNotReachBackground()).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await focusDidNotReachBackground()).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("modal supports explicit close, opt-in backdrop and native dialog form", async ({
  page,
}) => {
  let opened = await openModal(page);
  await opened.dialog.getByRole("button", { name: "Сохранить" }).click();
  await expect(opened.dialog).toBeHidden();
  await expect(opened.dialog).toHaveJSProperty("returnValue", "save");

  opened = await openModal(page);
  const surface = opened.dialog.locator(".shlz-modal__surface");
  const box = await surface.boundingBox();
  await page.mouse.click(box.x - 12, box.y + 10);
  await expect(opened.dialog).toBeHidden();

  const confirmTrigger = page.getByRole("button", { name: "Подтверждение" });
  await confirmTrigger.click();
  const confirm = page.locator("#showcase-confirm");
  await confirm.getByRole("button", { name: "Подтвердить" }).click();
  await expect(confirm).toBeHidden();
  await expect(confirm).toHaveJSProperty("returnValue", "confirm");
  await expect(confirmTrigger).toBeFocused();
});

test("non-dismissible modal backdrop blocks background interaction", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Подтверждение" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog = page.locator("#showcase-confirm");
  let backgroundClicks = 0;
  await page.exposeFunction("recordBackgroundClick", () => {
    backgroundClicks += 1;
  });
  await page.evaluate(() => {
    document
      .querySelector('[data-shlz-modal-trigger="showcase-modal"]')
      .addEventListener("click", window.recordBackgroundClick);
  });
  const background = page.getByRole("button", { name: "Открыть Modal" });
  const backgroundBox = await background.boundingBox();
  await page.mouse.click(
    backgroundBox.x + backgroundBox.width / 2,
    backgroundBox.y + backgroundBox.height / 2,
  );
  await expect(dialog).toBeVisible();
  expect(backgroundClicks).toBe(0);
});

test("modal body scrolls while header and footer remain fixed", async ({
  page,
}) => {
  const { dialog } = await openModal(page);
  const body = dialog.locator(".shlz-modal__body");
  const header = dialog.locator(".shlz-modal__header");
  const footer = dialog.locator(".shlz-modal__footer");
  const before = {
    header: await header.boundingBox(),
    footer: await footer.boundingBox(),
  };
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect((await header.boundingBox()).y).toBeCloseTo(before.header.y, 0);
  expect((await footer.boundingBox()).y).toBeCloseTo(before.footer.y, 0);
});

test("destroy removes modal trigger behavior", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Открыть Modal" });
  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.__shlzModalControllers[0].destroy());
  await trigger.click();
  await expect(page.locator("#showcase-modal")).toBeHidden();
});

test("drawer is a right-side modal with native focus and scrolling", async ({
  page,
}) => {
  const { trigger, dialog } = await openDrawer(page);
  await expect(dialog.locator("input")).toBeFocused();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x + box.width).toBeCloseTo(viewport.width, 0);
  expect(box.width).toBe(420);

  const body = dialog.locator("[data-drawer-scroll]");
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("drawer close, backdrop, narrow viewport and destroy remain native", async ({
  page,
}) => {
  let opened = await openDrawer(page);
  await opened.dialog.getByRole("button", { name: "Применить" }).click();
  await expect(opened.dialog).toBeHidden();

  opened = await openDrawer(page);
  const desktopSurfaceBox = await opened.dialog
    .locator(".shlz-drawer__surface")
    .boundingBox();
  await page.mouse.click(desktopSurfaceBox.x - 12, desktopSurfaceBox.y + 10);
  await expect(opened.dialog).toBeHidden();

  await page.setViewportSize({ width: 390, height: 700 });
  opened = await openDrawer(page);
  expect((await opened.dialog.boundingBox()).width).toBe(390);
  await page.keyboard.press("Escape");
  await expect(opened.dialog).toBeHidden();

  await page.evaluate(() => window.__shlzDrawerControllers[0].destroy());
  await opened.trigger.click();
  await expect(opened.dialog).toBeHidden();
});

for (const [name, selector] of [
  ["Dropdown внутри Modal", "#modal-menu"],
  ["Tooltip внутри Modal", "#modal-tooltip"],
  ["Popover внутри Modal", "#modal-popover"],
]) {
  test(`${name} remains visible in the dialog top layer and owns first Escape`, async ({
    page,
  }) => {
    const { dialog } = await openModal(page);
    const trigger = dialog.getByRole("button", { name });
    if (name.startsWith("Tooltip")) await trigger.focus();
    else await trigger.click();
    const floating = page.locator(selector);
    await expect(floating).toBeVisible();
    const floatingBox = await floating.boundingBox();
    const viewport = page.viewportSize();
    expect(floatingBox.x).toBeGreaterThanOrEqual(8);
    expect(floatingBox.x + floatingBox.width).toBeLessThanOrEqual(
      viewport.width - 8,
    );
    await page.keyboard.press("Escape");
    await expect(floating).toBeHidden();
    await expect(dialog).toBeVisible();
  });
}

test("modal, long content, drawer and nested floating visuals", async ({
  page,
}) => {
  let opened = await openModal(page);
  await expect(page).toHaveScreenshot("modal.png");
  await opened.dialog.locator(".shlz-modal__body").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page).toHaveScreenshot("modal-long-content.png");
  await opened.dialog
    .getByRole("button", { name: "Popover внутри Modal" })
    .click();
  await expect(page).toHaveScreenshot("modal-nested-popover.png");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  opened = await openDrawer(page);
  await expect(page).toHaveScreenshot("drawer.png");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 700 });
  await openDrawer(page);
  await expect(page).toHaveScreenshot("drawer-narrow.png");
});

test("plain HTML consumes modal and drawer via standalone CSS and direct ESM", async ({
  page,
}) => {
  await page.goto(
    "/@fs/home/antropophag/code/shlz-ui/tools/fixtures/plain-html.html",
  );
  const modalTrigger = page.getByRole("button", { name: "Открыть Modal" });
  await modalTrigger.click();
  await expect(page.locator("#fixture-modal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modalTrigger).toBeFocused();

  const drawerTrigger = page.getByRole("button", { name: "Открыть Drawer" });
  await drawerTrigger.click();
  await expect(page.locator("#fixture-drawer")).toBeVisible();
});
