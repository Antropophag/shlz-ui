import { expect, test } from "@playwright/test";
import { hideDeveloperDocumentation } from "./visual-harness.js";

const fixedGeometrySelectors = [
  ".shlz-type-stress .shlz-input",
  ".shlz-type-stress .shlz-field--select .shlz-field__control",
  ".shlz-type-stress .shlz-pagination__item",
  ".shlz-type-stress .shlz-status",
  ".shlz-type-stress .shlz-table tbody td",
];

const dimensions = (page, selectors) =>
  page.evaluate(
    (items) =>
      items.map((selector) => {
        const box = document.querySelector(selector).getBoundingClientRect();
        return { selector, width: box.width, height: box.height };
      }),
    selectors,
  );

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    window.localStorage.removeItem("shlz-font-profile"),
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("Golos is default and profiles work on roots and subtrees", async ({
  page,
}) => {
  const body = page.locator("body");
  await expect(body).not.toHaveAttribute("data-shlz-font");
  await expect(body).toHaveCSS("font-family", /Golos Text/);

  const golosFaces = await page.evaluate(async () => {
    const latin = await document.fonts.load('400 16px "Golos Text"', "SHLZ");
    const cyrillic = await document.fonts.load(
      '400 16px "Golos Text"',
      "Кириллица",
    );
    return {
      latin: latin.map(({ family, status }) => ({ family, status })),
      cyrillic: cyrillic.map(({ family, status }) => ({ family, status })),
    };
  });
  for (const faces of [golosFaces.latin, golosFaces.cyrillic]) {
    expect(faces).toContainEqual({ family: "Golos Text", status: "loaded" });
  }

  await body.evaluate((node) => {
    const subtree = document.createElement("div");
    subtree.dataset.shlzFont = "fira";
    subtree.textContent = "Кириллица ABC 0123456789";
    node.append(subtree);
  });
  await expect(body.locator('[data-shlz-font="fira"]')).toHaveCSS(
    "font-family",
    /Fira Sans/,
  );
  const loadedFaces = await page.evaluate(async () => {
    const latin = await document.fonts.load('400 16px "Fira Sans"', "SHLZ");
    const cyrillic = await document.fonts.load(
      '400 16px "Fira Sans"',
      "Кириллица",
    );
    return {
      latin: latin.map(({ family, status }) => ({ family, status })),
      cyrillic: cyrillic.map(({ family, status }) => ({ family, status })),
    };
  });
  for (const faces of [loadedFaces.latin, loadedFaces.cyrillic]) {
    expect(faces).toContainEqual({ family: "Fira Sans", status: "loaded" });
  }

  await body.evaluate((node) => {
    const drawer = document.createElement("dialog");
    drawer.className = "shlz-drawer";
    drawer.dataset.shlzFont = "fira";
    node.append(drawer);
  });
  await expect(
    body.locator("dialog.shlz-drawer[data-shlz-font='fira']"),
  ).toHaveCSS("font-family", /Fira Sans/);
});

test("Fira keeps shared geometry and stress content unclipped", async ({
  page,
}) => {
  await hideDeveloperDocumentation(page);
  const golosGeometry = await dimensions(page, fixedGeometrySelectors);
  await page.getByLabel("Fira Sans").check();
  await page.evaluate(() => document.fonts.ready);
  const firaGeometry = await dimensions(page, fixedGeometrySelectors);
  expect(firaGeometry.map(({ height }) => height)).toEqual(
    golosGeometry.map(({ height }) => height),
  );
  expect(firaGeometry.slice(0, 3).map(({ width }) => width)).toEqual(
    golosGeometry.slice(0, 3).map(({ width }) => width),
  );

  const stress = page.locator("[data-shlz-type-stress]");
  await expect(stress).toHaveCSS("font-family", /Fira Sans/);
  const failures = await stress.evaluate((root) =>
    [
      ...root.querySelectorAll(
        "button, input, th, td, .shlz-status, .shlz-badge, .shlz-tag",
      ),
    ]
      .filter((node) => node.scrollHeight > node.clientHeight + 1)
      .map((node) => `${node.tagName}.${node.className}`),
  );
  expect(failures).toEqual([]);

  for (const selector of [
    ".shlz-file-row__title",
    ".shlz-document-row__title",
  ]) {
    const ellipsis = stress.locator(selector);
    await expect(ellipsis).toHaveCSS("text-overflow", "ellipsis");
    expect(
      await ellipsis.evaluate((node) => node.scrollWidth > node.clientWidth),
    ).toBe(true);
  }

  const tableRow = stress.locator(".shlz-table tbody tr");
  expect(
    await tableRow.evaluate((node) => node.getBoundingClientRect().height),
  ).toBe(50);
  await page.addStyleTag({
    content: ".shlz-docs-sidebar { display: none !important; }",
  });
  await expect(stress).toHaveScreenshot("typography-fira-compatibility.png", {
    animations: "disabled",
  });
});
