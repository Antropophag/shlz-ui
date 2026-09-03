import { expect, test } from "@playwright/test";
import { textContrastEvidence } from "./text-contrast.js";

const expectAa = async (locator, label, pseudo = null) => {
  const evidence = await textContrastEvidence(locator, pseudo);
  expect(
    evidence.ratio,
    `${label}: ${evidence.color} on rgb(${evidence.background.join(" ")})`,
  ).toBeGreaterThanOrEqual(4.5);
  return evidence;
};

const expectOneAa = async (
  page,
  { id, selector, target, label, background, pseudo = null },
) => {
  const locator = page.locator(
    target ?? `[data-component-audit-id='${id}'] ${selector}`,
  );
  await expect(locator, `${label} must remain a closed-set member`).toHaveCount(
    1,
  );
  if (background)
    await expect(locator).toHaveCSS("background-color", background);
  await expectAa(locator, label, pseudo);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

test("active Field-family guidance and placeholders meet WCAG AA", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const labels = page.locator(
    ".shlz-field__label:visible, .shlz-field__message:visible, .shlz-field__counter:visible, .shlz-date-field__label:visible, .shlz-date-field__description:visible",
  );
  const labelCount = await labels.count();
  expect(labelCount).toBeGreaterThan(0);
  for (let index = 0; index < labelCount; index += 1) {
    const target = labels.nth(index);
    const disabled = await target.evaluate((element) =>
      Boolean(
        element
          .closest(".shlz-field, .shlz-date-field")
          ?.querySelector(":disabled"),
      ),
    );
    if (!disabled) await expectAa(target, `active Field guidance ${index + 1}`);
  }

  const nativePlaceholders = page.locator(
    ".shlz-input:visible:not(:disabled), .shlz-textarea:visible:not(:disabled), .shlz-date-field__input:visible:not(:disabled)",
  );
  const nativePlaceholderCount = await nativePlaceholders.count();
  for (let index = 0; index < nativePlaceholderCount; index += 1) {
    const target = nativePlaceholders.nth(index);
    if (await target.getAttribute("placeholder"))
      await expectAa(
        target,
        `active native placeholder ${index + 1}`,
        "::placeholder",
      );
  }

  const selectPlaceholders = page.locator(
    ".shlz-select__trigger:not(.shlz-select__trigger--selected):visible:not(:disabled)",
  );
  const selectPlaceholderCount = await selectPlaceholders.count();
  expect(selectPlaceholderCount).toBeGreaterThan(0);
  for (let index = 0; index < selectPlaceholderCount; index += 1)
    await expectAa(
      selectPlaceholders.nth(index),
      `active Select placeholder ${index + 1}`,
    );
});

test("supported backgrounds and material Field states form a closed contrast matrix", async ({
  page,
}) => {
  await page.locator("body").evaluate((body) => {
    const probe = body.ownerDocument.createElement("div");
    probe.dataset.accessibleContrastSurfaceMatrix = "";
    const surfaces = [
      ["white", "--shlz-source-color-white-white"],
      ["gray-50", "--shlz-source-color-gray-gray-50"],
      ["blue-50", "--shlz-source-color-blue-blue-50"],
      ["page", "--shlz-source-color-background-primary"],
    ];
    const roles = ["supporting-accessible", "placeholder-accessible"];
    probe.innerHTML = surfaces
      .flatMap(([name, token]) =>
        roles.map(
          (role) =>
            `<span data-contrast-surface="${name}" data-contrast-role="${role}" style="display:block;color:var(--shlz-semantic-color-text-${role});background:var(${token})">${name} ${role}</span>`,
        ),
      )
      .join("");
    body.append(probe);
  });

  const surfaceMatrix = [
    ["white", "rgb(255, 255, 255)"],
    ["gray-50", "rgb(245, 245, 245)"],
    ["blue-50", "rgb(238, 240, 244)"],
    ["page", "rgb(244, 246, 249)"],
  ];
  const roles = ["supporting-accessible", "placeholder-accessible"];
  for (const [name, background] of surfaceMatrix)
    for (const role of roles) {
      const locator = page.locator(
        `[data-contrast-surface='${name}'][data-contrast-role='${role}']`,
      );
      await expect(locator).toHaveCount(1);
      await expect(locator).toHaveCSS("background-color", background);
      await expectAa(locator, `${name} ${role} semantic surface`);
    }
  expect(surfaceMatrix.length * roles.length).toBe(8);

  const stateMatrix = [
    {
      id: "request-status-empty",
      selector: ".shlz-select__trigger",
      label: "Select default placeholder",
      background: "rgb(245, 245, 245)",
    },
    {
      id: "request-status-hover",
      selector: ".shlz-select__trigger",
      label: "Select hover placeholder",
      background: "rgb(238, 240, 244)",
    },
    {
      id: "request-status-focus",
      selector: ".shlz-select__trigger",
      label: "Select focus placeholder",
      background: "rgb(238, 240, 244)",
    },
    {
      id: "request-status-filled",
      selector: ".shlz-field__label",
      label: "Select filled-state label",
    },
    {
      target:
        "label:has([data-component-audit-id='textarea-error-empty']) .shlz-field__message",
      label: "Textarea invalid guidance",
    },
    {
      id: "input-workspace-search",
      selector: ".shlz-input",
      label: "Input consumer placeholder",
      pseudo: "::placeholder",
    },
    {
      id: "date-picker-calendar-showcase-source-large-default-empty-single",
      selector: ".shlz-date-field__label",
      label: "Date Field default label",
    },
    {
      id: "date-picker-calendar-showcase-source-large-hover-empty-single",
      selector: ".shlz-date-field__input",
      label: "Date Field hover placeholder",
      background: "rgba(0, 0, 0, 0)",
      pseudo: "::placeholder",
    },
    {
      id: "date-picker-calendar-showcase-source-large-focused-empty-single",
      selector: ".shlz-date-field__input",
      label: "Date Field focus placeholder",
      background: "rgba(0, 0, 0, 0)",
      pseudo: "::placeholder",
    },
  ];
  for (const member of stateMatrix) await expectOneAa(page, member);
  expect(stateMatrix).toHaveLength(9);
});

test("real consumers inherit accessible defaults and retain interaction", async ({
  page,
}) => {
  const search = page.locator(
    "[data-component-audit-id='input-workspace-search']",
  );
  await expectAa(search.locator(".shlz-field__label"), "workspace Input label");
  await expectAa(
    search.locator(".shlz-input"),
    "workspace Input placeholder",
    "::placeholder",
  );

  await page.getByRole("button", { name: /Фильтры/ }).click();
  const select = page.locator("[data-component-audit-id='workspace-status']");
  await expectAa(
    select.locator(".shlz-field__label"),
    "workspace Select label",
  );
  await expectAa(
    select.locator(".shlz-select__trigger"),
    "workspace Select placeholder",
  );
  await select.locator(".shlz-select__trigger").click();
  await expect(select.locator(".shlz-select__listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("dialog", { name: "Фильтры заявок" })
    .getByRole("button", { name: "Закрыть" })
    .click();

  await search.locator(".shlz-input").fill("Утечка");
  await expect(search.locator(".shlz-input")).toHaveValue("Утечка");

  const dateField = page.locator(
    "[data-component-audit-id='date-picker-calendar-showcase-form-consumer'] .shlz-date-field",
  );
  await expectAa(
    dateField.locator(".shlz-date-field__label"),
    "Date Picker consumer label",
  );
});

test("disabled Field text is measured separately from active thresholds", async ({
  page,
}) => {
  const disabledSelect = page.locator(
    "[data-component-audit-id='request-status-disabled'] .shlz-select__trigger",
  );
  await expect(disabledSelect).toBeDisabled();
  const evidence = await textContrastEvidence(disabledSelect);
  expect(evidence.ratio).toBeLessThan(4.5);
  expect(evidence.color).toBe("rgba(11, 22, 35, 0.1)");
});

test("compact Modal variants meet WCAG AA and still dismiss", async ({
  page,
}) => {
  for (const [name, trigger, dialogId] of [
    ["info", "Подтверждение", "showcase-confirm"],
    ["success", "success", "showcase-success"],
    ["warning", "warning", "showcase-warning"],
    ["error", "error", "showcase-error"],
  ]) {
    await page
      .getByRole("button", { name: trigger, exact: true })
      .evaluate((button) => button.click());
    const dialog = page.locator(`#${dialogId}`);
    await expect(dialog).toBeVisible();
    const copy = dialog.locator(".shlz-modal__compact-copy p");
    await expect(copy).toHaveCSS("color", "rgba(11, 22, 35, 0.6)");
    await expectAa(copy, `${name} Modal secondary copy`);
    await expect(dialog.locator(".shlz-modal__surface")).toHaveScreenshot(
      `accessible-${name}-modal.png`,
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
