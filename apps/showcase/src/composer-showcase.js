import { iconHref, iconViewBox } from "@shlz/icons";
import spriteUrl from "@shlz/icons/sprite.svg?url";

const icon = (name) =>
  `<svg class="shlz-icon shlz-rich-text-toolbar__icon" viewBox="${iconViewBox(name)}" aria-hidden="true"><use href="${iconHref(spriteUrl, name)}"></use></svg>`;

const command = ({ name, label, pressed, disabled = false }) =>
  `<button class="shlz-rich-text-toolbar__button" type="button" aria-label="${label}"${pressed === undefined ? "" : ` aria-pressed="${pressed}"`}${disabled ? " disabled" : ""} data-composer-command="${name}">${icon(name)}</button>`;

const toolbar = ({ auditId, label, pressed = false, disabled = false }) =>
  `<div class="shlz-rich-text-toolbar" role="toolbar" aria-label="${label}" data-component-audit-id="${auditId}"${disabled ? ' aria-disabled="true"' : ""}><div class="shlz-rich-text-toolbar__group" role="group" aria-label="Стиль текста">${command({ name: "bold-type", label: "Полужирный", pressed, disabled })}${command({ name: "italic", label: "Курсив", pressed: false, disabled })}${command({ name: "underline", label: "Подчёркнутый", pressed: false, disabled })}</div><div class="shlz-rich-text-toolbar__group" role="group" aria-label="Списки">${command({ name: "bulleted-list", label: "Маркированный список", pressed: false, disabled })}${command({ name: "numbered-list", label: "Нумерованный список", pressed: false, disabled })}</div><div class="shlz-rich-text-toolbar__group" role="group" aria-label="Вложения">${command({ name: "image", label: "Добавить изображение", disabled })}${command({ name: "file", label: "Добавить файл", disabled })}</div></div>`;

const composer = ({
  auditId,
  toolbarAuditId,
  modifier = "",
  help = "Форматирование и отправка управляются приложением.",
  status = "Черновик сохранён локально",
  value = "",
  disabled = false,
  readonly = false,
  invalid = false,
  consumer = false,
}) => {
  const helpId = `${auditId}-help`;
  const statusId = `${auditId}-status`;
  return `<section class="shlz-composer${modifier}" data-component-audit-id="${auditId}"${consumer ? " data-composer-consumer" : ""}${disabled ? ' data-disabled="true"' : ""}${readonly ? ' data-readonly="true"' : ""}${invalid ? ' aria-invalid="true"' : ""}><label class="shlz-composer__label" for="${auditId}-editor">Комментарий</label><p class="shlz-composer__help" id="${helpId}">${help}</p><div class="shlz-composer__frame">${toolbar({ auditId: toolbarAuditId, label: "Форматирование комментария", pressed: consumer, disabled })}<textarea class="shlz-composer__editor" id="${auditId}-editor" aria-describedby="${helpId} ${statusId}" placeholder="Введите комментарий"${disabled ? " disabled" : ""}${readonly ? " readonly" : ""}${invalid ? ' aria-invalid="true"' : ""}>${value}</textarea></div><div class="shlz-composer__attachments"><div class="shlz-file-row" data-component-audit-id="file-row-${auditId}"><div class="shlz-file-row__content"><span class="shlz-file-row__title">техническое-задание-с-длинным-названием.pdf</span><span class="shlz-file-row__meta">1,2 МБ</span></div></div></div><footer class="shlz-composer__footer"><p class="shlz-composer__status" id="${statusId}" aria-live="polite" data-composer-status>${invalid ? "Добавьте текст комментария" : status}</p><div class="shlz-composer__actions" data-component-audit-id="button-${auditId}-actions"><button class="shlz-button" type="button"${disabled ? " disabled" : ""}>Отмена</button><button class="shlz-button shlz-button--primary" type="button"${disabled ? " disabled" : ""} data-composer-submit>Отправить</button></div></footer></section>`;
};

export const composerShowcaseMarkup = `<article id="composer-demo" data-shlz-preexisting-visual-supplement><h3>Composer / Rich Text Toolbar</h3><p>Framework-neutral shell with consumer-owned editing, command, attachment, and submission behavior.</p><div class="shlz-composer-showcase">${composer({ auditId: "composer-showcase-source", toolbarAuditId: "rich-text-toolbar-showcase-source", value: "Коллеги, направляю комментарий по заявке." })}${composer({ auditId: "composer-showcase-disabled", toolbarAuditId: "rich-text-toolbar-showcase-disabled", value: "Недоступный черновик", disabled: true })}${composer({ auditId: "composer-showcase-readonly", toolbarAuditId: "rich-text-toolbar-showcase-readonly", value: "Доступно только для чтения", readonly: true })}${composer({ auditId: "composer-showcase-invalid", toolbarAuditId: "rich-text-toolbar-showcase-invalid", invalid: true, status: "Добавьте текст комментария" })}<div class="shlz-composer-showcase__narrow">${composer({ auditId: "composer-content-stress", toolbarAuditId: "rich-text-toolbar-content-stress", help: "Очень длинная локализованная подсказка проверяет перенос текста и отсутствие горизонтальной прокрутки в узком контейнере.", value: "Длинный текст без зависимости от конкретного редактора." })}</div></div></article>`;

export const composerConsumerMarkup = `<section class="shlz-consumer-workspace__composer" aria-labelledby="workspace-composer-title"><h4 id="workspace-composer-title">Комментарий к заявке</h4>${composer({ auditId: "composer-data-workspace", toolbarAuditId: "rich-text-toolbar-data-workspace", consumer: true, value: "Текст принадлежит приложению.", status: "Полужирный включён приложением" })}</section>`;

export function enhanceComposerShowcase() {
  const root = document.querySelector("[data-composer-consumer]");
  if (!root) return;
  const bold = root.querySelector('[data-composer-command="bold-type"]');
  const status = root.querySelector("[data-composer-status]");
  bold?.addEventListener("click", () => {
    const pressed = bold.getAttribute("aria-pressed") !== "true";
    bold.setAttribute("aria-pressed", String(pressed));
    if (status)
      status.textContent = `Полужирный ${pressed ? "включён" : "выключен"} приложением`;
  });
  root
    .querySelector("[data-composer-submit]")
    ?.addEventListener("click", () => {
      if (status) status.textContent = "Приложение обработало отправку";
    });
}
