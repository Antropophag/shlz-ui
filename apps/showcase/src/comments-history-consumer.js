export const commentsHistoryConsumerMarkup = `<section id="comments-history-consumer" class="shlz-major-section" data-comments-history-consumer><h2>ServiceDesk comments and history consumer</h2><p>Application-owned example using the public source-backed presentation contracts.</p><div class="shlz-comments-history-consumer__grid"><article><h3>Комментарии</h3><ol class="shlz-comment-feed" aria-label="Комментарии выбранной заявки" data-component-audit-id="comment-feed-source-consumer"><li class="shlz-comment-feed__item"><article class="shlz-comment-feed__content"><header class="shlz-comment-feed__header"><span class="shlz-comment-feed__author">Диспетчерская служба</span><time class="shlz-comment-feed__time" datetime="2026-09-04T09:30:00+03:00">сегодня</time></header><p class="shlz-comment-feed__body">Документы по заявке проверены.</p><button class="shlz-comment-feed__context-action" type="button" data-comments-history-action>Открыть заявку</button></article></li></ol></article><article><h3>История изменений</h3><ol class="shlz-history-timeline" data-source-layout aria-label="История выбранной заявки" data-component-audit-id="history-timeline-source-consumer"><li class="shlz-history-timeline__entry" data-history-kind="field"><article class="shlz-history-timeline__content"><header class="shlz-history-timeline__header"><span class="shlz-history-timeline__actor">Система</span><span class="shlz-history-timeline__action">изменила ответственную группу</span></header><p class="shlz-history-timeline__values"><span class="shlz-history-timeline__old-value">Диспетчерская</span><span class="shlz-history-timeline__transition" aria-label="на">→</span><span class="shlz-history-timeline__new-value">Монтажная служба</span></p><time class="shlz-history-timeline__time" datetime="2026-09-04T09:25:00+03:00">04.09.2026, 09:25</time><button class="shlz-history-timeline__disclosure" type="button" data-comments-history-action>Открыть запись</button></article></li></ol></article></div><p role="status" data-comments-history-status>Действие ещё не выполнялось.</p></section>`;

export const enhanceCommentsHistoryConsumer = (scope = document) => {
  const root = scope.querySelector("[data-comments-history-consumer]");
  if (!root) return null;
  const controller = new globalThis.AbortController();
  for (const action of root.querySelectorAll("[data-comments-history-action]"))
    action.addEventListener(
      "click",
      () => {
        root.querySelector("[data-comments-history-status]").textContent =
          "Приложение обработало действие.";
      },
      { signal: controller.signal },
    );
  return { destroy: () => controller.abort() };
};
