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
const contrastRatio = (foreground, background) => {
  const values = (color) =>
    color
      .match(/[\d.]+/g)
      .slice(0, 3)
      .map(Number);
  const luminance = (color) => {
    const channels = values(color).map((value) => {
      const channel = value / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
};
const compositeColor = (foreground, background) => {
  const channels = (color) => color.match(/[\d.]+/g).map(Number);
  const [red, green, blue, alpha = 1] = channels(foreground);
  const [backgroundRed, backgroundGreen, backgroundBlue] = channels(background);
  return `rgb(${[red, green, blue]
    .map((channel, index) =>
      Math.round(
        channel * alpha +
          [backgroundRed, backgroundGreen, backgroundBlue][index] * (1 - alpha),
      ),
    )
    .join(", ")})`;
};

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

  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("Use compact showcase navigation");
  await expect(sidebar(page)).toHaveCSS("width", "301px");
  await expect(sidebar(page)).toHaveCSS("background-color", "rgb(11, 22, 35)");
  await expect(inputLink).toHaveAttribute("aria-current", "location");
  await expect(dropdownLink).not.toHaveAttribute("aria-current", "location");
  await expect(inputLink).toHaveCSS(
    "background-color",
    "rgba(255, 255, 255, 0.1)",
  );
  await expect(dropdownLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const activePaint = await inputLink.evaluate((element) => {
    const style = globalThis.getComputedStyle(element);
    const sidebarStyle = globalThis.getComputedStyle(
      element.closest(".shlz-docs-sidebar"),
    );
    return {
      foreground: style.color,
      background: style.backgroundColor,
      backdrop: sidebarStyle.backgroundColor,
    };
  });
  expect(
    contrastRatio(
      activePaint.foreground,
      compositeColor(activePaint.background, activePaint.backdrop),
    ),
  ).toBeGreaterThanOrEqual(4.5);

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Use expanded showcase navigation");
  await expect(shell(page)).toHaveClass(/shlz-docs-shell--closed/);
  await expect(sidebar(page)).toHaveCSS("width", "72px");
  await expect(dropdownLink).toBeVisible();

  await dropdownLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#dropdown$/);
  await expect(dropdownLink).toHaveAttribute("aria-current", "location");
  await expect(inputLink).not.toHaveAttribute("aria-current", "location");
  await expect(dropdownLink).toHaveCSS(
    "background-color",
    "rgba(255, 255, 255, 0.1)",
  );
});

test("header default, hover, typing, and filled states are native", async ({
  page,
}) => {
  await page.goto("/");
  const input = search(page);

  await expect(input).toHaveValue("");
  await expect(input).toHaveCSS("height", "40px");
  const expected = await page.evaluate(() => {
    const style = globalThis.getComputedStyle(document.documentElement);
    const resolveColor = (value) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const resolved = globalThis.getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    };
    return {
      defaultBorder: resolveColor(
        style.getPropertyValue("--shlz-source-color-gray-gray-200").trim(),
      ),
      activeBorder: resolveColor(
        style.getPropertyValue("--shlz-source-color-blue-blue-200").trim(),
      ),
      filledBackground: resolveColor(
        style.getPropertyValue("--shlz-source-color-blue-blue-50").trim(),
      ),
    };
  });
  await expect(input).toHaveCSS("border-color", expected.defaultBorder);
  await input.hover();
  await expect(input).toHaveCSS("border-color", expected.activeBorder);

  await input.focus();
  await input.fill("Компоненты Input / VeryLongFoundationName");
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS("outline-style", "solid");
  await expect(input).toHaveCSS("outline-color", expected.activeBorder);
  const typingPaint = await input.evaluate((element) => {
    const style = globalThis.getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor };
  });
  expect(
    contrastRatio(typingPaint.foreground, typingPaint.background),
  ).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.press("Tab");
  await expect(input).toHaveValue("Компоненты Input / VeryLongFoundationName");
  await expect(input).toHaveCSS("background-color", expected.filledBackground);
  const filledPaint = await input.evaluate((element) => {
    const style = globalThis.getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor };
  });
  expect(
    contrastRatio(filledPaint.foreground, filledPaint.background),
  ).toBeGreaterThanOrEqual(4.5);
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
    links[0].dataset.stressKind = "cyrillic";
    links[0].textContent =
      "Регистрация заявки на проведение испытаний и согласование";
    links[1].dataset.stressKind = "latin";
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

  for (const kind of ["cyrillic", "latin"]) {
    const link = page.locator(`[data-stress-kind="${kind}"]`);
    await link.evaluate((element) =>
      element.scrollIntoView({ inline: "center" }),
    );
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("white-space", "normal");
    await expect(link).toHaveCSS("outline-style", "solid");
    const box = await link.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(2);
    expect(box.x + box.width).toBeLessThanOrEqual(388);
  }
});
