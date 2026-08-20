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
  await expect(input).toHaveAccessibleName("Поиск по заявкам");
  await input.focus();
  await expect(input).toBeFocused();
  await input.fill("SD-2418");
  await expect(input).toHaveValue("SD-2418");
  await expect(page.locator("[data-workspace-result-count]")).toHaveText("1");
  await input.evaluate((element) => {
    element.value = "programmatic";
  });
  await expect(input).toHaveValue("programmatic");
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
  await textarea.evaluate((element) => {
    const message = element
      .closest("label")
      .querySelector(".shlz-field__message");
    message.id = "textarea-audit-error";
    element.setAttribute("aria-describedby", message.id);
  });
  await expect(textarea).toHaveAttribute("aria-invalid", "true");
  await expect(textarea).toHaveAttribute(
    "aria-describedby",
    "textarea-audit-error",
  );
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
  let changes = 0;
  await checkbox.evaluate((element) =>
    element.addEventListener("change", () => window.__checkboxChanges++),
  );
  await page.evaluate(() => {
    window.__checkboxChanges = 0;
  });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.press("Space");
  await expect(checkbox).not.toBeChecked();
  changes = await page.evaluate(() => window.__checkboxChanges);
  expect(changes).toBe(2);
  await expect(
    page.locator("[data-component-audit-id='checkbox-medium-mixed']"),
  ).toHaveJSProperty("indeterminate", true);

  await page
    .locator("[data-component-audit-id='checkbox-workspace-sd-2418']")
    .check();
  await expect(page.locator("[data-workspace-selected-count]")).toHaveText("1");
  await page.locator("[data-workspace-clear]").click();
  await expect(page.locator("[data-workspace-selected-count]")).toHaveText("0");
});

test("Radio group owns exclusion, Arrow navigation and one change", async ({
  page,
}) => {
  const first = page.locator(
    "[data-component-audit-id='radio-framework-primary']",
  );
  const second = page.locator(
    "[data-component-audit-id='radio-framework-secondary']",
  );
  await expect(first).toBeChecked();
  await first.focus();
  await first.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toBeChecked();
  await expect(first).not.toBeChecked();
  await second.evaluate((element) => {
    element.checked = false;
  });
  await expect(second).not.toBeChecked();
});

test("Switch exposes native checked state through role=switch", async ({
  page,
}) => {
  const toggle = page.getByRole("switch", { name: "Настройка" });
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toBeChecked();
  await toggle.evaluate((element) => {
    element.checked = false;
  });
  await expect(toggle).not.toBeChecked();
  await expect(
    page.locator("[data-component-audit-id='switch-labelled-disabled']"),
  ).toBeDisabled();
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
