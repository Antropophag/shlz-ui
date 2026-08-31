import { expect } from "@playwright/test";

const ADDITIVE_SHOWCASE_SELECTOR =
  "[data-shlz-visual-addition], [data-shlz-dropdown-scrollable-fixture]";
const SUPPLEMENTAL_SHOWCASE_SELECTOR = "[data-shlz-consumer-supplement]";

export const hideDeveloperDocumentation = (page) =>
  page.evaluate(() => {
    for (const panel of document.querySelectorAll(
      ".shlz-developer-docs, [data-pagination-consumer]",
    )) {
      panel.hidden = true;
    }
  });

const hideShowcaseFixtures = async (page, selector) => {
  await page.evaluate((fixtureSelector) => {
    const additions = [...document.querySelectorAll(fixtureSelector)];
    const additionIds = new Set(additions.map(({ id }) => id).filter(Boolean));

    for (const addition of additions) {
      addition.hidden = true;
      addition.style.setProperty("display", "none", "important");
    }
    for (const link of document.querySelectorAll(
      ".shlz-docs-sidebar a[href^='#']",
    )) {
      if (additionIds.has(link.hash.slice(1))) link.hidden = true;
    }
  }, selector);
  await page.evaluate(() => document.fonts.ready);
};

export const stabilizeShowcaseLayout = (page) =>
  hideShowcaseFixtures(page, ADDITIVE_SHOWCASE_SELECTOR);

export const stabilizePreexistingShowcaseLayout = (page) =>
  hideShowcaseFixtures(page, SUPPLEMENTAL_SHOWCASE_SELECTOR);

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

export const expectStablePreexistingShowcaseScreenshot = async (
  page,
  locator,
  snapshot,
  options,
) => {
  await stabilizePreexistingShowcaseLayout(page);
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((element) => {
    const { requestAnimationFrame } = element.ownerDocument.defaultView;
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await expect(locator).toHaveScreenshot(snapshot, options);
};
