import { expect, test } from "@playwright/test";

const componentIds = [
  "button-demo",
  "input-demo",
  "textarea-demo",
  "checkbox-demo",
  "radio-demo",
  "switch-demo",
  "status-demo",
  "badge-demo",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("primary component documentation fits a desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1440);

  for (const id of componentIds) {
    const component = page.locator(`#${id}`);
    await expect(component).toBeVisible();
    expect(
      await component.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
      `${id} must not require horizontal scrolling`,
    ).toBe(true);
  }
});

test("choice controls preserve source geometry and native state", async ({
  page,
}) => {
  const checkbox = page.locator("#checkbox-demo .shlz-checkbox").first();
  await expect(checkbox).toHaveCSS("width", "20px");
  await expect(checkbox).toHaveCSS("height", "20px");

  const smallCheckbox = page
    .locator("#checkbox-demo .shlz-checkbox--sm")
    .first();
  await expect(smallCheckbox).toHaveCSS("width", "16px");
  await expect(smallCheckbox).toHaveCSS("height", "16px");

  const indeterminate = page
    .locator("#checkbox-demo [data-shlz-indeterminate]")
    .first();
  expect(await indeterminate.evaluate((input) => input.indeterminate)).toBe(
    true,
  );

  const selectedRadio = page.locator("#radio-demo .shlz-radio:checked").first();
  await expect(selectedRadio).toBeChecked();
  await expect(selectedRadio).toHaveCSS("width", "20px");
  await expect(selectedRadio).toHaveCSS("height", "20px");

  const mediumSwitch = page
    .locator("#switch-demo .shlz-switch__input:not(.shlz-switch__input--sm)")
    .first();
  await expect(mediumSwitch).toHaveCSS("width", "38px");
  await expect(mediumSwitch).toHaveCSS("height", "20px");

  const smallSwitch = page
    .locator("#switch-demo .shlz-switch__input--sm")
    .first();
  await expect(smallSwitch).toHaveCSS("width", "24px");
  await expect(smallSwitch).toHaveCSS("height", "14px");

  await expect(
    page.locator("#switch-demo .shlz-switch__input:checked").first(),
  ).toBeChecked();
  await expect(
    page.locator("#switch-demo .shlz-switch__input:disabled").first(),
  ).toBeDisabled();
});

test("status, badge, and diagnostics expose the source-backed contracts", async ({
  page,
}) => {
  await expect(page.locator("#status-demo .shlz-status").first()).toHaveCSS(
    "height",
    "30px",
  );
  await expect(page.locator("#status-demo .shlz-status").first()).toHaveCSS(
    "white-space",
    "nowrap",
  );
  const neutralStatus = page
    .locator("#status-demo .shlz-status--neutral")
    .first();
  await expect(neutralStatus).toHaveCSS("color", "rgb(147, 156, 165)");
  await expect(neutralStatus).toHaveCSS(
    "background-color",
    "rgb(245, 245, 245)",
  );
  await expect(page.locator("#badge-demo .shlz-badge").first()).toHaveCSS(
    "height",
    "16px",
  );
  await expect(page.locator("#badge-demo .shlz-badge--lg").first()).toHaveCSS(
    "height",
    "23px",
  );
  await expect(page.locator("#badge-demo .shlz-badge-dot").first()).toHaveCSS(
    "width",
    "10px",
  );

  for (const id of [
    "checkbox-demo",
    "radio-demo",
    "switch-demo",
    "status-demo",
    "badge-demo",
  ]) {
    const diagnostics = page.locator(
      `#${id} > details.shlz-component-diagnostics`,
    );
    await expect(diagnostics).toHaveCount(1);
    await diagnostics.locator(":scope > summary").click();
    await expect(
      diagnostics.locator("details.shlz-source-inventory"),
    ).toHaveCount(1);
    await expect(
      diagnostics.locator(".shlz-choice-comparison").first(),
    ).toBeVisible();
  }
});
