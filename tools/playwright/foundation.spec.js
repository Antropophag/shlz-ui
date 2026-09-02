import { expect, test } from "@playwright/test";

test("foundation reconciliation is reviewable at 1440 by 900", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?full=1");

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
  await page.goto("/?full=1");
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

test("foundation tokens resolve exactly in representative production consumers", async ({
  page,
}) => {
  await page.goto("/?full=1");

  const values = await page.evaluate(() => {
    const root = window.getComputedStyle(document.documentElement);
    const body = window.getComputedStyle(document.querySelector(".shlz-scope"));
    const control = window.getComputedStyle(
      document.querySelector(".shlz-field__control"),
    );
    const stack = window.getComputedStyle(
      document.querySelector(".shlz-stack"),
    );
    const notification = window.getComputedStyle(
      document.querySelector(".shlz-notification"),
    );
    return {
      primary: root
        .getPropertyValue("--shlz-source-color-dark-blue-dark-blue")
        .trim(),
      alpha: root
        .getPropertyValue("--shlz-source-color-dark-blue-dark-blue-10")
        .trim(),
      spacing: root.getPropertyValue("--shlz-source-spacing-16").trim(),
      radius: root.getPropertyValue("--shlz-source-radius-regular").trim(),
      maxRadius: root.getPropertyValue("--shlz-source-radius-max").trim(),
      surfaceColor: body.color,
      surfaceBackground: body.backgroundColor,
      stackGap: stack.gap,
      controlHeight: control.height,
      controlRadius: control.borderRadius,
      notificationShadow: notification.boxShadow,
    };
  });

  expect(values).toEqual({
    primary: "#0B1623",
    alpha: "rgb(11 22 35 / 10%)",
    spacing: "16px",
    radius: "12px",
    maxRadius: "100px",
    surfaceColor: "rgb(11, 22, 35)",
    surfaceBackground: "rgb(255, 255, 255)",
    stackGap: "16px",
    controlHeight: "40px",
    controlRadius: "20px",
    notificationShadow: "rgba(11, 22, 35, 0.1) 0px 4px 15px 0px",
  });
});
