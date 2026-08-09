import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Avatar showcase renders the complete source matrix at exact geometry", async ({
  page,
}) => {
  const avatars = page.locator("#avatar-demo [data-avatar-size]");
  await expect(avatars).toHaveCount(12);
  for (const size of [24, 32, 40, 64]) {
    for (const type of ["text", "image", "icon"]) {
      const avatar = page.locator(
        `#avatar-demo [data-avatar-size="${size}"][data-avatar-type="${type}"]`,
      );
      await expect(avatar).toHaveCount(1);
      expect(
        await avatar.evaluate((node) => node.getBoundingClientRect().width),
      ).toBe(size);
      expect(
        await avatar.evaluate((node) => node.getBoundingClientRect().height),
      ).toBe(size);
      if (type !== "text") {
        expect(
          await avatar.evaluate((node) => {
            const graphic = node.querySelector("img, svg");
            if (!graphic) return false;
            const style = window.getComputedStyle(graphic);
            const box = graphic.getBoundingClientRect();
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              Number(style.opacity) === 0 ||
              box.width === 0 ||
              box.height === 0
            )
              return false;
            if (graphic instanceof window.HTMLImageElement)
              return (
                graphic.complete &&
                graphic.naturalWidth > 0 &&
                graphic.naturalHeight > 0
              );
            const use = graphic.querySelector("use");
            if (use) {
              const bounds = use.getBBox();
              return (
                Boolean(
                  use.getAttribute("href") || use.getAttribute("xlink:href"),
                ) &&
                bounds.width > 0 &&
                bounds.height > 0
              );
            }
            const painted = [...graphic.querySelectorAll("path, circle, rect")];
            return painted.some((shape) => {
              const bounds = shape.getBoundingClientRect();
              const paint = window.getComputedStyle(shape);
              return (
                bounds.width > 0 &&
                bounds.height > 0 &&
                (paint.fill !== "none" || paint.stroke !== "none")
              );
            });
          }),
        ).toBe(true);
      }
    }
  }
  const icon = page.locator(
    '#avatar-demo [data-avatar-size="64"][data-avatar-type="icon"] .shlz-icon',
  );
  await expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  expect(
    await icon.evaluate((node) => node.getBoundingClientRect().width),
  ).toBe(40);
  await expect(page.locator("#avatar-demo")).toHaveScreenshot(
    "wave3-avatar.png",
  );
});

test("Table showcase remains a 50px coherent grid with bounded affordances", async ({
  page,
}) => {
  const table = page.locator("#table-demo .shlz-table");
  const rows = table.locator("tr");
  await expect(rows).toHaveCount(3);
  for (const row of await rows.all()) {
    expect(
      await row.evaluate((node) => node.getBoundingClientRect().height),
    ).toBe(50);
  }
  for (const icon of await table
    .locator(".shlz-table__affordance .shlz-icon")
    .all()) {
    const box = await icon.boundingBox();
    expect(box.width).toBe(16);
    expect(box.height).toBe(16);
    await expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  }
  const editor = table.locator(".shlz-table__editor");
  await expect(editor).toHaveCSS("border-top-width", "0px");
  await expect(editor).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(table.locator(".shlz-checkbox")).toHaveCount(3);
  await expect(table.locator(".shlz-status")).toHaveCount(1);
  await expect(table.locator(".shlz-table__dropdown")).toHaveCount(2);
  await expect(page.locator("#table-demo")).toHaveScreenshot("wave3-table.png");
});
