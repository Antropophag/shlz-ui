import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";

test.beforeEach(async ({ page }) => {
  await page.goto(fixtureUrl("calendar.html"));
});

test("Calendar exposes localized grid, month, and date states", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Календарь периода" });
  await expect(calendar).toBeVisible();
  await expect(calendar.getByRole("heading", { level: 2 })).toContainText(
    /август 2026/i,
  );
  await expect(calendar.getByRole("columnheader")).toHaveCount(7);
  await expect(calendar.getByRole("grid")).toHaveAttribute(
    "aria-labelledby",
    /.+/,
  );

  const enabledDays = calendar.locator(
    '[role="gridcell"] button:not(:disabled)',
  );
  await expect(enabledDays).toHaveCount(41);
  await expect(
    calendar.locator('[role="gridcell"] button:not(:disabled)[tabindex="0"]'),
  ).toHaveCount(1);
  await expect(
    calendar.getByRole("button", { name: /12 августа 2026/ }),
  ).toHaveAttribute("data-range-position", "start");
  await expect(
    calendar.getByRole("button", {
      name: /12 августа 2026.*начало диапазона/,
    }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    calendar.getByRole("button", { name: /13 августа 2026/ }),
  ).toHaveAttribute("data-in-range", "true");
  await expect(
    calendar.getByRole("button", { name: /15 августа 2026/ }),
  ).toHaveAttribute("data-range-position", "end");
  await expect(
    calendar.getByRole("button", { name: /20 августа 2026/ }),
  ).toHaveAttribute("aria-current", "date");
  await expect(
    calendar.getByRole("button", { name: /18 августа 2026/ }),
  ).toBeDisabled();
});

test("Calendar roving focus crosses months and selection matches pointer behavior", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Календарь периода" });
  const day12 = calendar.getByRole("button", { name: /12 августа 2026/ });
  await day12.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: /13 августа 2026/ }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    calendar.getByRole("button", { name: /16 августа 2026/ }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: /17 августа 2026/ }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: /19 августа 2026/ }),
  ).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(
    calendar.getByRole("button", { name: /19 сентября 2026/ }),
  ).toBeFocused();
  await expect(calendar.getByRole("heading", { level: 2 })).toContainText(
    /сентябрь 2026/i,
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-calendar-events]")).toHaveText(
    JSON.stringify({
      mode: "range",
      value: { start: "2026-08-12", end: "2026-08-15" },
      committed: false,
    }),
  );
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-calendar-events]")).toHaveText(
    JSON.stringify({
      mode: "range",
      value: { start: "2026-09-19", end: "2026-09-20" },
      committed: true,
    }),
  );
});

test("Calendar month controls expose bounds and preserve a single tab stop", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Календарь периода" });
  await calendar.getByRole("button", { name: "Предыдущий месяц" }).click();
  await expect(calendar.getByRole("heading", { level: 2 })).toContainText(
    /июль 2026/i,
  );
  await expect(
    calendar.getByRole("button", { name: "Предыдущий месяц" }),
  ).toBeDisabled();
  await expect(
    calendar.locator('[role="gridcell"] button:not(:disabled)[tabindex="0"]'),
  ).toHaveCount(1);
});
