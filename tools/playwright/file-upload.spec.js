/* global DataTransfer, DragEvent, File, getComputedStyle */

import { Buffer } from "node:buffer";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/file-upload.json",
    import.meta.url,
  ),
);
const manifestSubset = (ids) => ({
  ...manifest,
  occurrences: manifest.occurrences.filter(({ id }) => ids.includes(id)),
});

test.beforeEach(async ({ page }) => page.goto("/#file-upload-demo"));

test("native selection, file drops, filtering, disabled and consumer rendering work", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='file-upload-showcase-empty']",
  );
  const input = root.locator("input[type=file]");
  await page.evaluate(() => {
    window.__fileUploadEvents = [];
    window.__nativeFileUploadChanges = 0;
    document
      .querySelector("#showcase-upload-input")
      .addEventListener("change", () => {
        window.__nativeFileUploadChanges += 1;
      });
    document.addEventListener("shlz:file-upload-files", (event) =>
      window.__fileUploadEvents.push({
        source: event.detail.source,
        names: [...event.detail.files].map((file) => file.name),
        input: event.detail.input.id,
      }),
    );
  });
  await input.focus();
  const chooserPromise = page.waitForEvent("filechooser");
  await input.press("Enter");
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "contract.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("pdf"),
  });
  await expect
    .poll(() => page.evaluate(() => window.__fileUploadEvents))
    .toEqual([
      {
        source: "input",
        names: ["contract.pdf"],
        input: "showcase-upload-input",
      },
    ]);
  await expect
    .poll(() => page.evaluate(() => window.__nativeFileUploadChanges))
    .toBe(1);
  await root.evaluate((element) => {
    const data = new DataTransfer();
    data.setData("text/plain", "not a file");
    element.dispatchEvent(
      new DragEvent("dragenter", { bubbles: true, dataTransfer: data }),
    );
  });
  await expect(root).not.toHaveAttribute("data-drag-active");
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(["image"], "photo.png", { type: "image/png" }));
    return data;
  });
  const idlePaint = await root
    .locator(".shlz-file-upload__surface")
    .evaluate((surface) => ({
      background: getComputedStyle(surface).backgroundColor,
      borderColor: getComputedStyle(surface).borderColor,
    }));
  await root.dispatchEvent("dragenter", { dataTransfer: transfer });
  await expect(root).toHaveAttribute("data-drag-active", "true");
  const activePaint = await root
    .locator(".shlz-file-upload__surface")
    .evaluate((surface) => ({
      background: getComputedStyle(surface).backgroundColor,
      borderColor: getComputedStyle(surface).borderColor,
      borderStyle: getComputedStyle(surface).borderStyle,
    }));
  expect(activePaint.borderStyle).toBe("solid");
  expect(activePaint.background).not.toBe(idlePaint.background);
  expect(activePaint.borderColor).not.toBe(idlePaint.borderColor);
  await root.dispatchEvent("drop", { dataTransfer: transfer });
  await expect(root).not.toHaveAttribute("data-drag-active");
  await expect
    .poll(() => page.evaluate(() => window.__fileUploadEvents.length))
    .toBe(2);
  await expect(root.getByText("photo.png")).toBeVisible();

  const consumer = page.locator(
    "[data-component-audit-id='file-upload-data-workspace']",
  );
  await consumer.locator("input[type=file]").setInputFiles({
    name: "workspace-contract.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("workspace"),
  });
  await expect(page.locator("[data-file-upload-consumer-status]")).toHaveText(
    "1 file(s) queued by the application.",
  );
  await expect(
    consumer.locator(
      "[data-component-audit-id='file-row-file-upload-consumer'] .shlz-file-row__title",
    ),
  ).toHaveText("workspace-contract.pdf");

  const disabled = page.locator(
    "[data-component-audit-id='file-upload-showcase-disabled']",
  );
  await expect(disabled.locator("input[type=file]")).toBeDisabled();
  const disabledBackground = await disabled
    .locator(".shlz-file-upload__surface")
    .evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(disabledBackground).not.toBe(idlePaint.background);
  await expect(disabled.locator(".shlz-file-upload__trigger")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await disabled.dispatchEvent("drop", { dataTransfer: transfer });
  await expect
    .poll(() => page.evaluate(() => window.__fileUploadEvents.length))
    .toBe(3);
  expect(
    (await new AxeBuilder({ page }).include("#file-upload-demo").analyze())
      .violations,
  ).toEqual([]);
});

test("every File Upload occurrence is classified", async ({ page }) => {
  await expect(
    page.locator("[data-component-audit-id^='file-upload-']"),
  ).toHaveCount(5);
  await expectClassifiedComponentOccurrences(
    page,
    manifestSubset([
      "file-upload-showcase-empty",
      "file-upload-showcase-populated",
      "file-upload-showcase-disabled",
      "file-upload-showcase-error",
      "file-upload-data-workspace",
    ]),
  );
  await page.goto(fixtureUrl("file-upload.html"));
  await expect(
    page.locator("[data-component-audit-id^='file-upload-']"),
  ).toHaveCount(1);
  await expectClassifiedComponentOccurrences(
    page,
    manifestSubset(["file-upload-plain-html"]),
  );
});

test("focus, repeat enhancement and teardown are observable", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='file-upload-showcase-empty']",
  );
  const trigger = root.locator(".shlz-file-upload__trigger");
  await root.locator("input[type=file]").focus();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  const result = await page.evaluate(() => {
    const root = document.querySelector(
      "[data-component-audit-id='file-upload-showcase-empty']",
    );
    const first = window.__shlzEnhanceFileUploads(root.parentElement)[0];
    const second = window.__shlzEnhanceFileUploads(root.parentElement)[0];
    first.destroy();
    root.dispatchEvent(
      new DragEvent("dragenter", {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      }),
    );
    return {
      same: first === second,
      active: root.hasAttribute("data-drag-active"),
      markup: root.isConnected,
    };
  });
  expect(result).toEqual({ same: true, active: false, markup: true });
});

test("plain HTML and visual stress states remain coherent", async ({
  page,
}) => {
  await page.goto(fixtureUrl("file-upload.html"));
  const root = page.locator(
    "[data-component-audit-id='file-upload-plain-html']",
  );
  await expect(root.getByText("Choose files")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(root).toHaveScreenshot("file-upload-narrow.png");
  await page.goto("/#file-upload-demo");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  const populated = page.locator(
    "[data-component-audit-id='file-upload-showcase-populated']",
  );
  await populated.evaluate((element) => {
    element.style.inlineSize = "300px";
  });
  const input = populated.locator("input[type=file]");
  const trigger = populated.locator(".shlz-file-upload__trigger");
  await input.focus();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  const triggerOutline = await trigger.evaluate(
    (element) => getComputedStyle(element).outlineWidth,
  );
  const action = populated.locator(".shlz-file-row__action");
  await action.focus();
  await expect(action).toBeFocused();
  const geometry = await populated.evaluate((element) => {
    const trigger = element.querySelector(".shlz-file-upload__trigger");
    const surface = element.querySelector(".shlz-file-upload__surface");
    const action = element.querySelector(".shlz-file-row__action");
    const bounds = element.getBoundingClientRect();
    const actionBounds = action.getBoundingClientRect();
    return {
      rootOverflow: element.scrollWidth - element.clientWidth,
      surfaceOverflow: surface.scrollWidth - surface.clientWidth,
      triggerVisible: trigger.getBoundingClientRect().right <= bounds.right,
      actionVisible:
        actionBounds.left >= bounds.left && actionBounds.right <= bounds.right,
      actionOutline: getComputedStyle(action).outlineStyle,
    };
  });
  expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
  expect(geometry.surfaceOverflow).toBeLessThanOrEqual(1);
  expect(geometry.triggerVisible).toBe(true);
  expect(geometry.actionVisible).toBe(true);
  expect(triggerOutline).not.toBe("0px");
  expect(geometry.actionOutline).not.toBe("none");
});

test("source and repository visual states have independent evidence", async ({
  page,
}) => {
  const demo = page.locator("#file-upload-demo .shlz-component-grid");
  const empty = page.locator(
    "[data-component-audit-id='file-upload-showcase-empty'] .shlz-file-upload__surface",
  );
  const populated = page.locator(
    "[data-component-audit-id='file-upload-showcase-populated']",
  );
  const error = page.locator(
    "[data-component-audit-id='file-upload-showcase-error']",
  );
  await expect(empty).toHaveCSS("min-height", "102px");
  await expect(empty).toHaveCSS("border-style", "dashed");
  await expect(populated.locator(".shlz-file-row")).toBeVisible();
  const [emptyBorder, errorBorder] = await Promise.all([
    empty.evaluate((node) => getComputedStyle(node).borderColor),
    error
      .locator(".shlz-file-upload__surface")
      .evaluate((node) => getComputedStyle(node).borderColor),
  ]);
  expect(errorBorder).not.toBe(emptyBorder);
  await expect(error.locator(".shlz-file-upload__error")).toBeVisible();
  await expect(demo).toHaveScreenshot("file-upload-states.png");
});
