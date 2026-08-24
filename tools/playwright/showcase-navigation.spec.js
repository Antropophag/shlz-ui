import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/sidebar-application-shell.json",
    import.meta.url,
  ),
);

const shell = (page) =>
  page.locator(
    '[data-component-audit-id="sidebar-application-shell-showcase"]',
  );
const sidebar = (page) => page.locator(".shlz-docs-sidebar");
const search = (page) => page.locator("[data-shlz-shell-search]");

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
]) {
  test(`showcase navigation fits ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/#input");
    await expect(page.locator("#input-demo")).toBeInViewport();
    await expect(
      page.locator('[data-shlz-docs-link][href="#input"]'),
    ).toHaveAttribute("aria-current", "location");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);

    await page.locator('[data-shlz-docs-link][href="#dropdown"]').click();
    await expect(page).toHaveURL(/#dropdown$/);
    await expect(page.locator("#dropdown-demo")).toBeInViewport();
  });
}

test("foundation and verification evidence use progressive disclosure", async ({
  page,
}) => {
  await page.goto("/#foundations");
  await expect(page.locator(".shlz-foundation-evidence")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".shlz-verification-harness")).not.toHaveAttribute(
    "open",
    "",
  );

  await page.locator('[data-shlz-docs-link][href="#typography"]').click();
  await expect(page.locator(".shlz-foundation-evidence")).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator("#typography")).toBeInViewport();
});

test("sidebar supports keyboard navigation", async ({ page }) => {
  await page.goto("/");
  const first = page.locator('[data-shlz-docs-link][href="#foundations"]');
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.locator('[data-shlz-docs-link][href="#colors"]'),
  ).toBeFocused();
});

test("shell occurrence and native landmarks are classified", async ({
  page,
}) => {
  await page.goto("/");
  await expectClassifiedComponentOccurrences(page, manifest);
  await expect(sidebar(page)).toHaveAttribute(
    "aria-label",
    "Showcase navigation",
  );
  await expect(sidebar(page).locator("nav")).toHaveAttribute(
    "aria-label",
    "Components and foundations",
  );
  await expect(search(page)).toHaveAccessibleName(
    "Search components and foundations",
  );
});

test("sidebar opened, closed, and current states use the real interaction seam", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#input");
  const toggle = page.locator("[data-shlz-sidebar-toggle]");
  const inputLink = page.locator('[data-shlz-docs-link][href="#input"]');
  const dropdownLink = page.locator('[data-shlz-docs-link][href="#dropdown"]');

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar(page)).toHaveCSS("width", "301px");
  await expect(sidebar(page)).toHaveCSS("background-color", "rgb(11, 22, 35)");
  await expect(inputLink).toHaveAttribute("aria-current", "location");
  await expect(dropdownLink).not.toHaveAttribute("aria-current", "location");

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(shell(page)).toHaveClass(/shlz-docs-shell--closed/);
  await expect(sidebar(page)).toHaveCSS("width", "72px");
  await expect(dropdownLink).toBeVisible();

  await dropdownLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#dropdown$/);
  await expect(dropdownLink).toHaveAttribute("aria-current", "location");
  await expect(inputLink).not.toHaveAttribute("aria-current", "location");
});

test("header default, hover, typing, and filled states are native", async ({
  page,
}) => {
  await page.goto("/");
  const input = search(page);

  await expect(input).toHaveValue("");
  await expect(input).toHaveCSS("height", "40px");
  const defaultBorder = await input.evaluate(
    (element) => globalThis.getComputedStyle(element).borderColor,
  );
  await input.hover();
  const hoverBorder = await input.evaluate(
    (element) => globalThis.getComputedStyle(element).borderColor,
  );
  expect(hoverBorder).not.toBe(defaultBorder);

  await input.focus();
  await input.fill("Компоненты Input / VeryLongFoundationName");
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(input).toHaveValue("Компоненты Input / VeryLongFoundationName");
  await expect(input).toHaveCSS("background-color", "rgb(238, 240, 244)");
});

test("focused shell snapshots cover opened, closed, and filled states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#input");
  await expect(sidebar(page)).toHaveScreenshot("wave9-sidebar-opened.png", {
    maxDiffPixelRatio: 0.002,
  });

  await page.locator("[data-shlz-sidebar-toggle]").click();
  await expect(sidebar(page)).toHaveScreenshot("wave9-sidebar-closed.png", {
    maxDiffPixelRatio: 0.002,
  });

  await search(page).fill("Filled header search");
  await page.locator(".shlz-hero__intro h1").click();
  await expect(page.locator(".shlz-hero")).toHaveScreenshot(
    "wave9-header-filled.png",
    { maxDiffPixelRatio: 0.002 },
  );
});

test("narrow, long-content, and text-scale stress stays reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#input");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
    const links = document.querySelectorAll("[data-shlz-docs-link]");
    links[0].textContent =
      "Регистрация заявки на проведение испытаний и согласование";
    links[1].textContent =
      "ExtremelyLongLatinNavigationDestinationWithoutNaturalBreaks";
  });

  await expect(page.locator("[data-shlz-sidebar-toggle]")).toBeInViewport();
  await expect(search(page)).toBeVisible();
  await search(page).focus();
  await expect(search(page)).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  const focusBox = await search(page).boundingBox();
  expect(focusBox.x).toBeGreaterThanOrEqual(2);
  expect(focusBox.x + focusBox.width).toBeLessThanOrEqual(388);
});
