import { expect, test } from "@playwright/test";
import { readComponentAuditManifest } from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/date-picker-calendar.json",
    import.meta.url,
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/#date-picker-demo");
});

test("Showcase renders and classifies every Date Picker fixture", async ({
  page,
}) => {
  const showcase = page.locator("#date-picker-demo");
  await expect(
    showcase.locator("[data-date-picker-source-variant]"),
  ).toHaveCount(20);
  await expect(showcase.locator("[data-date-picker-scenario]")).toHaveCount(9);

  const actualIds = await showcase
    .locator("[data-component-audit-id^='date-picker-calendar-showcase-']")
    .evaluateAll((roots) => roots.map((root) => root.dataset.componentAuditId));
  const expectedIds = manifest.occurrences
    .filter(
      ({ id, kind }) =>
        id.startsWith("date-picker-calendar-showcase-") &&
        kind === "executable-fixture",
    )
    .map(({ id }) => id);
  expect([...actualIds].sort()).toEqual([...expectedIds].sort());
  expect(new Set(actualIds).size).toBe(29);
});

test("Showcase stress fixtures exercise invalid, constrained, locale and responsive states", async ({
  page,
}) => {
  const invalid = page.locator('[data-date-picker-scenario="invalid-input"]');
  await expect(
    invalid.getByRole("textbox", { name: "Дата проверки" }),
  ).toHaveValue("31.02.2026");
  await expect(
    invalid.getByRole("textbox", { name: "Дата проверки" }),
  ).toHaveAttribute("aria-invalid", "true");

  const constrained = page.locator('[data-date-picker-scenario="constraints"]');
  await constrained.getByRole("button", { name: /Открыть календарь/ }).click();
  await expect(
    constrained.getByRole("button", { name: /18 августа 2026/ }),
  ).toBeDisabled();

  const locale = page.locator('[data-date-picker-scenario="locale"]');
  await expect(
    locale.getByRole("textbox", { name: "Realisierungsüberprüfungsdatum" }),
  ).toHaveValue("05.09.2026");

  const wide = page.locator('[data-date-picker-scenario="two-month"]');
  await wide
    .locator(".shlz-date-field")
    .first()
    .getByRole("button", { name: /Открыть календарь/ })
    .click();
  await expect(wide.locator(".shlz-calendar__month")).toHaveCount(2);

  const narrow = page.locator('[data-date-picker-scenario="narrow"]');
  await narrow
    .locator(".shlz-date-field")
    .first()
    .getByRole("button", { name: /Открыть календарь/ })
    .click();
  await expect(narrow.locator(".shlz-calendar__month:visible")).toHaveCount(1);
  const overflow = await narrow.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
