import { readFile } from "node:fs/promises";
import { URL } from "node:url";
import { expect, test } from "@playwright/test";
import {
  expectContrastMember,
  expectReadable,
  statusPaints,
  emptyVariants,
} from "./status-empty-contrast-matrix.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const stylesheet = await readFile(
  new URL("../../packages/styles/dist/shlz.css", import.meta.url),
  "utf8",
);

test("all Status paints have readable text on supported light surfaces", async ({
  page,
}) => {
  await page.setContent(
    `<style>${stylesheet}</style><body class="shlz-scope"></body>`,
  );
  for (const member of Object.keys(statusPaints))
    await expectContrastMember(page, "status", member);
  await expect(page.locator("[data-contrast-probe]")).toHaveCount(0);
});

test("all Empty State compositions have readable text on supported light surfaces", async ({
  page,
}) => {
  await page.setContent(
    `<style>${stylesheet}</style><body class="shlz-scope"></body>`,
  );
  for (const member of emptyVariants)
    await expectContrastMember(page, "empty-state", member);
});

test("classified Status and Empty State occurrences keep static semantics and readable text", async ({
  page,
}) => {
  await page.goto("/?full=1");
  for (const family of ["status", "empty-state"]) {
    const manifest = await readComponentAuditManifest(
      new URL(`../../docs/component-audits/${family}.json`, import.meta.url),
    );
    await expectClassifiedComponentOccurrences(page, manifest);
    const roots = page.locator(manifest.rootSelector);
    for (const root of await roots.all()) {
      await expect(root).not.toHaveAttribute("role", /alert|status|button/);
      await expect(root).not.toHaveAttribute("aria-live", /.+/);
      await expect(root).not.toHaveAttribute("tabindex", /.+/);
      if (!(await root.isVisible())) continue;
      const text =
        family === "status"
          ? [root]
          : await root
              .locator(
                ".shlz-empty-state__title, .shlz-empty-state__description",
              )
              .all();
      for (const item of text)
        await expectReadable(item, `${family} classified occurrence`);
    }
  }
});

test("Data Workspace retains readable status filtering and keyboard empty-result recovery", async ({
  page,
}) => {
  await page.goto("/?full=1");
  const search = page.getByRole("searchbox", { name: "Поиск по заявкам" });
  await search.fill("SD-2418");
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(1);
  await expectReadable(
    page.locator("[data-component-audit-id='status-workspace-sd-2418']"),
    "filtered live status",
  );
  await search.fill("несуществующая заявка");
  const empty = page.locator(
    "[data-component-audit-id='empty-state-workspace-no-results']",
  );
  await expect(empty).toBeVisible();
  for (const text of await empty
    .locator(".shlz-empty-state__title, .shlz-empty-state__description")
    .all())
    await expectReadable(text, "live empty result");
  const reset = empty.getByRole("button", { name: "Сбросить условия" });
  await reset.focus();
  await expect(reset).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(empty).toBeHidden();
  await expect(page.locator("[data-workspace-row]:visible")).toHaveCount(3);
});

test("semantic foreground customization leaves Badge and source values independent", async ({
  page,
}) => {
  await page.goto("/?full=1");
  const badge = page.locator(
    "[data-component-audit-id='badge-showcase-small-blue-single']",
  );
  const sourceBefore = await page
    .locator("body")
    .evaluate((element) =>
      window
        .getComputedStyle(element)
        .getPropertyValue("--shlz-source-color-aditional-green"),
    );
  await page
    .locator("body")
    .evaluate((element) =>
      element.style.setProperty(
        "--shlz-semantic-color-status-foreground-green",
        "#123456",
      ),
    );
  await expect(
    page.locator("[data-component-audit-id='status-showcase-green']"),
  ).toHaveCSS("color", "rgb(18, 52, 86)");
  await expect(badge).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(badge).toHaveCSS("background-color", "rgb(37, 61, 152)");
  expect(
    await page
      .locator("body")
      .evaluate((element) =>
        window
          .getComputedStyle(element)
          .getPropertyValue("--shlz-source-color-aditional-green"),
      ),
  ).toBe(sourceBefore);
});

test("focused paint and narrow text-scaled compositions preserve content", async ({
  page,
}) => {
  await page.goto("/?full=1");
  const status = page.locator("#status-demo > section").first();
  await expect(status).toHaveScreenshot("status-accessible-paints.png");
  const matrix = page.locator("[data-shlz-empty-state-source-matrix]");
  await expect(matrix).toHaveScreenshot("empty-state-accessible-text.png");
  await page.setViewportSize({ width: 360, height: 900 });
  const stress = page.locator(
    "[data-component-audit-id='empty-state-typography-stress']",
  );
  await stress.evaluate((element) => {
    element.classList.remove("shlz-empty-state--simple");
    element.style.inlineSize = "280px";
    for (const text of element.querySelectorAll(
      ".shlz-empty-state__title, .shlz-empty-state__description",
    )) {
      const style = window.getComputedStyle(text);
      text.style.fontSize = `${Number.parseFloat(style.fontSize) * 2}px`;
      text.style.lineHeight = `${Number.parseFloat(style.lineHeight) * 2}px`;
    }
  });
  for (const text of await stress
    .locator(".shlz-empty-state__title, .shlz-empty-state__description")
    .all())
    await expectReadable(text, "narrow doubled empty-state text");
  expect(
    await stress.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await expect(stress).toHaveScreenshot("empty-state-accessible-stress.png");
  const narrowStatus = page.locator(
    "[data-component-audit-id='status-typography-table']",
  );
  await expectReadable(narrowStatus, "narrow table Status");
  await expect(narrowStatus).toHaveCSS("white-space", "nowrap");
});
