import { expect, test } from "@playwright/test";
import { URL } from "node:url";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const auditManifest = await readComponentAuditManifest(
  new URL("../../docs/component-audits/select.json", import.meta.url),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

test("every executable Showcase Select uses the reusable contract", async ({
  page,
}) => {
  const inventory = await expectClassifiedComponentOccurrences(
    page,
    auditManifest,
  );
  expect(inventory.diagnosticLegacy).toBeGreaterThan(0);
});

const productionField = (page, label) =>
  page
    .locator("#select-demo [data-select-production-fixtures] .shlz-field")
    .filter({ hasText: label });

test("Select trigger and chevron match the source-backed size and paint contract", async ({
  page,
}) => {
  const placeholder = productionField(page, "Статус заявки").first();
  const hover = productionField(page, "Наведение");
  const focus = productionField(page, "Фокус");
  const disabled = productionField(page, "Недоступно");
  const medium = productionField(page, "Компактный размер");

  await expect(placeholder).toHaveCSS("width", "250px");
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "height",
    "40px",
  );
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "border-radius",
    "20px",
  );
  await expect(placeholder.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 245)",
  );
  await expect(placeholder.locator(".shlz-field__label")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(placeholder.locator(".shlz-field__label")).toHaveCSS(
    "line-height",
    "15px",
  );
  await expect(placeholder.locator(".shlz-select__trigger")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(placeholder.locator(".shlz-select__trigger")).toHaveCSS(
    "line-height",
    "18px",
  );
  await expect(placeholder.locator(".shlz-select__trigger")).toHaveCSS(
    "color",
    "rgba(11, 22, 35, 0.25)",
  );

  await expect(hover.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(238, 240, 244)",
  );
  await expect(focus.locator(".shlz-field__control")).toHaveCSS(
    "border-color",
    "rgb(37, 61, 152)",
  );
  await expect(focus.locator(".shlz-field__control")).toHaveCSS(
    "background-color",
    "rgb(238, 240, 244)",
  );
  await expect(disabled.locator(".shlz-field__control")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(disabled.locator(".shlz-field__label")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(disabled.locator(".shlz-select__trigger")).toHaveCSS(
    "color",
    "rgba(11, 22, 35, 0.1)",
  );
  await expect(medium.locator(".shlz-field__control")).toHaveCSS(
    "height",
    "32px",
  );
  await expect(medium.locator(".shlz-field__control")).toHaveCSS(
    "border-radius",
    "16px",
  );

  const trailingGeometry = await placeholder.evaluate((field) => {
    const control = field.querySelector(".shlz-field__control");
    const value = field.querySelector("[data-shlz-select-value]");
    const label = field.querySelector(".shlz-field__label");
    const indicator = field.querySelector(".shlz-select__chevron");
    const controlBox = control.getBoundingClientRect();
    const valueBox = value.getBoundingClientRect();
    const labelBox = label.getBoundingClientRect();
    const indicatorBox = indicator.getBoundingClientRect();
    return {
      labelGap: Math.round(controlBox.top - labelBox.bottom),
      textInset: Math.round(valueBox.left - controlBox.left),
      textCenterOffset: Math.round(
        (valueBox.top + valueBox.bottom - controlBox.top - controlBox.bottom) /
          2,
      ),
      rightInset: Math.round(controlBox.right - indicatorBox.right),
      indicatorWidth: Math.round(indicatorBox.width),
    };
  });
  expect(trailingGeometry).toEqual({
    labelGap: 8,
    textInset: 12,
    textCenterOffset: 0,
    rightInset: 8,
    indicatorWidth: 24,
  });

  const mediumTextGeometry = await medium.evaluate((field) => {
    const control = field.querySelector(".shlz-select__trigger");
    const value = field.querySelector("[data-shlz-select-value]");
    const controlBox = control.getBoundingClientRect();
    const valueBox = value.getBoundingClientRect();
    return {
      textInset: Math.round(valueBox.left - controlBox.left),
      textCenterOffset: Math.round(
        (valueBox.top + valueBox.bottom - controlBox.top - controlBox.bottom) /
          2,
      ),
    };
  });
  expect(mediumTextGeometry).toEqual({ textInset: 12, textCenterOffset: 0 });
});

test("selected and long Select values keep source text paint and one-line placement", async ({
  page,
}) => {
  const selected = productionField(page, "Статус заявки").nth(1);
  await expect(selected.locator(".shlz-select__trigger")).toHaveCSS(
    "color",
    "rgb(11, 22, 35)",
  );

  const typography = page.locator(
    "#typography-compatibility [data-shlz-select]",
  );
  const geometry = await typography.evaluate((field) => {
    const trigger = field.querySelector(".shlz-select__trigger");
    const value = field.querySelector("[data-shlz-select-value]");
    const triggerBox = trigger.getBoundingClientRect();
    const valueBox = value.getBoundingClientRect();
    const style = window.getComputedStyle(value);
    return {
      height: Math.round(valueBox.height),
      textInset: Math.round(valueBox.left - triggerBox.left),
      overflow: style.overflow,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
    };
  });
  expect(geometry).toEqual({
    height: 18,
    textInset: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });
});

test("opened Select uses the SHLZ surface and emits one value change", async ({
  page,
}) => {
  const production = page.locator(
    "#select-demo [data-select-production-fixtures]",
  );
  const sourceDiagnostics = page.locator(
    "#select-demo [data-select-source-fixtures]",
  );
  const root = production.locator("[data-shlz-select]").first();
  const trigger = root.locator(".shlz-select__trigger");
  const input = root.locator('input[type="hidden"]');
  await input.evaluate((element) => {
    window.__selectFixtureChanges = [];
    element.addEventListener("change", () => {
      window.__selectFixtureChanges.push(element.value);
    });
  });

  await expect(sourceDiagnostics).not.toHaveAttribute("open", "");
  await expect(sourceDiagnostics.locator(".shlz-component-grid")).toBeHidden();
  await page.evaluate(() => {
    window.__shlzEnhanceSelects();
    window.__shlzEnhanceSelects();
  });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(root.locator(".shlz-select__listbox")).toBeVisible();
  await expect(root.locator(".shlz-select__listbox")).toHaveCSS(
    "border-radius",
    "12px",
  );
  await expect(root.locator(".shlz-select__listbox")).toHaveCSS(
    "padding-top",
    "10px",
  );
  await expect(root.locator(".shlz-select__option").first()).toHaveCSS(
    "min-height",
    "40px",
  );
  await expect(root.locator(".shlz-select__option").first()).toHaveCSS(
    "padding-left",
    "16px",
  );
  await expect(root.locator(".shlz-select__chevron")).toHaveCSS(
    "transform",
    "matrix(-1, 0, 0, -1, 0, 0)",
  );
  await root.locator('[role="option"][data-value="В работе"]').click();
  expect(await page.evaluate(() => window.__selectFixtureChanges)).toEqual([
    "В работе",
  ]);
  await expect(input).toHaveValue("В работе");
  await expect(trigger).toContainText("В работе");
  await expect(trigger).toBeFocused();
  await expect(root.locator(".shlz-select__listbox")).toBeHidden();
});

test("Select keyboard lifecycle opens, navigates, selects and restores focus", async ({
  page,
}) => {
  const root = page.locator("#select-demo [data-shlz-select]").first();
  const trigger = root.locator(".shlz-select__trigger");
  await trigger.focus();
  await page.keyboard.press("ArrowUp");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(root.locator('[role="option"]').last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(root.locator('[role="option"]').nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.locator('input[type="hidden"]')).toHaveValue("Новая");
  await expect(trigger).toBeFocused();
  await page.keyboard.press(" ");
  await expect(root.locator('[role="option"]').first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(" ");
  await expect(root.locator('input[type="hidden"]')).toHaveValue("В работе");
  await expect(trigger).toBeFocused();
});

test("outside dismissal, Tab, disabled options and multiple instances remain safe", async ({
  page,
}) => {
  const roots = page.locator(
    "#select-demo [data-select-production-fixtures] [data-shlz-select]",
  );
  const first = roots.nth(0);
  const second = roots.nth(1);
  const firstTrigger = first.locator(".shlz-select__trigger");
  const secondTrigger = second.locator(".shlz-select__trigger");

  await firstTrigger.click();
  await secondTrigger.click();
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
  await page.locator("#select-demo h3").click();
  await expect(secondTrigger).toHaveAttribute("aria-expanded", "false");

  await firstTrigger.click();
  await page.keyboard.press("Escape");
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(firstTrigger).toBeFocused();

  await firstTrigger.click();
  await page.keyboard.press("Tab");
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(secondTrigger).toBeFocused();

  const disabledTrigger = roots.nth(4).locator(".shlz-select__trigger");
  await disabledTrigger.evaluate((element) => element.click());
  await expect(disabledTrigger).toHaveAttribute("aria-expanded", "false");

  await firstTrigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(secondTrigger).toBeFocused();

  await page.getByRole("button", { name: /Фильтры/ }).click();
  const workspace = page.locator("#workspace-filter-drawer [data-shlz-select]");
  const workspaceTrigger = workspace.locator(".shlz-select__trigger");
  const disabled = workspace.getByRole("option", { name: "Архивная" });
  await workspaceTrigger.click();
  await expect(disabled).toHaveAttribute("tabindex", "-1");
  await disabled.evaluate((element) => element.click());
  await expect(workspace.locator('input[type="hidden"]')).toHaveValue("");
  await expect(workspaceTrigger).toHaveAttribute("aria-expanded", "true");
  await disabled.focus();
  await page.keyboard.press("ArrowUp");
  await expect(
    workspace.getByRole("option", { name: "Требует внимания" }),
  ).toBeFocused();
  await disabled.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    workspace.getByRole("option", { name: "Все статусы" }),
  ).toBeFocused();
});

test("events, setValue, teardown and ARIA relationship integrity are deterministic", async ({
  page,
}) => {
  const root = page.locator('[data-component-audit-id="request-status-empty"]');
  const trigger = root.locator(".shlz-select__trigger");
  const input = root.locator('input[type="hidden"]');
  await input.evaluate((element) => {
    window.__selectEvents = [];
    for (const type of ["input", "change"])
      element.addEventListener(type, (event) => {
        window.__selectEvents.push({
          type: event.type,
          bubbles: event.bubbles,
          targetMatches: event.target === element,
        });
      });
  });
  await page.evaluate(() => {
    const controller = window.__shlzSelectControllers.find(
      ({ root }) => root.dataset.componentAuditId === "request-status-empty",
    );
    controller.setValue("В работе", { emit: true });
  });
  expect(await page.evaluate(() => window.__selectEvents)).toEqual([
    { type: "input", bubbles: true, targetMatches: true },
    { type: "change", bubbles: true, targetMatches: true },
  ]);
  await expect(input).toHaveValue("В работе");
  await expect(trigger).toContainText("В работе");

  await trigger.click();
  await page.evaluate(() => {
    const controller = window.__shlzSelectControllers.find(
      ({ root }) => root.dataset.componentAuditId === "request-status-empty",
    );
    controller.destroy();
  });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.evaluate(() => window.__shlzEnhanceSelects());
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const duplicateError = await page.evaluate(() => {
    const original = document.querySelector(
      '[data-component-audit-id="request-status-filled"]',
    );
    const host = document.createElement("div");
    host.append(original.cloneNode(true));
    document.body.append(host);
    try {
      window.__shlzEnhanceSelects(host);
      return null;
    } catch (error) {
      return error.message;
    } finally {
      host.remove();
    }
  });
  expect(duplicateError).toContain("globally unique ARIA relationship IDs");
});

test("closed Select remains contained on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 240, height: 700 });
  const field = productionField(page, "Статус заявки").first();
  const containment = await field.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      viewport: document.documentElement.clientWidth,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });
  expect(containment.left).toBeGreaterThanOrEqual(0);
  expect(containment.right).toBeLessThanOrEqual(containment.viewport);
  expect(containment.scrollWidth).toBe(containment.clientWidth);
});
