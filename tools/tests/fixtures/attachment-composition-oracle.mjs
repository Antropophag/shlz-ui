import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

// The same public rendered-card assertions run against candidate styles and
// the immutable pre-change styles captured in the known-bad fixture.
const target = path.resolve(process.argv[2]);
const root = process.cwd();
const bad = (await stat(target)).isFile()
  ? JSON.parse(await readFile(target, "utf8"))
  : null;
const shared = await readFile(
  path.join(root, "packages/styles/components/file-row.css"),
  "utf8",
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const component of ["composer", "file-upload"]) {
    const css = bad
      ? bad[component]
      : await readFile(
          path.join(target, `packages/styles/components/${component}.css`),
          "utf8",
        );
    const container = component === "composer" ? "attachments" : "files";
    const card =
      '<div class="shlz-file-row"><span class="shlz-file-row__visual"></span><span class="shlz-file-row__content"><span class="shlz-file-row__title">Long localized filename.pdf</span><span class="shlz-file-row__meta">1.2 MB</span></span></div>';
    await page.setContent(
      `<style>${shared}\n${css}</style><section class="shlz-${component}" style="width:700px"><div class="shlz-${component}__${container}">${card}</div></section>`,
    );
    assert.equal(
      await page
        .locator(".shlz-file-row")
        .evaluate((node) => node.getBoundingClientRect().width),
      229,
      `${component}: single attachment stays compact`,
    );
    await page.locator(`.shlz-${component}`).evaluate((node) => {
      node.style.width = "220px";
    });
    assert.equal(
      await page
        .locator(".shlz-file-row")
        .evaluate((node) => node.getBoundingClientRect().width),
      220,
      `${component}: narrow card fits`,
    );
  }
} finally {
  await browser.close();
}
