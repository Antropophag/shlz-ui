import { expect, test } from "@playwright/test";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

const expectImagesLoaded = async (images) => {
  await images.evaluateAll((items) => {
    for (const image of items) image.loading = "eager";
  });
  await expect
    .poll(() =>
      images.evaluateAll((items) =>
        items.every((item) => item.complete && item.naturalWidth > 0),
      ),
    )
    .toBe(true);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
  await page.locator(".shlz-verification-harness").evaluate((details) => {
    details.open = true;
  });
  await page.locator("#fidelity").scrollIntoViewIfNeeded();
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { visibility: hidden !important; }",
  });
});

test("every fidelity unit uses an SVG-derived source reference", async ({
  page,
}) => {
  const units = page.locator(".shlz-fidelity-unit");
  // Seven primary migrated families own nested diagnostics in Implementation.
  await expect(units).toHaveCount(14);
  await expectImagesLoaded(
    units.locator(".shlz-reference img, .shlz-form-pair img"),
  );
  for (const unit of await units.all()) {
    await unit.scrollIntoViewIfNeeded();
    const images = unit.locator(".shlz-reference img, .shlz-form-pair img");
    expect(await images.count()).toBeGreaterThan(0);
    await expectImagesLoaded(images);
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
  const changedImages = page.locator(
    ".shlz-reference img, .shlz-form-pair img",
  );
  expect(
    await changedImages.evaluateAll((items) =>
      items.every(
        (item) => item.loading === "lazy" && item.decoding === "async",
      ),
    ),
  ).toBe(true);
  await expectImagesLoaded(images);
  expect(
    await images.evaluateAll((items) =>
      items.every((item) => item.clientWidth === item.naturalWidth),
    ),
  ).toBe(true);
});

test("source-critical matrices and geometry remain complete", async ({
  page,
}) => {
  await expect(page.locator("#fidelity-link .shlz-link")).toHaveCount(4);
  await expect(page.locator("#fidelity-avatar .shlz-avatar")).toHaveCount(8);
  await expect(page.locator("#fidelity-table .shlz-table__cell")).toHaveCount(
    6,
  );
  expect(
    await page
      .locator("#fidelity-avatar .shlz-avatar")
      .evaluateAll((items) =>
        items.map((item) => item.getBoundingClientRect().width),
      ),
  ).toEqual([24, 24, 32, 32, 40, 40, 64, 64]);
  expect(
    await page
      .locator("#fidelity-table tbody .shlz-table__cell")
      .evaluateAll((items) =>
        items.map((item) => item.getBoundingClientRect().height),
      ),
  ).toEqual([50, 50, 50, 50]);
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
  await expect(
    fixture.locator(".shlz-notification--danger .shlz-notification__icon"),
  ).toHaveCount(1);
  await expect(fixture.locator(".shlz-notification__action")).toHaveCount(8);
  const countdowns = fixture.locator(".shlz-notification__source-countdown");
  await expect(countdowns).toHaveCount(6);
  expect(
    await countdowns.evaluateAll((items) =>
      items.map((item) => ({
        number: item.dataset.snackbarNumber,
        label: item.querySelector(":scope > span").textContent,
        path: item.querySelector("path").getAttribute("d"),
        size: [item.offsetWidth, item.offsetHeight],
      })),
    ),
  ).toEqual(
    ["5", "4", "3", "2", "1", "0"].map((number) => ({
      number,
      label: number,
      path: expect.stringMatching(/^M.+Z$/),
      size: [40, 40],
    })),
  );
  await expect(
    fixture.locator(".shlz-notification__leading-progress"),
  ).toHaveCount(1);
});

test("filled multiselect preserves source trailing geometry under pressure", async ({
  page,
}) => {
  const field = page
    .locator("#fidelity-select .shlz-field--multiple")
    .filter({ has: page.locator(".shlz-field__count") })
    .first();
  const control = field.locator(".shlz-field__control");
  const count = field.locator(".shlz-field__count");
  const chevron = field.locator(
    ".shlz-field__indicator > .shlz-select__chevron",
  );
  await expect(field.locator(".shlz-field__chip-remove")).toHaveCount(2);
  await expect(control).toHaveCSS("overflow", "hidden");
  expect(
    await count.evaluate((node) => node.getBoundingClientRect().width),
  ).toBe(27);
  const geometry = await control.evaluate((node) => {
    const controlBox = node.getBoundingClientRect();
    const indicator = node.querySelector(".shlz-field__indicator");
    const countBox = indicator
      .querySelector(".shlz-field__count")
      .getBoundingClientRect();
    const iconBox = indicator
      .querySelector(":scope > .shlz-select__chevron")
      .getBoundingClientRect();
    return {
      rightInset: controlBox.right - iconBox.right,
      indicatorGap: iconBox.left - countBox.right,
      countCenterDelta: Math.abs(
        countBox.top +
          countBox.height / 2 -
          (controlBox.top + controlBox.height / 2),
      ),
      indicatorInside:
        countBox.left >= controlBox.left && iconBox.right <= controlBox.right,
    };
  });
  expect(geometry.rightInset).toBe(8);
  expect(geometry.indicatorGap).toBe(8);
  expect(geometry.countCenterDelta).toBeLessThanOrEqual(0.5);
  expect(geometry.indicatorInside).toBe(true);

  await field.evaluate((node) => {
    for (const chip of node.querySelectorAll(".shlz-field__chip"))
      chip.prepend("Extremely long selected value ");
  });
  await expect(count).toBeVisible();
  await expect(chevron).toBeVisible();
});

test("static overlay fidelity fixtures preserve source regions", async ({
  page,
}) => {
  const popover = page
    .locator("#fidelity-popover .shlz-static-popover")
    .first();
  await expect(popover).toHaveCSS("border-radius", "12px");
  expect(
    await popover.evaluate((node) => [node.offsetWidth, node.offsetHeight]),
  ).toEqual([236, 90]);

  const modal = page.locator(
    "#fidelity-modal .shlz-modal__surface--structured",
  );
  expect(
    await modal.evaluate((node) => [node.offsetWidth, node.offsetHeight]),
  ).toEqual([572, 196]);
  expect(
    await modal
      .locator(".shlz-modal__header")
      .evaluate((node) => node.offsetHeight),
  ).toBe(56);
  expect(
    await modal
      .locator(".shlz-modal__footer")
      .evaluate((node) => node.offsetHeight),
  ).toBe(60);

  const drawer = page.locator("#fidelity-drawer .shlz-drawer__surface");
  expect(
    await drawer.evaluate((node) => [node.offsetWidth, node.offsetHeight]),
  ).toEqual([420, 900]);
  expect(
    await drawer
      .locator(".shlz-drawer__header")
      .evaluate((node) => node.offsetHeight),
  ).toBe(64);
  expect(
    await drawer
      .locator(".shlz-drawer__footer")
      .evaluate((node) => node.offsetHeight),
  ).toBe(72);
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
    await expectStableShowcaseScreenshot(
      page,
      page.locator(`#fidelity-${component}`),
      `fidelity-${component}.png`,
    );
  });
}
