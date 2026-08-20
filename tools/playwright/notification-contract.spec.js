import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Notification documentation separates executable and static surfaces", async ({
  page,
}) => {
  const demo = page.locator("#notification-demo");
  await expect(
    demo.locator('[data-component-docs="notification"]'),
  ).toBeVisible();
  await expect(demo.locator("[data-notification-consumer]")).toBeVisible();
  await expect(demo.locator("[data-notification-visual-matrix]")).toHaveCount(
    2,
  );
  await expect(demo.getByText(/Static visual matrix;/)).toHaveCount(2);
});

test("close removes the Notification and returns focus to the declared target", async ({
  page,
}) => {
  const fixture = page.locator("[data-notification-consumer]");
  const notification = fixture.locator('[role="status"][data-notification]');
  const close = notification.getByRole("button", {
    name: "Закрыть уведомление",
  });
  const focusReturn = fixture.getByRole("button", {
    name: "Продолжить работу",
  });

  await close.focus();
  await expect(close).toBeFocused();
  await close.click();

  await expect(notification).toHaveCount(0);
  await expect(focusReturn).toBeFocused();
});

test("action emits one published bubbling event after repeated enhancement", async ({
  page,
}) => {
  const fixture = page.locator("[data-notification-consumer]");
  await page.evaluate(() => {
    window.__notificationContractEvents = [];
    document.addEventListener("app:notification-action", (event) => {
      window.__notificationContractEvents.push({
        targetIsNotification: event.target.matches("[data-notification]"),
        detail: event.detail,
        bubbles: event.bubbles,
      });
    });
    window.__shlzEnhanceNotificationConsumer();
    window.__shlzEnhanceNotificationConsumer();
  });

  await fixture.getByRole("button", { name: "Повторить" }).click();

  await expect(fixture.locator("[data-notification-action-result]")).toHaveText(
    "Получено действие: retry-save",
  );
  expect(
    await page.evaluate(() => window.__notificationContractEvents),
  ).toEqual([
    {
      targetIsNotification: true,
      detail: { action: "retry-save" },
      bubbles: true,
    },
  ]);
});
