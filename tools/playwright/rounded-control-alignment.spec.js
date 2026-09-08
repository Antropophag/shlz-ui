import { expect, test } from "@playwright/test";
import { URL } from "node:url";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";
import {
  applyHistoricalLayoutAdapter,
  openAlignmentShowcase,
  paintedThumbOffset,
  textLineGeometry,
} from "./rounded-control-probes.js";

for (const deviceScaleFactor of [1, 1.25, 1.5, 2]) {
  test(`A1 Small Switch painted center at DPR ${deviceScaleFactor}`, async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const page = await browser.newPage({
      deviceScaleFactor,
      reducedMotion: "reduce",
    });
    await openAlignmentShowcase(page);
    await page.addStyleTag({
      content:
        "[data-alignment-hide-thumb]::before { visibility: hidden !important; }",
    });
    await page.evaluate(() => {
      const host = document.createElement("div");
      host.dataset.alignmentProbe = "";
      host.className = "shlz-scope";
      host.style.cssText =
        "position:fixed;left:40px;top:120px;width:100px;height:40px;padding:8px;background:white;z-index:2147483647;font-size:0;line-height:0";
      host.innerHTML =
        '<input class="shlz-switch__input shlz-switch__input--sm" type="checkbox" role="switch" aria-label="Paint probe">';
      document.body.append(host);
    });
    const control = page.locator("[data-alignment-probe] input");
    for (const phase of [0, 0.25, 0.5, 0.75]) {
      for (const checked of [false, true]) {
        for (const disabled of [false, true]) {
          await control.evaluate(
            (element, state) => {
              element.parentElement.style.top = `${120 + state.phase}px`;
              element.checked = state.checked;
              element.disabled = state.disabled;
            },
            { phase, checked, disabled },
          );
          const box = await control.boundingBox();
          expect(box.width).toBe(24);
          expect(box.height).toBe(14);
          await expect(control).toHaveCSS("--shlz-switch-thumb", "11.2px");
          const paint = await paintedThumbOffset(page, control);
          expect(paint.thumbMass).toBeGreaterThan(0);
          expect(paint.trackMass).toBeGreaterThan(0);
          expect(
            Math.abs(paint.offset),
            `A1 ${JSON.stringify({ phase, checked, disabled, paint })}`,
          ).toBeLessThanOrEqual(0.25);
        }
      }
    }
    await control.evaluate((element) => {
      element.disabled = false;
      element.checked = false;
      element.dataset.inputCount = "0";
      element.dataset.changeCount = "0";
      for (const type of ["input", "change"])
        element.addEventListener(type, () => {
          element.dataset[`${type}Count`] = String(
            Number(element.dataset[`${type}Count`]) + 1,
          );
        });
    });
    await control.focus();
    await control.press("Space");
    await expect(control).toBeChecked();
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveAttribute("data-change-count", "1");
    await expect(control).toHaveAttribute("data-input-count", "1");
    expect(
      Math.abs((await paintedThumbOffset(page, control)).offset),
      "A1 native checked paint",
    ).toBeLessThanOrEqual(0.25);
    await control.click();
    await expect(control).not.toBeChecked();
    await expect(control).toHaveAttribute("data-change-count", "2");
    await expect(control).toHaveAttribute("data-input-count", "2");
    await control.evaluate((element) => {
      element.disabled = true;
    });
    const disabledBox = await control.boundingBox();
    await page.mouse.click(
      disabledBox.x + disabledBox.width / 2,
      disabledBox.y + disabledBox.height / 2,
    );
    await expect(control).not.toBeChecked();
    await expect(control).toHaveAttribute("data-change-count", "2");
    await page.close();
  });
}

for (const profile of ["golos", "fira"]) {
  test(`A2 A3 A11 A12 Field diagnostic text and actions in ${profile}`, async ({
    page,
  }) => {
    await openAlignmentShowcase(page);
    await page.evaluate((profile) => {
      document.body.dataset.shlzFont = profile;
    }, profile);
    await page.evaluate(() => document.fonts.ready);
    for (const selector of [
      ".shlz-field__chip",
      "span.shlz-select--placeholder",
    ]) {
      const id = selector === ".shlz-field__chip" ? "A2" : "A3";
      const controls = page.locator(selector);
      expect(await controls.count()).toBeGreaterThan(0);
      for (const control of await controls.all()) {
        const geometry = await textLineGeometry(control);
        expect.soft(geometry.lines.length, selector).toBeGreaterThan(0);
        for (const line of geometry.lines) {
          expect
            .soft(
              Math.abs(line.centerOffset),
              `${id} ${selector}: ${JSON.stringify(geometry)}`,
            )
            .toBeLessThanOrEqual(1);
        }
      }
    }
    const actions = page.locator(
      ".shlz-field__advanced-actions .shlz-field__action",
    );
    expect(await actions.count()).toBeGreaterThan(0);
    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect.soft(box.width, "A11 action width").toBe(82);
      expect.soft(box.height, "A11 action height").toBe(27);
      await expect
        .soft(action, "A12 Field action typography")
        .toHaveCSS(
          "font-family",
          new RegExp(profile === "golos" ? "Golos Text" : "Fira Sans"),
          { timeout: 250 },
        );
    }
  });
}

test("A4 A7 A8 A9 compact Tabs and Badge own their geometry", async ({
  page,
}) => {
  await openAlignmentShowcase(page);
  for (const [selector, height] of [
    [".shlz-tabs:not(.shlz-tabs--pill, .shlz-tabs--boxed) .shlz-tabs__tab", 61],
    [".shlz-tabs--pill .shlz-tabs__tab", 40],
    [".shlz-tabs--boxed .shlz-tabs__tab", 39],
  ]) {
    const tabs = page.locator(selector);
    expect(await tabs.count()).toBeGreaterThan(0);
    for (const tab of await tabs.all()) {
      const box = await tab.boundingBox();
      if (box)
        expect
          .soft(
            box.height,
            `${height === 40 ? "A4" : height === 39 ? "A9" : "Underline"} ${selector}`,
          )
          .toBe(height);
    }
  }
  const badges = page.locator(".shlz-badge-matrix .shlz-badge");
  expect(await badges.count()).toBeGreaterThan(0);
  for (const badge of await badges.all()) {
    const state = await badge.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        large: element.classList.contains("shlz-badge--lg"),
        single: element.classList.contains("shlz-badge--single"),
        width: box.width,
        height: box.height,
        fontSize: window.getComputedStyle(element).fontSize,
      };
    });
    expect
      .soft(state.width, "A8 Badge width")
      .toBe(state.large ? 35 : state.single ? 16 : 29);
    expect.soft(state.height, "A8 Badge height").toBe(state.large ? 23 : 16);
    expect
      .soft(state.fontSize, "A7 Badge typography")
      .toBe(state.large ? "14px" : "12px");
  }
  const liveTabs = page.locator("#tabs-demo [data-shlz-tabs]");
  for (const [variant, height, id] of [
    ["", 61, "Underline"],
    ["pill", 40, "A4"],
    ["boxed", 39, "A9"],
  ]) {
    await liveTabs.evaluate((element, variant) => {
      element.classList.toggle("shlz-tabs--pill", variant === "pill");
      element.classList.toggle("shlz-tabs--boxed", variant === "boxed");
    }, variant);
    const first = liveTabs.getByRole("tab").first();
    await first.focus();
    await first.press("Home");
    expect
      .soft((await first.boundingBox()).height, `${id} live tab height`)
      .toBe(height);
    await first.press("ArrowRight");
    await expect(liveTabs.getByRole("tab").nth(1)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(liveTabs.getByRole("tab").nth(1)).toBeFocused();
  }
});

for (const profile of ["golos", "fira"]) {
  test(`A6 A10 Notification contains short content and long actions in ${profile}`, async ({
    page,
  }) => {
    await openAlignmentShowcase(page);
    await page.evaluate((profile) => {
      document.body.dataset.shlzFont = profile;
    }, profile);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const short = page.locator(
        "[data-component-audit-id='notification-showcase-dismissible']",
      );
      const placement = await short.evaluate((element) => {
        const shell = element.getBoundingClientRect();
        const text = element
          .querySelector(".shlz-notification__content")
          .getBoundingClientRect();
        return {
          height: shell.height,
          offset: text.top + text.height / 2 - shell.top - shell.height / 2,
        };
      });
      expect.soft(placement.height, `A6 ${profile}/${width}`).toBe(58);
      expect
        .soft(Math.abs(placement.offset), `A6 ${profile}/${width}`)
        .toBeLessThanOrEqual(0.5);
      const actions = page.locator(".shlz-notification__action");
      for (const action of await actions.all()) {
        const geometry = await textLineGeometry(action);
        if (!geometry.height) continue;
        for (const line of geometry.lines) {
          for (const edge of ["left", "right", "top", "bottom"]) {
            expect
              .soft(
                line[edge],
                `A10 ${profile}/${width} action ${edge}: ${JSON.stringify(geometry)}`,
              )
              .toBeGreaterThanOrEqual(-0.5);
          }
        }
      }
    }
  });
}

for (const profile of ["golos", "fira"]) {
  test(`A5 A13 Empty State and History labels remain contained in ${profile}`, async ({
    page,
  }) => {
    await openAlignmentShowcase(page);
    await page.evaluate((profile) => {
      document.body.dataset.shlzFont = profile;
    }, profile);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const upload = page.locator(
        ".shlz-empty-state--customize .shlz-empty-state__actions .shlz-button",
      );
      const button = await textLineGeometry(upload);
      expect.soft(button.height, `A5 ${profile}/${width}`).toBe(32);
      expect.soft(button.lines, "A5 action lines").toHaveLength(1);
      for (const line of button.lines) {
        expect.soft(line.top, "A5 action top").toBeGreaterThanOrEqual(-0.5);
        expect
          .soft(line.bottom, "A5 action bottom")
          .toBeGreaterThanOrEqual(-0.5);
      }
      const labels = page.locator(
        ".shlz-history-timeline[data-source-layout] .shlz-history-timeline__old-value, .shlz-history-timeline[data-source-layout] .shlz-history-timeline__tag",
      );
      for (const label of await labels.all()) {
        const geometry = await textLineGeometry(label);
        expect.soft(geometry.height, `A13 ${profile}/${width}`).toBe(30);
        expect.soft(geometry.lines, "A13 History lines").toHaveLength(1);
      }
      const newStatus = page.locator(
        ".shlz-history-timeline[data-source-layout] [data-history-kind='status'] .shlz-history-timeline__new-value",
      );
      expect.soft((await newStatus.boundingBox()).height).toBe(35);
    }
    await page.setViewportSize({ width: 320, height: 1000 });
    const longAction = page.locator(
      ".shlz-empty-state--customize .shlz-empty-state__actions .shlz-button",
    );
    await longAction.evaluate((element) => {
      element.textContent =
        "ЗагрузитьОченьДлинноеЛокализованноеНазваниеДокумента";
    });
    const actionGeometry = await textLineGeometry(longAction);
    expect
      .soft(actionGeometry.lines.length, "A5 long action reflows")
      .toBeGreaterThan(1);
    const actionBox = await longAction.boundingBox();
    expect
      .soft(actionBox.x + actionBox.width, "A5 action fits viewport")
      .toBeLessThanOrEqual(320);
    for (const line of actionGeometry.lines)
      for (const edge of ["left", "right", "top", "bottom"])
        expect
          .soft(line[edge], `A5 long action ${edge}`)
          .toBeGreaterThanOrEqual(-0.5);
    await page.evaluate(() => {
      const history = document.createElement("ol");
      history.className = "shlz-history-timeline";
      history.dataset.alignmentHistory = "";
      history.style.inlineSize = "240px";
      history.innerHTML =
        '<li class="shlz-history-timeline__entry"><div class="shlz-history-timeline__content"><div class="shlz-history-timeline__tags"><span class="shlz-history-timeline__tag" style="inline-size:130px">ОченьДлинноеЛокализованноеЗначениеБезПробелов</span><span class="shlz-history-timeline__tag">Кратко</span></div></div></li>';
      document.body.append(history);
    });
    const historyTags = page.locator(
      "[data-alignment-history] .shlz-history-timeline__tag",
    );
    const longTag = await textLineGeometry(historyTags.first());
    expect
      .soft(longTag.lines.length, "A13 long tag reflows")
      .toBeGreaterThan(1);
    for (const line of longTag.lines)
      for (const edge of ["left", "right", "top", "bottom"])
        expect
          .soft(line[edge], `A13 long tag ${edge}`)
          .toBeGreaterThanOrEqual(-0.5);
    expect
      .soft(
        (await historyTags.nth(1).boundingBox()).height,
        "A13 neighbor stays compact",
      )
      .toBe(30);
  });
}

for (const profile of ["golos", "fira"]) {
  test(`A12 Comment Feed text buttons use ${profile}`, async ({ page }) => {
    await openAlignmentShowcase(page);
    await page.evaluate((profile) => {
      document.body.dataset.shlzFont = profile;
    }, profile);
    await page.evaluate(() => document.fonts.ready);
    const controls = page.locator(
      ".shlz-comment-feed__context-action, .shlz-comment-feed__suggestion",
    );
    expect(await controls.count()).toBeGreaterThan(0);
    for (const control of await controls.all()) {
      const family = await control.evaluate(
        (element) => window.getComputedStyle(element).fontFamily,
      );
      expect
        .soft(family, "A12 Comment Feed typography")
        .toContain(profile === "golos" ? "Golos Text" : "Fira Sans");
      const geometry = await textLineGeometry(control);
      for (const line of geometry.lines) {
        for (const edge of ["left", "right", "top", "bottom"])
          expect.soft(line[edge]).toBeGreaterThanOrEqual(-0.5);
      }
    }
  });
}

test("affected rounded-control occurrences remain classified", async ({
  page,
}) => {
  await openAlignmentShowcase(page);
  const standalone = {
    "notification-plain-html": "plain-html.html",
    "comment-feed-plain-html": "comment-feed.html",
    "history-timeline-plain-html": "messaging-history-components.html",
  };
  const pending = [];
  const census = [];
  for (const component of [
    "switch",
    "input",
    "select",
    "tabs",
    "badge",
    "notification",
    "snackbar",
    "empty-state",
    "history-timeline",
    "comment-feed",
  ]) {
    const manifest = await readComponentAuditManifest(
      new URL(`../../docs/component-audits/${component}.json`, import.meta.url),
    );
    const fixtureOccurrences = manifest.occurrences.filter(({ id }) =>
      Object.hasOwn(standalone, id),
    );
    const observed = await expectClassifiedComponentOccurrences(page, {
      ...manifest,
      occurrences: manifest.occurrences.filter(
        ({ id }) => !Object.hasOwn(standalone, id),
      ),
    });
    census.push({ component, surface: "showcase", ...observed });
    for (const occurrence of fixtureOccurrences)
      pending.push({ manifest, occurrence });
  }
  for (const { manifest, occurrence } of pending) {
    await page.goto(fixtureUrl(standalone[occurrence.id]));
    const observed = await expectClassifiedComponentOccurrences(page, {
      ...manifest,
      diagnosticOccurrenceCount: 0,
      occurrences: [occurrence],
    });
    census.push({
      component: manifest.component,
      surface: standalone[occurrence.id],
      ...observed,
    });
  }
  expect(
    census.flatMap(({ unclassifiedLegacy }) => unclassifiedLegacy),
  ).toEqual([]);
  await test.info().attach("rounded-control-census.json", {
    body: JSON.stringify(census, null, 2),
    contentType: "application/json",
  });
});

for (const profile of ["golos", "fira"]) {
  test(`A4 A9 plain HTML Tabs contain short and long labels in ${profile}`, async ({
    page,
  }) => {
    const resource = (path) =>
      `/@fs${new URL(`../../${path}`, import.meta.url).pathname}`;
    const variants = [
      ["underline", 61, "Underline"],
      ["pill", 40, "A4"],
      ["boxed", 39, "A9"],
    ];
    const markup = variants
      .map(
        ([variant]) =>
          `<section class="rail"><div class="shlz-tabs${variant === "underline" ? "" : ` shlz-tabs--${variant}`}" data-shlz-tabs data-plain-variant="${variant}"><div class="shlz-tabs__list" role="tablist" aria-label="${variant}"><button class="shlz-tabs__tab" id="${variant}-one" type="button" role="tab" aria-selected="true" aria-controls="${variant}-panel-one">One</button><button class="shlz-tabs__tab" id="${variant}-two" type="button" role="tab" aria-selected="false" aria-controls="${variant}-panel-two" tabindex="-1">Two</button></div><div class="shlz-tabs__panel" id="${variant}-panel-one" role="tabpanel" tabindex="0" aria-labelledby="${variant}-one">First panel</div><div class="shlz-tabs__panel" id="${variant}-panel-two" role="tabpanel" tabindex="0" aria-labelledby="${variant}-two" hidden>Second panel</div></div></section>`,
      )
      .join("");
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><link rel="stylesheet" href="${resource("packages/styles/dist/shlz.css")}"><link rel="stylesheet" href="${resource("node_modules/@fontsource/golos-text/400.css")}"><link rel="stylesheet" href="${resource("node_modules/@fontsource/fira-sans/400.css")}"><style>body{margin:16px}.rail{max-inline-size:100%;overflow-x:auto;margin-block:16px}</style></head><body class="shlz-scope" data-shlz-font="${profile}">${markup}<script type="module">import{enhanceTabs}from"${resource("packages/behaviors/dist/index.js")}";enhanceTabs();document.documentElement.dataset.tabsReady="";</script></body></html>`;
    await page.route("**/alignment-plain-consumer", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto("/alignment-plain-consumer");
    await page.locator("html[data-tabs-ready]").waitFor({ state: "attached" });
    const loaded = await page.evaluate(
      async (profile) =>
        (
          await document.fonts.load(
            `400 16px "${profile === "golos" ? "Golos Text" : "Fira Sans"}"`,
            "One Локализованное",
          )
        ).length,
      profile,
    );
    expect(loaded).toBeGreaterThan(0);
    await applyHistoricalLayoutAdapter(page);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [variant, height, id] of variants) {
        const root = page.locator(`[data-plain-variant="${variant}"]`);
        const first = root.getByRole("tab").first();
        expect
          .soft(
            (await first.boundingBox()).height,
            `${id} ${profile}/${width} plain short height`,
          )
          .toBe(height);
        await first.focus();
        await first.press("Home");
        await first.press("ArrowRight");
        await expect(root.getByRole("tab").nth(1)).toHaveAttribute(
          "aria-selected",
          "true",
        );
        await expect(root.getByRole("tab").nth(1)).toBeFocused();
        await root.getByRole("tab").nth(1).press("Tab");
        await expect(root.getByRole("tabpanel")).toBeFocused();
        await first.evaluate((element) => {
          element.style.inlineSize = "180px";
          element.textContent =
            "Длинное название раздела с несколькими словами";
        });
        const long = await textLineGeometry(first);
        expect
          .soft(long.lines.length, `${id} plain long label reflows`)
          .toBeGreaterThan(1);
        for (const line of long.lines)
          for (const edge of ["left", "right", "top", "bottom"])
            expect
              .soft(line[edge], `${id} ${profile}/${width} plain long ${edge}`)
              .toBeGreaterThanOrEqual(-0.5);
        await first.evaluate((element) => {
          element.style.removeProperty("inline-size");
          element.textContent = "One";
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
}
