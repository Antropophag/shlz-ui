import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

test("SHLZ status filter composes with Drawer and application state", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: /Фильтры/ });
  await trigger.click();

  const drawer = page.getByRole("dialog", { name: "Фильтры заявок" });
  const status = drawer.getByRole("combobox", { name: "Статус" });
  await expect(drawer).toBeVisible();
  await expect(status).toHaveJSProperty("tagName", "BUTTON");
  await status.click();
  const listbox = drawer.getByRole("listbox", { name: "Статус" });
  await expect(listbox).toBeVisible();
  await expect(listbox.getByRole("option")).toHaveCount(5);
  await expect(
    listbox.getByRole("option", { name: "Архивная" }),
  ).toHaveAttribute("aria-disabled", "true");

  await page.evaluate(() => {
    window.__workspaceSelectChanges = 0;
    document
      .querySelector("[data-workspace-status-filter]")
      .addEventListener("change", () => window.__workspaceSelectChanges++);
  });
  await listbox.getByRole("option", { name: "В работе" }).click();
  await expect
    .poll(() => page.evaluate(() => window.__workspaceSelectChanges))
    .toBe(1);
  await drawer.getByRole("button", { name: "Применить" }).click();

  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(1);
  await expect(page.locator("[data-workspace-result-count]")).toHaveText("1");
  await expect(page.locator("[data-workspace-filter-count]")).toBeVisible();
});

test("filter draft is committed only by Apply", async ({ page }) => {
  const trigger = page.getByRole("button", { name: /Фильтры/ });
  const drawer = page.getByRole("dialog", { name: "Фильтры заявок" });
  const status = drawer.getByRole("combobox", { name: "Статус" });
  const statusValue = drawer.locator("[data-workspace-status-filter]");
  const search = page.getByRole("searchbox", { name: "Поиск по заявкам" });

  await search.fill("SD");
  await trigger.click();
  const selectStatus = async (label) => {
    await status.click();
    await drawer.getByRole("option", { name: label, exact: true }).click();
  };
  await selectStatus("Новая");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(3);

  await trigger.click();
  await expect(statusValue).toHaveValue("");
  await selectStatus("В работе");
  await drawer.getByRole("button", { name: "Закрыть" }).click();
  await trigger.click();
  await expect(statusValue).toHaveValue("");

  await selectStatus("В работе");
  await drawer.getByRole("button", { name: "Применить" }).click();
  await trigger.click();
  await expect(statusValue).toHaveValue("В работе");
  await expect(status).toContainText("В работе");
  await drawer.getByRole("button", { name: "Закрыть" }).click();
  await trigger.click();
  await expect(statusValue).toHaveValue("В работе");
  await expect(status).toContainText("В работе");
  await drawer.getByRole("button", { name: "Сбросить" }).click();
  await expect(statusValue).toHaveValue("");
  await expect(search).toHaveValue("SD");
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(1);
  await drawer.getByRole("button", { name: "Применить" }).click();
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(3);
});

test("search, empty recovery and sort stay application-owned", async ({
  page,
}) => {
  const workspace = page.locator("[data-consumer-workspace]");
  const search = workspace.getByRole("searchbox", { name: "Поиск по заявкам" });
  await search.fill("спецификации");
  await expect(workspace.locator("[data-workspace-row]:visible")).toHaveCount(
    1,
  );
  await expect(workspace.getByText("SD-2409")).toBeVisible();

  await search.fill("отсутствующая заявка");
  await expect(
    workspace.getByRole("heading", { name: "Заявки не найдены" }),
  ).toBeVisible();
  await workspace.getByRole("button", { name: "Сбросить условия" }).click();
  await expect(search).toBeFocused();
  await expect(workspace.locator("[data-workspace-row]:visible")).toHaveCount(
    3,
  );

  const titleHeader = workspace.getByRole("columnheader", { name: /Тема/ });
  await workspace.getByRole("button", { name: /Тема/ }).click();
  await expect(titleHeader).toHaveAttribute("aria-sort", "descending");
});

test("selection, teardown and narrow containment remain explicit", async ({
  page,
}) => {
  const workspace = page.locator("[data-consumer-workspace]");
  await workspace
    .getByRole("checkbox", { name: "Выбрать заявку SD-2418" })
    .check();
  await expect(workspace.locator("[data-workspace-bulk]")).toBeVisible();
  await expect(workspace.locator("[data-workspace-selected-count]")).toHaveText(
    "1",
  );
  await workspace.getByRole("button", { name: "Снять выбор" }).click();
  await expect(workspace.locator("[data-workspace-bulk]")).toBeHidden();

  await page.evaluate(() => window.__shlzConsumerWorkspace.destroy());
  await workspace
    .getByRole("searchbox", { name: "Поиск по заявкам" })
    .fill("SD-2418");
  await expect(workspace.locator("[data-workspace-row]:visible")).toHaveCount(
    3,
  );

  await page.setViewportSize({ width: 360, height: 800 });
  await workspace.scrollIntoViewIfNeeded();
  const workspaceBox = await workspace.boundingBox();
  expect(workspaceBox.x).toBeGreaterThanOrEqual(0);
  expect(workspaceBox.x + workspaceBox.width).toBeLessThanOrEqual(360);
  const tableOverflow = await workspace
    .locator(".shlz-table-wrap")
    .evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(tableOverflow).toBe(true);
});

test("consumer workspace composition remains visually stable", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (const addition of document.querySelectorAll(
      '[data-component-docs="pagination"], [data-pagination-consumer]',
    )) {
      addition.hidden = true;
    }
  });
  await page.evaluate(() => document.fonts.ready);
  const workspace = page.locator("[data-consumer-workspace]");
  await workspace.scrollIntoViewIfNeeded();
  await expect(workspace).toHaveScreenshot("consumer-workspace.png", {
    animations: "disabled",
    caret: "hide",
  });
});

test("consumer workspace Select opened surface remains visually stable", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Фильтры/ }).click();
  const drawer = page.getByRole("dialog", { name: "Фильтры заявок" });
  await drawer.getByRole("combobox", { name: "Статус" }).click();
  await expect(drawer.getByRole("listbox", { name: "Статус" })).toBeVisible();
  await expect(drawer.locator(".shlz-drawer__surface")).toHaveScreenshot(
    "consumer-workspace-select-open.png",
    { animations: "disabled", caret: "hide" },
  );
});
