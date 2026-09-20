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
  "calendar-sidebar",
  "calendar-interface",
  "xls-file",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
  await page.addStyleTag({
    content: `
      .shlz-docs-sidebar { display: none !important; }
      #file-row-extension-demo { display: none !important; }
    `,
  });
});

test("all canonical icons resolve to painted production sprite symbols", async ({
  page,
}) => {
  const cards = page.locator(".shlz-icon-card");
  await expect(cards).toHaveCount(201);
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
  await expect(monochrome).toHaveCount(177);
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
  // Empty State retains a source-exact fractional height. Normalize this
  // detached diagnostic fixture to the baseline raster phase so unrelated
  // document-flow additions cannot recolor currentColor antialiasing.
  await fixture.evaluate((element) => {
    element.style.marginBlockStart = "0.5px";
    element.style.marginBlockEnd = "-0.5px";
  });
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

test("plain HTML consumes both calendars and preserved-paint sheet icons", async ({
  page,
}) => {
  const sources = await page.evaluate(() =>
    Object.fromEntries(
      ["calendar-sidebar", "calendar-interface", "xls-file"].map((name) => [
        name,
        document
          .querySelector(`[data-icon-name="${name}"] use`)
          ?.getAttribute("href") ??
          document.querySelector(`[data-icon-name="${name}"] img`).src,
      ]),
    ),
  );
  await page.setContent(`
    <!doctype html>
    <html lang="en"><body>
      <svg data-icon-consumer-name="calendar-sidebar" viewBox="0 0 24 24" role="img" aria-label="Navigation calendar"><use href="${sources["calendar-sidebar"]}"></use></svg>
      <svg data-icon-consumer-name="calendar-interface" viewBox="0 0 24 24" role="img" aria-label="Form calendar"><use href="${sources["calendar-interface"]}"></use></svg>
      <img data-icon-consumer-name="xls-file" src="${sources["xls-file"]}" alt="Spreadsheet file">
    </body></html>
  `);
  const icons = page.locator("[data-icon-consumer-name]");
  await expect(icons).toHaveCount(3);
  expect(
    await icons.evaluateAll((items) =>
      items.map((item) => ({
        name: item.dataset.iconConsumerName,
        loaded:
          item.tagName === "IMG"
            ? item.complete && item.naturalWidth > 0
            : (() => {
                const bounds = item.querySelector("use").getBBox();
                return bounds.width > 0 && bounds.height > 0;
              })(),
        label: item.getAttribute("alt") ?? item.getAttribute("aria-label"),
      })),
    ),
  ).toEqual([
    {
      name: "calendar-sidebar",
      loaded: true,
      label: "Navigation calendar",
    },
    {
      name: "calendar-interface",
      loaded: true,
      label: "Form calendar",
    },
    {
      name: "xls-file",
      loaded: true,
      label: "Spreadsheet file",
    },
  ]);
});
