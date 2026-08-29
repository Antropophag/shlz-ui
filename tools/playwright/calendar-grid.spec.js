import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  inspectComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/calendar-grid.json",
    import.meta.url,
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/#calendar-grid-demo");
});

test("classifies semantic Calendar Grid occurrences and accessibility", async ({
  page,
}) => {
  const showcaseInventory = await inspectComponentOccurrences(page, manifest);
  expect(showcaseInventory.occurrences.sort()).toEqual([
    "calendar-grid-data-workspace",
    "calendar-grid-showcase-source",
  ]);
  expect(showcaseInventory.unclassifiedLegacy).toEqual([]);
  const grid = page.locator("#calendar-grid-demo .shlz-calendar-grid").first();
  await expect(
    grid.getByRole("table", { name: "Calendar Grid source and state matrix" }),
  ).toBeVisible();
  await expect(grid.getByRole("rowheader")).toHaveCount(2);
  await expect(grid.getByRole("columnheader")).toHaveCount(8);
  await expect(
    grid.getByRole("columnheader", { name: "August 2026" }),
  ).toHaveAttribute("scope", "colgroup");
  await expect(
    grid.getByRole("columnheader", { name: "31 Aug Unavailable · holiday" }),
  ).toBeVisible();
  const headers = await grid.locator("td").first().getAttribute("headers");
  expect(headers).toContain("showcase-grid-row-design");
  expect(headers).toContain("showcase-grid-date-0");
  const results = await new AxeBuilder({ page })
    .include("#calendar-grid-demo")
    .analyze();
  expect(results.violations).toEqual([]);

  await page.goto(fixtureUrl("calendar-grid.html"));
  const plainHtmlGrid = page.locator(
    "[data-component-audit-id='calendar-grid-plain-html']",
  );
  await expect(
    plainHtmlGrid.getByRole("table", { name: "Team delivery calendar" }),
  ).toBeVisible();
  await expect(
    plainHtmlGrid.getByRole("columnheader", { name: "August 2026" }),
  ).toHaveAttribute("scope", "colgroup");
  const plainHtmlInventory = await inspectComponentOccurrences(page, manifest);
  expect(plainHtmlInventory.occurrences).toEqual(["calendar-grid-plain-html"]);
  expect(plainHtmlInventory.unclassifiedLegacy).toEqual([]);
  expect(
    (
      await new AxeBuilder({ page })
        .include("[data-component-audit-id='calendar-grid-plain-html']")
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("cell and row disclosure are independent, typed, focus-safe and destroyable", async ({
  page,
}) => {
  const grid = page.locator(
    "[data-component-audit-id='calendar-grid-showcase-source']",
  );
  const cell = grid.getByRole("button", { name: "1 more" });
  const row = grid.getByRole("button", { name: "Engineering" });
  const rowDetails = grid.locator("#showcase-grid-engineering-details");
  await page.evaluate(() => {
    window.__calendarGridEvents = [];
    document.addEventListener("shlz:calendar-grid-disclosure", (event) =>
      window.__calendarGridEvents.push(event.detail),
    );
  });
  await cell.focus();
  await expect(cell).toHaveCSS("outline-style", "solid");
  await expect(cell).toHaveCSS("outline-width", "2px");
  await expect(grid.getByText("Resolve content stress")).toHaveCSS(
    "display",
    "none",
  );
  await cell.press("Enter");
  await expect(cell).toHaveAttribute("aria-expanded", "true");
  await expect(grid.getByText("Resolve content stress")).toBeVisible();
  await expect(grid.getByText("Resolve content stress")).toHaveCSS(
    "display",
    "list-item",
  );
  await expect(cell).toBeFocused();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(rowDetails).toHaveCSS("display", "block");
  await row.press("Space");
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await expect(rowDetails).toHaveCSS("display", "none");
  expect(await page.evaluate(() => window.__calendarGridEvents)).toEqual([
    { kind: "cell", id: "showcase-grid-overflow-2", expanded: true },
    { kind: "row", id: "showcase-grid-engineering-details", expanded: false },
  ]);
  await page.evaluate(() => window.__shlzCalendarGridControllers[0].destroy());
  await cell.click();
  await expect(cell).toHaveAttribute("aria-expanded", "true");
  await page.evaluate(() => {
    const grid = document.querySelector(
      "[data-component-audit-id='calendar-grid-showcase-source']",
    );
    const row = grid.querySelector("tbody tr");
    row.replaceWith(row.cloneNode(true));
    window.__shlzCalendarGridControllers = window.__shlzEnhanceCalendarGrids();
  });
  const rerenderedCell = grid.getByRole("button", { name: "1 more" });
  await expect(rerenderedCell).toHaveAttribute("aria-expanded", "true");
  await rerenderedCell.click();
  await expect(rerenderedCell).toHaveAttribute("aria-expanded", "false");
});

test("nested Calendar Grid disclosure is owned only by its nearest root", async ({
  page,
}) => {
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML = `<div data-shlz-calendar-grid id="outer-grid"><div data-shlz-calendar-grid id="inner-grid"><button type="button" data-shlz-calendar-grid-disclosure="cell" aria-controls="nested-grid-target" aria-expanded="false">Nested details</button><div id="nested-grid-target" hidden>Nested content</div></div></div>`;
    document.body.append(host);
    window.__nestedCalendarGridEvents = [];
    host.addEventListener("shlz:calendar-grid-disclosure", (event) =>
      window.__nestedCalendarGridEvents.push(event.detail),
    );
    window.__shlzEnhanceCalendarGrids(host);
  });
  const inner = page.locator("#inner-grid");
  const button = inner.getByRole("button", { name: "Nested details" });
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(inner.getByText("Nested content")).toBeVisible();
  expect(await page.evaluate(() => window.__nestedCalendarGridEvents)).toEqual([
    { kind: "cell", id: "nested-grid-target", expanded: true },
  ]);
});

test("contains two-axis overflow, sticky context, consumer actions and visual states", async ({
  page,
}) => {
  const grid = page.locator(
    "[data-component-audit-id='calendar-grid-showcase-source']",
  );
  const geometry = await grid.evaluate((element) => ({
    overflowX: globalThis.getComputedStyle(element).overflowX,
    overflowY: globalThis.getComputedStyle(element).overflowY,
    headerPosition: globalThis.getComputedStyle(
      element.querySelector("thead th"),
    ).position,
    rowPosition: globalThis.getComputedStyle(
      element.querySelector("[scope=row]"),
    ).position,
    secondHeaderOffset: globalThis.getComputedStyle(
      element.querySelector("thead tr:nth-child(2) th"),
    ).insetBlockStart,
    cornerInlineOffset: globalThis.getComputedStyle(
      element.querySelector("thead tr:first-child > th:first-child"),
    ).insetInlineStart,
    firstDateInlineOffset: globalThis.getComputedStyle(
      element.querySelector("thead tr:nth-child(2) th"),
    ).insetInlineStart,
    pageOverflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  expect(geometry).toEqual({
    overflowX: "auto",
    overflowY: "auto",
    headerPosition: "sticky",
    rowPosition: "sticky",
    secondHeaderOffset: "56px",
    cornerInlineOffset: "0px",
    firstDateInlineOffset: "auto",
    pageOverflow: 0,
  });
  const consumer = page.locator(
    "[data-component-audit-id='calendar-grid-data-workspace']",
  );
  await consumer.getByRole("button", { name: "Open item" }).click();
  await expect(page.locator("[data-calendar-consumer-status]")).toHaveText(
    "Application action handled by the consumer.",
  );
  await expect(grid).toHaveScreenshot("calendar-grid-source-matrix.png");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const scaled = await grid.evaluate((element) => ({
    pageOverflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    reachableInline: element.scrollWidth > element.clientWidth,
    reachableBlock: element.scrollHeight >= element.clientHeight,
  }));
  expect(scaled.pageOverflow).toBe(0);
  expect(scaled.reachableInline).toBe(true);
  expect(scaled.reachableBlock).toBe(true);
  await expect(grid).toHaveScreenshot("calendar-grid-narrow.png");
});

test("renders source-backed past, today and future header and column treatments", async ({
  page,
}) => {
  const grid = page.locator(
    "[data-component-audit-id='calendar-grid-showcase-source']",
  );
  const stateStyles = await grid.evaluate((element) => {
    const read = (node) => {
      const style = globalThis.getComputedStyle(node);
      const treatment = globalThis.getComputedStyle(node, "::before");
      const primary = node.querySelector(".shlz-calendar-grid__date-primary");
      const secondary = node.querySelector(
        ".shlz-calendar-grid__date-secondary",
      );
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderInlineEndColor: style.borderInlineEndColor,
        borderBlockEndColor: style.borderBlockEndColor,
        boxShadow: style.boxShadow,
        fontWeight: style.fontWeight,
        primaryWeight: primary
          ? globalThis.getComputedStyle(primary).fontWeight
          : null,
        secondaryColor: secondary
          ? globalThis.getComputedStyle(secondary).color
          : null,
        secondaryOpacity: secondary
          ? globalThis.getComputedStyle(secondary).opacity
          : null,
        treatmentBackground: treatment.backgroundColor,
        treatmentInsetBlockStart: treatment.insetBlockStart,
        treatmentInsetInlineStart: treatment.insetInlineStart,
        treatmentInsetInlineEnd: treatment.insetInlineEnd,
        treatmentStartStartRadius: treatment.borderStartStartRadius,
        treatmentStartEndRadius: treatment.borderStartEndRadius,
        treatmentEndStartRadius: treatment.borderEndStartRadius,
        treatmentEndEndRadius: treatment.borderEndEndRadius,
      };
    };
    return Object.fromEntries(
      ["past", "today", "future"].map((state) => {
        const header = element.querySelector(
          `thead [data-shlz-calendar-grid-state="${state}"]`,
        );
        const cells = [
          ...element.querySelectorAll(
            `tbody [data-shlz-calendar-grid-state="${state}"]`,
          ),
        ];
        return [
          state,
          { header: read(header), cells: cells.map((cell) => read(cell)) },
        ];
      }),
    );
  });

  const headerContracts = {
    past: {
      outer: "rgb(255, 255, 255)",
      text: "rgb(11, 22, 35)",
      inner: "rgb(238, 240, 244)",
      inlineInsets: ["1px", "4px"],
      radii: ["0px", "8px", "0px", "8px"],
    },
    today: {
      outer: "rgb(244, 246, 249)",
      text: "rgb(37, 61, 152)",
      inner: "rgba(61, 136, 222, 0.15)",
      inlineInsets: ["4px", "4px"],
      radii: ["8px", "8px", "8px", "8px"],
    },
    future: {
      outer: "rgb(255, 255, 255)",
      text: "rgb(11, 22, 35)",
      inner: "rgb(238, 240, 244)",
      inlineInsets: ["4px", "0px"],
      radii: ["8px", "0px", "8px", "0px"],
    },
  };
  for (const [state, contract] of Object.entries(headerContracts)) {
    const header = stateStyles[state].header;
    expect(header.backgroundColor).toBe(contract.outer);
    expect(header.color).toBe(contract.text);
    expect(header.secondaryColor).toBe(contract.text);
    expect(header.treatmentBackground).toBe(contract.inner);
    expect([
      header.treatmentInsetInlineStart,
      header.treatmentInsetInlineEnd,
    ]).toEqual(contract.inlineInsets);
    expect([
      header.treatmentStartStartRadius,
      header.treatmentStartEndRadius,
      header.treatmentEndStartRadius,
      header.treatmentEndEndRadius,
    ]).toEqual(contract.radii);
    expect(header.treatmentInsetBlockStart).toBe("4px");
    expect(header.borderInlineEndColor).toBe("rgb(209, 216, 223)");
    expect(header.borderBlockEndColor).toBe("rgb(209, 216, 223)");
    expect(header.boxShadow).toBe("none");
    expect(header.fontWeight).toBe("700");
    expect(header.primaryWeight).toBe("600");
    expect(header.secondaryOpacity).toBe("1");
  }
  for (const [state, backgroundColor] of [
    ["past", "rgb(255, 255, 255)"],
    ["today", "rgb(244, 246, 249)"],
    ["future", "rgb(255, 255, 255)"],
  ]) {
    expect(stateStyles[state].cells).toHaveLength(2);
    for (const style of stateStyles[state].cells) {
      expect(style.backgroundColor).toBe(backgroundColor);
      expect(style.color).toBe("rgb(11, 22, 35)");
      expect(style.borderInlineEndColor).toBe("rgb(209, 216, 223)");
      expect(style.borderBlockEndColor).toBe("rgb(209, 216, 223)");
      expect(style.boxShadow).toBe("none");
      expect(style.fontWeight).toBe("400");
    }
  }

  const unavailableStyles = await grid.evaluate((element) =>
    [
      ...element.querySelectorAll(
        '[data-shlz-calendar-grid-state="unavailable"]',
      ),
    ].map((node) => {
      const style = globalThis.getComputedStyle(node);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderInlineEndColor: style.borderInlineEndColor,
        borderBlockEndColor: style.borderBlockEndColor,
      };
    }),
  );
  expect(unavailableStyles).toHaveLength(6);
  for (const style of unavailableStyles) {
    expect(style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(style.backgroundImage).toContain("rgb(245, 245, 245)");
    expect(style.borderInlineEndColor).toBe("rgb(209, 216, 223)");
    expect(style.borderBlockEndColor).toBe("rgb(209, 216, 223)");
  }
});

test("representative bounded matrix remains within the documented non-virtualized budget", async ({
  page,
}) => {
  const duration = await page.evaluate(() => {
    const grid = document.querySelector(
      "[data-component-audit-id='calendar-grid-showcase-source']",
    );
    const body = grid.querySelector("tbody");
    const template = body.querySelector("tr");
    const start = globalThis.performance.now();
    for (let index = 0; index < 60; index += 1) {
      const row = template.cloneNode(true);
      row
        .querySelectorAll("[id], button")
        .forEach((element) => element.removeAttribute("id"));
      row.querySelectorAll("button").forEach((button) => button.remove());
      body.append(row);
    }
    void grid.getBoundingClientRect();
    return globalThis.performance.now() - start;
  });
  expect(duration).toBeLessThan(1000);
});
