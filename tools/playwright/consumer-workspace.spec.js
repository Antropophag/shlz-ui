import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("native status filter composes with Drawer and application state", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: /Фильтры/ });
  await trigger.click();

  const drawer = page.getByRole("dialog", { name: "Фильтры заявок" });
  const status = drawer.getByRole("combobox", { name: "Статус" });
  await expect(drawer).toBeVisible();
  await expect(status).toHaveJSProperty("tagName", "SELECT");
  await expect(status.locator("option")).toHaveCount(5);
  await expect(
    status.locator("option", { hasText: "Архивная" }),
  ).toBeDisabled();
  await expect(drawer.getByRole("listbox")).toHaveCount(0);

  await page.evaluate(() => {
    window.__workspaceNativeChanges = 0;
    document
      .querySelector("[data-workspace-status-filter]")
      .addEventListener("change", () => window.__workspaceNativeChanges++);
  });
  await status.selectOption({ label: "В работе" });
  await expect
    .poll(() => page.evaluate(() => window.__workspaceNativeChanges))
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
  const search = page.getByRole("searchbox", { name: "Поиск по заявкам" });

  await search.fill("SD");
  await trigger.click();
  await status.selectOption({ label: "Новая" });
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(3);

  await trigger.click();
  await expect(status).toHaveValue("");
  await status.selectOption({ label: "В работе" });
  await drawer.getByRole("button", { name: "Закрыть" }).click();
  await trigger.click();
  await expect(status).toHaveValue("");

  await status.selectOption({ label: "В работе" });
  await drawer.getByRole("button", { name: "Применить" }).click();
  await trigger.click();
  await expect(status).toHaveValue("В работе");
  await drawer.getByRole("button", { name: "Сбросить" }).click();
  await expect(status).toHaveValue("");
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
  await page.evaluate(() => document.fonts.ready);
  const workspace = page.locator("[data-consumer-workspace]");
  await workspace.scrollIntoViewIfNeeded();
  await expect(workspace).toHaveScreenshot("consumer-workspace.png", {
    animations: "disabled",
    caret: "hide",
  });
});
