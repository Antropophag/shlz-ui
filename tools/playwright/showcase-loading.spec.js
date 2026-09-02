import { expect, test } from "@playwright/test";

test("keeps the root shell usable without requesting deferred source evidence", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Components and foundations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Components and foundations" }),
  ).toBeVisible();
  await expect(page.getByRole("searchbox")).toBeVisible();
  await expect(
    page.locator(
      '[data-component-audit-id="sidebar-application-shell-showcase"]',
    ),
  ).toHaveCount(1);
  await expect(page.locator("[data-showcase-loader]")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  expect(requests.filter((url) => url.endsWith(".svg"))).toEqual([]);
  expect(
    requests.some((url) => url.includes("main-") && url.endsWith(".js")),
  ).toBe(false);
});

test("loads a direct hash and shares concurrent work", async ({ page }) => {
  await page.goto("/");
  const shared = await page.evaluate(() => {
    const first = window.__shlzShowcaseLoader.load();
    const second = window.__shlzShowcaseLoader.load();
    return first === second;
  });
  expect(shared).toBe(true);
  await expect(page.locator("#input")).toHaveCount(1);
  await expect(page.locator("#implementation")).toBeVisible();

  await page.goto("/#file-upload-demo");
  await expect(page.locator("#file-upload-demo")).toBeVisible();
  await expect(page).toHaveURL(/#file-upload-demo$/);
});

test("preserves navigation focus while loading and responds to hash changes", async ({
  page,
}) => {
  await page.goto("/");
  const inputLink = page.getByRole("link", { name: "Input", exact: true });
  const shellBefore = await page
    .locator("[data-shlz-docs-shell]")
    .evaluate((element) => ({
      x: element.getBoundingClientRect().x,
      y: element.getBoundingClientRect().y + window.scrollY,
      width: element.getBoundingClientRect().width,
    }));
  const headerBefore = await page.locator(".shlz-hero").boundingBox();
  await inputLink.focus();
  await inputLink.click();
  await expect(page.locator("#input")).toHaveCount(1);
  await expect(
    page.locator('[data-shlz-docs-link][href="#input"]'),
  ).toBeFocused();
  const shellAfter = await page
    .locator(".shlz-docs-shell")
    .evaluate((element) => ({
      x: element.getBoundingClientRect().x,
      y: element.getBoundingClientRect().y + window.scrollY,
      width: element.getBoundingClientRect().width,
    }));
  const headerAfter = await page.locator(".shlz-hero").boundingBox();
  expect(shellAfter).toEqual(shellBefore);
  expect(headerAfter?.x).toBeCloseTo(headerBefore?.x ?? 0, 0);
  expect(headerAfter?.width).toBeCloseTo(headerBefore?.width ?? 0, 0);
  expect(headerAfter?.height).toBeCloseTo(headerBefore?.height ?? 0, 0);

  await page.goto("/");
  await page.evaluate(() => {
    window.location.hash = "composer-demo";
  });
  await expect(page.locator("#composer-demo")).toBeVisible();
  await page.locator("[data-shlz-shell-search]").fill("Button");
  await expect(
    page.getByRole("link", { name: "Button", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Composer / Rich Text Toolbar" }),
  ).toBeHidden();
});

test("reports a deferred import failure and retries without losing the hash", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let failed = false;
    window.__SHLZ_SHOWCASE_IMPORT__ = () => {
      if (failed) return null;
      failed = true;
      return Promise.reject(new Error("synthetic deferred failure"));
    };
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Input" }).click();
  await expect(
    page.getByText("Component documentation could not be loaded."),
  ).toBeVisible();
  await expect(page).toHaveURL(/#input$/);
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator("#input")).toHaveCount(1);
  await expect(page.locator("#implementation")).toBeVisible();
  await expect(page.locator("#input")).toHaveCount(1);
});

test("search filters the eager index and a result loads its documentation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("Composer");
  await expect(
    page.getByRole("link", { name: "Composer / Rich Text Toolbar" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Button", exact: true }),
  ).toBeHidden();
  await page
    .getByRole("link", { name: "Composer / Rich Text Toolbar" })
    .click();
  await expect(page.locator("#composer-demo")).toBeVisible();
});

test("initial and loaded states remain contained at narrow enlarged text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await expect(page.locator("[data-showcase-loader]")).toBeVisible();
  expect(
    await page
      .locator("[data-showcase-loader]")
      .evaluate(
        (element) => element.getBoundingClientRect().right <= window.innerWidth,
      ),
  ).toBe(true);

  await page.getByRole("link", { name: "Input", exact: true }).click();
  await expect(page.locator("#input-demo")).toBeVisible();
  expect(
    await page
      .locator("#input-demo")
      .evaluate(
        (element) => element.getBoundingClientRect().right <= window.innerWidth,
      ),
  ).toBe(true);
});

test("focused shell and progressive states have visual evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page).toHaveScreenshot("showcase-loading-shell.png", {
    animations: "disabled",
  });

  await page.evaluate(() => {
    window.__SHLZ_SHOWCASE_IMPORT__ = () => new Promise(() => {});
  });
  await page.getByRole("link", { name: "Input", exact: true }).click();
  await expect(page.locator("[data-showcase-loader]")).toHaveScreenshot(
    "showcase-loading-progress.png",
  );

  await page.goto("/");
  await page.evaluate(() => {
    window.__SHLZ_SHOWCASE_IMPORT__ = () =>
      Promise.reject(new Error("visual failure"));
  });
  await page.getByRole("link", { name: "Input", exact: true }).click();
  await expect(page.locator("[data-showcase-loader]")).toHaveScreenshot(
    "showcase-loading-error.png",
  );

  await page.goto("/?full=1#input");
  await expect(page.locator("#input-demo")).toHaveScreenshot(
    "showcase-loading-loaded-input.png",
    { animations: "disabled" },
  );
});
