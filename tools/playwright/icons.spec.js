import { expect, test } from "@playwright/test";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

const representativeIcons = [
  "add-documents",
  "filter",
  "flag",
  "arrow-opened",
  "close-remove",
  "user-1",
  "document-badge-plus",
  "six-dot-grid",
  "file-pdf",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(".shlz-icon-catalog").evaluate((details) => {
    details.open = true;
  });
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { display: none !important; }",
  });
});

test("all canonical icons resolve to painted production sprite symbols", async ({
  page,
}) => {
  const cards = page.locator(".shlz-icon-card");
  await expect(cards).toHaveCount(119);
  const failures = await cards.evaluateAll((items) =>
    items.flatMap((card) => {
      const graphic = card.querySelector(
        ":scope > svg.shlz-icon, :scope > img",
      );
      const valid = (() => {
        if (!graphic) return false;
        if (graphic instanceof window.HTMLImageElement)
          return graphic.complete && graphic.naturalWidth > 0;
        const use = graphic.querySelector("use");
        if (!use?.getAttribute("href")) return false;
        const bounds = use.getBBox();
        return bounds.width > 0 || bounds.height > 0;
      })();
      return valid ? [] : [card.dataset.iconName];
    }),
  );
  expect(failures).toEqual([]);
});

test("standalone monochrome icons use the semantic default foreground", async ({
  page,
}) => {
  const monochrome = page.locator(".shlz-icon-card > svg.shlz-icon");
  await expect(monochrome).toHaveCount(97);
  const colors = await monochrome.evaluateAll((items) => [
    ...new Set(items.map((item) => window.getComputedStyle(item).color)),
  ]);
  const semanticDefault = await page
    .locator(".shlz-scope")
    .evaluate((node) => window.getComputedStyle(node).color);
  expect(colors).toEqual([semanticDefault]);

  const inherited = await page.locator(".shlz-scope").evaluate((scope) => {
    const host = document.createElement("span");
    host.style.color = "rgb(198, 31, 55)";
    host.innerHTML =
      '<svg class="shlz-icon shlz-icon--inherit" viewBox="0 0 1 1"><rect width="1" height="1" fill="currentColor"></rect></svg>';
    scope.append(host);
    const color = window.getComputedStyle(host.firstElementChild).color;
    host.remove();
    return color;
  });
  expect(inherited).toBe("rgb(198, 31, 55)");
});

test("representative paint topologies remain visually stable", async ({
  page,
}) => {
  await page.evaluate((names) => {
    const fixture = document.createElement("div");
    fixture.className = "shlz-icon-grid shlz-icon-regression-fixture";
    for (const name of names)
      fixture.append(
        document.querySelector(`[data-icon-name="${name}"]`).cloneNode(true),
      );
    document.querySelector(".shlz-icon-catalog").prepend(fixture);
  }, representativeIcons);
  const fixture = page.locator(".shlz-icon-regression-fixture");
  await expect(fixture.locator(".shlz-icon-card")).toHaveCount(
    representativeIcons.length,
  );
  await expect(fixture).toHaveScreenshot("icon-catalog-representative.png", {
    animations: "disabled",
  });
});

test("Icon Catalog review is captured independently at large scale", async ({
  page,
}) => {
  await expectStableShowcaseScreenshot(
    page,
    page.locator(".shlz-icon-catalog"),
    "icon-catalog.png",
  );
});
