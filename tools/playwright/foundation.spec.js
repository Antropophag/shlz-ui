import { expect, test } from "@playwright/test";

test("foundation reconciliation is reviewable at 1440 by 900", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const source = page.locator("#source-spec");
  const production = page.locator("#implementation");
  await page.locator(".shlz-foundation-evidence").evaluate((details) => {
    details.open = true;
  });
  await expect(
    source.getByRole("heading", { name: "Typography evidence" }),
  ).toBeVisible();
  await expect(
    source.getByRole("heading", { name: "Component geometry evidence" }),
  ).toBeVisible();
  await expect(
    production.getByRole("heading", { name: /Production typography/ }),
  ).toBeVisible();
  await expect(source.locator("details")).not.toHaveAttribute("open", "");

  const radii = source.locator(".shlz-radius");
  const boxes = await radii.evaluateAll((elements) =>
    elements.map(({ offsetWidth, offsetHeight }) => [
      offsetWidth,
      offsetHeight,
    ]),
  );
  expect(new Set(boxes.map(String))).toEqual(new Set(["112,112"]));

  await expect(page.locator("body")).toHaveCSS("font-family", /^"Golos Text"/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1440);
});

test("migrated showcase families remain present after reconciliation", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of [
    "button-demo",
    "input-demo",
    "textarea-demo",
    "checkbox-demo",
    "radio-demo",
    "switch-demo",
    "status-demo",
    "badge-demo",
  ]) {
    await expect(page.locator(`#${id}`), id).toBeVisible();
  }
  await page.locator(".shlz-verification-harness").evaluate((details) => {
    details.open = true;
  });
  await expect(page.locator("#fidelity-select"), "select").toBeVisible();
});
