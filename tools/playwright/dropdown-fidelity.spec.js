import { expect, test } from "@playwright/test";

const installFixture = async (page) => {
  await page.goto("/?full=1");
  await page.evaluate(
    (items) => {
      document.body.className = "shlz-scope";
      document.body.innerHTML = `<main class="dropdown-wave3-fixture">
      <div class="shlz-dropdown">
        <div class="shlz-dropdown__menu shlz-dropdown__menu--scrollable" role="menu" data-shlz-dropdown-scrollable>
          <div class="shlz-dropdown__scroll-region">
            ${items.map((item) => `<button class="shlz-dropdown__item" type="button" role="menuitem">${item}</button>`).join("")}
          </div>
          <span class="shlz-dropdown__scrollbar" aria-hidden="true"></span>
        </div>
      </div>
    </main>`;
    },
    Array.from({ length: 34 }, (_, index) => `${index + 1} menu item`),
  );
  await page.addStyleTag({
    content: `
      html, body { margin: 0; background: #fff; }
      body { width: 280px; min-height: 420px; }
      .dropdown-wave3-fixture { box-sizing: border-box; width: 280px; height: 420px; padding: 30px; }
      .dropdown-wave3-fixture .shlz-dropdown__menu { position: relative; inset: auto; }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
};

test("Dropdown preserves the source Items=Srollbar composition", async ({
  page,
}) => {
  await installFixture(page);
  const fixture = page.locator(".dropdown-wave3-fixture");
  const menu = fixture.locator("[data-shlz-dropdown-scrollable]");
  const region = menu.locator(".shlz-dropdown__scroll-region");
  const scrollbar = menu.locator(".shlz-dropdown__scrollbar");
  const firstItem = menu.locator(".shlz-dropdown__item").first();
  await expect(menu).toBeVisible();
  await expect(firstItem).toBeVisible();

  const menuStyle = await menu.evaluate((node) => {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {
      width: style.width,
      height: style.height,
      maxHeight: style.maxHeight,
      overflow: style.overflow,
      paddingBlock: style.paddingBlock,
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
    };
  });
  expect(menuStyle).toEqual({
    width: "200px",
    height: "340px",
    maxHeight: "340px",
    overflow: "hidden",
    paddingBlock: "10px",
    borderRadius: "12px",
    backgroundColor: "rgb(255, 255, 255)",
  });
  await expect(menu.locator(".shlz-dropdown__item")).toHaveCount(34);
  await expect(region).toHaveCSS("height", "320px");
  await expect(region).toHaveCSS("overflow-y", "auto");
  expect(await region.evaluate((node) => node.scrollHeight)).toBeGreaterThan(
    320,
  );
  expect(
    await scrollbar.evaluate((node) => {
      const style = node.ownerDocument.defaultView.getComputedStyle(node);
      const menuBox = node.parentElement.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      return {
        size: [box.width, box.height],
        topInset: box.top - menuBox.top,
        rightInset: menuBox.right - box.right,
        radius: style.borderRadius,
        color: style.backgroundColor,
      };
    }),
  ).toEqual({
    size: [6, 80],
    topInset: 10,
    rightInset: 4,
    radius: "3px",
    color: "rgb(209, 216, 223)",
  });

  const itemStyle = await firstItem.evaluate((node) => {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {
      height: node.getBoundingClientRect().height,
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      paddingInline: style.paddingInline,
    };
  });
  expect(itemStyle).toMatchObject({
    height: 40,
    color: "rgb(11, 22, 35)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    fontSize: "14px",
    lineHeight: "20px",
    paddingInline: "16px",
  });
  expect(itemStyle.fontFamily).toContain("Golos Text");

  await expect(fixture).toHaveScreenshot("dropdown-scrollable.png", {
    maxDiffPixels: 0,
  });
});
