import { expect, test } from "@playwright/test";
import { hideDeveloperDocumentation } from "./visual-harness.js";

test("Pagination documentation exposes native-link semantics", async ({
  page,
}) => {
  await page.goto("/");
  const docs = page.locator('[data-component-docs="pagination"]');
  await expect(docs).toBeVisible();
  await expect(
    docs.locator('[data-shlz-snippet="pagination-html"]'),
  ).toContainText('href="/requests?page=6" aria-current="page"');
  await expect(
    docs.locator('[data-shlz-snippet="pagination-ellipsis-html"]'),
  ).toContainText('aria-hidden="true"');
  await expect(
    docs.locator('[data-shlz-snippet="pagination-boundary-html"]'),
  ).toContainText('aria-disabled="true"');
});

test("consumer-owned URL selects the visible result and current page", async ({
  page,
}) => {
  await page.goto("/?page=2#pagination-consumer");
  const consumer = page.locator("[data-pagination-consumer]");
  const pagination = consumer.getByRole("navigation", {
    name: "Страницы consumer validation",
  });

  await expect(consumer.locator("[data-pagination-result]")).toHaveText(
    "Заявки SD-2421–SD-2440",
  );
  await expect(
    pagination.getByRole("link", { name: "2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    pagination.getByRole("link", { name: "1", exact: true }),
  ).toHaveAttribute("href", "/?page=1#pagination-consumer");
  await expect(
    pagination.getByRole("link", { name: "Предыдущая страница" }),
  ).toHaveAttribute("href", "/?page=1#pagination-consumer");
  const next = pagination.getByRole("link", { name: "Следующая страница" });
  await expect(next).toHaveAttribute("href", "/?page=3#pagination-consumer");

  await next.click();
  await expect(page).toHaveURL(/\?page=3#pagination-consumer$/);
  const updatedConsumer = page.locator("[data-pagination-consumer]");
  await expect(updatedConsumer.locator("[data-pagination-result]")).toHaveText(
    "Заявки SD-2441–SD-2460",
  );
  await expect(
    updatedConsumer.getByRole("link", { name: "3", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("consumer boundary states are non-links", async ({ page }) => {
  await page.goto("/?page=1#pagination-consumer");
  const consumer = page.locator("[data-pagination-consumer]");
  const previous = consumer.locator(".shlz-pagination__item--disabled");
  await expect(previous).toHaveJSProperty("tagName", "SPAN");
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(previous).not.toHaveAttribute("href");
  await expect(previous).not.toHaveAttribute("aria-label");
  await expect(previous.locator(".shlz-visually-hidden")).toHaveText(
    "Предыдущая страница недоступна",
  );

  await page.goto("/?page=3#pagination-consumer");
  const next = page
    .locator("[data-pagination-consumer]")
    .locator(".shlz-pagination__item--disabled");
  await expect(next).toHaveJSProperty("tagName", "SPAN");
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(next).not.toHaveAttribute("href");
  await expect(next).not.toHaveAttribute("aria-label");
  await expect(next.locator(".shlz-visually-hidden")).toHaveText(
    "Следующая страница недоступна",
  );
});

test("narrow Pagination wraps without clipping or horizontal overflow", async ({
  page,
}) => {
  await page.goto("/?page=2#pagination-consumer");
  await page.setViewportSize({ width: 240, height: 700 });
  const consumer = page.locator("[data-pagination-consumer]");
  const list = consumer.locator(".shlz-pagination__list");
  const metrics = await list.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    firstItemHeight: element.firstElementChild.getBoundingClientRect().height,
  }));
  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  expect(metrics.clientHeight).toBeGreaterThan(metrics.firstItemHeight);
});

test("existing Pagination visual fixture remains isolated from developer additions", async ({
  page,
}) => {
  await page.goto("/");
  await hideDeveloperDocumentation(page);
  await expect(page.locator("[data-pagination-consumer]")).toBeHidden();
  await expect(page.locator("#pagination-demo > section").last()).toBeVisible();
});
