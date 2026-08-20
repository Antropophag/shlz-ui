import { expect, test } from "@playwright/test";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const isolateDocumentationSurface = async (page) => {
  await page.addStyleTag({
    content: `
      .shlz-docs-sidebar { visibility: hidden !important; }
      [data-shlz-dropdown-scrollable-fixture] { display: none !important; }
      #file-row-extension-demo { display: none !important; }
      .shlz-developer-docs, [data-pagination-consumer] { display: none !important; }
      .shlz-select-fixture-label:is(p) { display: none !important; }
      [data-select-source-fixtures][hidden] { display: none !important; }
    `,
  });

  await page.evaluate(() => {
    const production = document.querySelector(
      "#select-demo > [data-select-production-fixtures]",
    );
    const source = document.querySelector(
      "#select-demo > [data-select-source-fixtures]",
    );
    const productionGrid = production?.querySelector(".shlz-component-grid");
    const sourceGrid = source?.querySelector(".shlz-component-grid");
    const heading = production?.querySelector("h4");
    const productionFixtures = [...(productionGrid?.children ?? [])];
    const sourceFixtures = [...(sourceGrid?.children ?? [])];

    if (
      !productionGrid ||
      !source ||
      !heading ||
      productionFixtures.length !== 3 ||
      sourceFixtures.length !== 3
    ) {
      throw new Error("Select legacy fixture normalization contract changed");
    }

    heading.textContent = "Sizes and types";
    productionGrid.replaceChildren(
      productionFixtures[0],
      productionFixtures[1],
      ...sourceFixtures,
      productionFixtures[2],
    );
    source.hidden = true;
  });
};

test("showcase primitives keep their visual contract", async ({ page }) => {
  await isolateDocumentationSurface(page);
  await expect(page.locator("#components")).toHaveScreenshot(
    "showcase-components.png",
  );
});

test("source specification and fidelity surfaces are reviewable", async ({
  page,
}) => {
  await page.locator(".shlz-foundation-evidence").evaluate((details) => {
    details.open = true;
  });
  await isolateDocumentationSurface(page);
  await expectStableShowcaseScreenshot(
    page,
    page.locator("#source-spec"),
    "showcase-source-spec.png",
  );
  const buttonEvidence = page.locator(
    "#button-demo > .shlz-component-diagnostics",
  );
  await buttonEvidence.evaluate((details) => {
    details.open = true;
  });
  await expectStableShowcaseScreenshot(
    page,
    buttonEvidence,
    "showcase-fidelity.png",
  );
  await expect(page.locator("body")).toHaveCSS(
    "font-family",
    /system-ui|-apple-system|Segoe UI/,
  );
});

test("base single Select keeps the shipped native-only contract", async ({
  page,
}) => {
  const selectDemo = page.locator("#select-demo");
  const selects = selectDemo
    .locator(":scope > section")
    .first()
    .locator("select.shlz-select");

  await expect(selects).toHaveCount(3);
  await expect(selects.first()).toHaveJSProperty("tagName", "SELECT");
  await expect(
    selectDemo
      .locator(":scope > section")
      .first()
      .locator("select.shlz-select:enabled"),
  ).toHaveCount(2);
  await expect(
    selectDemo
      .locator(":scope > section")
      .first()
      .locator("select.shlz-select:disabled"),
  ).toHaveCount(1);
  await selects.first().focus();
  await expect(selects.first()).toBeFocused();
  await expect(selectDemo.getByRole("listbox")).toHaveCount(0);
});

test("documented components expose developer usage without mixing diagnostics", async ({
  page,
}) => {
  const documentedComponents = [
    ["button", "button-demo"],
    ["input", "input-demo"],
    ["textarea", "textarea-demo"],
    ["checkbox", "checkbox-demo"],
    ["radio", "radio-demo"],
    ["switch", "switch-demo"],
    ["status", "status-demo"],
    ["badge", "badge-demo"],
    ["tag", "tag-demo"],
    ["person-tag", "tag-demo"],
    ["segment", "segment-demo"],
    ["link", "link-demo"],
    ["avatar", "avatar-demo"],
    ["tabs", "tabs-demo"],
    ["notification", "notification-demo"],
    ["select", "select-demo"],
  ];

  for (const [name, hostId] of documentedComponents) {
    const component = page.locator(`#${hostId}`);
    const docs = component.locator(`[data-component-docs="${name}"]`);
    await expect(docs).toBeVisible();
    await expect(
      docs.getByText(/Executable · Production/).first(),
    ).toBeVisible();
    await expect(
      docs.getByRole("heading", { name: "Copyable usage" }),
    ).toBeVisible();
    await expect(
      docs.getByRole("heading", { name: "Public contract" }),
    ).toBeVisible();
    await expect(
      docs.getByRole("heading", { name: "Accessibility" }),
    ).toBeVisible();
    await expect(
      docs.getByRole("heading", { name: "Limitations" }),
    ).toBeVisible();
    await expect(docs.locator("[data-shlz-snippet]")).not.toHaveCount(0);
    await expect(docs.locator(".shlz-visual-fixture")).toHaveCount(0);
  }
});

test("keyboard focus is visible", async ({ page }) => {
  const primary = page
    .locator("#button-demo")
    .getByRole("button", { name: "Primary", exact: true })
    .first();
  await primary.focus();
  await expect(primary).toBeFocused();
  await expect(primary).toHaveCSS("outline-style", "solid");
  expect(
    await primary.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
});

test("monochrome control icons inherit every control foreground", async ({
  page,
}) => {
  const controls = page.locator("[data-shlz-button-icons] .shlz-button");
  await expect(controls).toHaveCount(8);
  for (const control of await controls.all()) {
    const icon = control.locator("svg.shlz-icon");
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveCSS(
      "color",
      await control.evaluate((node) => window.getComputedStyle(node).color),
    );
  }
  await expectStableShowcaseScreenshot(
    page,
    page.locator("[data-shlz-button-icons]"),
    "button-icon-foregrounds.png",
  );
});

test("existing controls use inheriting monochrome icons without recoloring preserved assets", async ({
  page,
}) => {
  for (const selector of [
    ".shlz-field__control .shlz-icon",
    ".shlz-dropdown__item .shlz-icon",
    ".shlz-pagination__item .shlz-icon",
    ".shlz-segment__label .shlz-icon",
    ".shlz-person-tag .shlz-tag__remove .shlz-icon",
  ]) {
    const icon = page.locator(selector).first();
    await expect(icon).toBeAttached();
    expect(
      await icon.evaluate((node) => window.getComputedStyle(node).color),
    ).toBe(
      await icon.evaluate(
        (node) => window.getComputedStyle(node.parentElement).color,
      ),
    );
  }
  await expect(page.locator(".shlz-icon-card img").first()).toBeAttached();
});

test("native checked and disabled states remain browser-owned", async ({
  page,
}) => {
  const checkbox = page
    .locator('#checkbox-demo .shlz-checkbox--sm[aria-label="checkbox default"]')
    .first();
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();

  const disabledCheckbox = page
    .locator("#checkbox-demo .shlz-checkbox:disabled:not(:checked)")
    .first();
  await expect(disabledCheckbox).toBeDisabled();
  await disabledCheckbox.evaluate((element) => element.click());
  await expect(disabledCheckbox).not.toBeChecked();

  const disabledButton = page
    .locator("#button-demo .shlz-button:disabled")
    .first();
  await expect(disabledButton).toBeDisabled();
});
