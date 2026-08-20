import { expect, test } from "@playwright/test";
import { URL } from "node:url";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifests = Object.fromEntries(
  await Promise.all(
    ["input", "textarea", "checkbox", "radio", "switch"].map(
      async (component) => [
        component,
        await readComponentAuditManifest(
          new URL(
            `../../docs/component-audits/${component}.json`,
            import.meta.url,
          ),
        ),
      ],
    ),
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("all Wave 2 executable and live roots are classified", async ({
  page,
}) => {
  for (const manifest of Object.values(manifests))
    await expectClassifiedComponentOccurrences(page, manifest);
  expect(Object.keys(manifests)).toHaveLength(5);
});

test("Input keeps native value, events, focus, disabled and programmatic updates", async ({
  page,
}) => {
  const input = page.locator("[data-workspace-search]");
  await input.evaluate((element) => {
    window.__inputEvents = { input: 0, change: 0 };
    element.addEventListener("input", () => window.__inputEvents.input++);
    element.addEventListener("change", () => window.__inputEvents.change++);
  });
  await expect(input).toHaveAccessibleName("Поиск по заявкам");
  await input.focus();
  await expect(input).toBeFocused();
  await input.fill("SD-2418");
  await expect(input).toHaveValue("SD-2418");
  await expect(page.locator("[data-workspace-result-count]")).toHaveText("1");
  await input.press("Tab");
  await expect
    .poll(() => page.evaluate(() => window.__inputEvents))
    .toEqual({
      input: 1,
      change: 1,
    });
  await input.evaluate((element) => {
    element.value = "programmatic";
  });
  await expect(input).toHaveValue("programmatic");
  expect(await page.evaluate(() => window.__inputEvents)).toEqual({
    input: 1,
    change: 1,
  });
  await input.evaluate((element) => {
    element.disabled = true;
  });
  await expect(input).toBeDisabled();
});

test("Textarea remains native and relates error text without a library controller", async ({
  page,
}) => {
  const textarea = page.locator(
    "[data-component-audit-id='textarea-error-filled']",
  );
  const message = page.locator(
    "label:has([data-component-audit-id='textarea-error-filled']) .shlz-field__message",
  );
  await expect(textarea).toHaveAttribute("aria-invalid", "true");
  await expect(textarea).toHaveAttribute(
    "aria-describedby",
    "textarea-error-filled-message",
  );
  await expect(message).toHaveAttribute("id", "textarea-error-filled-message");
  await expect(message).toHaveText("Error message");
  await textarea.fill(
    "Первая строка\nSecond line\nОчень длинное содержимое ".repeat(8),
  );
  await expect(textarea).toHaveValue(/Первая строка/);
});

test("Checkbox uses one native lifecycle for pointer, Space, mixed and workspace state", async ({
  page,
}) => {
  const checkbox = page.locator(
    "[data-component-audit-id='checkbox-medium-default']",
  );
  await checkbox.evaluate((element) => {
    window.__checkboxEvents = { input: 0, change: 0 };
    element.addEventListener("input", () => window.__checkboxEvents.input++);
    element.addEventListener("change", () => window.__checkboxEvents.change++);
  });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.press("Space");
  await expect(checkbox).not.toBeChecked();
  expect(await page.evaluate(() => window.__checkboxEvents)).toEqual({
    input: 2,
    change: 2,
  });
  await checkbox.evaluate((element) => {
    element.checked = true;
  });
  expect(await page.evaluate(() => window.__checkboxEvents)).toEqual({
    input: 2,
    change: 2,
  });
  await expect(
    page.locator("[data-component-audit-id='checkbox-medium-mixed']"),
  ).toHaveJSProperty("indeterminate", true);
  const disabled = page.locator(
    "[data-component-audit-id='checkbox-medium-disabled']",
  );
  await disabled.evaluate((element) => {
    window.__disabledCheckboxEvents = { input: 0, change: 0 };
    element.addEventListener(
      "input",
      () => window.__disabledCheckboxEvents.input++,
    );
    element.addEventListener(
      "change",
      () => window.__disabledCheckboxEvents.change++,
    );
    element.click();
  });
  await expect(disabled).toBeChecked();
  expect(await page.evaluate(() => window.__disabledCheckboxEvents)).toEqual({
    input: 0,
    change: 0,
  });

  await page
    .locator("[data-component-audit-id='checkbox-workspace-sd-2418']")
    .check();
  await expect(page.locator("[data-workspace-selected-count]")).toHaveText("1");
  await page.locator("[data-workspace-clear]").click();
  await expect(page.locator("[data-workspace-selected-count]")).toHaveText("0");
});

test("Radio group owns Tab, Arrow, Space, exclusion and exact events", async ({
  page,
}) => {
  const first = page.locator(
    "[data-component-audit-id='radio-framework-primary']",
  );
  const second = page.locator(
    "[data-component-audit-id='radio-framework-secondary']",
  );
  await first.evaluate((element) => {
    window.__radioEvents = { input: 0, change: 0 };
    for (const radio of element.form?.elements ||
      document.querySelectorAll("input")) {
      if (radio.name !== element.name) continue;
      radio.addEventListener("input", () => window.__radioEvents.input++);
      radio.addEventListener("change", () => window.__radioEvents.change++);
    }
  });
  await expect(first).toBeChecked();
  await page.locator(".shlz-composition .shlz-checkbox").focus();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await first.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toBeChecked();
  await expect(first).not.toBeChecked();
  expect(await page.evaluate(() => window.__radioEvents)).toEqual({
    input: 1,
    change: 1,
  });
  await first.evaluate((element) => {
    element.checked = true;
  });
  await expect(first).toBeChecked();
  await expect(second).not.toBeChecked();
  await second.focus();
  await second.press("Space");
  await expect(second).toBeChecked();
  await expect(first).not.toBeChecked();
  expect(await page.evaluate(() => window.__radioEvents)).toEqual({
    input: 2,
    change: 2,
  });
});

test("Switch owns exact events and rejects disabled interaction", async ({
  page,
}) => {
  const toggle = page.getByRole("switch", { name: "Настройка" });
  await toggle.evaluate((element) => {
    window.__switchEvents = { input: 0, change: 0 };
    element.addEventListener("input", () => window.__switchEvents.input++);
    element.addEventListener("change", () => window.__switchEvents.change++);
  });
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  expect(await page.evaluate(() => window.__switchEvents)).toEqual({
    input: 2,
    change: 2,
  });
  await toggle.evaluate((element) => {
    element.checked = true;
  });
  await expect(toggle).toBeChecked();
  expect(await page.evaluate(() => window.__switchEvents)).toEqual({
    input: 2,
    change: 2,
  });
  const disabled = page.locator(
    "[data-component-audit-id='switch-labelled-disabled']",
  );
  await expect(disabled).toBeDisabled();
  await disabled.evaluate((element) => {
    window.__disabledSwitchEvents = { input: 0, change: 0 };
    element.addEventListener(
      "input",
      () => window.__disabledSwitchEvents.input++,
    );
    element.addEventListener(
      "change",
      () => window.__disabledSwitchEvents.change++,
    );
    element.click();
  });
  await expect(disabled).not.toBeChecked();
  await disabled.focus();
  await expect(disabled).not.toBeFocused();
  expect(await page.evaluate(() => window.__disabledSwitchEvents)).toEqual({
    input: 0,
    change: 0,
  });
});

for (const [component, selector, name, focusSelector] of [
  [
    "input",
    "#input-demo > section:has(h4:text-is('States'))",
    "input-focused-states.png",
  ],
  [
    "textarea",
    "#textarea-demo > section:has(h4:text-is('States'))",
    "textarea-focused-states.png",
  ],
  [
    "checkbox",
    "#checkbox-demo > section:has(h4:text-is('Medium'))",
    "checkbox-focused-states.png",
    "[data-component-audit-id='checkbox-medium-default']",
  ],
  ["radio", ".shlz-composition .shlz-demo-fieldset", "radio-focused-group.png"],
  [
    "switch",
    "#switch-demo > section[data-shlz-switch-source-matrix]",
    "switch-focused-states.png",
  ],
]) {
  test(`${component} focused representative visual`, async ({ page }) => {
    const target = page.locator(selector);
    await target.scrollIntoViewIfNeeded();
    if (focusSelector) await page.locator(focusSelector).focus();
    await expect(target).toHaveScreenshot(name, { animations: "disabled" });
  });
}

test("Wave 2 controls contain long content in a narrow Fira subtree", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.locator("#typography-compatibility").evaluate((element) => {
    element.dataset.shlzFont = "fira";
  });
  const input = page.locator(
    "[data-component-audit-id='input-typography-stress']",
  );
  await expect(input).toHaveValue("Щербинский лифтостроительный завод");
  const containment = await input.evaluate((element) => {
    const field = element.closest(".shlz-field");
    const rect = field.getBoundingClientRect();
    return {
      fieldWidth: rect.width,
      fieldRight: rect.right,
      viewportWidth: window.innerWidth,
      inputScrollWidth: element.scrollWidth,
      inputClientWidth: element.clientWidth,
    };
  });
  expect(containment.fieldWidth).toBeLessThanOrEqual(containment.viewportWidth);
  expect(containment.fieldRight).toBeLessThanOrEqual(containment.viewportWidth);
  expect(containment.inputClientWidth).toBeLessThanOrEqual(
    containment.fieldWidth,
  );
});
