import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  inspectComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";

const [dashboard, widget] = await Promise.all(
  ["dashboard", "chart-widget"].map((name) =>
    readComponentAuditManifest(
      new globalThis.URL(
        `../../docs/component-audits/${name}.json`,
        import.meta.url,
      ),
    ),
  ),
);
const manifestsByComponent = Object.fromEntries(
  [dashboard, widget].map((manifest) => [manifest.component, manifest]),
);
const expectMaterialStates = (component) =>
  expect(
    manifestsByComponent[component].interactionEvidence.materialStates,
  ).toEqual([]);
const showcaseOnly = (manifest) => ({
  ...manifest,
  occurrences: manifest.occurrences.filter(
    ({ id }) => !id.endsWith("-plain-html") && !id.endsWith("-source-fixture"),
  ),
});

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1#reporting-dashboard-demo");
  await page.locator(".shlz-docs-content").evaluate((content) => {
    const navigation = content.previousElementSibling;
    if (navigation instanceof globalThis.HTMLElement)
      navigation.style.visibility = "hidden";
  });
});

test("dashboard and chart-widget occurrences are classified and presentational", async ({
  page,
}) => {
  expectMaterialStates("dashboard");
  expectMaterialStates("chart-widget");
  await expectClassifiedComponentOccurrences(page, showcaseOnly(dashboard));
  await expectClassifiedComponentOccurrences(page, showcaseOnly(widget));
  for (const selector of [".shlz-dashboard", ".shlz-chart-widget"]) {
    for (const root of await page.locator(selector).all()) {
      await expect(root).not.toHaveAttribute("tabindex", /.+/);
      await expect(root).not.toHaveAttribute("onclick", /.+/);
      await expect(root).not.toHaveCSS("cursor", "pointer");
    }
  }
  const action = page.locator(
    "[data-component-audit-id='chart-widget-showcase-default'] .shlz-button--text",
  );
  await action.focus();
  await expect(action).toBeFocused();
});

test("source-critical widget surface geometry is protected", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='chart-widget-showcase-default']",
  );
  await expect(root).toHaveCSS("min-height", "515px");
  await expect(root).toHaveCSS("border-radius", "16px");
  await expect(root).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(root).toHaveCSS("padding", "32px");
  await expect(
    page.locator(
      "[data-component-audit-id='dashboard-showcase-default'] .shlz-dashboard__grid",
    ),
  ).toHaveCSS("gap", "16px");
});

test("isolated source widget retains exact 1304 by 515 geometry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 650 });
  await page.goto(fixtureUrl("reporting-dashboard.html"));
  const source = page.locator(
    "[data-component-audit-id='chart-widget-source-fixture']",
  );
  await expect(source).toHaveCSS("width", "1304px");
  await expect(source).toHaveCSS("height", "515px");
  await expect(source).toHaveCSS("border-radius", "16px");
  await expect(source).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(source).toHaveCSS("padding", "32px");
  const inventory = await inspectComponentOccurrences(page, {
    ...widget,
    occurrences: widget.occurrences.filter(
      ({ id }) => id === "chart-widget-source-fixture",
    ),
  });
  expect(inventory.occurrences).toEqual(["chart-widget-source-fixture"]);
});

test("narrow dashboard reflows and contains stressed content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const dashboardRoot = page.locator(
    "[data-component-audit-id='dashboard-showcase-default']",
  );
  const stress = page.locator(
    "[data-component-audit-id='chart-widget-content-stress']",
  );
  await expect(stress).toHaveCSS("padding", "20px");
  await expect(stress.locator(".shlz-chart-widget__actions")).toHaveCSS(
    "white-space",
    "nowrap",
  );
  expect(
    await stress
      .locator(".shlz-chart-widget__actions")
      .evaluate((element) => element.getBoundingClientRect().width),
  ).toBeGreaterThan(70);
  const geometry = await dashboardRoot.evaluate((element) => ({
    scroll: element.scrollWidth,
    client: element.clientWidth,
    columns: globalThis.getComputedStyle(
      element.querySelector(".shlz-dashboard__grid"),
    ).gridTemplateColumns,
  }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client);
  expect(geometry.columns.trim().split(/\s+/)).toHaveLength(1);
  await expect(stress).toHaveCSS("min-height", "420px");
});

test("reporting consumer keeps an accessible structure", async ({ page }) => {
  const consumer = page.locator(
    "[data-component-audit-id='dashboard-reporting-consumer']",
  );
  await expect(
    consumer.getByRole("heading", { name: "Сводка по обращениям" }),
  ).toBeVisible();
  await expect(
    consumer.getByRole("link", { name: "Открыть таблицу" }),
  ).toHaveAttribute("href", "#table-demo");
  const results = await new AxeBuilder({ page })
    .include("#reporting-dashboard-consumer")
    .analyze();
  expect(results.violations).toEqual([]);
});

test("plain HTML consumes the standalone dashboard contracts", async ({
  page,
}) => {
  await page.goto(fixtureUrl("plain-html.html"));
  const dashboardInventory = await inspectComponentOccurrences(page, {
    ...dashboard,
    occurrences: dashboard.occurrences.filter(
      ({ id }) => id === "dashboard-plain-html",
    ),
  });
  const widgetInventory = await inspectComponentOccurrences(page, {
    ...widget,
    occurrences: widget.occurrences.filter(
      ({ id }) => id === "chart-widget-plain-html",
    ),
  });
  expect(dashboardInventory.occurrences).toEqual(["dashboard-plain-html"]);
  expect(widgetInventory.occurrences).toEqual(["chart-widget-plain-html"]);
  await expect(
    page.locator("[data-component-audit-id='chart-widget-plain-html']"),
  ).toHaveCSS("border-radius", "16px");
});
