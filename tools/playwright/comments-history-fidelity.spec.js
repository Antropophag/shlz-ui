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
  await hideShowcaseNavigation(page);
  const state = page.locator('[data-comment-feed-state="default"]');
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
  await page.locator("#comment-feed-demo details").evaluate((node) => {
    node.open = true;
  });
  for (const name of [
    "default",
    "composer-populated",
    "comment-added",
    "own-comment-actions",
    "other-comment-reply",
    "mention-suggestions",
    "comment-deleted",
  ])
    await expect(
      page.locator(`[data-comment-feed-state="${name}"]`),
    ).toBeVisible();
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
  await verifyMaterialState("comment-feed", "default", () =>
    expect(page.locator('[data-comment-feed-state="default"]')).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "composer-populated", () =>
    expect(
      page.locator('[data-comment-feed-state="composer-populated"]'),
    ).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "comment-added", () =>
    expect(
      page.locator('[data-comment-feed-state="comment-added"]'),
    ).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "own-comment-actions", () =>
    expect(
      page.locator('[data-comment-feed-state="own-comment-actions"]'),
    ).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "other-comment-reply", () =>
    expect(
      page.locator('[data-comment-feed-state="other-comment-reply"]'),
    ).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "mention-suggestions", () =>
    expect(
      page.locator('[data-comment-feed-state="mention-suggestions"]'),
    ).toBeVisible(),
  );
  await verifyMaterialState("comment-feed", "comment-deleted", () =>
    expect(
      page.locator('[data-comment-feed-state="comment-deleted"]'),
    ).toBeVisible(),
  );
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
    "max-width",
    "424px",
  );
  await expect(history.locator(".shlz-history-timeline__attachment")).toHaveCSS(
    "width",
    "239px",
  );
  await expect(history).toHaveScreenshot(
    "history-timeline-source-corrected.png",
  );
  await verifyMaterialState("history-timeline", "created", () =>
    expect(history.locator('[data-history-kind="created"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "status-transition", () =>
    expect(history.locator('[data-history-kind="status"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "quoted-comment", () =>
    expect(history.locator('[data-history-kind="comment"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "field-transition", () =>
    expect(history.locator('[data-history-kind="field"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "tags", () =>
    expect(history.locator('[data-history-kind="tags"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "people-disclosure", () =>
    expect(history.locator('[data-history-kind="people"]')).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "attachment", () =>
    expect(history.locator('[data-history-kind="attachment"]')).toHaveCount(1),
  );
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
