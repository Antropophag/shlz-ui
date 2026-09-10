import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

const referenceRoot = new globalThis.URL(
  "../../apps/showcase/generated/source-references/",
  import.meta.url,
);
const manifest = JSON.parse(
  await readFile(new globalThis.URL("manifest.json", referenceRoot), "utf8"),
).find(({ component }) => component === "table-cell");

test.setTimeout(90_000);

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1#table-cell-demo");
});

test("accounts for each source cell with native semantics and exact cell geometry", async ({
  page,
}) => {
  expect(manifest.sourceVariantCount).toBe(49);
  expect(manifest.references).toHaveLength(49);
  const specimens = page.locator("[data-table-source-cell]");
  await expect(specimens).toHaveCount(49);

  for (const reference of manifest.references) {
    const source = await readFile(
      new globalThis.URL(reference.file, referenceRoot),
      "utf8",
    );
    expect(source, reference.file).toContain("<svg");
    expect(source, `${reference.file} retains source divider paint`).toMatch(
      /#(?:D1D8DF|DFE2F0|253D98)/,
    );

    const specimen = specimens.nth(reference.sourceOrder - 1);
    await expect(specimen).toHaveAttribute(
      "data-table-source-cell",
      String(reference.sourceOrder),
    );
    await expect(specimen).toHaveAttribute(
      "data-source-reference",
      reference.file,
    );
    await expect(specimen).toHaveAttribute(
      "data-source-width",
      String(reference.sourceWidth),
    );
    await expect(specimen).toHaveAttribute(
      "data-source-content-height",
      String(reference.sourceHeight),
    );
    await expect(specimen).toHaveAttribute(
      "data-source-type",
      reference.variantProperties.Type,
    );
    await expect(specimen).toHaveAttribute(
      "data-source-state",
      reference.variantProperties.State,
    );
    await expect(specimen).toHaveAttribute(
      "data-source-cell-kind",
      reference.variantProperties.Cell,
    );

    const table = specimen.locator("table");
    await expect(table).toHaveAttribute(
      "data-component-audit-id",
      `table-cell-source-${reference.sourceOrder}`,
    );
    await expect(table).not.toHaveAttribute("role", /.+/);
    await expect(table.locator(":scope > caption")).toHaveCount(1);
    const cell = table
      .locator("th.shlz-table__cell, td.shlz-table__cell")
      .last();
    await expect(cell).toHaveCSS("height", "50px");
    const geometry = await table.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      cellWidth: element
        .querySelector(".shlz-table__cell")
        .getBoundingClientRect().width,
    }));
    expect(geometry.width).toBeCloseTo(reference.sourceWidth, 0);
    expect(geometry.cellWidth).toBeCloseTo(reference.sourceWidth, 0);
    if (reference.variantProperties.Cell === "Header") {
      await expect(table.locator("thead th[scope='col']")).toHaveCount(1);
    } else {
      await expect(table.locator("tbody td")).toHaveCount(1);
    }
  }
});

test("preserves blank cells, source state paint, and popup export ownership", async ({
  page,
}) => {
  for (const index of [10, 11]) {
    const cell = page.locator(`[data-table-source-cell='${index}'] tbody td`);
    await expect(cell).toBeEmpty();
  }

  for (const index of [9, 11, 13, 16, 19, 24, 25, 29, 34, 36, 39, 41, 45, 47]) {
    await expect(
      page.locator(`[data-table-source-cell='${index}'] .shlz-table__cell`),
    ).toHaveCSS("background-color", "rgb(238, 240, 244)");
  }
  for (const index of [2, 20]) {
    const specimen = page.locator(`[data-table-source-cell='${index}']`);
    await expect(specimen.locator("th.shlz-table__cell")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(specimen.locator(".shlz-table__heading")).toHaveCSS(
      "background-color",
      "rgb(238, 240, 244)",
    );
  }
  for (const index of [26, 43, 49]) {
    await expect(
      page.locator(`[data-table-source-cell='${index}'] .shlz-table__cell`),
    ).toHaveCSS("border-bottom-color", "rgb(37, 61, 152)");
  }
  await expect(
    page.locator("[data-table-source-cell='46'] .shlz-table__cell"),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  for (const index of [42, 43, 49]) {
    const specimen = page.locator(`[data-table-source-cell='${index}']`);
    await expect(specimen).toHaveAttribute("data-source-content-height", "154");
    await expect(specimen.locator("[data-table-source-popup]")).toHaveCount(1);
    await expect(specimen.locator(".shlz-table__cell")).toHaveCSS(
      "height",
      "50px",
    );
  }
});

test("executable fixture updates through keyboard, input, choice, switch, icon and add flows", async ({
  page,
}) => {
  const example = page.locator("#table-editing-example");
  const status = example.locator("[data-table-editing-status]");

  const name = example.locator("[data-table-live-name]");
  await name.fill("Новая заявка");
  await expect(status).toContainText("Новая заявка");

  const choice = example.locator("[data-table-live-choice]").first();
  const trigger = choice.locator(".shlz-table__cell-choice-trigger");
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(choice.locator("[data-table-live-choice-value]")).toHaveText(
    "Закрыт",
  );
  await expect(status).toContainText("Закрыт");

  await example.locator("[data-table-live-switch]").check();
  await expect(status).toHaveText("Заявка включена.");
  await example.locator("[data-table-live-icon]").click();
  await expect(status).toHaveText("Заявка отмечена.");
  await example.locator("[data-table-live-add]").click();
  await expect(example.locator("tbody tr")).toHaveCount(2);
  await expect(status).toHaveText("Добавлена строка 2.");

  await example.locator("[data-table-select-all]").check();
  await example.locator("[data-table-select-all]").uncheck();
  await expect(example.locator("[data-table-select-row]:checked")).toHaveCount(
    0,
  );
  await expect(status).toHaveText("Выбор строк снят.");
});

test("live choice popup escapes the narrow scrolling table wrapper", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const example = page.locator("#table-editing-example");
  const trigger = example
    .locator("button.shlz-table__cell-choice-trigger")
    .first();
  await trigger.click();
  const menu = example.locator("#table-editing-status-menu");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("position", "fixed");
  const geometry = await menu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const wrapper = element.closest(".shlz-table-wrap").getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      viewport: globalThis.innerWidth,
      extendsPastWrapper: rect.bottom > wrapper.bottom,
      reachable: element.contains(
        document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        ),
      ),
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(8);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport - 8);
  expect(geometry.reachable).toBe(true);
  await menu.getByRole("menuitem", { name: "В работе", exact: true }).click();
  await expect(trigger).toHaveText("В работе");
  await expect(trigger).toBeFocused();
});

test("text suggestions keep focus, select a value and dismiss without clipping", async ({
  page,
}) => {
  const root = page.locator("[data-table-suggestions]");
  const input = root.getByRole("combobox");
  await input.fill("Комп");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute(
    "aria-activedescendant",
    "table-name-option-1",
  );
  await expect(root.getByRole("option").first()).toHaveCSS(
    "background-color",
    "rgb(238, 240, 244)",
  );
  await input.press("Enter");
  await expect(input).toHaveValue("Комплектующие");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await input.fill("Комп");
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toHaveValue("Комп");
  await input.fill("Нет такого предложения");
  await expect(root.getByRole("listbox")).not.toBeVisible();
});

test("real add-row pressed paint, keyboard focus and disabled state", async ({
  page,
}) => {
  const example = page.locator("#table-editing-example");
  const add = example.locator("[data-table-live-add]");
  await add.focus();
  await expect(add).toHaveCSS("outline-style", "solid");
  await add.hover();
  await page.mouse.down();
  await expect(add).toHaveCSS("color", "rgb(37, 61, 152)");
  await expect(add).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.up();
  await expect(example.locator("tbody tr")).toHaveCount(2);
  await add.evaluate((el) => {
    el.disabled = true;
    el.click();
  });
  await expect(example.locator("tbody tr")).toHaveCount(2);
  await add.evaluate((el) => {
    el.disabled = false;
  });
  await add.focus();
  await page.keyboard.press("Enter");
  await expect(example.locator("tbody tr")).toHaveCount(3);
  const newEditor = example.getByRole("textbox", {
    name: "Название заявки 3",
    exact: true,
  });
  await newEditor.focus();
  await expect(newEditor.locator("xpath=..")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
});

test("focused source-cell snapshots preserve header, typing and open choice", async ({
  page,
}) => {
  for (const index of [2, 30, 43]) {
    await expect(
      page.locator(`[data-table-source-cell='${index}']`),
    ).toHaveScreenshot(`table-cell-${index}.png`);
  }
});
