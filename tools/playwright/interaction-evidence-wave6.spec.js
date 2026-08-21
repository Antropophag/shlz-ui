import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { fixtureUrl } from "./fixture-url.js";

const componentNames = [
  "dropdown-menu",
  "tooltip",
  "popover",
  "date-picker-calendar",
];
const manifests = Object.fromEntries(
  await Promise.all(
    componentNames.map(async (component) => [
      component,
      await readComponentAuditManifest(
        new globalThis.URL(
          `../../docs/component-audits/${component}.json`,
          import.meta.url,
        ),
      ),
    ]),
  ),
);
const executedStates = new Map(
  componentNames.map((component) => [component, new Set()]),
);

const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedStates.get(component).add(state);
};

const expectMaterialStates = (component) => {
  expect([...executedStates.get(component)].sort()).toEqual(
    [...manifests[component].interactionEvidence.materialStates].sort(),
  );
};

const computed = (locator) =>
  locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      opacity: style.opacity,
      visibility: style.visibility,
    };
  });

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
    const style = window.getComputedStyle(element);
    const foreground = parse(style.color);
    let background = [255, 255, 255];
    const layers = [];
    for (let node = element; node; node = node.parentElement)
      layers.push(parse(window.getComputedStyle(node).backgroundColor));
    for (const layer of layers.reverse())
      background = composite(layer, background);
    const renderedForeground = composite(foreground, background);
    const values = [luminance(renderedForeground), luminance(background)].sort(
      (a, b) => b - a,
    );
    return (values[0] + 0.05) / (values[1] + 0.05);
  });

const expectPageOccurrenceSubset = async (
  page,
  manifest,
  expectedIds,
  diagnostics,
) => {
  const expected = new Set(expectedIds);
  await expectClassifiedComponentOccurrences(page, {
    ...manifest,
    occurrences: manifest.occurrences.filter(({ id }) => expected.has(id)),
    diagnosticOccurrenceCount: diagnostics,
  });
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("all Wave 6 executable, consumer, stress and absence roots are classified", async ({
  page,
}) => {
  for (const component of componentNames) {
    const manifest = manifests[component];
    const showcaseIds = manifest.occurrences
      .map(({ id }) => id)
      .filter((id) => !id.endsWith("plain-html-consumer"));
    await expectPageOccurrenceSubset(
      page,
      manifest,
      showcaseIds,
      manifest.diagnosticOccurrenceCount,
    );
  }

  await page.goto(fixtureUrl("plain-html.html"));
  for (const component of componentNames) {
    const manifest = manifests[component];
    const plainIds = manifest.occurrences
      .map(({ id }) => id)
      .filter((id) => id.endsWith("plain-html-consumer"));
    await expectPageOccurrenceSubset(page, manifest, plainIds, 0);
  }
});

test("Dropdown binds real paint, keyboard, scroll, dismissal and lifecycle", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='dropdown-showcase-actions']",
  );
  const trigger = root.getByRole("button", { name: "Действия" });
  const menu = root.getByRole("menu");
  const first = root.getByRole("menuitem", { name: "Создать" });
  const disabled = root.getByRole("menuitem", { name: "Недоступно" });

  await trigger.click();
  await verifyMaterialState("dropdown-menu", "opened", async () => {
    await expect(menu).toBeVisible();
    expect(await computed(menu)).toMatchObject({
      width: 200,
      borderRadius: "12px",
      backgroundColor: "rgb(255, 255, 255)",
    });
  });
  await first.hover();
  await verifyMaterialState("dropdown-menu", "item-hover", async () => {
    await expect(first).toHaveCSS("background-color", "rgb(238, 240, 244)");
  });
  await page.mouse.down();
  await verifyMaterialState("dropdown-menu", "item-active", async () => {
    await expect(first).toHaveCSS("background-color", "rgb(238, 240, 244)");
  });
  await page.mouse.up();
  await page.keyboard.press("Escape");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(
    root.getByRole("menuitem", {
      name: "Длинный пункт меню для проверки ширины",
    }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await verifyMaterialState("dropdown-menu", "item-focus-visible", async () => {
    await expect(first).toBeFocused();
    expect(await computed(first)).toMatchObject({
      outlineStyle: "solid",
      outlineColor: "rgb(37, 61, 152)",
    });
  });
  await verifyMaterialState("dropdown-menu", "item-disabled", async () => {
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS("opacity", "0.5");
  });

  let activations = 0;
  await first.evaluate((element) => {
    window.__wave6DropdownActivations = 0;
    element.addEventListener(
      "click",
      () => window.__wave6DropdownActivations++,
    );
  });
  await page.keyboard.press("Enter");
  activations = await page.evaluate(() => window.__wave6DropdownActivations);
  expect(activations).toBe(1);
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.press("Space");
  await expect(first).toBeFocused();
  await first.press("Space");
  expect(await page.evaluate(() => window.__wave6DropdownActivations)).toBe(2);
  await expect(menu).toBeHidden();

  const scrollRoot = page.locator(
    "[data-component-audit-id='dropdown-scrollable-stress']",
  );
  const scrollTrigger = scrollRoot.getByRole("button", {
    name: "Много действий",
  });
  await scrollTrigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  const last = scrollRoot.getByRole("menuitem", { name: "34 menu item" });
  const region = scrollRoot.locator(".shlz-dropdown__scroll-region");
  await verifyMaterialState("dropdown-menu", "scroll-boundary", async () => {
    await expect(last).toBeFocused();
    expect(
      await region.evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    expect(
      await region.evaluate((element) => element.scrollHeight),
    ).toBeGreaterThan(await region.evaluate((element) => element.clientHeight));
    await expect(scrollRoot.getByRole("menu")).toHaveCSS("max-height", "340px");
  });
  await page.keyboard.press("Escape");
  await expect(scrollTrigger).toBeFocused();

  expect(
    await page.evaluate(() => {
      const firstController = window.__shlzDropdownControllers[0];
      return firstController === window.__shlzEnhanceDropdowns()[0];
    }),
  ).toBe(true);
  expect(
    await page.evaluate(async () => {
      const previous = window.__shlzDropdownControllers[0];
      previous.destroy();
      previous.trigger.click();
      const stayedClosed = previous.menu.hidden;
      const replacement = window.__shlzEnhanceDropdowns()[0];
      window.__shlzDropdownControllers[0] = replacement;
      previous.open();
      previous.close();
      previous.destroy();
      return stayedClosed && previous !== replacement && !replacement.expanded;
    }),
  ).toBe(true);
  await trigger.click();
  await expect(menu).toBeVisible();
  await trigger.click();
  await page.getByRole("heading", { name: "Dropdown", exact: true }).click();
  await expect(menu).toBeHidden();
  expectMaterialStates("dropdown-menu");
});

test("Tooltip binds focus and hover paint to accessible lifecycle", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Tooltip top" });
  const tooltip = page.locator("#tooltip-top");
  await trigger.focus();
  await verifyMaterialState("tooltip", "focus-open", async () => {
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-describedby", "tooltip-top");
    expect(await computed(tooltip)).toMatchObject({
      width: 100,
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(11, 22, 35)",
      borderRadius: "8px",
      visibility: "visible",
    });
    await expect(
      tooltip.locator("button, a, input, select, textarea"),
    ).toHaveCount(0);
    await expect(tooltip).not.toBeFocused();
  });
  await page.keyboard.press("Escape");
  await verifyMaterialState("tooltip", "escaped", async () => {
    await expect(tooltip).toBeHidden();
    await expect(trigger).not.toHaveAttribute(
      "aria-describedby",
      /tooltip-top/,
    );
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await verifyMaterialState("tooltip", "reopened", async () => {
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-describedby", "tooltip-top");
  });
  await page.keyboard.press("Tab");
  await expect(tooltip).toBeHidden();

  const hoverTrigger = page.getByRole("button", { name: "Tooltip left" });
  const hoverTooltip = page.locator("#tooltip-left");
  await hoverTrigger.hover();
  await verifyMaterialState("tooltip", "hover-open", async () => {
    await expect(hoverTooltip).toBeVisible();
    await expect(hoverTrigger).toHaveAttribute(
      "aria-describedby",
      "tooltip-left",
    );
  });
  await page.mouse.move(0, 0);
  await expect(hoverTooltip).toBeHidden();

  const edgeTrigger = page.getByRole("button", { name: "Tooltip edge stress" });
  await edgeTrigger.focus();
  const edge = page.locator("#tooltip-edge-stress");
  await expect(edge).toBeVisible();
  await page.setViewportSize({ width: 360, height: 640 });
  const edgeBox = await edge.boundingBox();
  expect(edgeBox.x).toBeGreaterThanOrEqual(8);
  expect(edgeBox.x + edgeBox.width).toBeLessThanOrEqual(352);
  expect(edgeBox.height).toBeGreaterThan(37);

  expect(
    await page.evaluate(() => {
      const firstController = window.__shlzTooltipControllers[0];
      return firstController === window.__shlzEnhanceTooltips()[0];
    }),
  ).toBe(true);
  expect(
    await page.evaluate(async () => {
      const previous = window.__shlzTooltipControllers[0];
      previous.destroy();
      previous.trigger.dispatchEvent(new globalThis.Event("focus"));
      await new Promise((resolve) => window.setTimeout(resolve, 20));
      const stayedClosed = previous.tooltip.hidden;
      const replacement = window.__shlzEnhanceTooltips()[0];
      window.__shlzTooltipControllers[0] = replacement;
      return stayedClosed && previous !== replacement;
    }),
  ).toBe(true);
  expectMaterialStates("tooltip");
});

test("Popover binds real surface paint to isolated dismissal and focus ownership", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Bottom", exact: true });
  const popover = page.locator("#popover-bottom");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await verifyMaterialState("popover", "opened", async () => {
    await expect(popover).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await computed(popover)).toMatchObject({
      width: 236,
      backgroundColor: "rgb(255, 255, 255)",
      borderRadius: "12px",
    });
    expect((await computed(popover)).boxShadow).not.toBe("none");
  });
  await verifyMaterialState("popover", "trigger-focus", async () => {
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS("outline-style", "solid");
  });
  await page.keyboard.press("Escape");
  await verifyMaterialState("popover", "escape-close", async () => {
    await expect(popover).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  const interactiveTrigger = page.getByRole("button", {
    name: "Interactive content",
  });
  await interactiveTrigger.click();
  await page.keyboard.press("Tab");
  await expect(page.locator("#popover-value")).toBeFocused();
  await page.keyboard.press("Tab");
  const close = page.locator("#popover-interactive [data-shlz-popover-close]");
  await expect(close).toBeFocused();
  await page.keyboard.press("Space");
  await verifyMaterialState("popover", "explicit-close-focus", async () => {
    await expect(page.locator("#popover-interactive")).toBeHidden();
    await expect(interactiveTrigger).toBeFocused();
  });

  await trigger.click();
  await page.getByRole("heading", { name: "Popover", exact: true }).click();
  await verifyMaterialState("popover", "outside-close", async () => {
    await expect(popover).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  await page.evaluate(() => {
    window.__shlzPopoverControllers[0].open();
    window.__shlzPopoverControllers[1].open();
  });
  await page.keyboard.press("Escape");
  await expect(page.locator("#popover-top")).toBeHidden();
  await expect(popover).toBeVisible();
  await trigger.press("Escape");
  await expect(popover).toBeHidden();

  await page.evaluate(() => {
    const body = document.querySelector("#popover-bottom .shlz-popover__body");
    body.insertAdjacentHTML(
      "beforeend",
      '<button type="button" data-shlz-tooltip-trigger="nested-tooltip" data-shlz-tooltip-open-delay="0">Nested help</button><span id="nested-tooltip" role="tooltip" data-shlz-tooltip hidden>Nested hint</span>',
    );
    window.__shlzEnhanceTooltips();
  });
  await trigger.click();
  const nestedTrigger = page.getByRole("button", { name: "Nested help" });
  await nestedTrigger.focus();
  await expect(page.locator("#nested-tooltip")).toBeVisible();
  await nestedTrigger.click();
  await expect(popover).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#nested-tooltip")).toBeHidden();
  await expect(popover).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();

  await page.evaluate(() => {
    const body = document.querySelector("#popover-bottom .shlz-popover__body");
    body.insertAdjacentHTML(
      "beforeend",
      '<div data-shlz-dropdown><button type="button" aria-haspopup="menu" aria-controls="nested-menu">Nested actions</button><div id="nested-menu" role="menu" hidden><button type="button" role="menuitem">Nested command</button></div></div>',
    );
    window.__shlzEnhanceDropdowns();
  });
  await trigger.click();
  const nestedDropdown = page.getByRole("button", { name: "Nested actions" });
  await nestedDropdown.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Nested command" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("menuitem", { name: "Nested command" }),
  ).toBeHidden();
  await expect(popover).toBeVisible();
  await trigger.press("Escape");
  await expect(popover).toBeHidden();

  await page.locator("body").evaluate((body, src) => {
    const frame = document.createElement("iframe");
    frame.src = src;
    frame.title = "cross-root fixture";
    body.append(frame);
  }, fixtureUrl("plain-html.html"));
  const frame = page.frameLocator('iframe[title="cross-root fixture"]');
  const frameTrigger = frame.getByRole("button", { name: "Подробнее" });
  await trigger.click();
  await frameTrigger.click();
  await expect(frame.locator("#fixture-popover")).toBeVisible();
  await frameTrigger.press("Escape");
  await expect(frame.locator("#fixture-popover")).toBeHidden();
  await expect(popover).toBeVisible();
  await trigger.press("Escape");
  await expect(popover).toBeHidden();

  await trigger.press("Space");
  await expect(popover).toBeVisible();
  await trigger.press("Space");
  await expect(popover).toBeHidden();

  await trigger.click();
  await page.getByRole("button", { name: "Tooltip top" }).focus();
  await expect(page.locator("#tooltip-top")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#tooltip-top")).toBeHidden();
  await expect(popover).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();

  expect(
    await page.evaluate(() => {
      const firstController = window.__shlzPopoverControllers[0];
      return firstController === window.__shlzEnhancePopovers()[0];
    }),
  ).toBe(true);
  expect(
    await page.evaluate(() => {
      const previous = window.__shlzPopoverControllers[0];
      previous.destroy();
      previous.trigger.click();
      const stayedClosed = previous.popover.hidden;
      const replacement = window.__shlzEnhancePopovers()[0];
      window.__shlzPopoverControllers[0] = replacement;
      return stayedClosed && previous !== replacement;
    }),
  ).toBe(true);
  await expect(close).toHaveCount(1);

  const detached = await page.evaluate(() => {
    const controller = window.__shlzPopoverControllers[0];
    controller.trigger.remove();
    controller.popover.remove();
    controller.open();
    controller.close();
    const closedAfterDetach = controller.popover.hidden;
    controller.destroy();
    return closedAfterDetach;
  });
  expect(detached).toBe(true);

  expectMaterialStates("popover");
});

test("Calendar and Date Picker remain source-only with an empty runtime ledger", async ({
  page,
}) => {
  expect(manifests["date-picker-calendar"].implementation).toEqual([]);
  await expect(
    page.locator(
      "input[type='date'], .shlz-calendar, .shlz-date-picker, [data-shlz-calendar], [data-shlz-date-picker]",
    ),
  ).toHaveCount(0);
  const index = JSON.parse(
    await readFile(
      new globalThis.URL(
        "../../design-source-index/components.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const datePicker = index.components.find(
    ({ name }) => name === "Date-Picker",
  );
  const calendar = index.components.find(
    ({ name }) => name === "Interface / Calendar",
  );
  expect(datePicker.kind).toBe("COMPONENT_SET");
  expect(datePicker.variants).toHaveLength(20);
  expect(Object.keys(datePicker.propertyDefinitions)).toEqual([
    "Size",
    "State",
    "Filled",
    "Ranged",
  ]);
  expect(calendar.kind).toBe("COMPONENT");
  expectMaterialStates("date-picker-calendar");
});

test("Wave 6 meaningful text surfaces pass the alpha-aware contrast guard", async ({
  page,
}) => {
  const dropdownTrigger = page.getByRole("button", { name: "Действия" });
  await dropdownTrigger.click();
  const dropdownItem = page.getByRole("menuitem", { name: "Создать" });
  await dropdownItem.hover();
  expect(await textContrast(dropdownItem)).toBeGreaterThanOrEqual(4.5);

  const tooltipTrigger = page.getByRole("button", { name: "Tooltip top" });
  await tooltipTrigger.focus();
  const tooltip = page.locator("#tooltip-top");
  await expect(tooltip).toBeVisible();
  expect(await textContrast(tooltip)).toBeGreaterThanOrEqual(4.5);

  const popoverTrigger = page.getByRole("button", {
    name: "Bottom",
    exact: true,
  });
  await popoverTrigger.click();
  const popoverBody = page.locator("#popover-bottom .shlz-popover__body");
  await expect(popoverBody).toBeVisible();
  expect(await textContrast(popoverBody)).toBeGreaterThanOrEqual(4.5);
});
