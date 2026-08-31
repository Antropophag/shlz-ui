import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectStablePreexistingShowcaseScreenshot } from "./visual-harness.js";
import {
  inspectComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/planner-schedule.json",
    import.meta.url,
  ),
);
const executedMaterialStates = new Set();
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedMaterialStates.add(`${component}:${state}`);
};
const verifyMaterialStates = async (component, states) => {
  for (const [state, assertion] of Object.entries(states))
    await verifyMaterialState(component, state, assertion);
};
const expectMaterialStates = (component) => {
  expect(
    manifest.interactionEvidence.materialStates.every((state) =>
      executedMaterialStates.has(`${component}:${state}`),
    ),
  ).toBe(true);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/#planner-schedule-demo");
});

test("classifies semantic schedule occurrences and accessible context", async ({
  page,
}) => {
  const inventory = await inspectComponentOccurrences(page, manifest);
  expect(inventory.occurrences.sort()).toEqual([
    "planner-schedule-data-workspace",
    "planner-schedule-showcase-source",
  ]);
  expect(inventory.unclassifiedLegacy).toEqual([]);

  const schedule = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  await expect(schedule).toBeVisible();
  await expect(schedule).toHaveAttribute("role", "region");
  await expect(schedule).toHaveAttribute(
    "aria-label",
    "Planner Schedule source and state matrix",
  );
  await expect(
    schedule.getByRole("list", { name: "Days" }).locator("li"),
  ).toHaveCount(7);
  await expect(
    schedule.getByRole("list", { name: "Times" }).locator("li"),
  ).toHaveCount(10);
  await expect(
    schedule.getByRole("button", { name: /Cabin installation 09:00–10:00/ }),
  ).toHaveAccessibleDescription(/16 Monday/);
  await expect(
    schedule.getByRole("img", { name: "Saturday · unavailable weekend" }),
  ).toBeVisible();
  await expect(
    schedule.getByRole("img", { name: "Friday after 16:00 is unavailable" }),
  ).toBeVisible();
  await expect(
    schedule.getByRole("img", { name: "Current time 12:24" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("#planner-schedule-demo")
    .analyze();
  expect(results.violations).toEqual([]);
});

test("duration, overlap, temporal and sticky geometry are computed", async ({
  page,
}) => {
  const schedule = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  const geometry = await schedule.evaluate((root) => {
    const box = (selector) => {
      const rect = root.querySelector(selector).getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    };
    const style = (selector) =>
      globalThis.getComputedStyle(root.querySelector(selector));
    const viewport = root.querySelector(".shlz-planner-schedule__viewport");
    return {
      first: box(".shlz-planner-schedule__event-slot:nth-child(1)"),
      overlapping: box(".shlz-planner-schedule__event-slot:nth-child(2)"),
      twoHour: box(".shlz-planner-schedule__event-slot:nth-child(3)"),
      today: style('[data-shlz-planner-state="today"]'),
      unavailable: style("[data-shlz-planner-unavailable]"),
      now: box(".shlz-planner-schedule__now"),
      viewport: {
        clientWidth: viewport.clientWidth,
        scrollWidth: viewport.scrollWidth,
        clientHeight: viewport.clientHeight,
        scrollHeight: viewport.scrollHeight,
      },
    };
  });
  expect(geometry.first.height).toBeGreaterThan(60);
  expect(geometry.twoHour.height).toBeGreaterThan(geometry.first.height);
  const halfHour = await schedule
    .getByRole("button", { name: /Client call 15:00–15:30/ })
    .locator("..")
    .boundingBox();
  expect(halfHour.height).toBeCloseTo(20, 0);
  expect(geometry.first.width).toBeCloseTo(geometry.overlapping.width, 0);
  expect(geometry.overlapping.left).toBeGreaterThan(geometry.first.left);
  expect(geometry.today.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(geometry.unavailable.backgroundImage).toContain(
    "repeating-linear-gradient",
  );
  expect(geometry.now.height).toBeLessThanOrEqual(1);
  expect(geometry.viewport.scrollWidth).toBeGreaterThan(
    geometry.viewport.clientWidth,
  );
  expect(geometry.viewport.scrollHeight).toBeGreaterThan(
    geometry.viewport.clientHeight,
  );

  const viewport = schedule.locator(".shlz-planner-schedule__viewport");
  const dayHeader = schedule.locator(".shlz-planner-schedule__days");
  const timeScale = schedule.locator(".shlz-planner-schedule__times");
  const before = {
    days: await dayHeader.boundingBox(),
    times: await timeScale.boundingBox(),
  };
  await viewport.evaluate((node) => {
    node.scrollTo({ left: 360, top: 220 });
  });
  const after = {
    days: await dayHeader.boundingBox(),
    times: await timeScale.boundingBox(),
  };
  expect(after.days.y).toBeCloseTo(before.days.y, 0);
  expect(after.times.x).toBeCloseTo(before.times.x, 0);
});

test("real event details use Popover lifecycle and consumer-owned actions", async ({
  page,
}) => {
  const source = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  const trigger = source.getByRole("button", {
    name: /Cabin installation 09:00–10:00/,
  });
  const detail = source.getByRole("dialog", {
    name: "Cabin installation details",
  });

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("Alex Morgan");
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.locator("#planner-schedule-demo > h3").click();
  await expect(detail).toBeHidden();
  await trigger.press("Space");
  await expect(detail).toBeVisible();
  await page.keyboard.press("Escape");

  const consumer = page.locator(
    "[data-component-audit-id='planner-schedule-data-workspace']",
  );
  await consumer
    .getByRole("button", { name: /Cabin installation 09:00–10:00/ })
    .click();
  await consumer
    .getByRole("button", { name: "Open application record" })
    .click();
  await expect(page.locator("[data-planner-consumer-status]")).toHaveText(
    "Application record action handled by consumer.",
  );

  await page.evaluate(() => {
    const trigger = document.querySelector(
      '[data-shlz-popover-trigger="planner-source-installation-detail"]',
    );
    const controller = window.__shlzPopoverControllers.find(
      (candidate) => candidate.trigger === trigger,
    );
    controller.destroy();
  });
  await trigger.click();
  await expect(detail).toBeHidden();
  await page.evaluate(() => window.__shlzEnhancePopovers());
  await trigger.click();
  await expect(detail).toBeVisible();
});

test("real hover, focus and status paint retain emergency contrast", async ({
  page,
}) => {
  const schedule = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  const event = schedule.getByRole("button", {
    name: /Cabin installation 09:00–10:00/,
  });
  const before = await event.evaluate(
    (node) => globalThis.getComputedStyle(node).backgroundColor,
  );
  expect(before).toBe("rgb(223, 226, 240)");
  await event.hover();
  const hover = await event.evaluate(
    (node) => globalThis.getComputedStyle(node).backgroundColor,
  );
  expect(hover).not.toBe(before);
  expect(hover).toBe("rgb(238, 240, 244)");
  await event.evaluate((node) =>
    node.addEventListener(
      "pointerdown",
      () => {
        node.dataset.pointerDownObserved = "true";
      },
      { once: true },
    ),
  );
  const eventBox = await event.boundingBox();
  await page.mouse.move(
    eventBox.x + eventBox.width / 2,
    eventBox.y + eventBox.height / 2,
  );
  await page.mouse.down();
  await expect(event).toHaveAttribute("data-pointer-down-observed", "true");
  await page.mouse.up();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(event).toBeFocused();
  expect(
    await event.evaluate(
      (node) => globalThis.getComputedStyle(node).outlineStyle,
    ),
  ).not.toBe("none");
  expect(
    await event.evaluate((node) => {
      const style = globalThis.getComputedStyle(node);
      return [style.color, style.outlineColor, style.outlineWidth];
    }),
  ).toEqual(["rgb(37, 61, 152)", "rgb(37, 61, 152)", "2px"]);

  for (const stateEvent of await schedule
    .locator(
      '.shlz-planner-schedule__event[data-tone="success"], .shlz-planner-schedule__event[data-state="canceled"]',
    )
    .all()) {
    await stateEvent.hover();
    expect(
      await stateEvent.evaluate(
        (node) => globalThis.getComputedStyle(node).boxShadow,
      ),
    ).not.toBe("none");
  }

  const ratios = await schedule
    .locator(".shlz-planner-schedule__event")
    .evaluateAll((nodes) => {
      const channel = (value) => {
        value /= 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (value) => {
        const [r, g, b] = value.match(/\d+/g).slice(0, 3).map(Number);
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      return nodes.map((node) => {
        const style = globalThis.getComputedStyle(node);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (
          (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05)
        );
      });
    });
  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
});

test("bounded sixty-event schedule remains measurable", async ({ page }) => {
  const schedule = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  const result = await schedule.evaluate((root) => {
    const list = root.querySelector(".shlz-planner-schedule__events");
    const template = list.querySelector(".shlz-planner-schedule__event-slot");
    const fragment = document.createDocumentFragment();
    const started = globalThis.performance.now();
    for (let index = list.children.length; index < 60; index += 1) {
      const clone = template.cloneNode(true);
      clone.style.setProperty("--shlz-planner-day", String(index % 5));
      clone.style.setProperty("--shlz-planner-start", String(index % 9));
      clone.style.setProperty("--shlz-planner-end", String((index % 9) + 0.5));
      clone
        .querySelector("button")
        .removeAttribute("data-shlz-popover-trigger");
      clone.querySelector("button").removeAttribute("aria-controls");
      clone.querySelector("button").removeAttribute("aria-expanded");
      fragment.append(clone);
    }
    list.append(fragment);
    const count = list.children.length;
    const finalRect = list.lastElementChild.getBoundingClientRect();
    return {
      count,
      height: finalRect.height,
      elapsed: globalThis.performance.now() - started,
    };
  });
  expect(result.count).toBe(60);
  expect(result.height).toBeGreaterThan(0);
  expect(result.elapsed).toBeLessThan(250);
});

test("executes the declared Planner Schedule material-state ledger", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  const event = root.getByRole("button", { name: /Cabin installation/ });
  const detail = page.locator("#planner-source-installation-detail");
  const visible = (selector) => async () =>
    expect(root.locator(selector).first()).toBeVisible();
  await verifyMaterialState("planner-schedule", "default", async () =>
    expect(event).toBeVisible(),
  );
  await event.hover();
  await verifyMaterialState("planner-schedule", "hover", async () =>
    expect(event).toBeVisible(),
  );
  await event.focus();
  await verifyMaterialState("planner-schedule", "focus-visible", async () =>
    expect(event).toBeFocused(),
  );
  await verifyMaterialStates("planner-schedule", {
    completed: visible('[data-state="completed"]'),
    canceled: visible('[data-state="canceled"]'),
    past: visible('[data-shlz-planner-state="past"]'),
    today: visible('[data-shlz-planner-state="today"]'),
    future: visible('[data-shlz-planner-state="future"]'),
    "unavailable-day": visible("[data-shlz-planner-unavailable]"),
    "unavailable-period": visible(".shlz-planner-schedule__unavailable-period"),
    "overlapping-lanes": visible('[style*="--shlz-planner-lane:1"]'),
    "current-time": visible(".shlz-planner-schedule__now"),
  });
  await event.press("Enter");
  await verifyMaterialState("planner-schedule", "detail-open", async () =>
    expect(detail).toBeVisible(),
  );
  await page.keyboard.press("Escape");
  await verifyMaterialState("planner-schedule", "detail-closed", async () =>
    expect(detail).toBeHidden(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await verifyMaterialState("planner-schedule", "narrow-layout", async () =>
    expect(root).toBeVisible(),
  );
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await verifyMaterialState("planner-schedule", "text-scale", async () =>
    expect(root).toBeVisible(),
  );
  expectMaterialStates("planner-schedule");
});

test("plain HTML, narrow viewport and enlarged text remain operable", async ({
  page,
}) => {
  await page.goto(fixtureUrl("planner-schedule.html"));
  const schedule = page.locator(
    "[data-component-audit-id='planner-schedule-plain-html']",
  );
  await expect(schedule).toBeVisible();
  await expect(schedule).toHaveAttribute("role", "region");
  await expect(schedule).toHaveAttribute("aria-label", "Service appointments");
  await schedule.getByRole("button", { name: /Cabin installation/ }).click();
  await expect(
    schedule.getByRole("dialog", { name: "Cabin installation details" }),
  ).toBeVisible();
  await schedule.getByRole("button", { name: "Close details" }).click();
  const plainInventory = await inspectComponentOccurrences(page, manifest);
  expect(plainInventory.occurrences).toEqual(["planner-schedule-plain-html"]);
  expect(plainInventory.unclassifiedLegacy).toEqual([]);

  await page.setViewportSize({ width: 320, height: 760 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  const viewport = schedule.locator(".shlz-planner-schedule__viewport");
  const metrics = await viewport.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth - globalThis.innerWidth,
  }));
  expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  expect(metrics.pageOverflow).toBeLessThanOrEqual(0);
  await viewport.focus();
  await page.keyboard.press("Tab");
  await expect(
    schedule.getByRole("button", { name: /Cabin installation/ }),
  ).toBeFocused();
});

test("focused Planner Schedule visuals", async ({ page }) => {
  const source = page.locator(
    "[data-component-audit-id='planner-schedule-showcase-source']",
  );
  await expectStablePreexistingShowcaseScreenshot(
    page,
    source,
    "planner-schedule-source.png",
  );
  const event = source.getByRole("button", { name: /Cabin installation/ });
  await event.hover();
  await expect(event).toHaveScreenshot("planner-schedule-event-hover.png");
  await page.mouse.move(0, 0);
  await event.focus();
  await expect(source).toHaveScreenshot("planner-schedule-event-focus.png");
  await event.press("Enter");
  await expect(
    page.locator("#planner-source-installation-detail"),
  ).toHaveScreenshot("planner-schedule-detail-open.png");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await expectStablePreexistingShowcaseScreenshot(
    page,
    source,
    "planner-schedule-narrow.png",
  );
});
