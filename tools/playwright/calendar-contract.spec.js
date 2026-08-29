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
    calendar
      .getByRole("button", {
        name: /12 августа 2026.*начало диапазона/,
      })
      .locator(".."),
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

test("adjacent enabled fallback remains the grid keyboard entry point", async ({
  page,
}) => {
  await page.evaluate(() =>
    window.__calendarController.setConstraints({
      min: "2026-09-01",
      max: "2026-09-30",
    }),
  );
  await expect(
    page.locator('.shlz-calendar__day:not([disabled])[tabindex="0"]'),
  ).toHaveCount(1);
  await expect(page.locator('button[data-date="2026-09-01"]')).toHaveAttribute(
    "tabindex",
    "0",
  );
});

test("Calendar source states have observable surface and cell styling", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Календарь периода" });
  await expect(calendar).toHaveCSS("width", "280px");
  await expect(calendar).toHaveCSS("background-color", "rgb(255, 255, 255)");

  const start = calendar.getByRole("button", { name: /12 августа 2026/ });
  const middle = calendar.getByRole("button", { name: /13 августа 2026/ });
  const end = calendar.getByRole("button", { name: /15 августа 2026/ });
  const today = calendar.getByRole("button", { name: /20 августа 2026/ });
  const disabled = calendar.getByRole("button", { name: /18 августа 2026/ });
  const outside = calendar.locator('[data-date="2026-07-27"]');

  await expect(start).toHaveCSS("width", "30px");
  await expect(start).toHaveCSS("background-color", "rgb(37, 61, 152)");
  await expect(middle).toHaveCSS("background-color", "rgb(238, 240, 244)");
  await expect(end).toHaveCSS("background-color", "rgb(37, 61, 152)");
  await expect(today).toHaveCSS("color", "rgb(37, 61, 152)");
  await expect(disabled).toHaveCSS("cursor", "not-allowed");
  await expect(outside).toHaveCSS("opacity", "0.65");

  await today.hover();
  await expect(today).toHaveCSS("background-color", "rgb(245, 245, 245)");
  await today.focus();
  await expect(today).toHaveCSS("outline-style", "solid");
  await expect(calendar).toHaveScreenshot("calendar-range-states.png");
});

test("explicit two-month Calendar collapses at the documented width without overflow", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (const [name, width] of [
      ["wide", 600],
      ["narrow", 320],
    ]) {
      const container = document.createElement("div");
      container.dataset[`${name}Calendar`] = "";
      container.style.width = `${width}px`;
      document.body.append(container);
      const host = document.createElement("div");
      container.append(host);
      new window.__calendarController.constructor(host, {
        mode: "single",
        visibleMonth: "2026-08",
        monthCount: 2,
        locale: name === "wide" ? "en-US" : "de-DE",
        label: `${name} calendar`,
      });
    }
  });

  const wide = page.getByRole("region", { name: "wide calendar" });
  const narrow = page.getByRole("region", { name: "narrow calendar" });
  await expect(wide.getByRole("heading", { level: 2 })).toHaveCount(2);
  await expect(wide.getByRole("heading", { level: 2 }).nth(0)).toContainText(
    /august 2026/i,
  );
  await expect(wide.getByRole("heading", { level: 2 }).nth(1)).toContainText(
    /september 2026/i,
  );
  await expect(narrow.getByRole("heading", { level: 2 })).toHaveCount(1);
  await expect(
    narrow.locator('button[data-month-delta="1"]:visible'),
  ).toHaveCount(1);
  expect(
    await narrow
      .getByRole("heading", { level: 2 })
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(
    await page.locator("[data-narrow-calendar]").evaluate((element) => ({
      own: element.scrollWidth,
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    })),
  ).toMatchObject({ own: 320, page: 1280, viewport: 1280 });
});
