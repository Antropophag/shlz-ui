import { expect, test } from "@playwright/test";

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
  await expect(page.locator(".shlz-icon-catalog")).toHaveScreenshot(
    "icon-catalog.png",
  );
});
