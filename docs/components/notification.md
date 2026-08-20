# Notification

## Status

`Executable / Production static feedback surface`. The visual primitive is shipped; orchestration and lifecycle remain consumer-owned.

## Purpose

Notification presents concise transient or contextual feedback while the application owns placement, lifetime and business actions.

## Use when

- Report the result or progress of an application action near the current workflow.
- A short visible title can convey the full meaning without color or iconography.

## Avoid when

- Use persistent inline content for validation or information that must remain available in context.
- Do not use the primitive as evidence that SHLZ supplies a toast queue, timer or announcement policy.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. The examples use exported `checkmark.svg` and `close-remove.svg` icons. No behavior package is required.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Dismissible status example

```html
<button id="notification-focus-return" type="button">Продолжить работу</button>
<div
  class="shlz-notification"
  role="status"
  data-notification
  data-notification-focus-return="notification-focus-return"
>
  <span class="shlz-notification__icon" aria-hidden="true">
    <img src="/assets/icons/checkmark.svg" alt="" />
  </span>
  <div class="shlz-notification__content">
    <p class="shlz-notification__title">Изменения сохранены</p>
  </div>
  <button
    class="shlz-notification__close"
    type="button"
    aria-label="Закрыть уведомление"
    data-notification-close
  >
    <img src="/assets/icons/close-remove.svg" alt="" />
  </button>
</div>
```

## Urgent action example

```html
<div
  class="shlz-notification shlz-notification--danger"
  role="alert"
  data-notification
  data-notification-focus-return="notification-focus-return"
>
  <div class="shlz-notification__content">
    <p class="shlz-notification__title">Не удалось сохранить изменения</p>
  </div>
  <button
    class="shlz-notification__action"
    type="button"
    data-notification-action="retry-save"
  >
    Повторить
  </button>
</div>
```

The following integration is application code, not a library event contract:

```js
const enhancedNotifications = new WeakSet();

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

enhanceNotifications();
```

The required `data-notification-focus-return` value must name the `id` of a safe, focusable element that remains after dismissal. If it does not resolve, the example deliberately leaves the notification in place instead of destroying the focused control. The application listens for the bubbling `app:notification-action` event on the notification or an ancestor. Its target is the notification root and its detail is `{ action: "retry-save" }` for this example. The prefix distinguishes this illustrative consumer event from SHLZ API. A `WeakSet` makes repeated enhancement idempotent.

## Public HTML contract

| Contract  | Supported value                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Root      | `.shlz-notification`; optional `--danger` or `--light` paint modifier                                                          |
| Content   | `.shlz-notification__content` with title and optional message                                                                  |
| Leading   | Optional decorative icon or visual progress/countdown                                                                          |
| Close     | Native `.shlz-notification__close` button with an accessible name                                                              |
| Action    | Native `.shlz-notification__action` button with visible action text                                                            |
| Lifecycle | Application-owned rendering and action handling; `data-notification-focus-return` must name a focus-target id before dismissal |
| Behavior  | No SHLZ controller, events, queue, timer or toast manager                                                                      |

## Accessibility

- Choose live semantics from urgency and context. `role="status"` suits many polite updates; reserve `role="alert"` for genuinely urgent interruptions. Static content often needs neither.
- Put the full meaning in text. Color and icons supplement it.
- Give an icon-only close button an accessible name and keep decorative images empty.
- Use an action label that describes the action's result.
- Do not repeatedly announce visual countdown numbers. Decide whether a message enters a live region before inserting it.
- Before removal, resolve the required focus-return id to a stable, focusable element. Move focus there immediately after removal; do not leave focus on a detached close button or `body`.

## Composition and lifecycle

The source confirms a 384×58 notification/snackbar surface, danger and light paint, action, close, leading progress and countdown compositions. Progress and countdown classes are visual surfaces only. Applications own placement, stacking, deduplication, maximum count, persistence, timeout, pause behavior, countdown synchronization, removal and focus recovery. Showcase separates an executable consumer fixture from static source-fidelity matrices; controls in the static matrices illustrate appearance only.

## Limitations

- No placement container, responsive collision handling, queue, timer or toast manager.
- No auto-dismiss, hover/focus pause, persistence or action-pending state.
- No library event is emitted by the CSS primitive.
- Live-region priority cannot be inferred safely from source color or geometry.

## Traceability

| Layer                       | Location                                                     |
| --------------------------- | ------------------------------------------------------------ |
| Authoritative source        | `shlz-design-source/raw/svg/Notification.svg`                |
| Snackbar source             | `shlz-design-source/raw/svg/UI Kit – Interface elements.zip` |
| Evidence map                | `docs/evidence-map.md`                                       |
| Provenance                  | `packages/tokens/provenance.json`                            |
| Tokens                      | `packages/tokens/tokens.json`                                |
| Styles                      | `packages/styles/components/notification.css`                |
| Documentation               | `docs/components/notification.md`                            |
| Showcase                    | `apps/showcase/src/main.js`                                  |
| Snippet tests               | `tools/tests/component-documentation.test.mjs`               |
| Source tests                | `tools/tests/notification-source.test.mjs`                   |
| Bundle contract tests       | `tools/tests/components.test.mjs`                            |
| Browser tests               | `tools/playwright/components-next.spec.js`                   |
| Documentation browser tests | `tools/playwright/primitives.spec.js`                        |
| Runtime contract tests      | `tools/playwright/notification-contract.spec.js`             |

## Source interpretation

- `FACT`: 384×58 surfaces, radius 29, dark/red/white paint and observed icon/action/countdown compositions.
- `DERIVED`: the families form one feedback primitive with notification and snackbar presentations.
- `DECISION`: native buttons and application-owned integration are the reusable public boundary.
- `UNKNOWN/CONSUMER-OWNED`: urgency, placement, queueing, timing, dismissal, focus and domain action.
