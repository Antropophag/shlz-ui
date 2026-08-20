import { expect, test } from "@playwright/test";
import { hideDeveloperDocumentation } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await hideDeveloperDocumentation(page);
  await page.addStyleTag({
    content: `
      .shlz-docs-sidebar { display: none !important; }
      #file-row-extension-demo { display: none !important; }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
});

const computed = (locator, pseudo = null) =>
  locator.evaluate((node, pseudoElement) => {
    const style = node.ownerDocument.defaultView.getComputedStyle(
      node,
      pseudoElement,
    );
    return {
      width: style.width,
      height: style.height,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      opacity: style.opacity,
      transform: style.transform,
    };
  }, pseudo);

test("Switch preserves the authoritative two-size source matrix", async ({
  page,
}) => {
  const fixture = page.locator("[data-shlz-switch-source-matrix]");
  const controls = fixture.locator(".shlz-switch__input");
  await expect(controls).toHaveCount(8);

  const mediumOff = fixture
    .locator(".shlz-switch__input:not(.shlz-switch__input--sm):not(:checked)")
    .first();
  const mediumOn = fixture
    .locator(".shlz-switch__input:not(.shlz-switch__input--sm):checked")
    .first();
  const smallOff = fixture
    .locator(".shlz-switch__input--sm:not(:checked)")
    .first();

  expect(await computed(mediumOff)).toMatchObject({
    width: "38px",
    height: "20px",
    backgroundColor: "rgb(209, 216, 223)",
    borderRadius: "100px",
  });
  expect(await computed(mediumOff, "::before")).toMatchObject({
    width: "16px",
    height: "16px",
    backgroundColor: "rgb(255, 255, 255)",
  });
  expect(await computed(mediumOn)).toMatchObject({
    backgroundColor: "rgb(37, 61, 152)",
  });
  expect(await computed(smallOff)).toMatchObject({
    width: "24px",
    height: "14px",
  });
  await expect(
    fixture.locator(".shlz-switch__input:disabled").first(),
  ).toHaveCSS("opacity", "0.4");

  await fixture.scrollIntoViewIfNeeded();
  await expect(fixture).toHaveScreenshot("remediation-switch.png", {
    maxDiffPixels: 0,
  });
});

test("Button exposes every source mode state with recovered typography", async ({
  page,
}) => {
  const fixture = page.locator("[data-shlz-button-source-matrix]");
  const stateMatrix = fixture.locator(".shlz-control-matrix");
  const rows = {
    primary: stateMatrix.locator(".shlz-button--primary"),
    secondary: stateMatrix.locator(
      ".shlz-button:not(.shlz-button--primary):not(.shlz-button--text)",
    ),
    text: stateMatrix.locator(".shlz-button--text"),
  };
  for (const row of Object.values(rows)) await expect(row).toHaveCount(4);

  const expected = {
    primary: [
      ["rgb(37, 61, 152)", "rgb(255, 255, 255)"],
      ["rgb(66, 91, 166)", "rgb(255, 255, 255)"],
      ["rgb(22, 39, 115)", "rgb(255, 255, 255)"],
      ["rgb(115, 131, 190)", "rgb(255, 255, 255)"],
    ],
    secondary: [
      ["rgb(238, 240, 244)", "rgb(11, 22, 35)"],
      ["rgb(238, 240, 244)", "rgb(37, 61, 152)"],
      ["rgb(223, 226, 240)", "rgb(22, 39, 115)"],
      ["rgb(238, 240, 244)", "rgb(147, 156, 165)"],
    ],
    text: [
      ["rgb(255, 255, 255)", "rgb(11, 22, 35)"],
      ["rgb(238, 240, 244)", "rgb(37, 61, 152)"],
      ["rgb(223, 226, 240)", "rgb(22, 39, 115)"],
      ["rgb(255, 255, 255)", "rgb(147, 156, 165)"],
    ],
  };
  for (const [mode, row] of Object.entries(rows)) {
    const items = await row.all();
    for (const [index, item] of items.entries()) {
      const style = await computed(item);
      expect(
        [style.backgroundColor, style.color],
        `${mode} state ${index}`,
      ).toEqual(expected[mode][index]);
      expect(style).toMatchObject({
        height: "40px",
        fontSize: "15px",
        fontWeight: "400",
        lineHeight: "19.5px",
        letterSpacing: "-0.15px",
      });
      expect(style.fontFamily).toContain("Golos Text");
    }
  }

  for (const [size, expectedTypography] of [
    ["medium", { fontSize: "14px", lineHeight: "18.2px" }],
    ["small", { fontSize: "14px", lineHeight: "18.2px" }],
  ]) {
    expect(
      await computed(
        fixture.locator(`[data-shlz-button-source-size="${size}"]`),
      ),
    ).toMatchObject({
      ...expectedTypography,
      fontWeight: "400",
      letterSpacing: "-0.14px",
    });
  }

  const iconOnly = fixture.locator(
    "[data-shlz-button-source-icons] .shlz-button--icon",
  );
  await expect(iconOnly).toHaveCount(4);
  await expect(iconOnly.nth(0)).toHaveCSS("width", "40px");
  await expect(iconOnly.nth(1)).toHaveCSS("width", "40px");
  await expect(iconOnly.nth(2)).toHaveCSS("width", "32px");
  await expect(iconOnly.nth(3)).toHaveCSS("width", "32px");
  await iconOnly.nth(0).focus();
  await expect(iconOnly.nth(0)).toHaveCSS("outline-style", "solid");

  await fixture.scrollIntoViewIfNeeded();
  await expect(fixture).toHaveScreenshot("remediation-button.png", {
    maxDiffPixels: 0,
  });
});

test("Empty State exposes Simple, Customize and Basic source compositions", async ({
  page,
}) => {
  const fixture = page.locator("[data-shlz-empty-state-source-matrix]");
  const simple = fixture.locator('[data-empty-state-variant="simple"]');
  const customize = fixture.locator('[data-empty-state-variant="customize"]');
  const basic = fixture.locator('[data-empty-state-variant="basic"]');

  expect(await computed(simple)).toMatchObject({
    width: "220px",
    height: "67px",
  });
  expect(await computed(customize)).toMatchObject({
    width: "159px",
    height: "136.5px",
  });
  expect(await computed(basic)).toMatchObject({
    width: "167px",
    height: "262px",
  });
  expect(
    await computed(customize.locator(".shlz-empty-state__visual")),
  ).toMatchObject({
    width: "159px",
    height: "60px",
  });
  expect(
    await computed(simple.locator(".shlz-empty-state__title")),
  ).toMatchObject({
    color: "rgb(147, 156, 165)",
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "19.5px",
    letterSpacing: "-0.15px",
  });
  expect(
    await computed(customize.locator(".shlz-empty-state__title")),
  ).toMatchObject({
    color: "rgb(11, 22, 35)",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "20.8px",
    letterSpacing: "-0.16px",
  });
  expect(
    await computed(basic.locator(".shlz-empty-state__visual")),
  ).toMatchObject({
    width: "167px",
    height: "131px",
  });
  expect(
    await computed(basic.locator(".shlz-empty-state__title")),
  ).toMatchObject({
    color: "rgb(11, 22, 35)",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "23.4px",
    letterSpacing: "-0.18px",
  });
  expect(
    await computed(basic.locator(".shlz-empty-state__description")),
  ).toMatchObject({
    color: "rgb(147, 156, 165)",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "20.8px",
    letterSpacing: "-0.16px",
  });
  await expect(
    customize.locator(".shlz-empty-state__actions .shlz-button"),
  ).toHaveCSS("height", "32px");
  await expect(
    customize.locator(".shlz-empty-state__actions .shlz-button"),
  ).toHaveCSS("width", "131px");
  await expect(
    basic.locator(".shlz-empty-state__actions .shlz-button"),
  ).toHaveCSS("height", "40px");
  await expect(
    basic.locator(".shlz-empty-state__actions .shlz-button"),
  ).toHaveCSS("width", "142px");

  await fixture.scrollIntoViewIfNeeded();
  await expect(fixture).toHaveScreenshot("remediation-empty-state.png", {
    maxDiffPixels: 0,
  });
});
