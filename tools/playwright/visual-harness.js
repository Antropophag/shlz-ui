import { expect } from "@playwright/test";

const ADDITIVE_SHOWCASE_SELECTOR =
  "[data-shlz-visual-addition], [data-shlz-dropdown-scrollable-fixture]";

export const stabilizeShowcaseLayout = async (page) => {
  await page.evaluate((selector) => {
    const additions = [...document.querySelectorAll(selector)];
    const additionIds = new Set(additions.map(({ id }) => id).filter(Boolean));

    for (const addition of additions) addition.hidden = true;
    for (const link of document.querySelectorAll(
      ".shlz-docs-sidebar a[href^='#']",
    )) {
      if (additionIds.has(link.hash.slice(1))) link.hidden = true;
    }
  }, ADDITIVE_SHOWCASE_SELECTOR);
  await page.evaluate(() => document.fonts.ready);
};

export const expectStableShowcaseScreenshot = async (
  page,
  locator,
  snapshot,
  options,
) => {
  await stabilizeShowcaseLayout(page);
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((element) => {
    const { requestAnimationFrame } = element.ownerDocument.defaultView;
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await expect(locator).toHaveScreenshot(snapshot, options);
};
