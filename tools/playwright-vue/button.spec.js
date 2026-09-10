import { test, expect } from "@playwright/test";
import {
  readComponentAuditManifest,
  expectClassifiedComponentOccurrences,
} from "../playwright/component-audit.js";

import { textContrastEvidence } from "../playwright/text-contrast.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/vue-button.json",
    import.meta.url,
  ),
);
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.consumerHydrated);
});

test("SSR DOM survives hydration and application lifecycle dispatches once", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await page.waitForFunction(() => window.consumerHydrated);
  expect(
    await page.evaluate(
      () => window.serverButton === document.querySelector("#reactive-button"),
    ),
  ).toBe(true);
  const button = page.getByRole("button", { name: "Run action", exact: true });
  await button.click();
  await expect(button).toHaveText("Actions: 1");
  await button.press("Enter");
  await expect(button).toHaveText("Actions: 2");
  await button.press("Space");
  await expect(button).toHaveText("Actions: 3");
  await button.evaluate((node) => node.click());
  await expect(button).toHaveText("Actions: 4");
  await page.getByRole("button", { name: "Change variant" }).click();
  await expect(button).toHaveClass(/shlz-button--primary/);
  await expect(button).toHaveAttribute("data-command-state", "primary");
  expect(
    await page.evaluate(
      () => window.serverButton === document.querySelector("#reactive-button"),
    ),
  ).toBe(true);
  await expect(button).toHaveClass(/consumer-class/);
  await expect(button).toHaveAttribute("style", /vertical-align/);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Toggle mount" }).click();
    await expect(button).toHaveCount(0);
    await page.getByRole("button", { name: "Toggle mount" }).click();
  }
  await button.click();
  await expect(button).toHaveText("Actions: 5");
  await page.getByRole("button", { name: "Focus action" }).click();
  await expect(button).toBeFocused();
  expect(errors).toEqual([]);
});

test("native forms and disabled behavior", async ({ page }) => {
  const button = page.locator("#reactive-button");
  await button.click();
  await expect(page.locator("#submissions")).toHaveText("Submissions: 0");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.getByRole("button", { name: "External submit" }).click();
  await expect(page.locator("#submissions")).toHaveText("Submissions: 2");
  await expect(
    page.getByRole("button", { name: "External submit" }),
  ).toHaveAttribute("name", "command");
  await expect(
    page.getByRole("button", { name: "External submit" }),
  ).toHaveAttribute("value", "external");
  await page.getByRole("textbox", { name: "Draft" }).fill("Edited");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Draft" })).toHaveValue(
    "Initial",
  );
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(button).toBeDisabled();
  const disabledBounds = await button.boundingBox();
  await page.mouse.click(
    disabledBounds.x + disabledBounds.width / 2,
    disabledBounds.y + disabledBounds.height / 2,
  );
  await button.evaluate((node) => node.click());
  await page.getByRole("textbox", { name: "Draft" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Submit", exact: true }),
  ).toBeFocused();
  await button.evaluate((node) => node.focus());
  await expect(button).not.toBeFocused();
  await expect(button).toHaveText("Actions: 1");
});

test("classified occurrences, source sizes, icons and narrow content", async ({
  page,
}) => {
  const inventory = await expectClassifiedComponentOccurrences(page, manifest);
  console.log("Vue Button observed census", JSON.stringify(inventory));
  for (const variant of ["neutral", "primary", "text"])
    for (const [size, height] of [
      ["md", 40],
      ["sm", 32],
      ["xs", 26],
    ]) {
      await expect(page.locator(`[data-case='${variant}-${size}']`)).toHaveCSS(
        "min-height",
        `${height}px`,
      );
    }
  for (const [name, size] of [
    ["Add", 32],
    ["Add large", 40],
  ]) {
    const icon = page.getByRole("button", { name, exact: true });
    await expect(icon).toHaveAccessibleName(name);
    const bounds = await icon.boundingBox();
    expect(bounds.height).toBe(size);
    expect(bounds.width).toBe(size);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  const long = page.locator("#long-label");
  expect((await long.boundingBox()).width).toBeLessThanOrEqual(180);
  expect(
    await long.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  for (const id of ["leading-icon", "trailing-icon"])
    await expect(page.locator(`#${id} img`)).toHaveCount(1);
});

test("real visual states retain authoritative Button paints", async ({
  page,
}) => {
  for (const variant of ["neutral", "primary", "text"]) {
    const button = page.locator(`[data-case='${variant}-md']`);
    await page.mouse.move(0, 0);
    await expect(button).toHaveCSS(
      "background-color",
      variant === "primary"
        ? "rgb(37, 61, 152)"
        : variant === "text"
          ? "rgb(255, 255, 255)"
          : "rgb(238, 240, 244)",
    );
    await button.hover();
    await expect(button).toHaveCSS(
      "background-color",
      variant === "primary" ? "rgb(66, 91, 166)" : "rgb(238, 240, 244)",
    );
    await expect(button).toHaveCSS(
      "color",
      variant === "primary" ? "rgb(255, 255, 255)" : "rgb(37, 61, 152)",
    );
    await page.mouse.down();
    await expect(button).toHaveCSS(
      "background-color",
      variant === "primary" ? "rgb(22, 39, 115)" : "rgb(223, 226, 240)",
    );
    await expect(button).toHaveCSS(
      "color",
      variant === "primary" ? "rgb(255, 255, 255)" : "rgb(22, 39, 115)",
    );
    expect((await textContrastEvidence(button)).ratio).toBeGreaterThanOrEqual(
      4.5,
    );
    await page.mouse.up();
    await button.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
    await button.evaluate((node) => {
      node.disabled = true;
    });
    await expect(button).toHaveCSS(
      "background-color",
      variant === "primary"
        ? "rgb(115, 131, 190)"
        : variant === "text"
          ? "rgb(255, 255, 255)"
          : "rgb(238, 240, 244)",
    );
    await expect(button).toHaveCSS(
      "color",
      variant === "primary" ? "rgb(255, 255, 255)" : "rgb(147, 156, 165)",
    );
  }
});

test("unsupported icon-only xs is normalized during SSR, hydration and reactive updates", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?iconSizeProbe=1");
  await page.waitForFunction(() => window.consumerHydrated);
  const button = page.locator("#reactive-button");
  await expect(button).toHaveClass(/shlz-button--sm/);
  await expect(button).toHaveClass(/shlz-button--icon/);
  await expect(button).not.toHaveClass(/shlz-button--xs/);
  await expect(button).toHaveCSS("min-height", "32px");
  await expect(button).toHaveAccessibleName("Run action");
  for (const [props, height, iconOnly] of [
    [{ size: "md" }, 40, true],
    [{ size: "xs" }, 32, true],
    [{ iconOnly: false }, 26, false],
    [{ iconOnly: true }, 32, true],
  ]) {
    await page.evaluate((next) => window.setButtonPresentation(next), props);
    await expect(button).toHaveCSS("min-height", `${height}px`);
    expect(
      await button.evaluate((node) =>
        node.classList.contains("shlz-button--icon"),
      ),
    ).toBe(iconOnly);
    expect(
      await page.locator(".shlz-button--xs.shlz-button--icon").count(),
    ).toBe(0);
    expect(
      await page.evaluate(
        () =>
          window.serverButton === document.querySelector("#reactive-button"),
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
