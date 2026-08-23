import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
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
const sourceSnackbarFrames = await Promise.all(
  Array.from({ length: 6 }, async (_, index) => {
    const source = await readFile(
      new globalThis.URL(
        `../../apps/showcase/generated/source-references/snackbar-${index + 1}.svg`,
        import.meta.url,
      ),
      "utf8",
    );
    const [, contour] = source.match(
      /<path fill-rule="evenodd" clip-rule="evenodd" d="([^"]+)" fill="white"\/>/,
    );
    return { contour, number: String(5 - index) };
  }),
);
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
  await expect(
    page.locator("[data-component-audit-id^='notification-']"),
  ).toHaveCount(3);
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
  await page.locator(".shlz-verification-harness > summary").click();
  const withButton = page
    .locator("#fidelity-notification .shlz-notification-matrix")
    .locator(":scope > .shlz-notification")
    .nth(2);
  await expect(withButton).toHaveCSS("background-color", "rgb(11, 22, 35)");
  await expect(
    withButton.locator("button", { hasText: "Удалить" }),
  ).toBeVisible();
  await verifyMaterialState("notification", "with-button", () =>
    expect(withButton).toBeVisible(),
  );
  await expect(dismissible).toHaveScreenshot("notification-default.png");
  await expect(danger).toHaveScreenshot("notification-error-action.png");

  const close = dismissible.getByRole("button", {
    name: "Закрыть уведомление",
  });
  await close.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
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
  ).toEqual(sourceSnackbarFrames.map(({ contour }) => contour));
  const frameEvidence = await countdowns.evaluateAll((items) =>
    items.map((item) => {
      const svg = item.querySelector("svg");
      const path = item.querySelector("path");
      const numeral = item.querySelector("span");
      const bounds = svg.getBoundingClientRect();
      return {
        numeral: numeral.textContent,
        svgWidth: bounds.width,
        svgHeight: bounds.height,
        pathFill: globalThis.getComputedStyle(path).fill,
        color: globalThis.getComputedStyle(item).color,
      };
    }),
  );
  expect(frameEvidence).toEqual(
    sourceSnackbarFrames.map(({ number }) => ({
      numeral: number,
      svgWidth: 64,
      svgHeight: 58,
      pathFill: "rgb(255, 255, 255)",
      color: "rgb(255, 255, 255)",
    })),
  );
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
  const stableUntil = Date.now() + 1100;
  await expect.poll(() => Date.now()).toBeGreaterThanOrEqual(stableUntil);
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
    const roots = [
      document.querySelector(
        "[data-component-audit-id='notification-content-stress']",
      ),
      document.querySelector(
        "[data-component-audit-id='snackbar-content-stress']",
      ),
    ];
    document.body.replaceChildren(...roots);
  });
  await page.addStyleTag({
    content:
      ".shlz-notification { font-size: 28px !important; line-height: 36px !important; }",
  });
  for (const id of ["notification-content-stress", "snackbar-content-stress"]) {
    const root = page.locator(`[data-component-audit-id='${id}']`);
    const metrics = await root.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const children = [...element.children].map((child) => {
        const childBounds = child.getBoundingClientRect();
        return {
          visible: childBounds.width > 0 && childBounds.height > 0,
          inside:
            childBounds.left >= bounds.left &&
            childBounds.right <= bounds.right + 1 &&
            childBounds.top >= bounds.top &&
            childBounds.bottom <= bounds.bottom + 1,
        };
      });
      return {
        fontSize: globalThis.getComputedStyle(element).fontSize,
        height: bounds.height,
        children,
      };
    });
    expect(metrics.fontSize).toBe("28px");
    expect(metrics.height).toBeGreaterThan(116);
    expect(
      metrics.children.every(({ visible, inside }) => visible && inside),
    ).toBe(true);
  }
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
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
