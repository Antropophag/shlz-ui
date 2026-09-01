/* global getComputedStyle */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const composerManifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/composer.json",
    import.meta.url,
  ),
);
const toolbarManifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/rich-text-toolbar.json",
    import.meta.url,
  ),
);
const executedMaterialStates = new Map();
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  const states = executedMaterialStates.get(component) ?? new Set();
  states.add(state);
  executedMaterialStates.set(component, states);
};
const expectMaterialStates = (component) => {
  const manifest =
    component === "composer" ? composerManifest : toolbarManifest;
  expect([...(executedMaterialStates.get(component) ?? [])].sort()).toEqual(
    [...manifest.interactionEvidence.materialStates].sort(),
  );
  executedMaterialStates.delete(component);
};

test.beforeEach(async ({ page }) => page.goto("/#composer-demo"));

test("every Composer and Rich Text Toolbar occurrence is classified independently", async ({
  page,
}) => {
  await expectClassifiedComponentOccurrences(page, composerManifest);
  await expectClassifiedComponentOccurrences(page, toolbarManifest);
  await expect(page.locator(composerManifest.rootSelector)).toHaveCount(6);
  await expect(page.locator(toolbarManifest.rootSelector)).toHaveCount(6);
  await expect(
    page.locator(
      "[data-consumer-workspace] [data-component-audit-id='composer-data-workspace']",
    ),
  ).toHaveCount(1);
});

test("semantic controls, material states and consumer-owned commands execute", async ({
  page,
}) => {
  const consumer = page.locator(
    "[data-component-audit-id='composer-data-workspace']",
  );
  const toolbar = consumer.getByRole("toolbar", {
    name: "Форматирование комментария",
  });
  await expect(toolbar.getByRole("group")).toHaveCount(3);
  await expect(toolbar.getByRole("button")).toHaveCount(7);
  const bold = toolbar.getByRole("button", { name: "Полужирный" });
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  const italic = toolbar.getByRole("button", { name: "Курсив" });
  const restingPaint = await italic.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    color: getComputedStyle(node).color,
  }));
  await italic.hover();
  const hoverPaint = await italic.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    color: getComputedStyle(node).color,
  }));
  expect(hoverPaint).not.toEqual(restingPaint);
  await bold.focus();
  await expect(bold).toHaveCSS("outline-style", "solid");
  await bold.press("Space");
  await expect(bold).toHaveAttribute("aria-pressed", "false");
  await expect(consumer.locator("[data-composer-status]")).toHaveText(
    "Полужирный выключен приложением",
  );
  await consumer.getByRole("button", { name: "Отправить" }).click();
  await expect(consumer.locator("[data-composer-status]")).toHaveText(
    "Приложение обработало отправку",
  );

  const disabled = page.locator(
    "[data-component-audit-id='composer-showcase-disabled']",
  );
  await expect(disabled.locator("textarea")).toBeDisabled();
  await expect(disabled.getByRole("toolbar")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(disabled.getByRole("button").first()).toBeDisabled();
  await expect(
    page.locator(
      "[data-component-audit-id='composer-showcase-readonly'] textarea",
    ),
  ).toHaveAttribute("readonly", "");
  await expect(
    page.locator(
      "[data-component-audit-id='composer-showcase-invalid'] textarea",
    ),
  ).toHaveAttribute("aria-invalid", "true");
});

test("focus, accessibility and responsive content stress remain coherent", async ({
  page,
}) => {
  const source = page.locator(
    "[data-component-audit-id='composer-showcase-source']",
  );
  const editor = source.locator("textarea");
  await expect(editor).toHaveCSS("max-height", "320px");
  await expect(editor).toHaveCSS("overflow-y", "auto");
  const frame = source.locator(".shlz-composer__frame");
  const idleBorder = await frame.evaluate(
    (node) => getComputedStyle(node).borderColor,
  );
  await editor.focus();
  const focusBorder = await frame.evaluate(
    (node) => getComputedStyle(node).borderColor,
  );
  expect(focusBorder).not.toBe(idleBorder);
  await expect(source).toHaveScreenshot("composer-source.png");
  expect(
    (
      await new AxeBuilder({ page })
        .include("[data-component-audit-id='composer-showcase-source']")
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  const narrow = page.locator(
    "[data-component-audit-id='composer-content-stress']",
  );
  await narrow.evaluate((root) => {
    root.parentElement.style.inlineSize = "220px";
  });
  const geometry = await narrow.evaluate((root) => {
    const toolbar = root.querySelector(".shlz-rich-text-toolbar");
    const groups = [...toolbar.querySelectorAll("[role=group]")];
    return {
      rootOverflow: root.scrollWidth - root.clientWidth,
      toolbarOverflow: toolbar.scrollWidth - toolbar.clientWidth,
      groupRows: new Set(groups.map((group) => group.offsetTop)).size,
    };
  });
  expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
  expect(geometry.toolbarOverflow).toBeLessThanOrEqual(1);
  expect(geometry.groupRows).toBeGreaterThan(1);
  await expect(narrow).toHaveScreenshot("composer-narrow.png");
});

test("toolbar pressed and focus-visible paint has focused evidence", async ({
  page,
}) => {
  const toolbar = page.locator(
    "[data-component-audit-id='rich-text-toolbar-data-workspace']",
  );
  const bold = toolbar.getByRole("button", { name: "Полужирный" });
  await bold.focus();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(bold).toHaveCSS("outline-style", "solid");
  await expect(toolbar).toHaveScreenshot("rich-text-toolbar-states.png");
});

test("material state ledgers exact-match executable assertions", async ({
  page,
}) => {
  const source = page.locator(
    "[data-component-audit-id='composer-showcase-source']",
  );
  const invalid = page.locator(
    "[data-component-audit-id='composer-showcase-invalid']",
  );
  const disabled = page.locator(
    "[data-component-audit-id='composer-showcase-disabled']",
  );
  const readonly = page.locator(
    "[data-component-audit-id='composer-showcase-readonly']",
  );
  const narrow = page.locator(
    "[data-component-audit-id='composer-content-stress']",
  );
  const toolbar = page.locator(
    "[data-component-audit-id='rich-text-toolbar-data-workspace']",
  );
  const italic = toolbar.getByRole("button", { name: "Курсив" });
  const bold = toolbar.getByRole("button", { name: "Полужирный" });

  await verifyMaterialState("composer", "default", () =>
    expect(source).toBeVisible(),
  );
  await verifyMaterialState("composer", "focus-within", async () => {
    await source.locator("textarea").focus();
    await expect(source.locator(".shlz-composer__frame")).toHaveCSS(
      "border-style",
      "solid",
    );
  });
  await verifyMaterialState("composer", "invalid", () =>
    expect(invalid.locator("textarea")).toHaveAttribute("aria-invalid", "true"),
  );
  await verifyMaterialState("composer", "disabled", () =>
    expect(disabled.locator("textarea")).toBeDisabled(),
  );
  await verifyMaterialState("composer", "read-only", () =>
    expect(readonly.locator("textarea")).toHaveAttribute("readonly", ""),
  );
  await verifyMaterialState("composer", "narrow-layout", async () => {
    await narrow.evaluate((root) => {
      root.parentElement.style.inlineSize = "220px";
    });
    await expect(narrow).toBeVisible();
  });
  await verifyMaterialState("composer", "text-scale", async () => {
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    expect(
      await narrow.evaluate((root) => root.scrollWidth - root.clientWidth),
    ).toBeLessThanOrEqual(1);
  });

  await verifyMaterialState("rich-text-toolbar", "default", () =>
    expect(italic).toBeVisible(),
  );
  await verifyMaterialState("rich-text-toolbar", "hover", async () => {
    await italic.hover();
    await expect(italic).toBeVisible();
  });
  await verifyMaterialState("rich-text-toolbar", "focus-visible", async () => {
    await italic.focus();
    await expect(italic).toHaveCSS("outline-style", "solid");
  });
  await verifyMaterialState("rich-text-toolbar", "pressed", () =>
    expect(bold).toHaveAttribute("aria-pressed", "true"),
  );
  await verifyMaterialState("rich-text-toolbar", "disabled", () =>
    expect(
      disabled.getByRole("toolbar").getByRole("button").first(),
    ).toBeDisabled(),
  );
  await verifyMaterialState("rich-text-toolbar", "wrapped-layout", async () => {
    const rows = await narrow
      .locator("[role=toolbar] [role=group]")
      .evaluateAll(
        (groups) => new Set(groups.map((group) => group.offsetTop)).size,
      );
    expect(rows).toBeGreaterThan(1);
  });
  await verifyMaterialState("rich-text-toolbar", "text-scale", () =>
    expect(narrow.getByRole("toolbar")).toBeVisible(),
  );

  expectMaterialStates("composer");
  expectMaterialStates("rich-text-toolbar");
});
