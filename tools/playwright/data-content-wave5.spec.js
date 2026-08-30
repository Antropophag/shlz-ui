import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const components = [
  "table",
  "file-row",
  "document-row",
  "empty-state",
  "domain-table-compositions",
];
const manifests = Object.fromEntries(
  await Promise.all(
    components.map(async (component) => [
      component,
      await readComponentAuditManifest(
        new globalThis.URL(
          `../../docs/component-audits/${component}.json`,
          import.meta.url,
        ),
      ),
    ]),
  ),
);
const verifiedMaterialStates = new Map();

const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  const states = verifiedMaterialStates.get(component) ?? new Set();
  states.add(state);
  verifiedMaterialStates.set(component, states);
};

const expectMaterialStates = (component) => {
  expect(
    [...(verifiedMaterialStates.get(component) ?? [])].sort(),
    `Wave 5 executed material states: ${component}`,
  ).toEqual(
    [...manifests[component].interactionEvidence.materialStates].sort(),
  );
  verifiedMaterialStates.delete(component);
};

const resolveColorToken = (page, token) =>
  page.evaluate((property) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = `var(${property})`;
    document.body.append(probe);
    const color = window.getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, token);

test.beforeEach(async ({ page }) => page.goto("/"));

test("all Wave 5 executable, stress and live roots are classified", async ({
  page,
}) => {
  expect(Object.keys(manifests).sort()).toEqual([...components].sort());
  for (const component of components)
    await expectClassifiedComponentOccurrences(page, manifests[component]);
});

test("Table preserves native semantics, source geometry and ownership", async ({
  page,
}) => {
  const tables = page.locator("[data-component-audit-id^='table-']");
  await expect(tables).toHaveCount(3);
  for (let index = 0; index < 3; index++) {
    const table = tables.nth(index);
    await expect(table).toHaveJSProperty("tagName", "TABLE");
    await expect(table.locator(":scope > thead")).toHaveCount(1);
    await expect(table.locator(":scope > tbody")).toHaveCount(1);
    await expect(table.locator(":scope > caption")).toHaveCount(1);
    await expect(table.locator("thead th:not([scope='col'])")).toHaveCount(0);
    await expect(table).not.toHaveAttribute("role", /.+/);
  }

  const table = page.locator(
    "[data-component-audit-id='table-showcase-mixed']",
  );
  const row = table.locator("tbody tr").first();
  const cell = row.locator("td").first();
  await expect(cell).toHaveCSS("height", "50px");
  await expect(cell).toHaveCSS("border-bottom-width", "1px");
  const before = await cell.evaluate(
    (element) => window.getComputedStyle(element).backgroundColor,
  );
  await verifyMaterialState("table", "row-hover", async () => {
    await row.hover();
    const after = await cell.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );
    expect(after).not.toBe(before);
    expect(after).toBe(
      await resolveColorToken(page, "--shlz-semantic-color-surface-muted"),
    );
  });

  const numeric = page
    .locator(
      "[data-component-audit-id='table-typography-stress'] tbody .shlz-table__cell--numeric",
    )
    .first();
  await expect(numeric).toHaveCSS("text-align", "end");
  await expect(numeric).toHaveCSS("font-variant-numeric", /tabular-nums/);
  expectMaterialStates("table");
});

test("Table wrapper owns real narrow horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const table = page.locator(
    "[data-component-audit-id='table-workspace-requests']",
  );
  const wrapper = table.locator("xpath=parent::*");
  const geometry = await wrapper.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflowX: window.getComputedStyle(element).overflowX,
    tableWidth: element.querySelector("table").getBoundingClientRect().width,
  }));
  expect(geometry.overflowX).toBe("auto");
  expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth);
  expect(geometry.tableWidth).toBeGreaterThan(geometry.clientWidth);
});

test("File Row keeps an inert root, real hover and bounded native targets", async ({
  page,
}) => {
  const roots = page.locator("[data-component-audit-id^='file-row-']");
  await expect(roots).toHaveCount(7);
  for (let index = 0; index < 7; index++) {
    const root = roots.nth(index);
    await expect(root).not.toHaveAttribute("role", /.+/);
    await expect(root).not.toHaveAttribute("tabindex", /.+/);
    const visual = root.locator(":scope > .shlz-file-row__visual");
    if (await visual.count())
      await expect(visual).toHaveCSS("flex-basis", "38px");
  }
  const row = page.locator(
    "[data-component-audit-id='file-row-showcase-default']",
  );
  const before = await row.evaluate(
    (element) => window.getComputedStyle(element).backgroundColor,
  );
  await verifyMaterialState("file-row", "row-hover", async () => {
    await row.hover();
    const after = await row.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );
    expect(after).not.toBe(before);
    expect(after).toBe(
      await resolveColorToken(page, "--shlz-source-color-background-primary"),
    );
  });
  await expect(row.locator(".shlz-file-row__primary")).toHaveJSProperty(
    "tagName",
    "A",
  );

  const stress = page.locator(
    "[data-component-audit-id='file-row-content-stress-actions']",
  );
  await stress.evaluate((element) => {
    element.style.inlineSize = "230px";
    element.querySelector(".shlz-file-row__primary").textContent =
      "архивбезрасширениясоченьдлиннымименем";
  });
  const metrics = await stress.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    visualWidth: element.querySelector(".shlz-file-row__visual").clientWidth,
    actionsWidth: element.querySelector(".shlz-file-row__actions").clientWidth,
    titleOverflow: window.getComputedStyle(
      element.querySelector(".shlz-file-row__primary"),
    ).textOverflow,
  }));
  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  expect(metrics.visualWidth).toBe(38);
  expect(metrics.actionsWidth).toBeGreaterThanOrEqual(64);
  expect(metrics.titleOverflow).toBe("ellipsis");
  expectMaterialStates("file-row");
});

test("Document Row remains distinct, native and contained", async ({
  page,
}) => {
  const roots = page.locator("[data-component-audit-id^='document-row-']");
  await expect(roots).toHaveCount(7);
  for (let index = 0; index < 7; index++) {
    const root = roots.nth(index);
    await expect(root).not.toHaveAttribute("role", /.+/);
    await expect(root).not.toHaveAttribute("tabindex", /.+/);
  }
  const row = page.locator(
    "[data-component-audit-id='document-row-content-stress-long']",
  );
  await row.evaluate((element) => (element.style.inlineSize = "230px"));
  const before = await row.evaluate(
    (element) => window.getComputedStyle(element).backgroundColor,
  );
  const expectedInteractionPaint = await resolveColorToken(
    page,
    "--shlz-source-color-background-primary",
  );
  await verifyMaterialState("document-row", "row-hover", async () => {
    await row.hover();
    const hoverPaint = await row.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );
    expect(hoverPaint).not.toBe(before);
    expect(hoverPaint).toBe(expectedInteractionPaint);
  });
  const link = row.locator(".shlz-document-row__title");
  await expect(link).toHaveJSProperty("tagName", "A");
  await verifyMaterialState("document-row", "row-focus-within", async () => {
    await link.focus();
    await expect(link).toBeFocused();
    await expect(row).toHaveCSS("background-color", expectedInteractionPaint);
  });
  const metrics = await row.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    actionWidth: element.querySelector(".shlz-document-row__actions")
      .clientWidth,
    titleOverflow: window.getComputedStyle(
      element.querySelector(".shlz-document-row__title"),
    ).textOverflow,
  }));
  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  expect(metrics.actionWidth).toBe(40);
  expect(metrics.titleOverflow).toBe("ellipsis");
  expectMaterialStates("document-row");
});

test("Empty State preserves source variants and presentation semantics", async ({
  page,
}) => {
  const roots = page.locator("[data-component-audit-id^='empty-state-']");
  await expect(roots).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    const root = roots.nth(index);
    await expect(root).not.toHaveAttribute("role", /alert|status/);
    await expect(root).not.toHaveAttribute("aria-live", /.+/);
  }
  const expected = {
    simple: ["220px", "67px", "15px"],
    customize: ["159px", /136\.5\d*px/, "16px"],
    basic: ["167px", "262px", "18px"],
  };
  for (const [variant, [width, height, titleSize]] of Object.entries(
    expected,
  )) {
    const root = page.locator(
      `[data-component-audit-id='empty-state-showcase-${variant}'][data-empty-state-variant='${variant}']`,
    );
    await expect(root).toHaveCSS("width", width);
    await expect(root).toHaveCSS("height", height);
    await expect(root.locator(".shlz-empty-state__title")).toHaveCSS(
      "font-size",
      titleSize,
    );
  }

  const live = page.locator(
    "[data-component-audit-id='empty-state-workspace-no-results']",
  );
  await expect(live).toBeHidden();
  await expect(live.locator("button[data-workspace-reset]")).toHaveJSProperty(
    "tagName",
    "BUTTON",
  );
  expectMaterialStates("empty-state");
});

test("Data Workspace is a consumer composition, not a public DomainTable", async ({
  page,
}) => {
  const domain = page.locator(
    "[data-component-audit-id='domain-table-workspace-requests']",
  );
  await expect(domain.locator(":scope .shlz-table")).toHaveCount(1);
  await expect(domain.locator(":scope .shlz-status")).toHaveCount(3);
  await expect(domain.locator(":scope .shlz-link")).toHaveCount(3);
  await expect(
    domain.locator("[class*='DomainTable'], [data-domain-table-controller]"),
  ).toHaveCount(0);

  const search = domain.getByRole("searchbox", { name: "Поиск по заявкам" });
  await verifyMaterialState(
    "domain-table-compositions",
    "filtered",
    async () => {
      await search.fill("спецификации");
      await expect(domain.locator("[data-workspace-row]:visible")).toHaveCount(
        1,
      );
      await expect(domain.getByRole("link", { name: "SD-2409" })).toBeVisible();
    },
  );
  await search.fill("");
  await expect(domain.locator("[data-workspace-row]:visible")).toHaveCount(3);

  await verifyMaterialState("domain-table-compositions", "sorted", async () => {
    const titleHeader = domain.getByRole("columnheader", { name: /Тема/ });
    const titleCells = domain.locator("[data-workspace-title]");
    const before = await titleCells.allTextContents();
    await domain.getByRole("button", { name: /Тема/ }).click();
    await expect(titleHeader).toHaveAttribute("aria-sort", "descending");
    const after = await titleCells.allTextContents();
    expect(after).not.toEqual(before);
    expect(after).toEqual(
      [...before].sort((left, right) => right.localeCompare(left, "ru")),
    );
  });

  await verifyMaterialState(
    "domain-table-compositions",
    "selected",
    async () => {
      await domain
        .getByRole("checkbox", { name: "Выбрать заявку SD-2418" })
        .check();
      const bulkSelection = domain.locator("[data-workspace-bulk]");
      await expect(bulkSelection).toBeVisible();
      await expect(
        bulkSelection.locator("[data-workspace-selected-count]"),
      ).toHaveText("1");
      await bulkSelection.getByRole("button", { name: "Снять выбор" }).click();
      await expect(bulkSelection).toBeHidden();
    },
  );

  await verifyMaterialState(
    "domain-table-compositions",
    "empty-result",
    async () => {
      await search.fill("отсутствующая заявка");
      await expect(
        domain.locator(
          "[data-component-audit-id='empty-state-workspace-no-results']",
        ),
      ).toBeVisible();
      await expect(
        domain.locator("[data-component-audit-id='table-workspace-requests']"),
      ).toBeHidden();
      await domain.getByRole("button", { name: "Сбросить условия" }).click();
      await expect(domain.locator("[data-workspace-row]:visible")).toHaveCount(
        3,
      );
    },
  );
  expectMaterialStates("domain-table-compositions");
});

test("Wave 5 meaningful text pairs pass the alpha-aware contrast guard", async ({
  page,
}) => {
  for (const [selector, label] of [
    [
      "[data-component-audit-id='table-showcase-mixed'] tbody td:nth-child(3)",
      "Table body",
    ],
    [
      "[data-component-audit-id='file-row-showcase-default'] .shlz-file-row__primary",
      "File Row filename",
    ],
    [
      "[data-component-audit-id='document-row-showcase-pdf'] .shlz-document-row__title",
      "Document Row title",
    ],
  ]) {
    const ratio = await page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const rgba = (value) => {
          const channels = value.match(/[\d.]+/g).map(Number);
          return [channels[0], channels[1], channels[2], channels[3] ?? 1];
        };
        const composite = (foreground, background) => {
          const [red, green, blue, alpha] = rgba(foreground);
          return [
            red * alpha + background[0] * (1 - alpha),
            green * alpha + background[1] * (1 - alpha),
            blue * alpha + background[2] * (1 - alpha),
          ];
        };
        const luminance = (channels) => {
          const linear = channels.map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const style = window.getComputedStyle(element);
        let background = [255, 255, 255];
        const ancestors = [];
        for (let node = element; node; node = node.parentElement)
          ancestors.push(node);
        for (const node of ancestors.reverse())
          background = composite(
            window.getComputedStyle(node).backgroundColor,
            background,
          );
        const foreground = composite(style.color, background);
        const values = [luminance(foreground), luminance(background)].sort(
          (left, right) => right - left,
        );
        return (values[0] + 0.05) / (values[1] + 0.05);
      });
    expect(ratio, label).toBeGreaterThanOrEqual(4.5);
  }

  const emptyStateRatio = await page
    .locator(
      "[data-component-audit-id='empty-state-showcase-simple'] .shlz-empty-state__title",
    )
    .evaluate((element) => {
      const channels = (value) => value.match(/[\d.]+/g).map(Number);
      const [red, green, blue, alpha = 1] = channels(
        window.getComputedStyle(element).color,
      );
      const foreground = [
        red * alpha + 255 * (1 - alpha),
        green * alpha + 255 * (1 - alpha),
        blue * alpha + 255 * (1 - alpha),
      ];
      const luminance = (values) => {
        const linear = values.map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      return (
        (luminance([255, 255, 255]) + 0.05) / (luminance(foreground) + 0.05)
      );
    });
  expect(emptyStateRatio).toBeCloseTo(2.79, 1);
  expect(emptyStateRatio).toBeLessThan(4.5);
});
