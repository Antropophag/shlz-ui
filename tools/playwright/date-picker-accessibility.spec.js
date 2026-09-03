import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const executedMaterialStates = new Set();
const verifyMaterialState = (component, state) => {
  expect(component).toBe("date-picker-calendar");
  executedMaterialStates.add(state);
};
const materialStateGroups = [
  ["calendar-focus", "calendar-range-selection"].sort(),
  ["picker-committed", "picker-dismissed", "picker-open"].sort(),
];
const expectMaterialStates = (component) => {
  expect(component).toBe("date-picker-calendar");
  expect(materialStateGroups).toContainEqual(
    [...executedMaterialStates].sort(),
  );
};

test.beforeEach(() => executedMaterialStates.clear());

async function expectNoAccessibilityViolations(page, include) {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(wcagTags)
    .analyze();

  expect(results.violations).toEqual([]);
}

test("standalone Calendar passes automated accessibility checks and keyboard state transitions", async ({
  page,
}) => {
  await page.goto(fixtureUrl("calendar.html"));

  const calendar = page.getByRole("region", { name: "Календарь периода" });
  await expectNoAccessibilityViolations(page, "[data-calendar-fixture]");

  const selectedStart = calendar.getByRole("button", {
    name: /12 августа 2026.*начало диапазона/,
  });
  await selectedStart.focus();
  await expect(selectedStart).toBeFocused();
  await expect(selectedStart).toHaveCSS("outline-style", "solid");
  verifyMaterialState("date-picker-calendar", "calendar-focus");

  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: /13 августа 2026/ }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: /19 августа 2026/ }),
  ).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(
    calendar
      .getByRole("button", {
        name: /19 августа 2026.*начало диапазона/,
      })
      .locator(".."),
  ).toHaveAttribute("aria-selected", "true");
  verifyMaterialState("date-picker-calendar", "calendar-range-selection");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(
    calendar
      .getByRole("button", {
        name: /20 августа 2026.*конец диапазона/,
      })
      .locator(".."),
  ).toHaveAttribute("aria-selected", "true");
  expectMaterialStates("date-picker-calendar");
});

test("Date Picker passes automated accessibility checks and restores focus after keyboard dismissal and commit", async ({
  page,
}) => {
  await page.goto(fixtureUrl("date-picker.html"));

  const picker = page.locator("[data-single-picker]");
  const trigger = picker.getByRole("button", {
    name: "Открыть календарь для поля «Дата поездки»",
  });
  await trigger.focus();
  await expect(trigger).not.toHaveCSS("outline-style", "none");
  await trigger.press("Enter");

  const surface = picker.locator("[data-shlz-popover]");
  await expect(surface).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    surface.getByRole("button", { name: /12 августа 2026/ }),
  ).toBeFocused();
  await expectNoAccessibilityViolations(page, "[data-single-picker]");
  verifyMaterialState("date-picker-calendar", "picker-open");

  await page.keyboard.press("Escape");
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  verifyMaterialState("date-picker-calendar", "picker-dismissed");

  await trigger.press("Space");
  await expect(surface).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(
    picker.getByRole("textbox", { name: "Дата поездки" }),
  ).toHaveValue("13.08.2026");
  verifyMaterialState("date-picker-calendar", "picker-committed");
  expectMaterialStates("date-picker-calendar");
});
