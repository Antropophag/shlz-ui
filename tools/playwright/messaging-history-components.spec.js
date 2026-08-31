import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectStablePreexistingShowcaseScreenshot } from "./visual-harness.js";
import assert from "node:assert/strict";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifests = new Map([
  [
    "message-thread",
    await readComponentAuditManifest(
      new globalThis.URL(
        "../../docs/component-audits/message-thread.json",
        import.meta.url,
      ),
    ),
  ],
  [
    "history-timeline",
    await readComponentAuditManifest(
      new globalThis.URL(
        "../../docs/component-audits/history-timeline.json",
        import.meta.url,
      ),
    ),
  ],
]);
const avatarManifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/avatar.json",
    import.meta.url,
  ),
);
const expectedIds = {
  showcase: {
    "message-thread": [
      "message-thread-showcase-source",
      "message-thread-data-workspace-consumer",
    ],
    "history-timeline": [
      "history-timeline-showcase-source",
      "history-timeline-data-workspace-consumer",
    ],
  },
  fixture: {
    "message-thread": ["message-thread-plain-html"],
    "history-timeline": ["history-timeline-plain-html"],
  },
};
const surfaceManifest = (component, surface) => ({
  ...manifests.get(component),
  occurrences: manifests
    .get(component)
    .occurrences.filter(({ id }) =>
      expectedIds[surface][component].includes(id),
    ),
});
const executedMaterialStates = new Set();
const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  executedMaterialStates.add(`${component}:${state}`);
};
const expectMaterialStates = (component) =>
  expect(
    manifests
      .get(component)
      .interactionEvidence.materialStates.every((state) =>
        executedMaterialStates.has(`${component}:${state}`),
      ),
  ).toBe(true);

test.beforeEach(async ({ page }) => page.goto("/#message-thread-demo"));

test("exact guard classifies Showcase fixtures and Data Workspace consumers", async ({
  page,
}) => {
  for (const component of manifests.keys()) {
    const partitionedIds = [
      ...expectedIds.showcase[component],
      ...expectedIds.fixture[component],
    ];
    expect(new Set(partitionedIds).size).toBe(partitionedIds.length);
    expect(partitionedIds.sort()).toEqual(
      manifests
        .get(component)
        .occurrences.map(({ id }) => id)
        .sort(),
    );
    await expectClassifiedComponentOccurrences(
      page,
      surfaceManifest(component, "showcase"),
    );
  }
  for (const component of manifests.keys())
    await expect(
      page.locator(
        `[data-consumer-workspace] [data-component-audit-id='${component}-data-workspace-consumer']`,
      ),
    ).toHaveCount(1);
});

test("shared guard rejects missing, duplicate, and unclassified roots on both surfaces", async ({
  page,
}) => {
  const messageManifest = surfaceManifest("message-thread", "showcase");
  await page
    .locator("[data-component-audit-id='message-thread-showcase-source']")
    .evaluate((root) => root.remove());
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, messageManifest),
  );

  await page.reload();
  await page
    .locator("[data-component-audit-id='message-thread-showcase-source']")
    .evaluate((root) => root.after(root.cloneNode(true)));
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, messageManifest),
  );

  await page.reload();
  await page
    .locator("#message-thread-demo")
    .evaluate((root) =>
      root.insertAdjacentHTML(
        "beforeend",
        '<ol class="shlz-message-thread"><li>Unclassified</li></ol>',
      ),
    );
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, messageManifest),
  );

  await page.goto(fixtureUrl("messaging-history-components.html"));
  const historyManifest = surfaceManifest("history-timeline", "fixture");
  const history = page.locator(
    "[data-component-audit-id='history-timeline-plain-html']",
  );
  await history.evaluate((root) => root.remove());
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, historyManifest),
  );

  await page.reload();
  await history.evaluate((root) => root.after(root.cloneNode(true)));
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, historyManifest),
  );

  await page.reload();
  await page
    .locator("main")
    .evaluate((root) =>
      root.insertAdjacentHTML(
        "beforeend",
        '<ol class="shlz-history-timeline"><li>Unclassified</li></ol>',
      ),
    );
  await assert.rejects(() =>
    expectClassifiedComponentOccurrences(page, historyManifest),
  );
});

test("native links and buttons receive keyboard focus with a visible indicator", async ({
  page,
}) => {
  const controls = [
    page.locator("#message-thread-demo a").first(),
    page.locator("#history-timeline-demo a").first(),
    page.locator("[data-workspace-message-action]"),
    page.locator("[data-workspace-history-action]"),
  ];
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded();
    await control.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    const indicator = await control.evaluate((node) => {
      const style = window.getComputedStyle(node);
      return (
        (Number.parseFloat(style.outlineWidth) > 0 &&
          style.outlineStyle !== "none") ||
        style.boxShadow !== "none"
      );
    });
    expect(indicator).toBe(true);
  }
  await controls[2].click();
  await controls[3].click();
  await expect(
    page.locator("[data-messaging-history-consumer-status]"),
  ).toContainText("Application handled");
  await expect(
    page.locator("[data-messaging-history-consumer-status]"),
  ).toHaveAttribute("role", "status");
  await expect(controls[0]).toHaveClass(/\bshlz-link\b/);
  await expect(controls[2]).toHaveClass(/\bshlz-link\b/);
  await expect(controls[3]).toHaveClass(/\bshlz-button\b/);
});

test("period labels explicitly describe their following history entries", async ({
  page,
}) => {
  const period = page.locator(
    "#history-timeline-demo .shlz-history-timeline__period",
  );
  await expect(period).not.toHaveAttribute("role", "presentation");
  const label = period.locator("[id]");
  const labelId = await label.getAttribute("id");
  expect(labelId).toBeTruthy();
  const describedEntries = page.locator(
    `#history-timeline-demo .shlz-history-timeline__entry[aria-describedby='${labelId}']`,
  );
  await expect(describedEntries).toHaveCount(2);
});

test("empty states are independently readable", async ({ page }) => {
  for (const [demo, className, text] of [
    ["#message-thread-demo", "shlz-message-thread__empty", "No messages yet."],
    [
      "#history-timeline-demo",
      "shlz-history-timeline__empty",
      "No history entries.",
    ],
  ])
    await page.locator(demo).evaluate(
      (root, state) => {
        const empty = document.createElement("p");
        empty.className = state.className;
        empty.textContent = state.text;
        root.replaceChildren(empty);
      },
      { className, text },
    );
  await expect(page.getByText("No messages yet.")).toBeVisible();
  await expect(page.getByText("No history entries.")).toBeVisible();
});

test("loading-safe states are independently exposed as status text", async ({
  page,
}) => {
  for (const [demo, className, text] of [
    [
      "#message-thread-demo",
      "shlz-message-thread__loading",
      "Loading messages…",
    ],
    [
      "#history-timeline-demo",
      "shlz-history-timeline__loading",
      "Loading history…",
    ],
  ])
    await page.locator(demo).evaluate(
      (root, state) => {
        const status = document.createElement("p");
        status.className = state.className;
        status.setAttribute("role", "status");
        status.textContent = state.text;
        root.replaceChildren(status);
      },
      { className, text },
    );
  await expect(
    page.getByRole("status").filter({ hasText: "Loading messages…" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Loading history…" }),
  ).toBeVisible();
});

test("200% text, unbroken messages, and sparse history remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page
    .locator("aside")
    .first()
    .evaluate((node) => {
      node.hidden = true;
    });
  await expect(
    page.locator("#message-thread-demo .shlz-message-thread"),
  ).toHaveScreenshot("message-thread-narrow.png");
  await expect(
    page.locator("#history-timeline-demo .shlz-history-timeline"),
  ).toHaveScreenshot("history-timeline-narrow.png");
  await page.addStyleTag({
    content: "html{font-size:200%}",
  });
  await page
    .locator("#message-thread-demo .shlz-message-thread__body p")
    .first()
    .evaluate((node) => {
      node.textContent = "A".repeat(240);
    });
  await page
    .locator("#history-timeline-demo .shlz-history-timeline")
    .evaluate((root) => {
      root.insertAdjacentHTML(
        "beforeend",
        `<li class="shlz-history-timeline__entry"><span class="shlz-history-timeline__marker" aria-hidden="true"></span><article class="shlz-history-timeline__content"><header class="shlz-history-timeline__header"><span class="shlz-history-timeline__actor">System</span><time class="shlz-history-timeline__time">13:00</time></header><p class="shlz-history-timeline__description">Sparse entry.</p></article></li>`,
      );
    });
  for (const root of ["#message-thread-demo", "#history-timeline-demo"])
    expect(
      await page
        .locator(root)
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    ),
  ).toBe(true);
  await expect(page.locator("#message-thread-demo a").first()).toBeVisible();
  await expect(page.locator("#history-timeline-demo a").first()).toBeVisible();
  await expect(page.locator("[data-workspace-message-action]")).toBeVisible();
  await expect(page.locator("[data-workspace-history-action]")).toBeVisible();
  await expect(page.getByText("Sparse entry.")).toBeVisible();
  await verifyMaterialState("message-thread", "incoming", () =>
    expect(
      page.locator("#message-thread-demo [data-direction='incoming']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("message-thread", "outgoing", () =>
    expect(
      page.locator("#message-thread-demo [data-direction='outgoing']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("message-thread", "narrow-layout", () =>
    expect(
      page.locator("#message-thread-demo .shlz-message-thread"),
    ).toBeVisible(),
  );
  await verifyMaterialState("message-thread", "text-scale", () =>
    expect(
      page.locator("#message-thread-demo .shlz-message-thread__author").first(),
    ).toBeVisible(),
  );
  await verifyMaterialState("history-timeline", "period-group", () =>
    expect(
      page.locator("#history-timeline-demo .shlz-history-timeline__period"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "current", () =>
    expect(
      page.locator("#history-timeline-demo [data-emphasis='current']"),
    ).toHaveCount(1),
  );
  await verifyMaterialState("history-timeline", "narrow-layout", () =>
    expect(
      page.locator("#history-timeline-demo .shlz-history-timeline"),
    ).toBeVisible(),
  );
  await verifyMaterialState("history-timeline", "text-scale", () =>
    expect(
      page
        .locator("#history-timeline-demo .shlz-history-timeline__actor")
        .first(),
    ).toBeVisible(),
  );
  expectMaterialStates("message-thread");
  expectMaterialStates("history-timeline");
});

test("every semantic item in the grouped message sequence identifies its author and time", async ({
  page,
}) => {
  const groupedSequence = page.locator(
    "[data-component-audit-id='message-thread-data-workspace-consumer'] > li",
  );
  await expect(groupedSequence).toHaveCount(2);
  await expect(groupedSequence.last()).toHaveAttribute("data-grouped", "");
  for (const item of await groupedSequence.all()) {
    await expect(item.locator(".shlz-message-thread__author")).toHaveCount(1);
    await expect(item.locator("time.shlz-message-thread__time")).toHaveCount(1);
  }
});

test("semantic fixtures pass accessibility and focused source visuals", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page })
    .include("#message-thread-demo")
    .include("#history-timeline-demo")
    .include(
      "[data-component-audit-id='message-thread-data-workspace-consumer']",
    )
    .include(
      "[data-component-audit-id='history-timeline-data-workspace-consumer']",
    )
    .analyze();
  expect(results.violations).toEqual([]);
  await expectStablePreexistingShowcaseScreenshot(
    page,
    page.locator("[data-component-audit-id='message-thread-showcase-source']"),
    "message-thread-source.png",
  );
  await expect(
    page.locator(
      "[data-component-audit-id='history-timeline-showcase-source']",
    ),
  ).toHaveScreenshot("history-timeline-source.png");
});

test("plain HTML fixture has its own exact occurrence inventory", async ({
  page,
}) => {
  await page.goto(fixtureUrl("messaging-history-components.html"));
  for (const component of manifests.keys())
    await expectClassifiedComponentOccurrences(
      page,
      surfaceManifest(component, "fixture"),
    );
  await expectClassifiedComponentOccurrences(page, {
    ...avatarManifest,
    diagnosticOccurrenceCount: 0,
    occurrences: avatarManifest.occurrences.filter(({ id }) =>
      id.endsWith("-plain-html"),
    ),
  });
  await expect(page.getByRole("list", { name: "Messages" })).toBeVisible();
  await expect(page.getByRole("list", { name: "History" })).toBeVisible();
});
