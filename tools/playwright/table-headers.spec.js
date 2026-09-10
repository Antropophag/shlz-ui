import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { textContrastEvidence } from "./text-contrast.js";
import { expect, test } from "@playwright/test";

const primary = "rgb(37, 61, 152)";
const gray = "rgb(147, 156, 165)";
const hoverGray = "rgb(209, 216, 223)";

test.beforeEach(async ({ page }) => page.goto("/?full=1"));

for (const state of ["none", "ascending", "descending"]) {
  test(`table sorter source state ${state}`, async ({ page }) => {
    const table = page.locator(
      '[data-component-audit-id="table-workspace-requests"]',
    );
    const sorter = table.locator("[data-workspace-sort]");
    if (state !== "none") {
      await sorter.click(); // Existing consumer starts with descending.
      if (state === "ascending") await sorter.click();
    } else await sorter.focus();
    await expect(sorter.locator("xpath=ancestor::th")).toHaveAttribute(
      "aria-sort",
      state,
    );
    await expect(sorter.locator("svg")).toHaveCSS("width", "16px");
    await expect(sorter.locator("svg")).toHaveCSS("height", "16px");
    await expect(sorter.locator(".shlz-table__sort-up")).toHaveCSS(
      "fill",
      state === "ascending" ? primary : gray,
    );
    await expect(sorter.locator(".shlz-table__sort-down")).toHaveCSS(
      "fill",
      state === "descending" ? primary : gray,
    );
    if (state !== "none") {
      const titles = await table
        .locator("[data-workspace-title]")
        .allTextContents();
      const expected = [...titles].sort(
        (a, b) => a.localeCompare(b, "ru") * (state === "ascending" ? 1 : -1),
      );
      expect(titles).toEqual(expected);
    }
  });
}

for (const state of ["default", "hover", "active"]) {
  test(`table filter source state ${state}`, async ({ page }) => {
    const filter = page.locator("[data-workspace-header-filter]");
    await expect(filter).toHaveAttribute("aria-haspopup", "dialog");
    await expect(filter).not.toHaveAttribute("aria-pressed");
    if (state === "hover") await filter.hover();
    else if (state === "default") await filter.focus();
    else {
      await filter.click();
      const dialog = page.locator("#workspace-filter-drawer");
      await dialog.getByRole("combobox").click();
      await dialog
        .getByRole("option", { name: "В работе", exact: true })
        .click();
      await dialog
        .getByRole("button", { name: "Применить", exact: true })
        .click();
      await expect(filter).toBeFocused();
      await expect(filter).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(1);
    }
    await expect(filter).toHaveAttribute(
      "data-filter-active",
      String(state === "active"),
    );
    await expect(filter).toHaveAccessibleDescription(
      state === "active"
        ? "Применён фильтр по статусу: В работе"
        : "Фильтр по статусу не применён",
    );
    await expect(filter.locator("svg")).toHaveCSS("width", "16px");
    await expect(filter.locator("svg")).toHaveCSS("height", "18px");
    await expect(filter.locator("path")).toHaveCSS(
      "fill",
      state === "active" ? primary : state === "hover" ? hoverGray : gray,
    );
  });
}

test("header filter preserves applied state on Escape and restores initiating focus", async ({
  page,
}) => {
  const filter = page.locator("[data-workspace-header-filter]");
  await filter.focus();
  await page.keyboard.press("Enter");
  await expect(filter).toHaveAttribute("aria-expanded", "true");
  await expect(filter).toHaveAttribute("data-filter-active", "false");
  await page.keyboard.press("Escape");
  await expect(filter).toBeFocused();
  await expect(filter).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(3);
  await filter.evaluate((el) => {
    el.disabled = true;
  });
  await filter.evaluate((el) => el.click());
  await expect(page.locator("#workspace-filter-drawer")).not.toBeVisible();
});

test("mixed table controls act and selected row paint reflects native selection", async ({
  page,
}) => {
  const demo = page.locator("#table-demo");
  await expect(
    demo.getByRole("checkbox", { name: "Select all rows" }),
  ).toHaveJSProperty("indeterminate", true);
  const filter = demo.locator("[data-table-demo-filter]");
  await filter.focus();
  await page.keyboard.press("Space");
  await expect(demo.locator("tbody tr:visible")).toHaveCount(1);
  await filter.click();
  await expect(demo.locator("tbody tr:visible")).toHaveCount(2);
  await demo.getByRole("checkbox", { name: "Select all rows" }).check();
  await expect(demo.locator('[data-selected="true"]')).toHaveCount(2);
  await expect(demo.locator("tbody td").first()).toHaveCSS(
    "background-color",
    "rgb(244, 246, 249)",
  );
  await demo.getByRole("checkbox", { name: "Select all rows" }).uncheck();
  await demo
    .getByRole("textbox", { name: "Edit name" })
    .fill("Updated request");
  await expect(
    demo.getByRole("textbox", { name: "Edit name" }).locator("xpath=.."),
  ).toHaveCSS("border-bottom-color", primary);
  await demo.getByRole("button", { name: "Save", exact: true }).click();
  await expect(demo.locator("[data-table-demo-result]")).toHaveText(
    "Saved: Updated request",
  );
});

test("table pagination keeps native navigation and changes rows", async ({
  page,
}) => {
  await page.goto("/?page=1#pagination-consumer");
  const consumer = page.locator("#pagination-consumer");
  await expect(consumer.locator("tbody tr").first()).toContainText("SD-2401");
  await consumer.getByRole("link", { name: "Следующая страница" }).click();
  await expect(consumer.locator("tbody tr").first()).toContainText("SD-2421");
  await expect(consumer.locator('[aria-current="page"]')).toHaveText("2");
});

test("complete Table material-state ledger and focused accessibility", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const manifest = JSON.parse(
    await readFile(
      new globalThis.URL(
        "../../docs/component-audits/table.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const executed = new Set();
  const verifyMaterialState = async (component, state, check) => {
    expect(component).toBe(manifest.component);
    await check();
    executed.add(state);
  };
  const workspace = page.locator(
    '[data-component-audit-id="table-workspace-requests"]',
  );
  const firstCell = workspace.locator("tbody tr").first().locator("td").first();
  await verifyMaterialState("table", "row-hover", async () => {
    await firstCell.hover();
    await expect(firstCell).toHaveCSS("background-color", "rgb(238, 240, 244)");
  });
  const editor = page.locator("[data-table-live-name]").first();
  await verifyMaterialState("table", "cell-hover", async () => {
    await editor.hover();
    await expect(editor.locator("xpath=ancestor::td")).toHaveCSS(
      "background-color",
      "rgb(238, 240, 244)",
    );
  });
  await verifyMaterialState("table", "editing-focus", async () => {
    await editor.click();
    await expect(editor.locator("xpath=ancestor::td")).toHaveCSS(
      "border-bottom-color",
      primary,
    );
    await expect(editor.locator("xpath=ancestor::td")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  });
  await verifyMaterialState("table", "typing", async () => {
    await editor.fill("Комп");
    await expect(editor).toHaveValue("Комп");
    await expect(editor).toHaveCSS("font-size", "15px");
    await expect(editor.locator("xpath=ancestor::td")).toHaveCSS(
      "border-bottom-color",
      primary,
    );
  });
  const choice = page.locator("[data-table-live-choice]").first();
  await verifyMaterialState("table", "choice-open", async () => {
    await choice.locator("button[aria-haspopup]").focus();
    await page.keyboard.press("ArrowDown");
    await expect(choice.locator("[role=menu]")).toBeVisible();
    await expect(choice.locator("[role=menu]")).toHaveCSS("position", "fixed");
    await expect(choice.locator("xpath=..")).toHaveCSS(
      "border-bottom-color",
      primary,
    );
  });
  await page.keyboard.press("Escape");
  const sorter = workspace.locator("[data-workspace-sort]");
  await verifyMaterialState("table", "sort-descending", async () => {
    await sorter.click();
    await expect(sorter.locator(".shlz-table__sort-down")).toHaveCSS(
      "fill",
      primary,
    );
  });
  await verifyMaterialState("table", "sort-ascending", async () => {
    await sorter.click();
    await expect(sorter.locator(".shlz-table__sort-up")).toHaveCSS(
      "fill",
      primary,
    );
  });
  const filter = workspace.locator("[data-workspace-header-filter]");
  await verifyMaterialState("table", "filter-hover", async () => {
    await filter.hover();
    await expect(filter.locator("path")).toHaveCSS("fill", hoverGray);
  });
  await verifyMaterialState("table", "filter-active", async () => {
    await filter.click();
    const dialog = page.locator("#workspace-filter-drawer");
    await dialog.getByRole("combobox").click();
    await dialog.getByRole("option", { name: "В работе", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Применить", exact: true })
      .click();
    await expect(filter).toHaveAttribute("data-filter-active", "true");
    await expect(filter.locator("path")).toHaveCSS("fill", primary);
  });
  await verifyMaterialState("table", "row-selected", async () => {
    const row = workspace.locator("tbody tr:visible");
    await row.getByRole("checkbox").check();
    await expect(row.locator("td").first()).toHaveCSS(
      "background-color",
      "rgb(244, 246, 249)",
    );
  });
  const add = page.locator("[data-table-live-add]");
  await verifyMaterialState("table", "focus-visible", async () => {
    await add.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(add).toBeFocused();
    await expect(add).toHaveCSS("outline-style", "solid");
  });
  await verifyMaterialState("table", "add-row-pressed", async () => {
    await add.hover();
    await page.mouse.down();
    await expect(add).toHaveCSS("color", primary);
    await page.mouse.up();
  });
  for (const text of [add, editor, workspace.locator("th").nth(2)])
    expect((await textContrastEvidence(text)).ratio).toBeGreaterThanOrEqual(
      4.5,
    );
  const expectMaterialStates = (component) => {
    expect(component).toBe(manifest.component);
    expect([...executed].sort()).toEqual(
      [...manifest.interactionEvidence.materialStates].sort(),
    );
  };
  expectMaterialStates("table");
  const accessibility = await new AxeBuilder({ page })
    .include("#table-editing-example")
    .include('[data-component-audit-id="table-workspace-requests"]')
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("Table navigation resolves to the executable table instead of a missing anchor", async ({
  page,
}) => {
  await page.goto("/#table-demo");
  await expect(page.locator("#table-demo")).toHaveCount(1);
  await expect(page.locator("#table-demo")).toBeVisible();
  await expect(
    page.locator("#table-demo [data-table-demo-sort]"),
  ).toBeEnabled();
});

test("filter reads the current edited row name", async ({ page }) => {
  const demo = page.locator("#table-demo");
  const editor = demo.getByRole("textbox", { name: "Edit name" });
  await editor.fill("Alpha request edited");
  await demo.locator("[data-table-demo-filter]").click();
  await expect(editor).toBeVisible();
  await expect(demo.locator("tbody tr:visible")).toHaveCount(2);
  await demo.locator("[data-table-demo-filter]").click();
  await editor.fill("Gamma request");
  await demo.locator("[data-table-demo-filter]").click();
  await expect(editor).not.toBeVisible();
});
