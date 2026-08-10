import { expect, test } from "@playwright/test";

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
  expect(
    await page.evaluate(() => document.fonts.check('16px "Fira Sans"')),
  ).toBe(true);
});

test("Fira keeps shared geometry and stress content unclipped", async ({
  page,
}) => {
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
