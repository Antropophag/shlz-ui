import docxIconUrl from "../../../packages/icons/dist/file-types/docx.svg?url";
import pdfIconUrl from "../../../packages/icons/dist/file-types/pdf.svg?url";
import xlsIconUrl from "../../../packages/icons/dist/file-types/xls.svg?url";

const fileIcon = (title) =>
  title.toLowerCase().includes("pdf")
    ? pdfIconUrl
    : title.toLowerCase().includes("xls")
      ? xlsIconUrl
      : docxIconUrl;

const avatar = (initials, id = "") =>
  `<span class="shlz-avatar shlz-avatar--32 shlz-comment-feed__avatar" aria-hidden="true"${id ? ` data-component-audit-id="${id}"` : ""}>${initials}</span>`;

const file = (title, meta, id = "") =>
  `<div class="shlz-file-row"${id ? ` data-component-audit-id="${id}"` : ""}><div class="shlz-file-row__visual" aria-hidden="true"><img src="${fileIcon(title)}" alt=""></div><div class="shlz-file-row__content"><a class="shlz-file-row__primary" href="#comment-feed-demo">${title}</a><span class="shlz-file-row__meta">${meta}</span></div></div>`;

const audit = (auditId, nestedId) => (auditId ? nestedId : "");

const comment = ({
  author,
  initials,
  time,
  body,
  files = "",
  summary = "",
  mention = "",
  id = "",
  context = "",
}) =>
  `<li class="shlz-comment-feed__item"${context ? ' data-emphasis="true"' : ""}>${avatar(initials, id ? `avatar-${id}` : "")}<article class="shlz-comment-feed__content"><header class="shlz-comment-feed__header"><span class="shlz-comment-feed__author">${author}</span><time class="shlz-comment-feed__time" datetime="2026-08-30">${time}</time></header><p class="shlz-comment-feed__body">${mention ? `<span class="shlz-comment-feed__mention">${mention}</span> ` : ""}${body}</p>${files ? `<div class="shlz-comment-feed__attachments">${files}</div>` : ""}${summary ? `<p class="shlz-comment-feed__attachment-summary">${summary}</p>` : ""}</article>${context === "own" ? '<div class="shlz-comment-feed__context"><button class="shlz-comment-feed__context-action" type="button">Изменить</button><button class="shlz-comment-feed__context-action shlz-comment-feed__context-action--danger" type="button">Удалить</button></div>' : context === "reply" ? '<div class="shlz-comment-feed__context"><button class="shlz-comment-feed__context-action" type="button">Ответить</button></div>' : ""}</li>`;

const comments = ({ auditId = "", context = "", includeAdded = false } = {}) =>
  `<ol class="shlz-comment-feed" aria-label="Комментарии к обращению"${auditId ? ` data-component-audit-id="${auditId}"` : ""}>
${comment({ author: "Александр Васильев", initials: "АВ", time: "4 дня назад", id: audit(auditId, "comment-source-one"), body: "Коллеги, всем привет! Предлагаю обсудить здесь текущую ситуацию по этой заявке. Также отправляю несколько важных документов для ознакомления.", files: file("схема-лифт47.pdf", "31 MB", audit(auditId, "file-row-comment-source-pdf")) + file("lift_illustration.docx", "9 MB", audit(auditId, "file-row-comment-source-docx")), summary: `2 файла, <span class="shlz-comment-feed__file-meta">40 MB</span> <a class="shlz-link shlz-comment-feed__download-all"${auditId ? ' data-component-audit-id="link-comment-feed-download-all"' : ""} href="#comment-feed-demo">Скачать все</a>` })}
${comment({ author: "Александр Васильев", initials: "АВ", time: "3 дня назад", id: audit(auditId, "comment-source-two"), body: "Также прикрепляю договор с клиентом", files: file("Договор Рязань ли…", "12 MB", audit(auditId, "file-row-comment-source-contract")), summary: '1 файл, <span class="shlz-comment-feed__file-meta">12 MB</span>' })}
${comment({ author: "Михаил Богданов", initials: "МБ", time: "1 день назад", id: audit(auditId, "comment-source-three"), body: "Если гарантийный срок на лифт еще действует, следует оформить претензию производителю для компенсации затрат на ремонт.", context: context === "reply" ? "reply" : "" })}
${comment({ author: "Александр Васильев", initials: "АВ", time: "1 день назад", id: audit(auditId, "comment-source-four"), mention: "Михаил Богданов", body: "Гарантийный срок не действует. Рекомендуется установить срок выполнения работ в течение 5–7 рабочих дней.", context: context === "own" ? "own" : "" })}
${includeAdded ? comment({ author: "Александр Васильев", initials: "АВ", time: "только что", body: "Привет еще раз. Сегодня прошла встреча с клиентом." }) : ""}
</ol>`;

const composer = ({
  populated = false,
  suggestions = false,
  audited = false,
} = {}) =>
  `<form class="shlz-comment-feed__composer">${avatar("АВ", audited ? "avatar-comment-composer" : "")}<div class="shlz-comment-feed__composer-frame">${populated ? `<div class="shlz-comment-feed__composer-files">${file("application040…", "20 MB")}${file("application040…", "20 MB")}${file("application040…", "20 MB")}</div><div class="shlz-rich-text-toolbar shlz-comment-feed__composer-toolbar" role="toolbar" aria-label="Форматирование комментария"><button class="shlz-rich-text-toolbar__button" type="button" aria-label="Полужирный">B</button><button class="shlz-rich-text-toolbar__button" type="button" aria-label="Курсив">I</button><button class="shlz-rich-text-toolbar__button" type="button" aria-label="Прикрепить файл">+</button></div>` : ""}<label><span class="shlz-visually-hidden">Комментарий</span><textarea class="shlz-comment-feed__composer-input" placeholder="Оставьте комментарий">${populated ? "Привет еще раз. Сегодня прошла встреча с клиентом" : ""}</textarea></label>${populated ? '<div class="shlz-comment-feed__composer-footer"><span>34 / 100</span><button class="shlz-comment-feed__submit" type="submit" aria-label="Отправить комментарий">↑</button></div>' : ""}</div>${suggestions ? '<div class="shlz-comment-feed__suggestions" aria-label="Упоминания"><button class="shlz-comment-feed__suggestion" type="button">Андрей Михайлов</button><button class="shlz-comment-feed__suggestion" type="button">Михаил Богданов</button></div>' : ""}</form>`;

const state = (name, body) =>
  `<section data-comment-feed-state="${name}"><h4>${name}</h4><div class="shlz-comment-feed__surface" data-source-frame>${body}</div></section>`;

export const commentFeedShowcaseMarkup = `<article id="comment-feed-demo"><h3>Comment Feed</h3><p><code>Комментарии.svg</code> · source fixture; data and mutations are consumer-owned.</p>${state("default", comments({ auditId: "comment-feed-showcase-source" }) + composer({ audited: true }))}<details class="shlz-component-diagnostics"><summary>Source-observed states</summary><div class="shlz-stack">${state("composer-populated", comments() + composer({ populated: true }))}${state("comment-added", comments({ includeAdded: true }) + composer() + '<div class="shlz-notification" role="status"><div class="shlz-notification__content"><p class="shlz-notification__title">Комментарий успешно добавлен</p></div></div>')}${state("own-comment-actions", comments({ context: "own" }) + composer())}${state("other-comment-reply", comments({ context: "reply" }) + composer())}${state("mention-suggestions", comments() + composer({ populated: true, suggestions: true }))}${state("comment-deleted", comments() + composer() + '<div class="shlz-notification"><span class="shlz-notification__countdown">4</span><div class="shlz-notification__content"><p class="shlz-notification__title">Комментарий удален</p></div><button class="shlz-notification__action" type="button">Отменить</button></div>')}</div></details></article>`;

export function enhanceCommentFeedShowcase() {}
