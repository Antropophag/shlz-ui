import { expect, test } from "@playwright/test";

const installFixture = async (page, markup) => {
  await page.goto("/");
  await page.evaluate((html) => {
    document.body.innerHTML = html;
    document.body.className = "shlz-scope";
  }, markup);
  await page.addStyleTag({
    content: `
      html, body { margin: 0; background: #fff; }
      body { width: 640px; min-height: 480px; }
      .wave2-fixture { box-sizing: border-box; width: 640px; padding: 32px; }
      .wave2-tooltip-grid {
        display: grid;
        grid-template-columns: repeat(4, 100px);
        gap: 48px 32px;
        align-items: center;
      }
      .wave2-tooltip {
        position: relative;
        inset: auto;
        display: block;
      }
      .wave2-tooltip[data-placement^="top"] .shlz-tooltip__arrow {
        inset-block-end: -4px;
        inset-inline-start: calc(50% - 4px);
      }
      .wave2-tooltip[data-placement^="bottom"] .shlz-tooltip__arrow {
        inset-block-start: -4px;
        inset-inline-start: calc(50% - 4px);
      }
      .wave2-tooltip[data-placement="left"] .shlz-tooltip__arrow {
        inset-block-start: calc(50% - 4px);
        inset-inline-end: -4px;
      }
      .wave2-tooltip[data-placement="right"] .shlz-tooltip__arrow {
        inset-block-start: calc(50% - 4px);
        inset-inline-start: -4px;
      }
      .wave2-tooltip[data-placement$="start"] .shlz-tooltip__arrow {
        inset-inline-start: 18px;
      }
      .wave2-tooltip[data-placement$="end"] .shlz-tooltip__arrow {
        inset-inline: auto 18px;
      }
      .wave2-link-grid {
        display: grid;
        grid-template-columns: repeat(4, max-content);
        gap: 32px;
        align-items: center;
      }
    `,
  });
  await page.evaluate(() => document.fonts.ready);
};

const computed = (locator) =>
  locator.evaluate((node) => {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {
      width: style.width,
      height: style.height,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      paddingBlock: style.paddingBlock,
      paddingInline: style.paddingInline,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textDecorationLine: style.textDecorationLine,
    };
  });

test("Tooltip preserves source typography, surface and placement geometry", async ({
  page,
}) => {
  const placements = [
    "top-start",
    "top",
    "top-end",
    "left",
    "right",
    "bottom-start",
    "bottom",
    "bottom-end",
  ];
  await installFixture(
    page,
    `<main class="wave2-fixture"><div class="wave2-tooltip-grid">${placements
      .map(
        (placement) =>
          `<div class="shlz-tooltip wave2-tooltip" role="tooltip" data-placement="${placement}">prompt text<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div>`,
      )
      .join("")}</div></main>`,
  );

  const tooltips = page.locator(".wave2-tooltip");
  await expect(tooltips).toHaveCount(8);
  const style = await computed(tooltips.first());
  expect(style).toMatchObject({
    width: "100px",
    height: "37px",
    color: "rgb(255, 255, 255)",
    backgroundColor: "rgb(11, 22, 35)",
    borderRadius: "8px",
    boxShadow: "none",
    paddingBlock: "8px",
    paddingInline: "8px",
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "19.5px",
    letterSpacing: "-0.15px",
  });
  expect(style.fontFamily).toContain("Golos Text");

  const arrows = tooltips.locator(".shlz-tooltip__arrow");
  await expect(arrows).toHaveCount(8);
  for (const arrow of await arrows.all()) {
    expect(
      await arrow.evaluate((node) => [node.offsetWidth, node.offsetHeight]),
    ).toEqual([8, 8]);
    await expect(arrow).toHaveCSS("background-color", "rgb(11, 22, 35)");
  }
  const geometry = await tooltips.evaluateAll((nodes) =>
    nodes.map((node) => {
      const surface = node.getBoundingClientRect();
      const arrow = node
        .querySelector(".shlz-tooltip__arrow")
        .getBoundingClientRect();
      return {
        placement: node.dataset.placement,
        surface: [surface.width, surface.height],
        arrow: [arrow.width, arrow.height],
        centerX: arrow.left + arrow.width / 2 - surface.left,
        centerY: arrow.top + arrow.height / 2 - surface.top,
      };
    }),
  );
  expect(
    geometry.every(({ surface }) => surface[0] === 100 && surface[1] === 37),
  ).toBe(true);
  expect(geometry.find(({ placement }) => placement === "top").centerX).toBe(
    50,
  );
  expect(geometry.find(({ placement }) => placement === "bottom").centerX).toBe(
    50,
  );
  expect(geometry.find(({ placement }) => placement === "left").centerY).toBe(
    18.5,
  );
  expect(geometry.find(({ placement }) => placement === "right").centerY).toBe(
    18.5,
  );

  await expect(page.locator(".wave2-fixture")).toHaveScreenshot(
    "wave2-tooltip.png",
    { maxDiffPixels: 0 },
  );
});

test("Link preserves the exact four-state source contract", async ({
  page,
}) => {
  await installFixture(
    page,
    `<main class="wave2-fixture"><div class="wave2-link-grid">
      <a class="shlz-link" href="#default">Link</a>
      <a class="shlz-link shlz-link--visual-hover" href="#hover">Link</a>
      <a class="shlz-link shlz-link--visual-pressed" href="#pressed">Link</a>
      <span class="shlz-link shlz-link--disabled" aria-disabled="true">Link</span>
    </div></main>`,
  );

  const links = page.locator(".shlz-link");
  await expect(links).toHaveCount(4);
  const styles = await links.evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = node.ownerDocument.defaultView.getComputedStyle(node);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textDecorationLine: style.textDecorationLine,
      };
    }),
  );
  expect(styles.map(({ color }) => color)).toEqual([
    "rgb(37, 61, 152)",
    "rgb(66, 91, 166)",
    "rgb(22, 39, 115)",
    "rgb(115, 131, 190)",
  ]);
  for (const style of styles) {
    expect(style).toMatchObject({
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "21px",
      letterSpacing: "-0.16px",
      textDecorationLine: "none",
    });
    expect(style.fontFamily).toContain("Golos Text");
  }
  await expect(links.nth(3)).not.toHaveAttribute("href");

  await expect(page.locator(".wave2-fixture")).toHaveScreenshot(
    "wave2-link.png",
    { maxDiffPixels: 0 },
  );
});
