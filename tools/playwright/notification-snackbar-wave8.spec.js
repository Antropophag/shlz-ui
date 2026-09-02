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
const materialStateOwnership = {
  notification: {
    source: ["default", "error", "with-button", "focus-visible"],
    interaction: ["hover", "active", "disabled"],
    stress: ["long-content", "narrow-layout", "text-scale"],
  },
  snackbar: {
    source: [
      "number-5",
      "number-4",
      "number-3",
      "number-2",
      "number-1",
      "number-0",
    ],
    interaction: ["hover", "active", "focus-visible", "disabled"],
    stress: ["long-content", "narrow-layout", "text-scale"],
  },
};
const createMaterialStateTracker = (component, expectedStates) => {
  const executedStates = new Set();
  return {
    verifyMaterialState: async (owner, state, assertion) => {
      expect(owner).toBe(component);
      await assertion();
      executedStates.add(state);
    },
    expectMaterialStates: (owner) => {
      expect(owner).toBe(component);
      expect([...executedStates].sort()).toEqual([...expectedStates].sort());
    },
  };
};
const textContrast = (locator) =>
  locator.evaluate((element) => {
    const parse = (value) => {
      const channels = value.match(/[\d.]+/g).map(Number);
      return [channels[0], channels[1], channels[2], channels[3] ?? 1];
    };
    const composite = (foreground, background) => {
      const [red, green, blue, alpha] = foreground;
      return [
        red * alpha + background[0] * (1 - alpha),
        green * alpha + background[1] * (1 - alpha),
        blue * alpha + background[2] * (1 - alpha),
      ];
    };
    const luminance = (channels) => {
      const linear = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const foreground = parse(globalThis.getComputedStyle(element).color);
    let background = [255, 255, 255];
    const layers = [];
    for (let node = element; node; node = node.parentElement)
      layers.push(parse(globalThis.getComputedStyle(node).backgroundColor));
    for (const layer of layers.reverse())
      background = composite(layer, background);
    const values = [
      luminance(composite(foreground, background)),
      luminance(background),
    ].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  });
const subset = (component, ids, diagnostics) => ({
  ...manifests[component],
  occurrences: manifests[component].occurrences.filter(({ id }) =>
    ids.includes(id),
  ),
  diagnosticOccurrenceCount: diagnostics,
});

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

test("material state ownership covers each independent manifest", () => {
  for (const component of ["notification", "snackbar"]) {
    const ownedStates = Object.values(materialStateOwnership[component]).flat();
    expect([...ownedStates].sort()).toEqual(
      [...manifests[component].interactionEvidence.materialStates].sort(),
    );
  }
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
  const materialStates = createMaterialStateTracker(
    "notification",
    materialStateOwnership.notification.source,
  );
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
  await materialStates.verifyMaterialState("notification", "default", () =>
    expect(dismissible).toBeVisible(),
  );
  await materialStates.verifyMaterialState("notification", "error", () =>
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
  await materialStates.verifyMaterialState("notification", "with-button", () =>
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
  await materialStates.verifyMaterialState(
    "notification",
    "focus-visible",
    () => expect(close).toBeFocused(),
  );
  await close.click();
  await expect(dismissible).toHaveCount(0);
  await expect(
    fixture.getByRole("button", { name: "Продолжить работу" }),
  ).toBeFocused();
  materialStates.expectMaterialStates("notification");
});

test("Notification real native interaction and disabled states remain accessible", async ({
  page,
}) => {
  const materialStates = createMaterialStateTracker(
    "notification",
    materialStateOwnership.notification.interaction,
  );
  const action = page.locator(
    "[data-component-audit-id='notification-showcase-action'] .shlz-notification__action",
  );
  const base = await action.evaluate(
    (element) => globalThis.getComputedStyle(element).backgroundColor,
  );
  await action.hover();
  await expect(action).toHaveCSS("background-color", base);
  expect(await textContrast(action)).toBeGreaterThanOrEqual(4.5);
  await materialStates.verifyMaterialState("notification", "hover", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  const box = await action.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(action).toHaveCSS("background-color", base);
  expect(await textContrast(action)).toBeGreaterThanOrEqual(4.5);
  await materialStates.verifyMaterialState("notification", "active", () =>
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
  await materialStates.verifyMaterialState("notification", "disabled", () =>
    expect(disabled).toBeDisabled(),
  );
  await disabled.evaluate((element) => element.focus());
  await expect(disabled).not.toBeFocused();
  materialStates.expectMaterialStates("notification");
});

test("Snackbar preserves all six exact static contours without timer semantics", async ({
  page,
}) => {
  const materialStates = createMaterialStateTracker(
    "snackbar",
    materialStateOwnership.snackbar.source,
  );
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
  await materialStates.verifyMaterialState("snackbar", "number-5", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='5']"),
    ).toHaveCount(1),
  );
  await materialStates.verifyMaterialState("snackbar", "number-4", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='4']"),
    ).toHaveCount(1),
  );
  await materialStates.verifyMaterialState("snackbar", "number-3", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='3']"),
    ).toHaveCount(1),
  );
  await materialStates.verifyMaterialState("snackbar", "number-2", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='2']"),
    ).toHaveCount(1),
  );
  await materialStates.verifyMaterialState("snackbar", "number-1", () =>
    expect(
      fixture.locator(".shlz-snackbar [data-snackbar-number='1']"),
    ).toHaveCount(1),
  );
  await materialStates.verifyMaterialState("snackbar", "number-0", () =>
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
  materialStates.expectMaterialStates("snackbar");
});

test("Snackbar real action states execute once and countdown stays decorative", async ({
  page,
}) => {
  const materialStates = createMaterialStateTracker(
    "snackbar",
    materialStateOwnership.snackbar.interaction,
  );
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
  expect(await textContrast(action)).toBeGreaterThanOrEqual(4.5);
  await materialStates.verifyMaterialState("snackbar", "hover", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  const box = await action.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(action).toHaveCSS("background-color", base);
  expect(await textContrast(action)).toBeGreaterThanOrEqual(4.5);
  await materialStates.verifyMaterialState("snackbar", "active", () =>
    expect(action).toHaveCSS("background-color", base),
  );
  await page.mouse.up();
  await action.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(action).toHaveCSS("outline-style", "solid");
  await materialStates.verifyMaterialState("snackbar", "focus-visible", () =>
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
  await materialStates.verifyMaterialState("snackbar", "disabled", () =>
    expect(disabled).toBeDisabled(),
  );
  materialStates.expectMaterialStates("snackbar");
});

const verifyContentStress = async (page, id) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const root = page.locator(`[data-component-audit-id='${id}']`);
  await expect(root).toBeVisible();
  const narrowMetrics = await root.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    scrollWidth: element.scrollWidth,
    right: element.getBoundingClientRect().right,
  }));
  expect(narrowMetrics.width).toBeLessThanOrEqual(288);
  expect(narrowMetrics.height).toBeGreaterThan(58);
  expect(narrowMetrics.scrollWidth).toBeLessThanOrEqual(
    Math.ceil(narrowMetrics.width),
  );
  expect(narrowMetrics.right).toBeLessThanOrEqual(320);
  await expect(root).toHaveScreenshot(`${id}-narrow.png`);
  await root.evaluate((element) => document.body.replaceChildren(element));
  await page.addStyleTag({
    content:
      ".shlz-notification { font-size: 28px !important; line-height: 36px !important; }",
  });
  const scaledMetrics = await root.evaluate((element) => {
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
  expect(scaledMetrics.fontSize).toBe("28px");
  expect(scaledMetrics.height).toBeGreaterThan(116);
  expect(
    scaledMetrics.children.every(({ visible, inside }) => visible && inside),
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  return root;
};

test("Notification survives narrow, long and text-scaled content", async ({
  page,
}) => {
  const materialStates = createMaterialStateTracker(
    "notification",
    materialStateOwnership.notification.stress,
  );
  const root = await verifyContentStress(page, "notification-content-stress");
  await materialStates.verifyMaterialState("notification", "long-content", () =>
    expect(root).toBeVisible(),
  );
  await materialStates.verifyMaterialState(
    "notification",
    "narrow-layout",
    () => expect(root).toBeVisible(),
  );
  await materialStates.verifyMaterialState("notification", "text-scale", () =>
    expect(root).toBeVisible(),
  );
  materialStates.expectMaterialStates("notification");
});

test("Snackbar survives narrow, long and text-scaled content", async ({
  page,
}) => {
  const materialStates = createMaterialStateTracker(
    "snackbar",
    materialStateOwnership.snackbar.stress,
  );
  const root = await verifyContentStress(page, "snackbar-content-stress");
  await materialStates.verifyMaterialState("snackbar", "long-content", () =>
    expect(root).toBeVisible(),
  );
  await materialStates.verifyMaterialState("snackbar", "narrow-layout", () =>
    expect(root).toBeVisible(),
  );
  await materialStates.verifyMaterialState("snackbar", "text-scale", () =>
    expect(root).toBeVisible(),
  );
  materialStates.expectMaterialStates("snackbar");
});
