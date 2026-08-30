import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const components = ["status", "badge", "tag", "person-tag", "avatar"];
const manifests = Object.fromEntries(
  await Promise.all(
    components.map(async (component) => [
      component,
      await readComponentAuditManifest(
        new globalThis.URL(
          `../../docs/component-audits/${component}.json`,
          import.meta.url,
        ),
      ),
    ]),
  ),
);

test.beforeEach(async ({ page }) => page.goto("/"));

test("all Wave 4 executable and live roots are semantically classified", async ({
  page,
}) => {
  expect(components).toHaveLength(5);
  for (const component of components) {
    const manifest = manifests[component];
    await expectClassifiedComponentOccurrences(page, {
      ...manifest,
      occurrences: manifest.occurrences.filter(
        ({ id }) => !id.endsWith("-plain-html"),
      ),
    });
  }
});

test("Status and Badge remain static text/count primitives", async ({
  page,
}) => {
  for (const selector of [
    "[data-component-audit-id^='status-']",
    "[data-component-audit-id^='badge-']",
  ]) {
    const roots = page.locator(selector);
    for (let index = 0; index < (await roots.count()); index++) {
      const root = roots.nth(index);
      await expect(root).not.toHaveAttribute("role", "status");
      await expect(root).not.toHaveAttribute("tabindex", /.+/);
      await expect(
        root.locator("button, a, input, select, textarea"),
      ).toHaveCount(0);
    }
  }
  await expect(
    page.locator("[data-component-audit-id='badge-showcase-dot-blue']"),
  ).toHaveAttribute("aria-hidden", "true");
});

test("Person Tag removal is native, exact and consumer-owned", async ({
  page,
}) => {
  const exercise = async (activate) => {
    const root = page.locator("[data-person-tag-consumer]");
    const remove = root.getByRole("button", { name: "Удалить Анну Петрову" });
    await expect(remove).toHaveAttribute("type", "button");
    await page.evaluate(() => {
      window.__wave4Clicks = 0;
      const target = document.querySelector("[data-person-tag-remove]");
      target.addEventListener("click", () => window.__wave4Clicks++);
    });
    await expect(root).not.toHaveAttribute("role", /.+/);
    await expect(root).not.toHaveAttribute("tabindex", /.+/);
    await activate(remove);
    await expect(root).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.__wave4Clicks)).toBe(1);
  };

  await exercise((remove) => remove.click());
  await page.reload();
  await exercise(async (remove) => {
    await remove.focus();
    await page.keyboard.press("Enter");
  });
  await page.reload();
  await exercise(async (remove) => {
    await remove.focus();
    await page.keyboard.press("Space");
  });

  const disabled = page.locator(
    "[data-component-audit-id='person-tag-content-stress'] button",
  );
  await expect(disabled).toBeDisabled();
  await page.evaluate(() => (window.__wave4DisabledClicks = 0));
  await disabled.evaluate((element) =>
    element.addEventListener("click", () => window.__wave4DisabledClicks++),
  );
  const disabledBox = await disabled.boundingBox();
  expect(disabledBox).not.toBeNull();
  await page.mouse.click(
    disabledBox.x + disabledBox.width / 2,
    disabledBox.y + disabledBox.height / 2,
  );
  await expect(disabled).toBeAttached();
  expect(await page.evaluate(() => window.__wave4DisabledClicks)).toBe(0);
});

test("identity and label content remains component-bounded", async ({
  page,
}) => {
  const personTagRoots = page.locator(
    "[data-component-audit-id^='person-tag-']",
  );
  await expect(personTagRoots).toHaveCount(3);
  for (let index = 0; index < 3; index++)
    await expect(
      personTagRoots.nth(index).locator(":scope > .shlz-person-tag__label"),
    ).toHaveCount(1);

  const person = page.locator(
    "[data-component-audit-id='person-tag-content-stress']",
  );
  await person.evaluate((element) => (element.style.inlineSize = "180px"));
  const label = person.locator(".shlz-person-tag__label");
  const metrics = await label.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflow: window.getComputedStyle(element).overflow,
    textOverflow: window.getComputedStyle(element).textOverflow,
  }));
  expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  expect(metrics).toMatchObject({
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  const avatar = person.locator(".shlz-avatar");
  await expect(avatar).toHaveCSS("width", "24px");
  await expect(avatar).toHaveCSS("height", "24px");

  const status = page.locator(
    "[data-component-audit-id='status-typography-table']",
  );
  await status.evaluate((element) => {
    element.parentElement.style.inlineSize = "120px";
    element.textContent = "Очень длинное состояние заявки";
  });
  await expect(status).toHaveCSS("white-space", "nowrap");

  const oneDigit = page.locator(
    "[data-component-audit-id='badge-showcase-small-blue-single']",
  );
  const twoDigits = page.locator(
    "[data-component-audit-id='badge-showcase-small-blue-multiple']",
  );
  const manyDigits = page.locator(
    "[data-component-audit-id='badge-typography-stress']",
  );
  await expect(oneDigit).toHaveCSS("height", "16px");
  await expect(oneDigit).toHaveCSS("min-width", "16px");
  await expect(twoDigits).toHaveCSS("height", "16px");
  await expect(twoDigits).toHaveCSS("min-width", "29px");
  const badgeMetrics = await manyDigits.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    height: element.getBoundingClientRect().height,
  }));
  expect(badgeMetrics.scrollWidth).toBeLessThanOrEqual(
    badgeMetrics.clientWidth,
  );
  expect(badgeMetrics.height).toBe(16);

  for (const size of [24, 32, 40, 64]) {
    const image = page.locator(
      `[data-component-audit-id='avatar-showcase-${size}-image']`,
    );
    await expect(image).toHaveCSS("width", `${size}px`);
    await expect(image).toHaveCSS("height", `${size}px`);
    await expect(image.locator("img")).toHaveCSS("object-fit", "cover");
  }
});

test("Wave 4 accessibility ownership follows composition context", async ({
  page,
}) => {
  const repeatedIdentityImages = page.locator(
    "[data-component-audit-id^='person-tag-'] > .shlz-tag__avatar",
  );
  await expect(repeatedIdentityImages).toHaveCount(2);
  for (let index = 0; index < 2; index++)
    await expect(repeatedIdentityImages.nth(index)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  await expect(
    page.locator("[data-component-audit-id='avatar-showcase-32-text']"),
  ).toHaveAttribute("role", "img");
  await expect(
    page.locator("[data-component-audit-id='avatar-table-beta']"),
  ).toHaveAttribute("aria-hidden", "true");
  await expect(
    page.locator(
      "[data-component-audit-id^='avatar-'] a, [data-component-audit-id^='avatar-'] button",
    ),
  ).toHaveCount(0);
});
