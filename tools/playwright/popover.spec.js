import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function open(page, name, id) {
  const trigger = page.getByRole("button", { name, exact: true });
  const popover = page.locator(`#${id}`);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  return { trigger, popover };
}

async function expectSide(trigger, popover, side) {
  const triggerBox = await trigger.boundingBox();
  const popoverBox = await popover.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(popoverBox).not.toBeNull();

  if (side === "bottom")
    expect(popoverBox.y).toBeGreaterThanOrEqual(
      triggerBox.y + triggerBox.height + 7,
    );
  if (side === "top")
    expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(
      triggerBox.y - 7,
    );
  if (side === "left")
    expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(
      triggerBox.x - 7,
    );
  if (side === "right")
    expect(popoverBox.x).toBeGreaterThanOrEqual(
      triggerBox.x + triggerBox.width + 7,
    );
}

async function screenshotPair(page, trigger, popover, name) {
  const triggerBox = await trigger.boundingBox();
  const popoverBox = await popover.boundingBox();
  const padding = 24;
  const x = Math.max(0, Math.min(triggerBox.x, popoverBox.x) - padding);
  const y = Math.max(0, Math.min(triggerBox.y, popoverBox.y) - padding);
  const right = Math.min(
    await page.evaluate(() => window.innerWidth),
    Math.max(triggerBox.x + triggerBox.width, popoverBox.x + popoverBox.width) +
      padding,
  );
  const bottom = Math.min(
    await page.evaluate(() => window.innerHeight),
    Math.max(
      triggerBox.y + triggerBox.height,
      popoverBox.y + popoverBox.height,
    ) + padding,
  );
  await expect(page).toHaveScreenshot(name, {
    clip: { x, y, width: right - x, height: bottom - y },
  });
}

test("opens, synchronizes state, dismisses and restores focus", async ({
  page,
}) => {
  const { trigger, popover } = await open(page, "Bottom", "popover-bottom");
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("heading", { name: "Popover" }).click();
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("interactive content stays in native keyboard order", async ({ page }) => {
  const { trigger, popover } = await open(
    page,
    "Interactive content",
    "popover-interactive",
  );
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#popover-value")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(popover.getByRole("button", { name: "Готово" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("positions all supported sides and keeps edge case in viewport", async ({
  page,
}) => {
  for (const [name, id, side] of [
    ["Bottom", "popover-bottom", "bottom"],
    ["Top", "popover-top", "top"],
    ["Left", "popover-left", "left"],
    ["Right", "popover-right", "right"],
  ]) {
    const { trigger, popover } = await open(page, name, id);
    await expect(popover).toHaveAttribute("data-placement", side);
    await expectSide(trigger, popover, side);
    await trigger.click();
  }

  const { popover } = await open(page, "Около края", "popover-edge");
  const box = await popover.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 8);
  await expect(popover).toHaveAttribute("data-placement", /^(left|top|bottom)/);
});

test("repositions on scroll and resize", async ({ page }) => {
  const { trigger, popover } = await open(
    page,
    "Scroll anchor",
    "popover-scroll",
  );
  const beforeTrigger = await trigger.boundingBox();
  const beforePopover = await popover.boundingBox();
  await page.locator("[data-popover-scroll]").evaluate((element) => {
    element.scrollTop = 40;
  });
  await expect
    .poll(async () => (await trigger.boundingBox()).y)
    .toBeLessThan(beforeTrigger.y - 30);
  await expect
    .poll(async () => (await popover.boundingBox()).y)
    .toBeLessThan(beforePopover.y - 30);
  await expectSide(trigger, popover, "bottom");

  await page.setViewportSize({ width: 760, height: 800 });
  await expect
    .poll(async () => (await popover.boundingBox()).x)
    .toBeGreaterThanOrEqual(8);
  const resizedBox = await popover.boundingBox();
  expect(resizedBox.x + resizedBox.width).toBeLessThanOrEqual(752);
});

test("destroy removes listeners and active positioning", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Bottom", exact: true });
  const popover = page.locator("#popover-bottom");
  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.__shlzPopoverControllers[0].destroy());
  await trigger.click();
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("bottom and top placements have visual baselines", async ({ page }) => {
  let pair = await open(page, "Bottom", "popover-bottom");
  await screenshotPair(page, pair.trigger, pair.popover, "popover-bottom.png");
  await pair.trigger.click();
  pair = await open(page, "Top", "popover-top");
  await screenshotPair(page, pair.trigger, pair.popover, "popover-top.png");
});

test("viewport edge has a visual baseline", async ({ page }) => {
  const { trigger, popover } = await open(page, "Около края", "popover-edge");
  await screenshotPair(page, trigger, popover, "popover-edge.png");
});

test("plain HTML consumes standalone CSS and bundled ESM behavior", async ({
  page,
}) => {
  await page.goto(
    "/@fs/home/antropophag/code/shlz-ui/tools/fixtures/plain-html.html",
  );
  const trigger = page.getByRole("button", { name: "Подробнее" });
  await trigger.click();
  await expect(page.locator("#fixture-popover")).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});
