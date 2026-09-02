import { expect, test } from "@playwright/test";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1");
});

const isolateDocumentationSurface = async (page) => {
  await page.addStyleTag({
    content: `
      .shlz-docs-sidebar { visibility: hidden !important; }
      [data-shlz-dropdown-scrollable-fixture] { display: none !important; }
      #file-row-extension-demo { display: none !important; }
      .shlz-developer-docs, [data-pagination-consumer] { display: none !important; }
      .shlz-select-fixture-label:is(p) { display: none !important; }
    `,
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

test("base single Select exposes the shipped trigger and listbox contract", async ({
  page,
}) => {
  const selectDemo = page.locator("#select-demo");
  const nativeSelects = selectDemo
    .locator("[data-select-production-fixtures]")
    .locator("select.shlz-select");

  await expect(nativeSelects).toHaveCount(0);
  const triggers = selectDemo.locator(
    '[data-select-production-fixtures] [data-shlz-select] [aria-haspopup="listbox"]',
  );
  await expect(triggers).toHaveCount(6);
  await expect(
    selectDemo.locator(
      '[data-select-production-fixtures] [data-shlz-select] [aria-haspopup="listbox"]:disabled',
    ),
  ).toHaveCount(1);
  await triggers.first().focus();
  await expect(triggers.first()).toBeFocused();
  const listboxes = selectDemo.locator(
    '[data-select-production-fixtures] [role="listbox"]',
  );
  await expect(listboxes).toHaveCount(6);
  for (const listbox of await listboxes.all())
    await expect(listbox).toBeHidden();
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
