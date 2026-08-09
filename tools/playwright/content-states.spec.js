import { expect, test } from "@playwright/test";
import { stabilizeShowcaseLayout } from "./visual-harness.js";

test("file row exposes independent targets and source geometry", async ({
  page,
}) => {
  await page.goto("/#file-row-demo");
  const row = page.locator("#file-row-demo .shlz-file-row").nth(1);
  await expect(row.locator(".shlz-file-row__primary")).toBeVisible();
  await expect(row.locator(".shlz-file-row__action")).toHaveCount(1);
  await expect(row.locator(".shlz-file-row__visual")).toHaveCSS(
    "width",
    "38px",
  );
  await expect(row.locator(".shlz-file-row__primary")).toHaveCSS(
    "text-overflow",
    "ellipsis",
  );
  await row.locator(".shlz-file-row__action").focus();
  await expect(row.locator(".shlz-file-row__action")).toBeFocused();
  await expect(row.locator(".shlz-file-row__primary")).not.toBeFocused();
  await expect(page.locator(".shlz-file-row[aria-invalid='true']")).toHaveCSS(
    "height",
    "73px",
  );
});

test("empty state composes optional regions responsively", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/#empty-state-demo");
  const states = page.locator("#empty-state-demo .shlz-empty-state");
  await expect(states).toHaveCount(2);
  await expect(states.nth(0).locator(".shlz-empty-state__actions")).toHaveCount(
    0,
  );
  await expect(
    states.nth(1).locator(".shlz-empty-state__actions"),
  ).toBeVisible();
  await expect(states.nth(0)).toHaveCSS("padding-left", "0px");
  await expect(states.nth(0).locator(".shlz-empty-state__visual")).toHaveCSS(
    "width",
    "64px",
  );
});

test("legacy component captures ignore additive showcase sections", async ({
  page,
}) => {
  await page.goto("/");
  const target = page.locator("#tabs-demo");
  await stabilizeShowcaseLayout(page);
  await target.scrollIntoViewIfNeeded();
  const before = await target.screenshot();

  await page.evaluate(() => {
    const addition = document.createElement("article");
    addition.id = "visual-harness-probe";
    addition.dataset.shlzVisualAddition = "";
    addition.style.blockSize = "777.5px";
    document.querySelector("#tabs-demo").before(addition);

    const link = document.createElement("a");
    link.href = "#visual-harness-probe";
    link.textContent = "Probe";
    document.querySelector(".shlz-docs-sidebar nav").append(link);
  });

  await stabilizeShowcaseLayout(page);
  await target.scrollIntoViewIfNeeded();
  await expect(target.screenshot()).resolves.toEqual(before);
});
