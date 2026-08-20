import { expect, test } from "@playwright/test";
import {
  hideDeveloperDocumentation,
  stabilizeShowcaseLayout,
} from "./visual-harness.js";

test("file row exposes independent targets and source geometry", async ({
  page,
}) => {
  await page.goto("/#file-row-demo");
  const row = page.locator("#file-row-demo .shlz-file-row").nth(1);
  await expect(row.locator(".shlz-file-row__primary")).toBeVisible();
  await expect(row.locator(".shlz-file-row__action")).toHaveCount(1);
  await expect(row.locator(".shlz-file-row__visual")).toHaveCSS(
    "width",
    "38px",
  );
  await expect(row.locator(".shlz-file-row__primary")).toHaveCSS(
    "text-overflow",
    "ellipsis",
  );
  await row.locator(".shlz-file-row__action").focus();
  await expect(row.locator(".shlz-file-row__action")).toBeFocused();
  await expect(row.locator(".shlz-file-row__primary")).not.toBeFocused();
  await expect(page.locator(".shlz-file-row[aria-invalid='true']")).toHaveCSS(
    "height",
    "73px",
  );
});

test("document row supports compact and metadata-rich fluid lists", async ({
  page,
}) => {
  await page.goto("/#file-row-extension-demo");
  const rows = page.locator("#file-row-extension-demo .shlz-document-row");
  await expect(rows).toHaveCount(6);

  const detailed = rows.first();
  await expect(detailed.locator(".shlz-document-row__meta")).toHaveText(
    "Версия 1 · 17 КБ",
  );
  await expect(detailed.locator(".shlz-document-row__modified")).toHaveText(
    "15.07.2026, 13:57",
  );
  await expect(detailed).toHaveAttribute("data-file-type", "pdf-default");
  await expect(
    detailed.locator(".shlz-document-row__visual img"),
  ).toBeVisible();
  await expect(detailed.locator(".shlz-document-row__visual img")).toHaveCSS(
    "width",
    "44px",
  );
  await expect(detailed.locator(".shlz-document-row__action")).toHaveCount(1);
  await expect(detailed.locator(".shlz-document-row__title")).toHaveAttribute(
    "title",
    "Сопроводительные материалы 100.pdf",
  );
  await expect(detailed.locator(".shlz-document-row__title")).toHaveCSS(
    "text-overflow",
    "ellipsis",
  );
  await expect(detailed.locator(".shlz-document-row__title")).toHaveCSS(
    "white-space",
    "nowrap",
  );
  await expect(detailed.locator(".shlz-document-row__title")).toHaveCSS(
    "text-decoration-line",
    "none",
  );
  await expect(detailed.locator(".shlz-document-row__content")).toHaveCSS(
    "display",
    "grid",
  );
  await expect(detailed.locator(".shlz-document-row__actions")).toHaveCSS(
    "width",
    "40px",
  );
  await expect(detailed).toHaveCSS("column-gap", "8px");

  const compact = page
    .locator("#file-row-extension-demo .shlz-document-row--compact")
    .first();
  await expect(compact.locator(".shlz-document-row__meta")).toBeVisible();
  await expect(compact.locator(".shlz-document-row__modified")).toHaveCount(0);

  const expectedHoverBackground = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--shlz-source-color-background-primary)";
    document.body.append(probe);
    const value = globalThis.getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  });
  await detailed.hover();
  await expect(detailed).toHaveCSS("background-color", expectedHoverBackground);
  await detailed.locator(".shlz-document-row__action").focus();
  await expect(detailed.locator(".shlz-document-row__action")).toBeFocused();

  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "document-row-regression-fixtures";
    host.inert = true;
    host.style.position = "absolute";
    host.style.insetInlineStart = "-10000px";
    host.style.insetBlockStart = "0";

    const sourceRows = document.querySelectorAll(
      ".shlz-document-row-visual-fixture .shlz-document-row",
    );
    for (const [index, width] of [230, 272, 320].entries()) {
      const fixture = document.createElement("div");
      fixture.dataset.fixtureWidth = String(width);
      fixture.style.inlineSize = `${width}px`;
      fixture.append(sourceRows[index].cloneNode(true));
      host.append(fixture);
    }
    document.body.append(host);
  });

  const fixtures = page.locator(
    "#document-row-regression-fixtures [data-fixture-width]",
  );
  for (const width of [230, 272, 320]) {
    const fixture = fixtures.nth([230, 272, 320].indexOf(width));
    const geometry = await fixture.evaluate((element) => {
      const row = element.querySelector(".shlz-document-row");
      const title = element.querySelector(".shlz-document-row__title");
      const actions = element.querySelector(".shlz-document-row__actions");
      return {
        fixtureWidth: element.clientWidth,
        rowClientWidth: row.clientWidth,
        rowScrollWidth: row.scrollWidth,
        titleClientWidth: title.clientWidth,
        titleScrollWidth: title.scrollWidth,
        actionsWidth: actions.getBoundingClientRect().width,
      };
    });
    expect(geometry.fixtureWidth).toBe(width);
    expect(geometry.rowClientWidth).toBe(width);
    expect(geometry.rowScrollWidth).toBe(geometry.rowClientWidth);
    expect(geometry.actionsWidth).toBe(40);
    if (width === 230)
      expect(geometry.titleScrollWidth).toBeGreaterThan(
        geometry.titleClientWidth,
      );
  }

  const wide = page.locator(".shlz-document-row-visual-fixture");
  await expect(wide).toHaveCSS("width", /\d+px/);
  expect(await wide.evaluate((element) => element.clientWidth)).toBeGreaterThan(
    400,
  );
});

test("document row visual regression", async ({ page }) => {
  await page.goto("/#file-row-extension-demo");
  await hideDeveloperDocumentation(page);
  const fixture = page.locator(".shlz-document-row-visual-fixture");
  const firstRow = fixture.locator(".shlz-document-row").first();

  await expect(firstRow).toHaveCSS("display", "grid");
  await expect(firstRow.locator(".shlz-document-row__content")).toHaveCSS(
    "display",
    "grid",
  );
  await expect(firstRow.locator(".shlz-document-row__actions")).toHaveCSS(
    "width",
    "40px",
  );
  await expect(firstRow.locator(".shlz-document-row__title")).toHaveCSS(
    "text-overflow",
    "ellipsis",
  );
  await expect(fixture).toHaveScreenshot("document-row-metadata-rich.png", {
    animations: "disabled",
  });
});

test("empty state composes optional regions responsively", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/#empty-state-demo");
  const states = page.locator("#empty-state-demo .shlz-empty-state");
  await expect(states).toHaveCount(3);
  await expect(states.nth(0).locator(".shlz-empty-state__actions")).toHaveCount(
    0,
  );
  await expect(
    states.nth(1).locator(".shlz-empty-state__actions"),
  ).toBeVisible();
  await expect(
    states.nth(2).locator(".shlz-empty-state__actions"),
  ).toBeVisible();
  await expect(states.nth(0)).toHaveCSS("padding-left", "0px");
  await expect(states.nth(0).locator(".shlz-empty-state__visual")).toHaveCSS(
    "width",
    "64px",
  );
});

test("legacy component captures ignore additive showcase sections", async ({
  page,
}) => {
  await page.goto("/");
  const target = page.locator("#tabs-demo");
  await stabilizeShowcaseLayout(page);
  await target.scrollIntoViewIfNeeded();
  const before = await target.screenshot();

  await page.evaluate(() => {
    const addition = document.createElement("article");
    addition.id = "visual-harness-probe";
    addition.dataset.shlzVisualAddition = "";
    addition.style.blockSize = "777.5px";
    document.querySelector("#tabs-demo").before(addition);

    const link = document.createElement("a");
    link.href = "#visual-harness-probe";
    link.textContent = "Probe";
    document.querySelector(".shlz-docs-sidebar nav").append(link);
  });

  await stabilizeShowcaseLayout(page);
  await target.scrollIntoViewIfNeeded();
  await expect(target.screenshot()).resolves.toEqual(before);
});
