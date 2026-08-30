import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fixtureUrl } from "./fixture-url.js";
import { inspectComponentOccurrences } from "./component-audit.js";

const manifests = new Map([
  [
    "message-thread",
    JSON.parse(
      await readFile("docs/component-audits/message-thread.json", "utf8"),
    ),
  ],
  [
    "history-timeline",
    JSON.parse(
      await readFile("docs/component-audits/history-timeline.json", "utf8"),
    ),
  ],
]);
const executedMaterialStates = new Set();
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedMaterialStates.add(`${component}:${state}`);
};
const expectMaterialStates = (component) =>
  expect(
    manifests
      .get(component)
      .interactionEvidence.materialStates.every((state) =>
        executedMaterialStates.has(`${component}:${state}`),
      ),
  ).toBe(true);

test.beforeEach(async ({ page }) => {
  await page.goto("/#message-thread-demo");
});

test("renders semantic Message Thread and History Timeline with native consumer actions", async ({
  page,
}) => {
  const thread = page.locator(
    "[data-component-audit-id='message-thread-showcase-source']",
  );
  const timeline = page.locator(
    "[data-component-audit-id='history-timeline-showcase-source']",
  );
  for (const component of ["message-thread", "history-timeline"]) {
    const inventory = await inspectComponentOccurrences(
      page,
      manifests.get(component),
    );
    expect(inventory.unclassifiedLegacy).toEqual([]);
    expect(inventory.occurrences).toHaveLength(3);
  }
  await expect(thread).toHaveAttribute("aria-label", "Project discussion");
  await expect(thread.locator(":scope > li")).toHaveCount(2);
  await expect(timeline.locator(".shlz-history-timeline__entry")).toHaveCount(
    2,
  );
  await verifyMaterialState("message-thread", "incoming", () =>
    expect(thread.locator('[data-direction="incoming"]')).toHaveCount(1),
  );
  await verifyMaterialState("message-thread", "outgoing", () =>
    expect(thread.locator('[data-direction="outgoing"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "period-group", () =>
    expect(timeline.locator(".shlz-history-timeline__period")).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "current", () =>
    expect(timeline.locator('[data-emphasis="current"]')).toHaveCount(1),
  );
  await page.getByRole("button", { name: "Открыть заявку" }).click();
  await expect(page.locator("[data-message-consumer-status]")).toContainText(
    "обработчиком приложения",
  );
  await page.getByRole("button", { name: "Открыть запись" }).click();
  await expect(page.locator("[data-history-consumer-status]")).toContainText(
    "обработчиком приложения",
  );
  const results = await new AxeBuilder({ page })
    .include("#message-thread-demo")
    .include("#history-timeline-demo")
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(thread).toHaveScreenshot("message-thread-source.png");
  await expect(timeline).toHaveScreenshot("history-timeline-source.png");
});

test("contains long content and reflows at a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addStyleTag({
    content: ".shlz-message-thread,.shlz-history-timeline{font-size:200%}",
  });
  const overflow = await page
    .locator("#message-thread-demo, #history-timeline-demo")
    .evaluateAll((roots) =>
      roots.some((root) => root.scrollWidth > root.clientWidth + 1),
    );
  expect(overflow).toBe(false);
  await expect(
    page.locator(".shlz-message-thread__bubble").first(),
  ).toBeVisible();
  await expect(
    page.locator(".shlz-history-timeline__marker").first(),
  ).toHaveCSS("width", "12px");
  await verifyMaterialState("message-thread", "narrow-layout", () =>
    expect(page.locator(".shlz-message-thread__bubble").first()).toBeVisible(),
  );
  await verifyMaterialState("message-thread", "incoming", () =>
    expect(
      page.locator(
        '[data-component-audit-id="message-thread-showcase-source"] [data-direction="incoming"]',
      ),
    ).toHaveCount(1),
  );
  await verifyMaterialState("message-thread", "outgoing", () =>
    expect(
      page.locator(
        '[data-component-audit-id="message-thread-showcase-source"] [data-direction="outgoing"]',
      ),
    ).toHaveCount(1),
  );
  await verifyMaterialState("message-thread", "text-scale", () =>
    expect(page.locator(".shlz-message-thread__author").first()).toBeVisible(),
  );
  await verifyMaterialState("history-timeline", "narrow-layout", () =>
    expect(
      page.locator(".shlz-history-timeline__content").first(),
    ).toBeVisible(),
  );
  await verifyMaterialState("history-timeline", "text-scale", () =>
    expect(page.locator(".shlz-history-timeline__actor").first()).toBeVisible(),
  );
  await verifyMaterialState("history-timeline", "period-group", () =>
    expect(
      page.locator(
        '[data-component-audit-id="history-timeline-showcase-source"] .shlz-history-timeline__period',
      ),
    ).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "current", () =>
    expect(
      page.locator(
        '[data-component-audit-id="history-timeline-showcase-source"] [data-emphasis="current"]',
      ),
    ).toHaveCount(1),
  );
  await expect(page.locator("[data-message-empty]")).toBeVisible();
  await expect(page.locator("[data-history-empty]")).toBeVisible();
  await expect(
    page.locator(".shlz-message-thread__item[data-grouped]"),
  ).toHaveCount(2);
  expectMaterialStates("message-thread");
  expectMaterialStates("history-timeline");
  await expect(
    page.locator('[data-component-audit-id="message-thread-showcase-source"]'),
  ).toHaveScreenshot("message-thread-narrow.png");
  await expect(
    page.locator(
      '[data-component-audit-id="history-timeline-showcase-source"]',
    ),
  ).toHaveScreenshot("history-timeline-narrow.png");
});

test("plain HTML fixture consumes the package without JavaScript", async ({
  page,
}) => {
  await page.goto(fixtureUrl("messaging-history-components.html"));
  await expect(page.getByRole("list", { name: "Messages" })).toBeVisible();
  await expect(page.getByRole("list", { name: "History" })).toBeVisible();
});
