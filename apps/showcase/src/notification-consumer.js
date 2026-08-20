const enhancedNotifications = new WeakSet();
const enhancedFixtures = new WeakSet();

export const notificationBehaviorSnippet = `const enhancedNotifications = new WeakSet();

function enhanceNotifications(scope = document) {
  for (const notification of scope.querySelectorAll("[data-notification]")) {
    if (enhancedNotifications.has(notification)) continue;
    enhancedNotifications.add(notification);

    notification
      .querySelector("[data-notification-close]")
      ?.addEventListener("click", () => {
        const focusReturn = document.getElementById(
          notification.dataset.notificationFocusReturn,
        );
        if (!(focusReturn instanceof window.HTMLElement)) return;

        notification.remove();
        focusReturn.focus();
      });

    notification
      .querySelector("[data-notification-action]")
      ?.addEventListener("click", (event) => {
        const action = event.currentTarget.dataset.notificationAction;
        notification.dispatchEvent(
          new window.CustomEvent("app:notification-action", {
            bubbles: true,
            detail: { action },
          }),
        );
      });
  }
}

enhanceNotifications();`;

export function enhanceNotifications(scope = document) {
  for (const notification of scope.querySelectorAll("[data-notification]")) {
    if (enhancedNotifications.has(notification)) continue;
    enhancedNotifications.add(notification);

    notification
      .querySelector("[data-notification-close]")
      ?.addEventListener("click", () => {
        const focusReturn = document.getElementById(
          notification.dataset.notificationFocusReturn,
        );
        if (!(focusReturn instanceof window.HTMLElement)) return;

        notification.remove();
        focusReturn.focus();
      });

    notification
      .querySelector("[data-notification-action]")
      ?.addEventListener("click", (event) => {
        const action = event.currentTarget.dataset.notificationAction;
        notification.dispatchEvent(
          new window.CustomEvent("app:notification-action", {
            bubbles: true,
            detail: { action },
          }),
        );
      });
  }
}

export const notificationConsumerMarkup = (iconUrl) => `
  <section data-notification-consumer data-shlz-visual-addition>
    <h4>Executable consumer boundary</h4>
    <p>Application-owned dismissal, focus return and action handling.</p>
    <button class="shlz-button" id="notification-consumer-return" type="button">
      Продолжить работу
    </button>
    <div class="shlz-stack">
      <div class="shlz-notification" role="status" data-notification data-notification-focus-return="notification-consumer-return">
        <span class="shlz-notification__icon" aria-hidden="true">
          <img src="${iconUrl("checkmark")}" alt="">
        </span>
        <div class="shlz-notification__content">
          <p class="shlz-notification__title">Изменения сохранены</p>
        </div>
        <button class="shlz-notification__close" type="button" aria-label="Закрыть уведомление" data-notification-close>
          <img src="${iconUrl("close-remove")}" alt="">
        </button>
      </div>
      <div class="shlz-notification shlz-notification--danger" role="alert" data-notification data-notification-focus-return="notification-consumer-return">
        <div class="shlz-notification__content">
          <p class="shlz-notification__title">Не удалось сохранить изменения</p>
        </div>
        <button class="shlz-notification__action" type="button" data-notification-action="retry-save">
          Повторить
        </button>
      </div>
    </div>
    <p data-notification-action-result aria-live="polite">Действие ещё не запрошено.</p>
  </section>`;

export function enhanceNotificationConsumer(scope = document) {
  enhanceNotifications(scope);

  for (const fixture of scope.querySelectorAll(
    "[data-notification-consumer]",
  )) {
    if (enhancedFixtures.has(fixture)) continue;
    enhancedFixtures.add(fixture);
    fixture.addEventListener("app:notification-action", (event) => {
      const result = fixture.querySelector("[data-notification-action-result]");
      if (result instanceof window.HTMLElement) {
        result.textContent = `Получено действие: ${event.detail.action}`;
      }
    });
  }
}
