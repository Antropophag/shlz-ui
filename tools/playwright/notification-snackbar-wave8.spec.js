import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifests = {
  notification: await readComponentAuditManifest(
    new globalThis.URL(
      "../../docs/component-audits/notification.json",
      import.meta.url,
    ),
  ),
  snackbar: await readComponentAuditManifest(
    new globalThis.URL(
      "../../docs/component-audits/snackbar.json",
      import.meta.url,
    ),
  ),
};
const expectedContours = [
  "M32 46C41.3888 46 49 38.3888 49 29C49 19.6112 41.3888 12 32 12C22.6112 12 15 19.6112 15 29C15 38.3888 22.6112 46 32 46ZM32 49C43.0457 49 52 40.0457 52 29C52 17.9543 43.0457 9 32 9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49Z",
  "M49 29C49 38.3888 41.3888 46 32 46C22.6112 46 15 38.3888 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49C43.0457 49 52 40.0457 52 29C52 26.3477 51.4837 23.8161 50.5462 21.5L47.9109 23C48.6148 24.8658 49 26.8879 49 29Z",
  "M44.6402 44.5L42.955 42C39.9963 44.4958 36.1738 46 32 46C22.6112 46 15 38.3888 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49C36.7945 49 41.195 47.3129 44.6402 44.5Z",
  "M17.7171 43L20 41.0416C16.9114 37.9636 15 33.705 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 34.4509 14.1806 39.3925 17.7171 43Z",
  "M15.294 18L17.7171 19.7767C20.7454 15.0969 26.011 12 32 12V9C25.0179 9 18.8715 12.5778 15.294 18Z",
  "M31.2632 9.01332L31.4172 12.0098C31.6106 12.0033 31.8049 12 32 12V9C31.7533 9 31.5077 9.00447 31.2632 9.01332Z",
];
const executedStates = new Map([
  ["notification", new Set()],
  ["snackbar", new Set()],
]);
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedStates.get(component).add(state);
};
const expectMaterialStates = (component) => {
  expect([...executedStates.get(component)].sort()).toEqual(
    [...manifests[component].interactionEvidence.materialStates].sort(),
  );
};
const subset = (component, ids, diagnostics) => ({
  ...manifests[component],
  occurrences: manifests[component].occurrences.filter(({ id }) =>
    ids.includes(id),
  ),
  diagnosticOccurrenceCount: diagnostics,
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("independent occurrence guards classify Showcase, diagnostics and plain HTML", async ({
  page,
}) => {
  await expectClassifiedComponentOccurrences(
    page,
    subset(
      "notification",
      [
        "notification-showcase-dismissible",
        "notification-showcase-action",
        "notification-content-stress",
      ],
      6,
    ),
  );
  await expectClassifiedComponentOccurrences(
    page,
    subset(
      "snackbar",
      ["snackbar-showcase-action", "snackbar-content-stress"],
      7,
    ),
  );
  await page.goto(fixtureUrl("plain-html.html"));
  await expectClassifiedComponentOccurrences(
    page,
    subset("notification", ["notification-plain-html"], 0),
  );
});

test("occurrence guards reject an unclassified Notification and Snackbar", async ({
  page,
}) => {
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="shlz-notification">Unclassified</div><div class="shlz-notification shlz-snackbar">Unclassified</div>',
    );
  });
  const notification = await import("./component-audit.js").then(
    ({ inspectComponentOccurrences }) =>
      inspectComponentOccurrences(page, manifests.notification),
  );
  const snackbar = await import("./component-audit.js").then(
    ({ inspectComponentOccurrences }) =>
      inspectComponentOccurrences(page, manifests.snackbar),
  );
  expect(notification.unclassifiedLegacy).toHaveLength(1);
  expect(snackbar.unclassifiedLegacy).toHaveLength(1);
});

test("Notification exact source geometry, paint and application lifecycle execute", async ({
  page,
}) => {
  const fixture = page.locator("[data-notification-consumer]");
  const dismissible = fixture.locator(
    "[data-component-audit-id='notification-showcase-dismissible']",
  );
  const danger = fixture.locator(
    "[data-component-audit-id='notification-showcase-action']",
  );
  await expect(dismissible).toHaveCSS("width", "384px");
  await expect(dismissible).toHaveCSS("min-height", "58px");
  await expect(dismissible).toHaveCSS("border-radius", "29px");
  await expect(dismissible).toHaveCSS("background-color", "rgb(11, 22, 35)");
  await expect(danger).toHaveCSS("background-color", "rgb(204, 31, 31)");
  await verifyMaterialState("notification", "default", () =>
    expect(dismissible).toBeVisible(),
  );
  await verifyMaterialState("notification", "error", () =>
    expect(danger).toBeVisible(),
  );
  await verifyMaterialState("notification", "with-button", () =>
    expect(danger.getByRole("button")).toBeVisible(),
  );
  await expect(dismissible).toHaveScreenshot("notification-default.png");
  await expect(danger).toHaveScreenshot("notification-error-action.png");

  const close = dismissible.getByRole("button", {
    name: "Закрыть уведомление",
  });
  await close.focus();
  await expect(close).toBeFocused();
  await expect(close).toHaveCSS("outline-style", "solid");
  await verifyMaterialState("notification", "focus-visible", () =>
    expect(close).toBeFocused(),
  );
  await close.click();
  await expect(dismissible).toHaveCount(0);
  await expect(
    fixture.getByRole("button", { name: "Продолжить работу" }),
  ).toBeFocused();
});

test("Notification real native interaction and disabled states remain accessible", async ({
  page,
}) => {
  const action = page.locator(
    "[data-component-audit-id='notification-showcase-action'] .shlz-notification__action",
  );
  const base = await action.evaluate(
    (element) => globalThis.getComputedStyle(element).backgroundColor,
  );
  await action.hover();
  await expect(action).toHaveCSS("background-color", base);
  await verifyMaterialState("notification", "hover", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  const box = await action.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(action).toHaveCSS("background-color", base);
  await verifyMaterialState("notification", "active", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  await page.mouse.up();
  await action.press("Enter");
  await expect(page.locator("[data-notification-action-result]")).toHaveText(
    "Получено действие: retry-save",
  );

  const disabled = page.locator(
    "[data-component-audit-id='notification-content-stress'] button",
  );
  await expect(disabled).toBeDisabled();
  await verifyMaterialState("notification", "disabled", () =>
    expect(disabled).toBeDisabled(),
  );
  await disabled.evaluate((element) => element.focus());
  await expect(disabled).not.toBeFocused();
});

test("Snackbar preserves all six exact static contours without timer semantics", async ({
  page,
}) => {
  const fixture = page.locator("#fidelity-notification");
  const countdowns = fixture.locator(
    ".shlz-snackbar .shlz-notification__source-countdown",
  );
  await expect(countdowns).toHaveCount(6);
  expect(
    await countdowns.evaluateAll((items) =>
      items.map((item) => item.dataset.snackbarNumber),
    ),
  ).toEqual(["5", "4", "3", "2", "1", "0"]);
  expect(
    await countdowns
      .locator("path")
      .evaluateAll((paths) => paths.map((path) => path.getAttribute("d"))),
  ).toEqual(expectedContours);
  await verifyMaterialState("snackbar", "number-5", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='5']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("snackbar", "number-4", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='4']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("snackbar", "number-3", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='3']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("snackbar", "number-2", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='2']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("snackbar", "number-1", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='1']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("snackbar", "number-0", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='0']"),
    ).toHaveCount(1),
  );
  await page.waitForTimeout(1100);
  expect(
    await countdowns.evaluateAll((items) =>
      items.map((item) => item.dataset.snackbarNumber),
    ),
  ).toEqual(["5", "4", "3", "2", "1", "0"]);
  await page.locator(".shlz-verification-harness > summary").click();
  await expect(fixture.locator(".shlz-snackbar").first()).toHaveScreenshot(
    "snackbar-number-5.png",
  );
});

test("Snackbar real action states execute once and countdown stays decorative", async ({
  page,
}) => {
  const snackbar = page.locator(
    "[data-component-audit-id='snackbar-showcase-action']",
  );
  await expect(snackbar.locator("[data-snackbar-number]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const action = snackbar.getByRole("button", { name: "Отменить" });
  const base = await action.evaluate(
    (element) => globalThis.getComputedStyle(element).backgroundColor,
  );
  await action.hover();
  await expect(action).toHaveCSS("background-color", base);
  await verifyMaterialState("snackbar", "hover", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  const box = await action.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(action).toHaveCSS("background-color", base);
  await verifyMaterialState("snackbar", "active", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  await page.mouse.up();
  await action.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(action).toHaveCSS("outline-style", "solid");
  await verifyMaterialState("snackbar", "focus-visible", () =>
    expect(action).toBeFocused(),
  );
  await action.press("Space");
  await expect(page.locator("[data-notification-action-result]")).toHaveText(
    "Получено действие: undo-send",
  );
  const disabled = page.locator(
    "[data-component-audit-id='snackbar-content-stress'] button",
  );
  await expect(disabled).toBeDisabled();
  await verifyMaterialState("snackbar", "disabled", () =>
    expect(disabled).toBeDisabled(),
  );
});

test("Notification and Snackbar survive narrow, long and text-scaled content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const id of ["notification-content-stress", "snackbar-content-stress"]) {
    const root = page.locator(`[data-component-audit-id='${id}']`);
    await expect(root).toBeVisible();
    const metrics = await root.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      height: element.getBoundingClientRect().height,
      scrollWidth: element.scrollWidth,
      right: element.getBoundingClientRect().right,
    }));
    expect(metrics.width).toBeLessThanOrEqual(288);
    expect(metrics.height).toBeGreaterThan(58);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(Math.ceil(metrics.width));
    expect(metrics.right).toBeLessThanOrEqual(320);
    await expect(root).toHaveScreenshot(`${id}-narrow.png`);
  }
  await verifyMaterialState("notification", "long-content", () =>
    expect(
      page.locator("[data-component-audit-id='notification-content-stress']"),
    ).toBeVisible(),
  );
  await verifyMaterialState("notification", "narrow-layout", () =>
    expect(
      page.locator("[data-component-audit-id='notification-content-stress']"),
    ).toBeVisible(),
  );
  await verifyMaterialState("snackbar", "long-content", () =>
    expect(
      page.locator("[data-component-audit-id='snackbar-content-stress']"),
    ).toBeVisible(),
  );
  await verifyMaterialState("snackbar", "narrow-layout", () =>
    expect(
      page.locator("[data-component-audit-id='snackbar-content-stress']"),
    ).toBeVisible(),
  );
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  for (const id of ["notification-content-stress", "snackbar-content-stress"])
    expect(
      await page
        .locator(`[data-component-audit-id='${id}']`)
        .evaluate(
          (element) =>
            element.scrollWidth <=
            Math.ceil(element.getBoundingClientRect().width),
        ),
    ).toBe(true);
  await verifyMaterialState("notification", "text-scale", () =>
    expect(
      page.locator("[data-component-audit-id='notification-content-stress']"),
    ).toBeVisible(),
  );
  await verifyMaterialState("snackbar", "text-scale", () =>
    expect(
      page.locator("[data-component-audit-id='snackbar-content-stress']"),
    ).toBeVisible(),
  );
  expectMaterialStates("notification");
  expectMaterialStates("snackbar");
});
