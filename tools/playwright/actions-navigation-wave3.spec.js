import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import { expectStableShowcaseScreenshot } from "./visual-harness.js";

const manifests = Object.fromEntries(
  await Promise.all(
    ["button", "link", "segment", "tabs", "pagination"].map(
      async (component) => [
        component,
        await readComponentAuditManifest(
          new globalThis.URL(
            `../../docs/component-audits/${component}.json`,
            import.meta.url,
          ),
        ),
      ],
    ),
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("all Wave 3 executable and live roots are semantically classified", async ({
  page,
}) => {
  for (const manifest of Object.values(manifests)) {
    const inventory = await expectClassifiedComponentOccurrences(
      page,
      manifest,
    );
    expect(inventory.unclassifiedLegacy).toEqual([]);
  }
});

test("Button preserves native activation, disabled and event ownership", async ({
  page,
}) => {
  const button = page.locator("#button-demo .shlz-button--primary").first();
  const disabled = page
    .locator("#button-demo .shlz-button--primary:disabled")
    .first();
  await button.evaluate((element) => {
    element.dataset.clicks = "0";
    element.addEventListener("click", () => {
      element.dataset.clicks = String(Number(element.dataset.clicks) + 1);
    });
  });
  await button.click();
  await expect(button).toHaveAttribute("data-clicks", "1");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("data-clicks", "2");
  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("data-clicks", "3");
  await button.evaluate((element) => element.click());
  await expect(button).toHaveAttribute("data-clicks", "4");

  await disabled.evaluate((element) => {
    element.dataset.clicks = "0";
    element.addEventListener("click", () => {
      element.dataset.clicks = String(Number(element.dataset.clicks) + 1);
    });
  });
  await disabled.click({ force: true });
  await expect(disabled).toHaveAttribute("data-clicks", "0");
  await disabled.focus();
  await expect(disabled).not.toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(disabled).toHaveAttribute("data-clicks", "0");
  await disabled.evaluate((element) => element.click());
  await expect(disabled).toHaveAttribute("data-clicks", "0");
  await expect(disabled).toBeDisabled();
  expect(
    await page.locator(".shlz-button a, .shlz-button button").count(),
  ).toBe(0);
  await expect(page.locator("[data-workspace-apply-filter]")).toHaveAttribute(
    "value",
    "apply",
  );
  await expect(page.locator("[data-workspace-reset-filter]")).toHaveAttribute(
    "type",
    "button",
  );
});

test("Button real interaction paint matches every source-backed mode state", async ({
  page,
}) => {
  const matrix = page.locator("[data-shlz-button-source-matrix]");
  const modes = {
    primary: {
      selector: ".shlz-button--primary",
      states: [
        ["rgb(255, 255, 255)", "rgb(37, 61, 152)"],
        ["rgb(255, 255, 255)", "rgb(66, 91, 166)"],
        ["rgb(255, 255, 255)", "rgb(22, 39, 115)"],
        ["rgb(255, 255, 255)", "rgb(115, 131, 190)"],
      ],
    },
    secondary: {
      selector:
        ".shlz-button:not(.shlz-button--primary):not(.shlz-button--text)",
      states: [
        ["rgb(11, 22, 35)", "rgb(238, 240, 244)"],
        ["rgb(37, 61, 152)", "rgb(238, 240, 244)"],
        ["rgb(22, 39, 115)", "rgb(223, 226, 240)"],
        ["rgb(147, 156, 165)", "rgb(238, 240, 244)"],
      ],
    },
    text: {
      selector: ".shlz-button--text",
      states: [
        ["rgb(11, 22, 35)", "rgb(255, 255, 255)"],
        ["rgb(37, 61, 152)", "rgb(238, 240, 244)"],
        ["rgb(22, 39, 115)", "rgb(223, 226, 240)"],
        ["rgb(147, 156, 165)", "rgb(255, 255, 255)"],
      ],
    },
  };
  const paint = (locator) =>
    locator.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

  const expectedPaint = ([color, backgroundColor]) => ({
    color,
    backgroundColor,
  });

  for (const [mode, { selector, states }] of Object.entries(modes)) {
    const fixtures = matrix.locator(selector);
    const live = fixtures.nth(0);
    const visualHover = fixtures.nth(1);
    const visualActive = fixtures.nth(2);
    const disabled = fixtures.nth(3);

    await page.mouse.move(0, 0);
    expect(await paint(live), `${mode} default`).toMatchObject(
      expectedPaint(states[0]),
    );

    await live.hover();
    expect(await paint(live), `${mode} real hover`).toMatchObject(
      expectedPaint(states[1]),
    );
    expect(
      await paint(live),
      `${mode} hover fixture equivalence`,
    ).toMatchObject(await paint(visualHover));

    await page.mouse.down();
    expect(await paint(live), `${mode} real active`).toMatchObject(
      expectedPaint(states[2]),
    );
    expect(
      await paint(live),
      `${mode} active fixture equivalence`,
    ).toMatchObject(await paint(visualActive));
    await page.mouse.up();

    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await live.focus();
    await expect(live).toBeFocused();
    expect(await paint(live), `${mode} real focus-visible paint`).toMatchObject(
      expectedPaint(states[0]),
    );
    expect(
      await live.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return {
          outlineColor: style.outlineColor,
          outlineStyle: style.outlineStyle,
        };
      }),
      `${mode} real focus-visible`,
    ).toEqual({
      outlineColor: "rgb(37, 61, 152)",
      outlineStyle: "solid",
    });

    expect(await paint(disabled), `${mode} disabled`).toMatchObject(
      expectedPaint(states[3]),
    );
  }
});

test("Link remains native navigation and unavailable text is inert", async ({
  page,
}) => {
  const link = page.locator("#link-demo a.shlz-link").first();
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#link-demo$/);
  await expect(link).toHaveAttribute("href", "#link-demo");
  const unavailable = page.locator("#link-demo .shlz-link--disabled");
  await expect(unavailable).toHaveJSProperty("tagName", "SPAN");
  await expect(unavailable).not.toHaveAttribute("href");
  await expect(unavailable).not.toHaveAttribute("role");
  await expect(page.locator("div[role='link'], span[role='link']")).toHaveCount(
    0,
  );
});

test("Segment uses one native radio lifecycle without a controller", async ({
  page,
}) => {
  const group = page.locator("#segment-demo fieldset.shlz-segment").first();
  const inputs = group.locator("input[type='radio']");
  await inputs.evaluateAll((elements) => {
    window.__segmentEvents = { input: 0, change: 0 };
    for (const element of elements) {
      element.addEventListener("input", () => window.__segmentEvents.input++);
      element.addEventListener("change", () => window.__segmentEvents.change++);
    }
  });
  const month = group.getByRole("radio", { name: "Месяц" });
  await month.click();
  await expect(month).toBeChecked();
  expect(await page.evaluate(() => window.__segmentEvents)).toEqual({
    input: 1,
    change: 1,
  });
  await page.evaluate(() => {
    window.__segmentEvents = { input: 0, change: 0 };
  });
  const week = group.getByRole("radio", { name: "Неделя" });
  await week.focus();
  await page.keyboard.press("Space");
  await expect(week).toBeChecked();
  await expect(month).not.toBeChecked();
  expect(await page.evaluate(() => window.__segmentEvents)).toEqual({
    input: 1,
    change: 1,
  });
  await month.focus();
  await page.keyboard.press("Space");
  await expect(month).toBeChecked();
  await expect(week).not.toBeChecked();
  expect(await page.evaluate(() => window.__segmentEvents)).toEqual({
    input: 2,
    change: 2,
  });
  await page.keyboard.press("ArrowLeft");
  await expect(group.getByRole("radio", { name: "Неделя" })).toBeChecked();
  expect(await page.evaluate(() => window.__segmentEvents)).toEqual({
    input: 3,
    change: 3,
  });
  const disabled = group.getByRole("radio", { name: "Год" });
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  await disabled.focus();
  await expect(disabled).not.toBeFocused();
  await page.keyboard.press("Space");
  await disabled.evaluate((element) => element.click());
  await expect(disabled).not.toBeChecked();
  expect(await page.evaluate(() => window.__segmentEvents)).toEqual({
    input: 3,
    change: 3,
  });
});

test("Tabs validates ARIA, skips disabled, is idempotent and tears down", async ({
  page,
}) => {
  const root = page.locator("#tabs-demo [data-shlz-tabs]");
  await expect(root.locator('[role="tab"][aria-selected="true"]')).toHaveCount(
    1,
  );
  await expect(root.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  const first = root.getByRole("tab", { name: "Первый" });
  const second = root.getByRole("tab", { name: "Второй" });
  const disabled = root.getByRole("tab", { name: "Disabled" });
  const firstPanel = root.getByRole("tabpanel", {
    name: "Первый",
    includeHidden: true,
  });
  const secondPanel = root.getByRole("tabpanel", {
    name: "Второй",
    includeHidden: true,
  });

  await second.click();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("tabindex", "0");
  await expect(first).toHaveAttribute("aria-selected", "false");
  await expect(first).toHaveAttribute("tabindex", "-1");
  await expect(secondPanel).toBeVisible();
  await expect(firstPanel).toBeHidden();

  await disabled.click({ force: true });
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(secondPanel).toBeVisible();
  await expect(firstPanel).toBeHidden();
  await disabled.evaluate((element) => {
    const controller = window.__shlzEnhanceTabs(
      element.closest("[data-shlz-tabs]").parentElement,
    )[0];
    controller.activate(element);
  });
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(secondPanel).toBeVisible();
  await expect(firstPanel).toBeHidden();

  await first.focus();
  await page.keyboard.press("End");
  await expect(second).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(first).toBeFocused();

  expect(
    await page.evaluate(() => {
      const before = window.__shlzTabsControllers[0];
      return window.__shlzEnhanceTabs()[0] === before;
    }),
  ).toBe(true);
  await page.evaluate(() => window.__shlzTabsControllers[0].destroy());
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(first).toBeFocused();
  await page.evaluate(() => {
    window.__shlzTabsControllers = window.__shlzEnhanceTabs();
  });
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();

  const error = await page.evaluate(() => {
    const host = document.createElement("div");
    const malformed = document.createElement("div");
    malformed.dataset.shlzTabs = "";
    malformed.innerHTML = `<div role="tablist" aria-label="Broken"><button role="tab">Broken</button></div>`;
    host.append(malformed);
    document.body.append(host);
    try {
      window.__shlzEnhanceTabs(host);
      return null;
    } catch (caught) {
      return caught instanceof TypeError ? caught.message : String(caught);
    } finally {
      host.remove();
    }
  });
  expect(error).toContain("requires id and aria-controls");
});

test("Tabs rejects duplicate and cross-root ARIA without rebinding valid roots", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const host = document.createElement("section");
    const validRoot = (name) => `
      <div data-shlz-tabs data-test-tabs-root="${name}">
        <div role="tablist" aria-label="${name}">
          <button id="${name}-tab-a" role="tab" aria-controls="${name}-panel-a" aria-selected="true">${name} A</button>
          <button id="${name}-tab-b" role="tab" aria-controls="${name}-panel-b">${name} B</button>
        </div>
        <div id="${name}-panel-a" role="tabpanel" aria-labelledby="${name}-tab-a">${name} panel A</div>
        <div id="${name}-panel-b" role="tabpanel" aria-labelledby="${name}-tab-b" hidden>${name} panel B</div>
      </div>`;
    host.innerHTML = validRoot("alpha") + validRoot("beta");
    document.body.append(host);
    const initial = window.__shlzEnhanceTabs(host);

    const malformedCases = [
      {
        name: "duplicate tab id",
        markup: `<div data-shlz-tabs><div role="tablist"><button id="alpha-tab-a" role="tab" aria-controls="duplicate-tab-panel">Duplicate tab</button></div><div id="duplicate-tab-panel" role="tabpanel" aria-labelledby="alpha-tab-a"></div></div>`,
      },
      {
        name: "duplicate panel id",
        markup: `<div data-shlz-tabs><div role="tablist"><button id="duplicate-panel-tab" role="tab" aria-controls="alpha-panel-a">Duplicate panel</button></div><div id="alpha-panel-a" role="tabpanel" aria-labelledby="duplicate-panel-tab"></div></div>`,
      },
      {
        name: "panel outside current root",
        markup: `<div data-shlz-tabs><div role="tablist"><button id="outside-panel-tab" role="tab" aria-controls="outside-panel">Outside panel</button></div></div><div id="outside-panel" role="tabpanel" aria-labelledby="outside-panel-tab"></div>`,
      },
    ];
    const errors = malformedCases.map(({ name, markup }) => {
      const fixture = document.createElement("div");
      fixture.innerHTML = markup;
      host.append(fixture);
      try {
        window.__shlzEnhanceTabs(host);
        return { name, errorName: null, message: null };
      } catch (error) {
        return {
          name,
          errorName: error?.constructor?.name ?? null,
          message: error instanceof Error ? error.message : String(error),
        };
      } finally {
        fixture.remove();
      }
    });
    const afterErrors = window.__shlzEnhanceTabs(host);
    return {
      errors,
      controllerCount: initial.length,
      identitiesPreserved: afterErrors.every(
        (controller, index) => controller === initial[index],
      ),
    };
  });

  expect(result.controllerCount).toBe(2);
  expect(result.identitiesPreserved).toBe(true);
  expect(result.errors).toEqual([
    {
      name: "duplicate tab id",
      errorName: "TypeError",
      message:
        "Tabs relationship alpha-tab-a -> duplicate-tab-panel must be unique and root-scoped.",
    },
    {
      name: "duplicate panel id",
      errorName: "TypeError",
      message:
        "Tabs relationship duplicate-panel-tab -> alpha-panel-a must be unique and root-scoped.",
    },
    {
      name: "panel outside current root",
      errorName: "TypeError",
      message:
        "Tabs relationship outside-panel-tab -> outside-panel must be unique and root-scoped.",
    },
  ]);

  const alphaFirst = page.getByRole("tab", { name: "alpha A" });
  const alphaSecond = page.getByRole("tab", { name: "alpha B" });
  const betaFirst = page.getByRole("tab", { name: "beta A" });
  await alphaFirst.focus();
  await page.keyboard.press("ArrowRight");
  await expect(alphaSecond).toBeFocused();
  await expect(betaFirst).toHaveAttribute("aria-selected", "true");

  await page.evaluate(() => {
    const host = document
      .querySelector("[data-test-tabs-root='alpha']")
      .closest("section");
    for (const controller of window.__shlzEnhanceTabs(host))
      controller.destroy();
  });
  await alphaFirst.focus();
  await page.keyboard.press("ArrowRight");
  await expect(alphaFirst).toBeFocused();
});

test("Tabs validates IDs within a detached tree", async ({ page }) => {
  const result = await page.evaluate(() => {
    const host = document.createElement("section");
    host.innerHTML = `
      <div data-shlz-tabs>
        <div role="tablist" aria-label="Detached tabs">
          <button id="detached-tab" role="tab" aria-controls="detached-panel">Detached tab</button>
        </div>
        <div id="detached-panel" role="tabpanel" aria-labelledby="detached-tab">Detached panel</div>
      </div>`;
    try {
      const controllers = window.__shlzEnhanceTabs(host);
      return { count: controllers.length, error: null };
    } catch (error) {
      return {
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  expect(result).toEqual({ count: 1, error: null });
});

test("direct TabsController construction replaces prior root ownership", async ({
  page,
}) => {
  const root = page.locator("#tabs-demo [data-shlz-tabs]");
  const replacementRegistered = await root.evaluate((element) => {
    const current = window.__shlzEnhanceTabs(element.parentElement)[0];
    const Replacement = current.constructor;
    const replacement = new Replacement(element);
    window.__directTabsReplacement = replacement;
    return window.__shlzEnhanceTabs(element.parentElement)[0] === replacement;
  });
  expect(replacementRegistered).toBe(true);

  await page.evaluate(() => window.__directTabsReplacement.destroy());
  const first = root.getByRole("tab", { name: "Первый" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(first).toBeFocused();
});

test("Tabs programmatic activation is root-owned", async ({ page }) => {
  const result = await page.evaluate(() => {
    const controller = window.__shlzEnhanceTabs(
      document.querySelector("#tabs-demo"),
    )[0];
    const owned = controller.root.querySelector("#tab-two");
    controller.activate(owned);
    const selectedAfterOwned = owned.getAttribute("aria-selected");
    const foreign = document.createElement("button");
    foreign.setAttribute("role", "tab");
    try {
      controller.activate(foreign);
      return { selectedAfterOwned, errorName: null, message: null };
    } catch (error) {
      return {
        selectedAfterOwned,
        errorName: error?.constructor?.name ?? null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });
  expect(result).toEqual({
    selectedAfterOwned: "true",
    errorName: "TypeError",
    message: "TabsController can only activate a tab owned by its root.",
  });
  await expect(
    page.locator(
      "#tabs-demo [data-shlz-tabs] [role='tab'][aria-selected='true']",
    ),
  ).toHaveCount(1);
});

test("Pagination preserves native URL navigation at every boundary", async ({
  page,
}) => {
  for (const [current, result] of [
    [1, "Заявки SD-2401–SD-2420"],
    [2, "Заявки SD-2421–SD-2440"],
    [3, "Заявки SD-2441–SD-2460"],
  ]) {
    await page.goto(`/?page=${current}#pagination-consumer`);
    const consumer = page.locator("[data-pagination-consumer]");
    await expect(consumer.locator("[data-pagination-result]")).toHaveText(
      result,
    );
    await expect(consumer.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(consumer.locator("a:not([href])")).toHaveCount(0);
    const disabled = consumer.locator(".shlz-pagination__item--disabled");
    await expect(disabled).toHaveCount(current === 2 ? 0 : 1);
    if (current !== 2) await expect(disabled).not.toHaveAttribute("href");
  }
});

test("Wave 3 responsive claims are component-local", async ({ page }) => {
  await page.setViewportSize({ width: 240, height: 900 });
  const longButton = page
    .locator("#typography-compatibility .shlz-button")
    .first();
  const longLink = page.locator("[data-workspace-body] .shlz-link").first();
  const singleLineLinkHeight = await longLink.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  await longLink.evaluate((element) => {
    element.textContent =
      "SD-2418 — регистрация заявки на проведение испытаний";
    element.parentElement.style.inlineSize = "140px";
  });
  const segment = page.locator("#segment-demo .shlz-segment").first();
  const pagination = page.locator(
    "[data-pagination-consumer] .shlz-pagination__list",
  );
  for (const [name, locator] of [
    ["button", longButton],
    ["link", longLink],
    ["segment", segment],
    ["pagination", pagination],
  ]) {
    const metrics = await locator.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      parentWidth: element.parentElement.getBoundingClientRect().width,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    expect(
      metrics.width,
      `${name}: ${JSON.stringify(metrics)}`,
    ).toBeLessThanOrEqual(metrics.parentWidth + 1);
    expect(
      metrics.scrollWidth,
      `${name}: ${JSON.stringify(metrics)}`,
    ).toBeLessThanOrEqual(metrics.clientWidth + 1);
  }

  // Tabs overflow/wrapping is consumer-owned. This narrow composition is
  // integration evidence only; it is not a component responsive contract.
  const tabs = page.locator("#typography-compatibility .shlz-tabs");
  await tabs.evaluate((element) => {
    element.style.overflowX = "auto";
    element.style.maxInlineSize = "100%";
  });
  const tabsMetrics = await tabs.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    wrap: window.getComputedStyle(element.querySelector(".shlz-tabs__list"))
      .flexWrap,
  }));
  expect(tabsMetrics.wrap).toBe("nowrap");
  expect(tabsMetrics.scrollWidth).toBeGreaterThan(tabsMetrics.clientWidth);
  expect(
    await longLink.evaluate(
      (element) => element.getBoundingClientRect().height,
    ),
  ).toBeGreaterThan(singleLineLinkHeight);
});

test("source-backed geometry and focus paint are computed independently", async ({
  page,
}) => {
  for (const [selector, height] of [
    ["#button-demo .shlz-button--primary:not(.shlz-button--sm)", 40],
    ["#button-demo .shlz-button--sm", 32],
    ["#button-demo .shlz-button--xs", 26],
    ["#segment-demo .shlz-segment--sm", 26],
    [
      "#segment-demo .shlz-segment:not(.shlz-segment--sm):not(.shlz-segment--lg)",
      33,
    ],
    ["#segment-demo .shlz-segment--lg", 41],
  ]) {
    await expect(page.locator(selector).first()).toHaveCSS(
      "height",
      `${height}px`,
    );
  }
  const link = page.locator("#link-demo a.shlz-link").first();
  await link.focus();
  expect(
    await link.evaluate(
      (element) => window.getComputedStyle(element).outlineStyle,
    ),
  ).toBe("solid");
  await expect(page.locator("#tabs-demo .shlz-tabs__list").first()).toHaveCSS(
    "min-height",
    "61px",
  );
  await expect(
    page.locator("#pagination-demo [aria-current='page']").first(),
  ).toHaveCSS("height", "40px");
});

for (const [name, locator, snapshot] of [
  ["button", "#button-demo > section", "button-focused-contract.png"],
  ["link", "#link-demo", "link-focused-contract.png"],
  ["segment", "#segment-demo > section", "segment-focused-contract.png"],
  ["tabs", "#tabs-demo > section", "tabs-focused-contract.png"],
  [
    "pagination",
    "#pagination-demo > section",
    "pagination-focused-contract.png",
  ],
]) {
  test(`${name} focused visual contract`, async ({ page }) => {
    const surface = page.locator(locator).last();
    await expect(surface).toBeVisible();
    if (name === "link") {
      const longLink = surface.locator("a.shlz-link").first();
      await longLink.evaluate((element) => {
        element.textContent =
          "Очень длинная ссылка на заявку для узкого контейнера";
        element.parentElement.style.inlineSize = "180px";
      });
    }
    const focusable = surface.locator("a, button, input").first();
    if ((await focusable.count()) > 0) await focusable.focus();
    await expectStableShowcaseScreenshot(page, surface, snapshot);
  });
}
