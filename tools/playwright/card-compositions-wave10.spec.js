import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifests = await Promise.all(
  ["card-with-action", "report-card", "cover"].map((name) =>
    readComponentAuditManifest(
      new globalThis.URL(
        `../../docs/component-audits/${name}.json`,
        import.meta.url,
      ),
    ),
  ),
);
const manifestsByComponent = Object.fromEntries(
  manifests.map((manifest) => [manifest.component, manifest]),
);
const expectMaterialStates = (component) => {
  expect(
    manifestsByComponent[component].interactionEvidence.materialStates,
  ).toEqual([]);
};
test.beforeEach(async ({ page }) => page.goto("/"));

test("Wave 10 occurrences are classified and roots remain presentational", async ({
  page,
}) => {
  for (const manifest of manifests)
    await expectClassifiedComponentOccurrences(page, manifest);
  expectMaterialStates("card-with-action");
  expectMaterialStates("report-card");
  expectMaterialStates("cover");
  for (const selector of [
    ".shlz-card-with-action",
    ".shlz-report-card",
    ".shlz-cover",
  ])
    await expect(page.locator(selector).first()).not.toHaveAttribute(
      "tabindex",
      /.+/,
    );
  await expect(
    page.locator(
      "[data-component-audit-id='card-with-action-showcase-source'] .shlz-button",
    ),
  ).toBeVisible();
});

test("Wave 10 source-size and material variants retain computed geometry", async ({
  page,
}) => {
  const card = page.locator(
    "[data-component-audit-id='card-with-action-showcase-source']",
  );
  await expect(card).toHaveCSS("width", "314px");
  await expect(card).toHaveCSS("height", "230px");
  await expect(card).toHaveCSS("border-radius", "16px");
  await expect(card).toHaveScreenshot("card-with-action-source.png");
  await expect(
    page.locator("#report-card-demo .shlz-card-composition-grid"),
  ).toHaveScreenshot("report-card-variants.png");
  await expect(
    page.locator("[data-component-audit-id='cover-showcase-default']"),
  ).toHaveScreenshot("cover-default.png");
});

test("Wave 10 fluid variants contain long content at narrow width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1100 });
  const card = page.locator(
    "[data-component-audit-id='card-with-action-content-stress']",
  );
  const cover = page.locator(
    "[data-component-audit-id='cover-content-stress']",
  );
  await expect(card).toHaveScreenshot("card-with-action-narrow.png");
  await expect(cover).toHaveScreenshot("cover-narrow.png");
  for (const root of [card, cover])
    expect(
      await root.evaluate(
        (node) =>
          node.scrollWidth <= node.clientWidth &&
          node.scrollHeight <= node.clientHeight,
      ),
    ).toBe(true);
});

test("Report card is composed in the real Data Workspace consumer", async ({
  page,
}) => {
  const consumer = page.locator(
    "[data-component-audit-id='report-card-workspace-summary']",
  );
  await expect(consumer).toBeVisible();
  await expect(consumer).toHaveScreenshot("report-card-consumer.png");
});
