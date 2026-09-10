import { expect, test } from "@playwright/test";

const expected = {
  appeals: { variants: 4, columns: 9 },
  "status-management": { variants: 4, columns: 4 },
  "organization-management": { variants: 3, columns: 4 },
  "profile-management": { variants: 3, columns: 4 },
  "linked-profiles": { variants: 2, columns: 9 },
  "category-management": { variants: 3, columns: 7 },
  "field-management": { variants: 6, columns: [4, 10] },
  "auto-assignment": { variants: 3, columns: 6 },
  directories: { variants: 3, columns: 3 },
};

test.beforeEach(async ({ page }) => page.goto("/?full=1#table-compositions"));

test("Table.svg families render native source-shaped rows", async ({
  page,
}) => {
  const root = page.locator(".shlz-table-compositions");
  expect(
    await root
      .locator("table")
      .evaluateAll((tables) => tables.every((table) => table.inert)),
  ).toBe(true);
  await expect(root.locator("table")).toHaveCount(10);
  await expect(root.locator("[data-table-composition-variant]")).toHaveCount(
    31,
  );

  for (const [family, contract] of Object.entries(expected)) {
    const figures = root.locator(`[data-table-composition-family="${family}"]`);
    await expect(figures).toHaveCount(Array.isArray(contract.columns) ? 2 : 1);
    await expect(
      figures.locator("[data-table-composition-variant]"),
    ).toHaveCount(contract.variants);
    const columnCounts = await figures
      .locator("table")
      .evaluateAll((tables) =>
        tables.map((table) => table.tHead.rows[0].cells.length),
      );
    expect(columnCounts).toEqual(
      Array.isArray(contract.columns) ? contract.columns : [contract.columns],
    );
  }
});

test("composition rows retain observed geometry and state paint", async ({
  page,
}) => {
  const root = page.locator(".shlz-table-compositions");
  const appealsHeader = root.locator(
    "[data-table-composition-family='appeals'] thead tr",
  );
  await expect(appealsHeader).toHaveCSS("height", "50px");
  for (const row of await root.locator("[data-source-height='50']").all())
    await expect(row).toHaveCSS("height", "50px");

  const hover = root
    .locator("[data-source-state='hover']")
    .first()
    .locator("td")
    .first();
  await expect(hover).toHaveCSS("background-color", "rgb(238, 240, 244)");
  const active = root
    .locator("[data-source-state='active']")
    .first()
    .locator("td")
    .first();
  await expect(active).toHaveCSS("background-color", "rgb(244, 246, 249)");
  const dotsPressed = root
    .locator("[data-source-state='dots-pressed']")
    .locator("td")
    .first();
  await expect(dotsPressed).toHaveCSS("background-color", "rgb(238, 240, 244)");
});

test("transferred layouts contain their observed nested primitives", async ({
  page,
}) => {
  const root = page.locator(".shlz-table-compositions");
  await expect(root.locator("input.shlz-checkbox")).not.toHaveCount(0);
  await expect(root.locator(".shlz-status")).not.toHaveCount(0);
  await expect(root.locator(".shlz-table__priority")).not.toHaveCount(0);
  await expect(root.locator("input[role='switch']")).not.toHaveCount(0);
  await expect(root.locator("input[role='switch']").first()).toHaveCSS(
    "width",
    "38px",
  );
  await expect(root.locator("input[role='switch']").first()).toHaveCSS(
    "height",
    "20px",
  );
  await expect(
    root.locator(
      "[data-table-composition-family='appeals'] thead [aria-label='Приоритет']",
    ),
  ).toHaveCount(1);
  await expect(
    root.getByRole("button", { name: "Редактировать", includeHidden: true }),
  ).not.toHaveCount(0);
  await expect(
    root.getByRole("button", { name: "Другие действия", includeHidden: true }),
  ).not.toHaveCount(0);
});

test("all table composition icons are real painted source graphics", async ({
  page,
}) => {
  const root = page.locator(".shlz-table-compositions");
  const broken = await root
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((img) => !img.complete || !img.naturalWidth)
        .map((img) => img.src),
    );
  expect(broken).toEqual([]);
  for (const icon of await root.locator(".shlz-table__icon-action svg").all()) {
    const box = await icon.evaluate((svg) => ({ width: svg.getBBox().width }));
    expect(box.width).toBeGreaterThan(0);
    const painted = await icon.evaluate((svg) =>
      [
        ...svg.querySelectorAll("path, circle, rect, line, polyline, polygon"),
      ].some((shape) => {
        const bounds = shape.getBBox();
        const style = window.getComputedStyle(shape);
        const visibleColor = (paint) =>
          paint !== "none" &&
          paint !== "transparent" &&
          !/rgba\([^)]*,\s*0\)$/.test(paint);
        for (let node = shape; node; node = node.parentElement) {
          const parentStyle = window.getComputedStyle(node);
          if (
            Number(parentStyle.opacity) === 0 ||
            parentStyle.visibility !== "visible" ||
            parentStyle.display === "none"
          )
            return false;
          if (node === svg) break;
        }
        return (
          (bounds.width > 0 || bounds.height > 0) &&
          ((bounds.width > 0 &&
            bounds.height > 0 &&
            Number(style.fillOpacity) > 0 &&
            visibleColor(style.fill)) ||
            (Number.parseFloat(style.strokeWidth) > 0 &&
              Number(style.strokeOpacity) > 0 &&
              visibleColor(style.stroke)))
        );
      }),
    );
    expect(painted).toBe(true);
  }
});

test("native non-Table occurrences have explicit independent ownership", async ({
  page,
}) => {
  const { readFile } = await import("node:fs/promises");
  const manifest = JSON.parse(
    await readFile(
      new globalThis.URL(
        "../../docs/component-audits/table.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const inventory = await page
    .locator("table:not(.shlz-table)")
    .evaluateAll(
      (tables, rules) =>
        tables.map((table) =>
          rules
            .filter((rule) => table.matches(rule.selector))
            .map((rule) => rule.selector),
        ),
      manifest.nativeTableCensus,
    );
  expect(inventory.every((matches) => matches.length === 1)).toBe(true);
  for (const entry of manifest.nativeTableCensus)
    await expect(page.locator(entry.selector)).toHaveCount(entry.observedCount);
});

test("source composition viewers scroll with keyboard while their controls stay inert", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const viewer = page.locator("[data-table-source-scroll]").first();
  await expect(viewer.locator(":scope > .shlz-visually-hidden")).toContainText(
    "Статический образец Table.svg",
  );
  await viewer.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => viewer.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  expect(await viewer.locator("table").evaluate((el) => el.inert)).toBe(true);
});
