import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("showcase primitives keep their visual contract", async ({ page }) => {
  await expect(page.locator("#components")).toHaveScreenshot(
    "showcase-components.png",
  );
});

test("source specification and fidelity surfaces are reviewable", async ({
  page,
}) => {
  await expect(page.locator("#source-spec")).toHaveScreenshot(
    "showcase-source-spec.png",
  );
  await expect(page.locator("#fidelity-button")).toHaveScreenshot(
    "showcase-fidelity.png",
  );
  await expect(page.locator("body")).toHaveCSS(
    "font-family",
    /system-ui|-apple-system|Segoe UI/,
  );
});

test("keyboard focus is visible", async ({ page }) => {
  const primary = page
    .getByRole("button", { name: "Создать", exact: true })
    .first();
  await primary.focus();
  await expect(primary).toBeFocused();
  await expect(primary).toHaveCSS("outline-style", "solid");
  expect(
    await primary.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
});

test("native checked and disabled states remain browser-owned", async ({
  page,
}) => {
  const checkbox = page.getByRole("checkbox", { name: "Unchecked" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();

  const disabledCheckbox = page.getByRole("checkbox", { name: "Disabled" });
  await expect(disabledCheckbox).toBeDisabled();
  await disabledCheckbox.evaluate((element) => element.click());
  await expect(disabledCheckbox).not.toBeChecked();

  const disabledButton = page
    .getByRole("button", { name: "Недоступно" })
    .first();
  await expect(disabledButton).toBeDisabled();
});
