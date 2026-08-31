import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  inspectComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";
import { expectStablePreexistingShowcaseScreenshot } from "./visual-harness.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/calendar-grid.json",
    import.meta.url,
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/#calendar-grid-demo");
});

test("exposes temporal colgroups above independent date headers with source geometry", async ({
  page,
}) => {
  const grid = page.locator(
    "[data-component-audit-id='calendar-grid-showcase-source']",
  );
  const table = grid.getByRole("table", {
    name: "Calendar Grid source and state matrix",
  });
  const groups = table.locator(
    'thead tr[data-shlz-calendar-grid-header-row="temporal"] > th[scope="colgroup"]',
  );

  await expect(groups).toHaveCount(3);
  await expect(groups.nth(0)).toHaveAccessibleName("Past");
  await expect(groups.nth(0)).toHaveAttribute("colspan", "1");
  await expect(groups.nth(1)).toHaveAccessibleName("Today");
  await expect(groups.nth(1)).toHaveAttribute("colspan", "1");
  await expect(groups.nth(2)).toHaveAccessibleName("Future");
  await expect(groups.nth(2)).toHaveAttribute("colspan", "3");

  const dateHeaders = table.locator(
    'thead tr[data-shlz-calendar-grid-header-row="dates"] > th[scope="col"]',
  );
  await expect(dateHeaders).toHaveCount(5);
  const dateNames = [
    "28 Aug Friday",
    "29 Aug Saturday · unavailable weekend",
    "30 Aug Sunday · unavailable weekend",
    "31 Aug Monday · unavailable holiday",
    "1 Sep Tuesday",
  ];
  for (const [index, name] of dateNames.entries()) {
    await expect(dateHeaders.nth(index)).toHaveAccessibleName(name);
  }
  for (const temporalName of ["Past", "Today", "Future"]) {
    await expect(
      dateHeaders.filter({ hasText: new RegExp(temporalName, "i") }),
    ).toHaveCount(0);
  }

  await expectStablePreexistingShowcaseScreenshot(
    page,
    table.locator("thead"),
    "calendar-grid-header-rows.png",
  );

  const geometry = await table.evaluate((element) => {
    const boxes = (selector) =>
      [...element.querySelectorAll(selector)].map((node) => {
        const box = node.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      });
    const groupBoxes = boxes(
      'thead tr[data-shlz-calendar-grid-header-row="temporal"] > th[scope="colgroup"]',
    );
    const dateBoxes = boxes(
      'thead tr[data-shlz-calendar-grid-header-row="dates"] > th[scope="col"]',
    );
    const todayCells = boxes('tbody [data-shlz-calendar-grid-state="today"]');
    const todayTreatment = globalThis.getComputedStyle(
      element.querySelector(
        'thead [scope="colgroup"][data-shlz-calendar-grid-state="today"]',
      ),
      "::before",
    );
    return {
      groupBoxes,
      dateBoxes,
      todayCells,
      todayInset: [
        todayTreatment.insetBlockStart,
        todayTreatment.insetInlineEnd,
        todayTreatment.insetBlockEnd,
        todayTreatment.insetInlineStart,
      ],
      todayRadius: todayTreatment.borderRadius,
    };
  });
  expect(geometry.groupBoxes.map(({ width }) => width)).toEqual(
    geometry.dateBoxes
      .map(({ width }) => width)
      .map((width, index, all) =>
        index < 2
          ? width
          : index === 2
            ? all.slice(2).reduce((sum, value) => sum + value, 0)
            : undefined,
      )
      .filter((width) => width !== undefined),
  );
  expect(geometry.groupBoxes.map(({ left }) => left)).toEqual([
    geometry.dateBoxes[0].left,
    geometry.dateBoxes[1].left,
    geometry.dateBoxes[2].left,
  ]);
  expect(geometry.groupBoxes.at(-1).right).toBe(
    geometry.dateBoxes.at(-1).right,
  );
  expect(geometry.todayCells).toHaveLength(2);
  for (const box of geometry.todayCells) {
    expect(box.left).toBe(geometry.dateBoxes[1].left);
    expect(box.right).toBe(geometry.dateBoxes[1].right);
  }
  expect(geometry.todayInset).toEqual(["4px", "4px", "4px", "4px"]);
  expect(geometry.todayRadius).toBe("8px");
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
  await expect(grid.getByRole("columnheader")).toHaveCount(9);
  await expect(
    grid.getByRole("columnheader", { name: "Future" }),
  ).toHaveAttribute("colspan", "3");
  await expect(
    grid.getByRole("columnheader", {
      name: "31 Aug Monday · unavailable holiday",
    }),
  ).toBeVisible();
  const headers = await grid.locator("td").first().getAttribute("headers");
  expect(headers).toContain("showcase-grid-row-design");
  expect(headers).toContain("showcase-grid-group-past");
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
    plainHtmlGrid.getByRole("columnheader", { name: "Future" }),
  ).toHaveAttribute("colspan", "3");
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
  await expectStablePreexistingShowcaseScreenshot(
    page,
    grid,
    "calendar-grid-source-matrix.png",
  );
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
      const group = node.querySelector(".shlz-calendar-grid__group-label");
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
        groupWeight: group
          ? globalThis.getComputedStyle(group).fontWeight
          : null,
        treatmentBackground: treatment.backgroundColor,
        treatmentInsetBlockStart: treatment.insetBlockStart,
        treatmentInsetBlockEnd: treatment.insetBlockEnd,
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
    expect(header.secondaryColor).toBeNull();
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
    expect(header.treatmentInsetBlockEnd).toBe("4px");
    expect(header.borderInlineEndColor).toBe("rgb(209, 216, 223)");
    expect(header.borderBlockEndColor).toBe("rgb(209, 216, 223)");
    expect(header.boxShadow).toBe("none");
    expect(header.fontWeight).toBe("700");
    expect(header.primaryWeight).toBeNull();
    expect(header.secondaryOpacity).toBeNull();
    expect(header.groupWeight).toBe("700");
  }
  for (const [state, backgroundColor] of [
    ["past", "rgb(255, 255, 255)"],
    ["today", "rgb(244, 246, 249)"],
    ["future", "rgb(255, 255, 255)"],
  ]) {
    expect(stateStyles[state].cells).toHaveLength(state === "future" ? 6 : 2);
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
    [...element.querySelectorAll("[data-shlz-calendar-grid-unavailable]")].map(
      (node) => {
        const style = globalThis.getComputedStyle(node);
        return {
          tagName: node.tagName,
          state: node.getAttribute("data-shlz-calendar-grid-state"),
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          borderInlineEndColor: style.borderInlineEndColor,
          borderBlockEndColor: style.borderBlockEndColor,
        };
      },
    ),
  );
  expect(unavailableStyles).toHaveLength(9);
  for (const style of unavailableStyles) {
    expect(style.backgroundColor).toBe(
      style.state === "today" ? "rgb(244, 246, 249)" : "rgb(255, 255, 255)",
    );
    expect(
      style,
      `${style.tagName} ${style.state} keeps unavailable hatch`,
    ).toMatchObject({
      backgroundImage: expect.stringContaining("rgb(245, 245, 245)"),
    });
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
