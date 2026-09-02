import { expect, test } from "@playwright/test";

const contrastEvidence = (locator, pseudo = null) =>
  locator.evaluate((element, pseudoElement) => {
    const rgba = (value) => {
      const channels = value.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3)
        throw new Error(`Not RGB: ${value}`);
      return [channels[0], channels[1], channels[2], channels[3] ?? 1];
    };
    const composite = (foreground, background) => {
      const [red, green, blue, alpha] = rgba(foreground);
      return [
        red * alpha + background[0] * (1 - alpha),
        green * alpha + background[1] * (1 - alpha),
        blue * alpha + background[2] * (1 - alpha),
      ];
    };
    const luminance = (channels) => {
      const linear = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };

    const style = window.getComputedStyle(element, pseudoElement);
    const backgrounds = [];
    let current = element;
    while (current) {
      backgrounds.push(window.getComputedStyle(current).backgroundColor);
      current = current.parentElement;
    }
    const background = backgrounds
      .reverse()
      .reduce((paint, layer) => composite(layer, paint), [255, 255, 255]);
    const foreground = composite(style.color, background);
    const luminances = [luminance(foreground), luminance(background)].sort(
      (left, right) => right - left,
    );
    return {
      color: style.color,
      background,
      ratio: (luminances[0] + 0.05) / (luminances[1] + 0.05),
    };
  }, pseudo);

const expectAa = async (locator, label, pseudo = null) => {
  const evidence = await contrastEvidence(locator, pseudo);
  expect(
    evidence.ratio,
    `${label}: ${evidence.color} on rgb(${evidence.background.join(" ")})`,
  ).toBeGreaterThanOrEqual(4.5);
  return evidence;
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
  const evidence = await contrastEvidence(disabledSelect);
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
    const copy =
      name === "info"
        ? dialog.locator(".shlz-modal__body p")
        : dialog.locator(".shlz-modal__compact-copy p");
    await expectAa(copy, `${name} Modal secondary copy`);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
