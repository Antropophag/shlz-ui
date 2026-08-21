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
  for (const component of components)
    await expectClassifiedComponentOccurrences(page, manifests[component]);
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
  const root = page.locator("[data-person-tag-consumer]");
  const remove = root.getByRole("button", { name: "Удалить Анну Петрову" });
  await expect(remove).toHaveAttribute("type", "button");
  let clicks = 0;
  await remove.evaluate((element) =>
    element.addEventListener("click", () => window.__wave4Clicks++),
  );
  await page.evaluate(() => (window.__wave4Clicks = 0));
  await remove.focus();
  await page.keyboard.press("Enter");
  await expect(root).toHaveCount(0);
  clicks = await page.evaluate(() => window.__wave4Clicks);
  expect(clicks).toBe(1);

  await page.reload();
  const pointerRoot = page.locator("[data-person-tag-consumer]");
  await pointerRoot.getByRole("button").click();
  await expect(pointerRoot).toHaveCount(0);

  await page.reload();
  const spaceRoot = page.locator("[data-person-tag-consumer]");
  const spaceRemove = spaceRoot.getByRole("button");
  await spaceRemove.focus();
  await page.keyboard.press("Space");
  await expect(spaceRoot).toHaveCount(0);

  const disabled = page.locator(
    "[data-component-audit-id='person-tag-content-stress'] button",
  );
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  await expect(disabled).toBeAttached();
});

test("identity and label content remains component-bounded", async ({
  page,
}) => {
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
