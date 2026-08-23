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
      <div class="shlz-notification" role="status" data-notification data-notification-focus-return="notification-consumer-return" data-component-audit-id="notification-showcase-dismissible">
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
      <div class="shlz-notification shlz-notification--danger" role="alert" data-notification data-notification-focus-return="notification-consumer-return" data-component-audit-id="notification-showcase-action">
        <div class="shlz-notification__content">
          <p class="shlz-notification__title">Не удалось сохранить изменения</p>
        </div>
        <button class="shlz-notification__action" type="button" data-notification-action="retry-save">
          Повторить
        </button>
      </div>
      <div class="shlz-notification" data-component-audit-id="notification-content-stress">
        <div class="shlz-notification__content">
          <p class="shlz-notification__title">Результат синхронизации большого набора корпоративных документов</p>
          <p class="shlz-notification__message">Подробное описание остаётся читаемым при узком viewport и увеличенном тексте.</p>
        </div>
        <button class="shlz-notification__action" type="button" disabled>Запустить синхронизацию снова</button>
      </div>
      <div class="shlz-notification shlz-snackbar" data-notification data-snackbar data-component-audit-id="snackbar-showcase-action">
        <span class="shlz-notification__source-countdown" data-snackbar-number="5" aria-hidden="true">
          <svg viewBox="0 0 64 58"><path fill-rule="evenodd" clip-rule="evenodd" d="M32 46C41.3888 46 49 38.3888 49 29C49 19.6112 41.3888 12 32 12C22.6112 12 15 19.6112 15 29C15 38.3888 22.6112 46 32 46ZM32 49C43.0457 49 52 40.0457 52 29C52 17.9543 43.0457 9 32 9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49Z" fill="currentColor"></path></svg>
          <span>5</span>
        </span>
        <div class="shlz-notification__content"><p class="shlz-notification__title">Сообщение отправлено</p></div>
        <button class="shlz-notification__action" type="button" data-notification-action="undo-send">Отменить</button>
      </div>
      <div class="shlz-notification shlz-snackbar" data-component-audit-id="snackbar-content-stress">
        <span class="shlz-notification__source-countdown" data-snackbar-number="0" aria-hidden="true"><svg viewBox="0 0 64 58"><path fill-rule="evenodd" clip-rule="evenodd" d="M31.2632 9.01332L31.4172 12.0098C31.6106 12.0033 31.8049 12 32 12V9C31.7533 9 31.5077 9.00447 31.2632 9.01332Z" fill="currentColor"></path></svg><span>0</span></span>
        <div class="shlz-notification__content"><p class="shlz-notification__title">Корпоративное сообщение с длинным локализованным названием отправлено</p></div>
        <button class="shlz-notification__action" type="button" disabled>Отменить отправку сообщения</button>
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
