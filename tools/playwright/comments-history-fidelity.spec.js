import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const commentManifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/comment-feed.json",
    import.meta.url,
  ),
);

const executedMaterialStates = new Set();
const expectedStates = {
  "comment-feed": [
    "default",
    "composer-populated",
    "comment-added",
    "own-comment-actions",
    "other-comment-reply",
    "mention-suggestions",
    "comment-deleted",
    "narrow-layout",
    "text-scale",
  ],
  "history-timeline": [
    "created",
    "status-transition",
    "quoted-comment",
    "field-transition",
    "tags",
    "people-disclosure",
    "attachment",
    "narrow-layout",
    "text-scale",
  ],
};
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedMaterialStates.add(`${component}:${state}`);
};
const expectMaterialStates = (component) =>
  expect(
    expectedStates[component].every((state) =>
      executedMaterialStates.has(`${component}:${state}`),
    ),
  ).toBe(true);

test.beforeEach(async ({ page }) => page.goto("/#comment-feed-demo"));

const hideShowcaseNavigation = (page) =>
  page.locator(".shlz-docs-sidebar").evaluate((node) => {
    node.style.display = "none";
  });

test("Comment Feed reproduces source geometry without chat polarity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await hideShowcaseNavigation(page);
  const state = page.locator('[data-comment-feed-state="default"]');
  await state.evaluate((node) => {
    node.style.inlineSize = "1304px";
  });
  const feed = state.locator(".shlz-comment-feed");
  await expect(feed).toBeVisible();
  await expect(feed.locator(".shlz-comment-feed__item")).toHaveCount(4);
  await expect(
    feed.locator('[data-direction="incoming"], [data-direction="outgoing"]'),
  ).toHaveCount(0);
  await expect(feed.locator(".shlz-comment-feed__avatar").first()).toHaveCSS(
    "width",
    "32px",
  );
  await expect(feed.locator(".shlz-file-row").first()).toHaveCSS(
    "width",
    "229px",
  );
  await expect(state.locator(".shlz-comment-feed__composer-input")).toHaveCSS(
    "width",
    "1196px",
  );
  await expect(state.locator(".shlz-comment-feed__composer-input")).toHaveCSS(
    "min-height",
    "39px",
  );
  await expect(state.locator(".shlz-comment-feed__surface")).toHaveScreenshot(
    "comment-feed-source.png",
  );
});

test("Comment Feed occurrence ledger covers source, consumer, fixture and diagnostics", async ({
  page,
}) => {
  await expect(
    page.locator("[data-component-audit-id^='comment-feed-']"),
  ).toHaveCount(2);
  await expectClassifiedComponentOccurrences(page, {
    ...commentManifest,
    occurrences: commentManifest.occurrences.filter(({ id }) =>
      ["comment-feed-showcase-source", "comment-feed-source-consumer"].includes(
        id,
      ),
    ),
  });
  await page.goto(fixtureUrl("comment-feed.html"));
  await expectClassifiedComponentOccurrences(page, {
    ...commentManifest,
    diagnosticOccurrenceCount: 0,
    occurrences: commentManifest.occurrences.filter(
      ({ id }) => id === "comment-feed-plain-html",
    ),
  });
});

test("source-contract consumer owns Comment Feed and History actions", async ({
  page,
}) => {
  const consumer = page.locator("[data-comments-history-consumer]");
  await expect(
    consumer.locator(
      "[data-component-audit-id='comment-feed-source-consumer']",
    ),
  ).toHaveCount(1);
  await expect(
    consumer.locator(
      "[data-component-audit-id='history-timeline-source-consumer']",
    ),
  ).toHaveCount(1);
  await consumer.locator("[data-comments-history-action]").first().click();
  await expect(consumer.locator("[data-comments-history-status]")).toHaveText(
    "Приложение обработало действие.",
  );
});

test("all seven Comments source states remain represented", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await hideShowcaseNavigation(page);
  await page.locator("#comment-feed-demo details").evaluate((node) => {
    node.open = true;
  });
  const states = [
    "default",
    "composer-populated",
    "comment-added",
    "own-comment-actions",
    "other-comment-reply",
    "mention-suggestions",
    "comment-deleted",
  ];
  for (const name of states) {
    const state = page.locator(`[data-comment-feed-state="${name}"]`);
    await state.evaluate((node) => {
      node.style.inlineSize = "1304px";
    });
    await expect(state).toBeVisible();
    await expect(state.locator(".shlz-comment-feed__surface")).toHaveCSS(
      "width",
      "1304px",
    );
    await expect(state.locator(".shlz-comment-feed__surface")).toHaveScreenshot(
      `comment-feed-${name}.png`,
    );
    executedMaterialStates.add(`comment-feed:${name}`);
  }
  await expect(
    page.locator(
      '[data-comment-feed-state="composer-populated"] .shlz-file-row',
    ),
  ).toHaveCount(6);
  await expect(
    page.locator(
      '[data-comment-feed-state="comment-added"] .shlz-comment-feed__item',
    ),
  ).toHaveCount(5);
  await expect(
    page.locator(
      '[data-comment-feed-state="own-comment-actions"] .shlz-comment-feed__context',
    ),
  ).toHaveCSS("height", "100px");
  await expect(
    page.locator(
      '[data-comment-feed-state="other-comment-reply"] .shlz-comment-feed__context',
    ),
  ).toHaveCSS("height", "60px");
  await expect(
    page.locator(
      '[data-comment-feed-state="mention-suggestions"] .shlz-comment-feed__suggestions',
    ),
  ).toHaveCSS("width", "260px");
  await expect(
    page.locator(
      '[data-comment-feed-state="mention-suggestions"] .shlz-comment-feed__suggestions',
    ),
  ).toHaveCSS("height", "120px");
  await expect(page.getByRole("button", { name: "Изменить" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Удалить", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Ответить" })).toBeVisible();
  await expect(
    page
      .locator("#comment-feed-demo")
      .getByRole("button", { name: "Отменить", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await verifyMaterialState("comment-feed", "narrow-layout", () =>
    expect(page.locator('[data-comment-feed-state="default"]')).toBeVisible(),
  );
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await verifyMaterialState("comment-feed", "text-scale", () =>
    expect(page.locator('[data-comment-feed-state="default"]')).toBeVisible(),
  );
  expectMaterialStates("comment-feed");
});

test("History source fixture is content-led and matches source dimensions", async ({
  page,
}) => {
  await hideShowcaseNavigation(page);
  const history = page.locator("#history-timeline-demo .shlz-history-timeline");
  await expect(history.locator(".shlz-history-timeline__entry")).toHaveCount(7);
  await expect(history.locator(".shlz-history-timeline__marker")).toHaveCount(
    0,
  );
  await expect(history.locator(".shlz-history-timeline__quote")).toHaveCSS(
    "width",
    "424px",
  );
  await expect(history.locator(".shlz-history-timeline__quote")).toHaveCSS(
    "height",
    "137px",
  );
  await expect(history).toHaveCSS("width", "463px");
  await expect(history).toHaveCSS("height", "997px");
  expect(
    await history.evaluate((node) => node.scrollHeight <= node.clientHeight),
  ).toBe(true);
  await expect(
    history.locator(
      '[data-history-kind="status"] .shlz-history-timeline__old-value',
    ),
  ).toHaveCSS("width", "66px");
  await expect(
    history.locator(
      '[data-history-kind="status"] .shlz-history-timeline__new-value',
    ),
  ).toHaveCSS("width", "119px");
  await expect(
    history
      .locator('[data-history-kind="tags"] .shlz-history-timeline__tag')
      .first(),
  ).toHaveCSS("width", "137px");
  await expect(
    history
      .locator('[data-history-kind="tags"] .shlz-history-timeline__tag')
      .nth(1),
  ).toHaveCSS("width", "111px");
  await expect(
    history.locator(".shlz-history-timeline__person").first(),
  ).toHaveCSS("width", "156px");
  await expect(history.locator(".shlz-history-timeline__attachment")).toHaveCSS(
    "width",
    "239px",
  );
  await expect(history).toHaveScreenshot(
    "history-timeline-source-corrected.png",
  );
  for (const [state, kind] of [
    ["created", "created"],
    ["status-transition", "status"],
    ["quoted-comment", "comment"],
    ["field-transition", "field"],
    ["tags", "tags"],
    ["people-disclosure", "people"],
    ["attachment", "attachment"],
  ]) {
    await expect(history.locator(`[data-history-kind="${kind}"]`)).toHaveCount(
      1,
    );
    executedMaterialStates.add(`history-timeline:${state}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await verifyMaterialState("history-timeline", "narrow-layout", () =>
    expect(history).toBeVisible(),
  );
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await verifyMaterialState("history-timeline", "text-scale", () =>
    expect(history).toBeVisible(),
  );
  expectMaterialStates("history-timeline");
});

test("corrected surfaces remain accessible and contained at narrow width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await hideShowcaseNavigation(page);
  for (const selector of ["#comment-feed-demo", "#history-timeline-demo"])
    expect(
      await page
        .locator(selector)
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('[data-comment-feed-state="default"] .shlz-comment-feed__surface')
    .include("#history-timeline-demo")
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(
    page.locator(
      '[data-comment-feed-state="default"] .shlz-comment-feed__surface',
    ),
  ).toHaveScreenshot("comment-feed-narrow.png");
  await expect(
    page.locator("#history-timeline-demo .shlz-history-timeline"),
  ).toHaveScreenshot("history-timeline-narrow-corrected.png");
  await page.addStyleTag({ content: "html{font-size:200%}" });
  for (const selector of ["#comment-feed-demo", "#history-timeline-demo"])
    expect(
      await page
        .locator(selector)
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(
    page.locator('[data-comment-feed-state="default"]'),
  ).toBeVisible();
  await expect(page.locator("#history-timeline-demo")).toBeVisible();
});

test("intermediate, wide, enlarged and sparse content keeps component actions reachable", async ({
  page,
}) => {
  await hideShowcaseNavigation(page);
  await page.locator("#comment-feed-demo details").evaluate((node) => {
    node.open = true;
  });
  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const selectors = [
      '[data-comment-feed-state="mention-suggestions"] .shlz-comment-feed__surface',
      "#history-timeline-demo .shlz-history-timeline",
    ];
    const measurements = await Promise.all(
      selectors.map((selector) =>
        page.locator(selector).evaluate(
          (node, selectorName) => ({
            selector: selectorName,
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
          }),
          selector,
        ),
      ),
    );
    expect(measurements).toEqual(
      measurements.map((measurement) => ({
        ...measurement,
        scrollWidth: measurement.clientWidth,
      })),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: "html{font-size:200%}" });
  const commentDemo = page.locator("#comment-feed-demo");
  for (const control of [
    commentDemo.getByRole("link", { name: "Скачать все", exact: true }).first(),
    commentDemo.getByRole("button", { name: "Отправить комментарий" }).first(),
    commentDemo.getByRole("button", { name: "Изменить", exact: true }),
    commentDemo.getByRole("button", { name: "Удалить", exact: true }),
    commentDemo.getByRole("button", { name: "Ответить", exact: true }),
    commentDemo.getByRole("button", { name: "Отменить", exact: true }),
    commentDemo.getByRole("button", { name: "Андрей Михайлов", exact: true }),
    commentDemo.getByRole("button", { name: "Михаил Богданов", exact: true }),
    commentDemo.getByRole("button", { name: /Удалить файл/ }).first(),
  ]) {
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toBeInViewport();
  }
  for (const surface of await commentDemo
    .locator(".shlz-comment-feed__surface")
    .all()) {
    const measurement = await surface.evaluate((node) => ({
      state: node
        .closest("[data-comment-feed-state]")
        ?.getAttribute("data-comment-feed-state"),
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
    }));
    expect(measurement, JSON.stringify(measurement)).toMatchObject({
      scrollWidth: measurement.clientWidth,
    });
  }
  const history = page.locator("#history-timeline-demo .shlz-history-timeline");
  await history.evaluate((node) => {
    const sparse = node.querySelector('[data-history-kind="attachment"]');
    sparse?.querySelector(".shlz-history-timeline__attachment")?.remove();
    const actor = sparse?.querySelector(".shlz-history-timeline__actor");
    if (actor)
      actor.textContent =
        "Ответственный сотрудник с очень длинным локализованным именем";
  });
  expect(
    await history.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await expect(
    history.locator('[data-history-kind="attachment"]'),
  ).toBeVisible();
});

test("Comment Feed empty, loading and error-safe endpoints remain readable", async ({
  page,
}) => {
  const surface = page.locator(
    '[data-comment-feed-state="default"] .shlz-comment-feed__surface',
  );
  for (const [className, text, role] of [
    ["shlz-comment-feed__empty", "Комментариев пока нет", null],
    ["shlz-comment-feed__loading", "Загрузка комментариев", "status"],
    ["shlz-comment-feed__error", "Не удалось загрузить комментарии", "alert"],
  ]) {
    await surface.evaluate(
      (node, state) => {
        const message = document.createElement("p");
        message.className = state.className;
        message.textContent = state.text;
        if (state.role) message.setAttribute("role", state.role);
        node.replaceChildren(message);
      },
      { className, text, role },
    );
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
});
