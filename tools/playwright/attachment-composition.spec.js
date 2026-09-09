/* global getComputedStyle */

import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const fileRowManifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/file-row.json",
    import.meta.url,
  ),
);
const expectFileIcon = async (page, icon, name) => {
  const source = await icon.getAttribute("src");
  const actual = source.startsWith("data:")
    ? decodeURIComponent(source.slice(source.indexOf(",") + 1))
    : await (await page.request.get(source)).text();
  const expected = await readFile(
    new globalThis.URL(
      `../../packages/icons/dist/file-types/${name}.svg`,
      import.meta.url,
    ),
    "utf8",
  );
  // Vite can inline SVGs and normalize their quotes; compare parsed geometry.
  const geometry = (svg) =>
    svg
      .replaceAll('"', "'")
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim();
  expect(geometry(actual)).toBe(geometry(expected));
};
const cardGeometry = (row) => {
  const style = getComputedStyle(row);
  const visual = row.querySelector(".shlz-file-row__visual");
  return {
    width: row.getBoundingClientRect().width,
    height: row.getBoundingClientRect().height,
    radius: style.borderRadius,
    visualWidth: visual?.getBoundingClientRect().width,
    visualHeight: visual?.getBoundingClientRect().height,
    metaColor: getComputedStyle(row.querySelector(".shlz-file-row__meta"))
      .color,
  };
};

test("named attachments match Comment Feed cards", async ({ page }) => {
  await page.goto("/#composer-demo");
  await expectClassifiedComponentOccurrences(page, fileRowManifest);
  const reference = page.locator(
    "[data-component-audit-id='file-row-comment-source-pdf']",
  );
  const expected = await reference.evaluate(cardGeometry);
  expect(expected).toMatchObject({
    width: 229,
    height: 55,
    radius: "12px",
    visualWidth: 38,
    visualHeight: 38,
  });
  for (const id of [
    "file-row-composer-data-workspace",
    "file-row-file-upload-populated",
  ]) {
    const row = page.locator(`[data-component-audit-id='${id}']`);
    expect(await row.evaluate(cardGeometry)).toEqual(expected);
    const icon = row.locator(".shlz-file-row__visual img");
    await expect(icon).toHaveAttribute(
      "src",
      await reference.locator("img").getAttribute("src"),
    );
    await expect(icon).toHaveAttribute("alt", "");
    await expect(row).toHaveScreenshot(`${id}.png`);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .include("#file-upload-demo")
        .include("[data-component-audit-id='composer-data-workspace']")
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("selected files keep compact cards, literal names and removal", async ({
  page,
}) => {
  await page.goto("/#file-upload-demo");
  const root = page.locator(
    "[data-component-audit-id='file-upload-showcase-empty']",
  );
  const names = [
    "техническое-задание-с-длинным-названием.PDF",
    "report.pdf.unknown",
    "<img onerror=alert(1)>.pdf",
  ];
  await root.locator("input").setInputFiles(
    names.map((name) => ({
      name,
      mimeType: "application/octet-stream",
      buffer: Buffer.from("fixture"),
    })),
  );
  const rows = root.locator(".shlz-file-row");
  await expect(rows).toHaveCount(3);
  const dynamicIds = names.map(
    (_, index) => `file-row-file-upload-showcase-empty-selected-${index}`,
  );
  await expectClassifiedComponentOccurrences(page, {
    ...fileRowManifest,
    occurrences: [
      ...fileRowManifest.occurrences,
      ...dynamicIds.map((id) => ({ id, kind: "executable-fixture" })),
    ],
  });
  await expect(rows.locator(".shlz-file-row__title")).toHaveText(names);
  await expect(rows.locator(".shlz-file-row__title img")).toHaveCount(0);
  const pdfSource = await page
    .locator("[data-component-audit-id='file-row-comment-source-pdf'] img")
    .getAttribute("src");
  await expect(rows.nth(0).locator("img")).toHaveAttribute("src", pdfSource);
  await expectFileIcon(page, rows.nth(1).locator("img"), "file-generic");
  await expectFileIcon(page, rows.nth(2).locator("img"), "file-generic");
  const bounds = await rows.evaluateAll((elements) =>
    elements.map((row) => ({
      width: row.getBoundingClientRect().width,
      top: row.getBoundingClientRect().top,
    })),
  );
  expect(bounds.map(({ width }) => width)).toEqual([229, 229, 229]);
  expect(bounds[2].top).toBeGreaterThan(bounds[0].top);
  const remove = rows
    .nth(1)
    .getByRole("button", { name: `Remove ${names[1]}`, exact: true });
  await remove.focus();
  await expect(remove).toHaveCSS("outline-style", "solid");
  await remove.press("Enter");
  await expect(rows.locator(".shlz-file-row__title")).toHaveText([
    names[0],
    names[2],
  ]);
  await expectClassifiedComponentOccurrences(page, {
    ...fileRowManifest,
    occurrences: [
      ...fileRowManifest.occurrences,
      ...[dynamicIds[0], dynamicIds[2]].map((id) => ({
        id,
        kind: "executable-fixture",
      })),
    ],
  });

  const consumer = page.locator(
    "[data-component-audit-id='file-upload-data-workspace']",
  );
  await consumer.locator("input").setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("fixture"),
  });
  await expectFileIcon(page, consumer.locator(".shlz-file-row img"), "png");
  await consumer
    .getByRole("button", { name: "Remove photo.png" })
    .press("Space");
  await expect(consumer.locator(".shlz-file-row__title")).toHaveText(
    "No file selected",
  );
  await expectFileIcon(
    page,
    consumer.locator(".shlz-file-row img"),
    "file-generic",
  );
});

test("attachment cards fit narrow containers and keep fixed visuals and actions", async ({
  page,
}) => {
  await page.goto("/#composer-demo");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  for (const id of [
    "composer-content-stress",
    "file-upload-showcase-populated",
  ]) {
    const root = page.locator(`[data-component-audit-id='${id}']`);
    await root.evaluate((element) => {
      element.style.inlineSize = "220px";
    });
    const row = root.locator(".shlz-file-row");
    const geometry = await row.evaluate((element) => {
      const title = element.querySelector(".shlz-file-row__title");
      const visual = element.querySelector(".shlz-file-row__visual");
      const action = element.querySelector(".shlz-file-row__action");
      const bounds = element.getBoundingClientRect();
      return {
        width: bounds.width,
        overflow: element.scrollWidth - element.clientWidth,
        visualWidth: visual.getBoundingClientRect().width,
        truncated: title.scrollWidth > title.clientWidth,
        actionContained:
          !action || action.getBoundingClientRect().right <= bounds.right,
      };
    });
    expect(geometry).toEqual({
      width: 220,
      overflow: 0,
      visualWidth: 38,
      truncated: true,
      actionContained: true,
    });
    await expect(row).toHaveScreenshot(`${id}-attachment-narrow.png`);
  }
});
