import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUrl } from "./fixture-url.js";

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
    document.addEventListener("shlz:file-upload-files", (event) =>
      window.__fileUploadEvents.push({
        source: event.detail.source,
        names: [...event.detail.files].map((file) => file.name),
        input: event.detail.input.id,
      }),
    );
  });
  await input.setInputFiles({
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
  await root.dispatchEvent("dragenter", { dataTransfer: transfer });
  await expect(root).toHaveAttribute("data-drag-active", "true");
  await root.dispatchEvent("drop", { dataTransfer: transfer });
  await expect(root).not.toHaveAttribute("data-drag-active");
  await expect
    .poll(() => page.evaluate(() => window.__fileUploadEvents.length))
    .toBe(2);
  await expect(root.getByText("photo.png")).toBeVisible();

  const disabled = page.locator(
    "[data-component-audit-id='file-upload-showcase-disabled']",
  );
  await disabled.dispatchEvent("drop", { dataTransfer: transfer });
  await expect
    .poll(() => page.evaluate(() => window.__fileUploadEvents.length))
    .toBe(2);
  expect(
    (await new AxeBuilder({ page }).include("#file-upload-demo").analyze())
      .violations,
  ).toEqual([]);
});

test("focus, repeat enhancement and teardown are observable", async ({
  page,
}) => {
  const root = page.locator(
    "[data-component-audit-id='file-upload-showcase-empty']",
  );
  const trigger = root.locator(".shlz-file-upload__trigger");
  await trigger.focus();
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
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await expect(root).toHaveCSS("overflow-x", "visible");
});
/* global DataTransfer, DragEvent, File */

import { Buffer } from "node:buffer";
