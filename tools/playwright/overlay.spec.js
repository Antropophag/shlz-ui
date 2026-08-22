import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifests = {
  modal: await readComponentAuditManifest(
    new globalThis.URL(
      "../../docs/component-audits/modal.json",
      import.meta.url,
    ),
  ),
  drawer: await readComponentAuditManifest(
    new globalThis.URL(
      "../../docs/component-audits/drawer.json",
      import.meta.url,
    ),
  ),
};
const executedStates = new Map([
  ["modal", new Set()],
  ["drawer", new Set()],
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
const textContrast = (locator) =>
  locator.evaluate((element) => {
    const parse = (value) =>
      value
        .match(/[\d.]+/g)
        .map(Number)
        .slice(0, 3);
    const luminance = (channels) =>
      channels
        .map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, channel, index) =>
            sum + channel * [0.2126, 0.7152, 0.0722][index],
          0,
        );
    const foreground = luminance(
      parse(globalThis.getComputedStyle(element).color),
    );
    const background = luminance(
      parse(
        globalThis.getComputedStyle(
          element.closest(".shlz-modal__surface, .shlz-drawer__surface"),
        ).backgroundColor,
      ),
    );
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
const verifyModalStatus = async (page, state, color) => {
  await page
    .getByRole("button", { name: state, exact: true })
    .evaluate((button) => button.click());
  const dialog = page.locator(`#showcase-${state}`);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".shlz-modal__variant-icon")).toHaveCSS(
    "color",
    color,
  );
  expect(await textContrast(dialog.locator("h2"))).toBeGreaterThanOrEqual(4.5);
  expect(await textContrast(dialog.locator("p"))).toBeCloseTo(2.79, 1);
  await page.keyboard.press("Escape");
};
const expectOccurrenceSubset = async (page, component, ids, diagnostics) =>
  expectClassifiedComponentOccurrences(page, {
    ...manifests[component],
    occurrences: manifests[component].occurrences.filter(({ id }) =>
      ids.includes(id),
    ),
    diagnosticOccurrenceCount: diagnostics,
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Modal and Drawer occurrence guards classify Showcase and plain HTML roots", async ({
  page,
}) => {
  await expectOccurrenceSubset(
    page,
    "modal",
    manifests.modal.occurrences
      .map(({ id }) => id)
      .filter((id) => id !== "modal-plain-html"),
    5,
  );
  await expectOccurrenceSubset(
    page,
    "drawer",
    ["drawer-showcase", "drawer-data-workspace"],
    1,
  );
  await page.goto(fixtureUrl("plain-html.html"));
  await expectOccurrenceSubset(page, "modal", ["modal-plain-html"], 0);
  await expectOccurrenceSubset(page, "drawer", ["drawer-plain-html"], 0);
});

test("overlay occurrence guard detects an unclassified native root", async ({
  page,
}) => {
  await page.evaluate(() => {
    const dialog = document.createElement("dialog");
    dialog.dataset.shlzModal = "";
    dialog.innerHTML = '<div class="shlz-modal__surface"></div>';
    document.body.append(dialog);
  });
  await expect(
    expectOccurrenceSubset(
      page,
      "modal",
      manifests.modal.occurrences
        .map(({ id }) => id)
        .filter((id) => id !== "modal-plain-html"),
      5,
    ),
  ).rejects.toThrow();
});

test("Modal and Drawer execute their strict material-state ledgers", async ({
  page,
}) => {
  await verifyMaterialState("modal", "basic-open", async () => {
    const { dialog } = await openModal(page);
    await expect(dialog.locator(".shlz-modal__surface")).toHaveCSS(
      "border-radius",
      "16px",
    );
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("modal", "info-open", async () => {
    await page.getByRole("button", { name: "Подтверждение" }).click();
    await expect(page.locator("#showcase-confirm")).toBeVisible();
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("modal", "success-open", () =>
    verifyModalStatus(page, "success", "rgb(37, 152, 62)"),
  );
  await verifyMaterialState("modal", "warning-open", () =>
    verifyModalStatus(page, "warning", "rgb(212, 126, 46)"),
  );
  await verifyMaterialState("modal", "error-open", () =>
    verifyModalStatus(page, "error", "rgb(204, 31, 31)"),
  );
  await verifyMaterialState("modal", "focus-visible", async () => {
    const { dialog } = await openModal(page);
    await page.keyboard.press("Shift+Tab");
    const close = dialog.getByRole("button", { name: "Закрыть" });
    await expect(close).toBeFocused();
    await expect(close).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("modal", "long-content", async () => {
    const { dialog } = await openModal(page);
    const body = dialog.locator(".shlz-modal__body");
    await body.evaluate(
      (element) => (element.scrollTop = element.scrollHeight),
    );
    await expect
      .poll(() => body.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("modal", "narrow-layout", async () => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { dialog } = await openModal(page);
    expect((await dialog.boundingBox()).width).toBeLessThanOrEqual(344);
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1440, height: 1000 });
  });
  expectMaterialStates("modal");

  await verifyMaterialState("drawer", "dismissible-open", async () => {
    const { dialog } = await openDrawer(page);
    await expect(dialog).toHaveAttribute("data-shlz-drawer-backdrop-close", "");
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("drawer", "non-dismissible-open", async () => {
    await page.getByRole("button", { name: /Фильтры/ }).click();
    const dialog = page.locator("#workspace-filter-drawer");
    await expect(dialog).not.toHaveAttribute(
      "data-shlz-drawer-backdrop-close",
      "",
    );
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("drawer", "focus-visible", async () => {
    const { dialog } = await openDrawer(page);
    await page.keyboard.press("Shift+Tab");
    const close = dialog.getByRole("button", { name: "Закрыть" });
    await expect(close).toBeFocused();
    await expect(close).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("drawer", "long-content", async () => {
    const { dialog } = await openDrawer(page);
    const body = dialog.locator(".shlz-drawer__body");
    await body.evaluate(
      (element) => (element.scrollTop = element.scrollHeight),
    );
    await expect
      .poll(() => body.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await page.keyboard.press("Escape");
  });
  await verifyMaterialState("drawer", "narrow-layout", async () => {
    await page.setViewportSize({ width: 390, height: 700 });
    const { dialog } = await openDrawer(page);
    expect((await dialog.boundingBox()).width).toBe(390);
    await page.keyboard.press("Escape");
  });
  expectMaterialStates("drawer");
});

async function openModal(page) {
  const trigger = page.getByRole("button", { name: "Открыть Modal" });
  const dialog = page.locator("#showcase-modal");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect
    .poll(() => dialog.evaluate((element) => element.matches(":modal")))
    .toBe(true);
  return { trigger, dialog };
}

async function openDrawer(page) {
  const trigger = page.getByRole("button", { name: "Открыть Drawer" });
  const dialog = page.locator("#showcase-drawer");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

test("modal uses native focus containment, Escape and return focus", async ({
  page,
}) => {
  const { trigger, dialog } = await openModal(page);
  await expect(page.locator("#modal-autofocus")).toBeFocused();

  const focusDidNotReachBackground = async () =>
    page.evaluate(() => {
      const modal = document.querySelector("#showcase-modal");
      const active = document.activeElement;
      return active === document.body || modal.contains(active);
    });
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    expect(await focusDidNotReachBackground()).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await focusDidNotReachBackground()).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("modal supports explicit close, opt-in backdrop and native dialog form", async ({
  page,
}) => {
  let opened = await openModal(page);
  await opened.dialog.getByRole("button", { name: "Сохранить" }).click();
  await expect(opened.dialog).toBeHidden();
  await expect(opened.dialog).toHaveJSProperty("returnValue", "save");

  opened = await openModal(page);
  const surface = opened.dialog.locator(".shlz-modal__surface");
  const box = await surface.boundingBox();
  await page.mouse.click(box.x - 12, box.y + 10);
  await expect(opened.dialog).toBeHidden();

  const confirmTrigger = page.getByRole("button", { name: "Подтверждение" });
  await confirmTrigger.click();
  const confirm = page.locator("#showcase-confirm");
  await confirm.getByRole("button", { name: "Подтвердить" }).click();
  await expect(confirm).toBeHidden();
  await expect(confirm).toHaveJSProperty("returnValue", "confirm");
  await expect(confirmTrigger).toBeFocused();
});

test("non-dismissible modal backdrop blocks background interaction", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Подтверждение" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog = page.locator("#showcase-confirm");
  let backgroundClicks = 0;
  await page.exposeFunction("recordBackgroundClick", () => {
    backgroundClicks += 1;
  });
  await page.evaluate(() => {
    document
      .querySelector('[data-shlz-modal-trigger="showcase-modal"]')
      .addEventListener("click", window.recordBackgroundClick);
  });
  const background = page.getByRole("button", { name: "Открыть Modal" });
  const backgroundBox = await background.boundingBox();
  await page.mouse.click(
    backgroundBox.x + backgroundBox.width / 2,
    backgroundBox.y + backgroundBox.height / 2,
  );
  await expect(dialog).toBeVisible();
  expect(backgroundClicks).toBe(0);
});

test("modal body scrolls while header and footer remain fixed", async ({
  page,
}) => {
  const { dialog } = await openModal(page);
  const body = dialog.locator(".shlz-modal__body");
  const header = dialog.locator(".shlz-modal__header");
  const footer = dialog.locator(".shlz-modal__footer");
  const before = {
    header: await header.boundingBox(),
    footer: await footer.boundingBox(),
  };
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect((await header.boundingBox()).y).toBeCloseTo(before.header.y, 0);
  expect((await footer.boundingBox()).y).toBeCloseTo(before.footer.y, 0);
});

test("modal native fallback focus and backdrop gesture state stay cycle-local", async ({
  page,
}) => {
  const confirmTrigger = page.getByRole("button", { name: "Подтверждение" });
  await confirmTrigger.click();
  const confirm = page.locator("#showcase-confirm");
  await expect(confirm).toBeVisible();
  expect(
    await confirm.evaluate((dialog) => dialog.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");

  const { dialog } = await openModal(page);
  const surface = dialog.locator(".shlz-modal__surface");
  const box = await surface.boundingBox();
  await page.mouse.move(box.x + 12, box.y + 12);
  await page.mouse.down();
  await page.mouse.move(box.x - 12, box.y + 12);
  await page.mouse.up();
  await expect(dialog).toBeVisible();

  await page.mouse.move(box.x - 12, box.y + 12);
  await page.mouse.down();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.evaluate(() => window.__shlzEnhanceModals()[0].open());
  await expect(dialog).toBeVisible();
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
});

test("destroy removes modal trigger behavior", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Открыть Modal" });
  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.__shlzModalControllers[0].destroy());
  await trigger.click();
  await expect(page.locator("#showcase-modal")).toBeHidden();
});

test("repeated modal enhancement keeps one owner and one teardown", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Открыть Modal" });
  await trigger.scrollIntoViewIfNeeded();
  const sameOwner = await page.evaluate(() => {
    const first = window.__shlzModalControllers[0];
    const repeated = window.__shlzEnhanceModals()[0];
    window.__wave7RepeatedModal = repeated;
    return first === repeated;
  });
  expect(sameOwner).toBe(true);

  await page.evaluate(() => window.__wave7RepeatedModal.destroy());
  await trigger.click();
  await expect(page.locator("#showcase-modal")).toBeHidden();
});

test("modal reopen uses only the current eligible opener", async ({ page }) => {
  const dialog = page.locator("#showcase-modal");
  const first = page.getByRole("button", { name: "Открыть Modal" });
  const second = page.getByRole("button", { name: "Подтверждение" });
  await first.click();
  await first.evaluate((button) =>
    button.setAttribute("aria-disabled", "true"),
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(first).not.toBeFocused();

  await page.evaluate(() => {
    const trigger = document.querySelector(
      '[data-shlz-modal-trigger="showcase-confirm"]',
    );
    window.__shlzModalControllers[0].open(trigger);
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(second).toBeFocused();
});

test("repeated drawer enhancement has one owner and isolated teardown", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Открыть Drawer" });
  const sameOwner = await page.evaluate(() => {
    window.__shlzEnhanceDrawers = window.__shlzEnhanceDrawers ?? (() => []);
    const first = window.__shlzDrawerControllers[0];
    const repeated = window.__shlzEnhanceDrawers()[0];
    if (repeated) window.__wave7RepeatedDrawer = repeated;
    return first === repeated;
  });
  expect(sameOwner).toBe(true);
  await page.evaluate(() => window.__wave7RepeatedDrawer.destroy());
  await trigger.click();
  await expect(page.locator("#showcase-drawer")).toBeHidden();
});

test("stale destroy cannot delete a newer Modal or Drawer owner", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const staleModal = window.__shlzModalControllers[0];
    staleModal.destroy();
    const currentModal = window.__shlzEnhanceModals()[0];
    staleModal.destroy();
    const repeatedModal = window.__shlzEnhanceModals()[0];

    const staleDrawer = window.__shlzDrawerControllers[0];
    staleDrawer.destroy();
    const currentDrawer = window.__shlzEnhanceDrawers()[0];
    staleDrawer.destroy();
    const repeatedDrawer = window.__shlzEnhanceDrawers()[0];
    return {
      modal: currentModal === repeatedModal,
      drawer: currentDrawer === repeatedDrawer,
    };
  });
  expect(result).toEqual({ modal: true, drawer: true });
});

test("overlay instances isolate triggers, return values and stale openers", async ({
  page,
}) => {
  const modal = page.locator("#showcase-modal");
  const modalTrigger = page.getByRole("button", { name: "Открыть Modal" });
  await modalTrigger.click();
  await modal.getByRole("button", { name: "Сохранить" }).click();
  await expect(modal).toHaveJSProperty("returnValue", "save");
  await modalTrigger.click();
  await expect(modal).toHaveJSProperty("returnValue", "");
  await page.keyboard.press("Escape");

  await page
    .getByRole("button", { name: "success", exact: true })
    .evaluate((button) => button.click());
  const success = page.locator("#showcase-success");
  await expect(success).toBeVisible();
  await expect(modal).toBeHidden();
  await expect(modalTrigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Escape");

  const staleResults = await page.evaluate(async () => {
    const controller = window.__shlzEnhanceModals()[0];
    const disconnected = document.createElement("button");
    document.body.append(disconnected);
    disconnected.focus();
    controller.open(disconnected);
    disconnected.remove();
    controller.close();

    const disabled = document.createElement("button");
    document.body.append(disabled);
    disabled.focus();
    controller.open(disabled);
    disabled.disabled = true;
    controller.close();
    await new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
    const disabledFocused = document.activeElement === disabled;
    disabled.remove();
    return {
      disconnectedFocused: document.activeElement === disconnected,
      disabledFocused,
    };
  });
  expect(staleResults).toEqual({
    disconnectedFocused: false,
    disabledFocused: false,
  });
});

test("Data Workspace Drawer owns modal focus and stress geometry, not filter state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 320 });
  const trigger = page.getByRole("button", { name: /Фильтры/ });
  await trigger.click();
  const drawer = page.locator("#workspace-filter-drawer");
  await expect(drawer).toBeVisible();
  expect(
    await drawer.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  expect((await drawer.boundingBox()).width).toBe(360);
  const body = drawer.locator(".shlz-drawer__body");
  expect(
    await body.evaluate(
      (element) => element.scrollHeight >= element.clientHeight,
    ),
  ).toBe(true);
  await drawer.getByRole("button", { name: "Закрыть" }).click();
  await expect(trigger).toBeFocused();
});

test("drawer is a right-side modal with native focus and scrolling", async ({
  page,
}) => {
  const { trigger, dialog } = await openDrawer(page);
  await expect(dialog.locator("input")).toBeFocused();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x + box.width).toBeCloseTo(viewport.width, 0);
  expect(box.width).toBe(420);

  const body = dialog.locator("[data-drawer-scroll]");
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("drawer close, backdrop, narrow viewport and destroy remain native", async ({
  page,
}) => {
  let opened = await openDrawer(page);
  await opened.dialog.getByRole("button", { name: "Применить" }).click();
  await expect(opened.dialog).toBeHidden();

  opened = await openDrawer(page);
  const desktopSurfaceBox = await opened.dialog
    .locator(".shlz-drawer__surface")
    .boundingBox();
  await page.mouse.click(desktopSurfaceBox.x - 12, desktopSurfaceBox.y + 10);
  await expect(opened.dialog).toBeHidden();

  await page.setViewportSize({ width: 390, height: 700 });
  opened = await openDrawer(page);
  expect((await opened.dialog.boundingBox()).width).toBe(390);
  await page.keyboard.press("Escape");
  await expect(opened.dialog).toBeHidden();

  await page.evaluate(() => window.__shlzDrawerControllers[0].destroy());
  await opened.trigger.click();
  await expect(opened.dialog).toBeHidden();
});

for (const [name, selector] of [
  ["Dropdown внутри Modal", "#modal-menu"],
  ["Tooltip внутри Modal", "#modal-tooltip"],
  ["Popover внутри Modal", "#modal-popover"],
]) {
  test(`${name} remains visible in the dialog top layer and owns first Escape`, async ({
    page,
  }) => {
    const { dialog } = await openModal(page);
    const trigger = dialog.getByRole("button", { name });
    if (name.startsWith("Tooltip")) await trigger.focus();
    else await trigger.click();
    const floating = page.locator(selector);
    await expect(floating).toBeVisible();
    const floatingBox = await floating.boundingBox();
    const viewport = page.viewportSize();
    expect(floatingBox.x).toBeGreaterThanOrEqual(8);
    expect(floatingBox.x + floatingBox.width).toBeLessThanOrEqual(
      viewport.width - 8,
    );
    await page.keyboard.press("Escape");
    await expect(floating).toBeHidden();
    await expect(dialog).toBeVisible();
  });
}

for (const [name, selector] of [
  ["Dropdown внутри Modal", "#modal-menu"],
  ["Tooltip внутри Modal", "#modal-tooltip"],
  ["Popover внутри Modal", "#modal-popover"],
]) {
  test(`${name} composes inside Drawer and preserves one-layer Escape`, async ({
    page,
  }) => {
    const { dialog } = await openDrawer(page);
    await page.evaluate((nestedName) => {
      const modal = document.querySelector("#showcase-modal");
      const drawerBody = document.querySelector(
        "#showcase-drawer .shlz-drawer__body",
      );
      const trigger = [...modal.querySelectorAll("button")].find(
        (button) => button.textContent.trim() === nestedName,
      );
      const controlled =
        trigger.getAttribute("aria-controls") ??
        trigger.dataset.shlzTooltipTrigger;
      drawerBody.append(trigger, document.getElementById(controlled));
    }, name);
    const trigger = dialog.getByRole("button", { name });
    if (name.startsWith("Tooltip")) await trigger.focus();
    else await trigger.click();
    const floating = page.locator(selector);
    await expect(floating).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(floating).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
}

test("modal, long content, drawer and nested floating visuals", async ({
  page,
}) => {
  let opened = await openModal(page);
  await expect(page).toHaveScreenshot("modal.png");
  await opened.dialog.locator(".shlz-modal__body").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page).toHaveScreenshot("modal-long-content.png");
  await opened.dialog
    .getByRole("button", { name: "Popover внутри Modal" })
    .click();
  await expect(page).toHaveScreenshot("modal-nested-popover.png");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  opened = await openDrawer(page);
  await expect(page).toHaveScreenshot("drawer.png");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 700 });
  await openDrawer(page);
  await expect(page).toHaveScreenshot("drawer-narrow.png");
});

test("plain HTML consumes modal and drawer via standalone CSS and direct ESM", async ({
  page,
}) => {
  await page.goto(fixtureUrl("plain-html.html"));
  const modalTrigger = page.getByRole("button", { name: "Открыть Modal" });
  await modalTrigger.click();
  await expect(page.locator("#fixture-modal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modalTrigger).toBeFocused();

  const drawerTrigger = page.getByRole("button", { name: "Открыть Drawer" });
  await drawerTrigger.click();
  const drawer = page.locator("#fixture-drawer");
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawerTrigger).toBeFocused();
  await page.evaluate(() => window.__fixtureDrawerControllers[0].destroy());
  await drawerTrigger.click();
  await expect(drawer).toBeHidden();
});
