import { expect, test } from "@playwright/test";

const representativeIcons = [
  "add-documents",
  "filter",
  "flag",
  "arrow-opened",
  "close-remove",
  "user-1",
  "document-badge-plus",
  "six-dot-grid",
  "file-pdf",
  "delivery-4",
  "calendar-interface",
  "xls-file",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/?full=1#icons");
  await page.addStyleTag({
    content: `
      .shlz-docs-sidebar { display: none !important; }
      #file-row-extension-demo { display: none !important; }
    `,
  });
});

test("all catalog icon families resolve to painted production sprite symbols", async ({
  page,
}) => {
  const cards = page.locator(".shlz-icon-card");
  await expect(cards).toHaveCount(181);
  await expect(page.locator("[data-icon-related-name]")).toHaveCount(63);
  const failures = await cards.evaluateAll((items) =>
    items.flatMap((card) => {
      const graphic = card.querySelector(
        ":scope > svg.shlz-icon, :scope > img",
      );
      const valid = (() => {
        if (!graphic) return false;
        if (graphic instanceof window.HTMLImageElement)
          return graphic.complete && graphic.naturalWidth > 0;
        const use = graphic.querySelector("use");
        if (!use?.getAttribute("href")) return false;
        const bounds = use.getBBox();
        return bounds.width > 0 || bounds.height > 0;
      })();
      return valid ? [] : [card.dataset.iconName];
    }),
  );
  expect(failures).toEqual([]);
});

test("outlined icons do not acquire an implicit solid fill", async ({
  page,
}) => {
  const implicitFills = await page.evaluate(async () => {
    const uses = [...document.querySelectorAll(".shlz-icon-card > svg use")];
    const spriteUrl = uses[0].href.baseVal.split("#")[0];
    const sprite = new window.DOMParser().parseFromString(
      await (await window.fetch(spriteUrl)).text(),
      "image/svg+xml",
    );
    return uses.flatMap((use) => {
      const name = use.closest("[data-icon-name]")?.dataset.iconName;
      const symbol = sprite.querySelector(`#${use.href.baseVal.split("#")[1]}`);
      return symbol?.getAttribute("fill") !== "none" &&
        symbol?.querySelector("[stroke]:not([fill])")
        ? [name]
        : [];
    });
  });
  expect([...new Set(implicitFills)]).toEqual([]);
});

test("standalone monochrome icons use the semantic default foreground", async ({
  page,
}) => {
  const monochrome = page.locator(
    '.shlz-icon-card[data-icon-color-mode="currentColor"] > svg.shlz-icon',
  );
  expect(await monochrome.count()).toBeGreaterThan(0);
  const colors = await monochrome.evaluateAll((items) => [
    ...new Set(items.map((item) => window.getComputedStyle(item).color)),
  ]);
  const semanticDefault = await page
    .locator(".shlz-scope")
    .evaluate((node) => window.getComputedStyle(node).color);
  expect(colors).toEqual([semanticDefault]);

  const inherited = await page.locator(".shlz-scope").evaluate((scope) => {
    const host = document.createElement("span");
    host.style.color = "rgb(198, 31, 55)";
    host.innerHTML =
      '<svg class="shlz-icon shlz-icon--inherit" viewBox="0 0 1 1"><rect width="1" height="1" fill="currentColor"></rect></svg>';
    scope.append(host);
    const color = window.getComputedStyle(host.firstElementChild).color;
    host.remove();
    return color;
  });
  expect(inherited).toBe("rgb(198, 31, 55)");
});

test("representative paint topologies remain visually stable", async ({
  page,
}) => {
  await page.evaluate((names) => {
    const fixture = document.createElement("div");
    fixture.className = "shlz-icon-grid shlz-icon-regression-fixture";
    for (const name of names)
      fixture.append(
        document.querySelector(`[data-icon-name="${name}"]`).cloneNode(true),
      );
    document.querySelector(".shlz-icon-catalog").prepend(fixture);
  }, representativeIcons);
  const fixture = page.locator(".shlz-icon-regression-fixture");
  await expect(fixture.locator(".shlz-icon-card")).toHaveCount(
    representativeIcons.length,
  );
  const boxes = await fixture
    .locator(".shlz-icon-card > :is(svg, img)")
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().toJSON()),
    );
  expect(boxes.every(({ width, height }) => width > 0 && height > 0)).toBe(
    true,
  );
});

test("plain HTML consumes both calendars and preserved-paint sheet icons", async ({
  page,
}) => {
  const sources = await page.evaluate(() => {
    const spriteUrl = document
      .querySelector(".shlz-icon-card use")
      .getAttribute("href")
      .split("#")[0];
    return Object.fromEntries(
      ["calendar-sidebar", "calendar-interface", "xls-file"].map((name) => {
        const card = document.querySelector(`[data-icon-name="${name}"]`);
        return [
          name,
          card?.querySelector("use")?.getAttribute("href") ??
            card?.querySelector("img")?.src ??
            `${spriteUrl}#shlz-icon-${name}`,
        ];
      }),
    );
  });
  await page.setContent(`
    <!doctype html>
    <html lang="en"><body>
      <svg data-icon-consumer-name="calendar-sidebar" viewBox="0 0 24 24" role="img" aria-label="Navigation calendar"><use href="${sources["calendar-sidebar"]}"></use></svg>
      <svg data-icon-consumer-name="calendar-interface" viewBox="0 0 24 24" role="img" aria-label="Form calendar"><use href="${sources["calendar-interface"]}"></use></svg>
      <img data-icon-consumer-name="xls-file" src="${sources["xls-file"]}" alt="Spreadsheet file">
    </body></html>
  `);
  const icons = page.locator("[data-icon-consumer-name]");
  await expect(icons).toHaveCount(3);
  expect(
    await icons.evaluateAll((items) =>
      items.map((item) => ({
        name: item.dataset.iconConsumerName,
        loaded:
          item.tagName === "IMG"
            ? item.complete && item.naturalWidth > 0
            : (() => {
                const bounds = item.querySelector("use").getBBox();
                return bounds.width > 0 && bounds.height > 0;
              })(),
        label: item.getAttribute("alt") ?? item.getAttribute("aria-label"),
      })),
    ),
  ).toEqual([
    {
      name: "calendar-sidebar",
      loaded: true,
      label: "Navigation calendar",
    },
    {
      name: "calendar-interface",
      loaded: true,
      label: "Form calendar",
    },
    {
      name: "xls-file",
      loaded: true,
      label: "Spreadsheet file",
    },
  ]);
});
