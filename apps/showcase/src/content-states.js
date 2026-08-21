const icon = (name, label, iconUrl, className = "") =>
  `<img class="${className}" src="${iconUrl(name)}" alt="${label}">`;

const action = (name, label, iconUrl) =>
  `<button class="shlz-file-row__action" type="button" aria-label="${label}">${icon(name, "", iconUrl)}</button>`;

const documentAction = (name, label, iconUrl) =>
  `<button class="shlz-document-row__action" type="button" aria-label="${label}">${icon(name, "", iconUrl)}</button>`;

const emptySimpleVisual = `<svg viewBox="78 1 64 39" role="img" aria-label="Пустая коробка">
  <path d="M110 39.7031C127.673 39.7031 142 36.5923 142 32.755C142 28.9177 127.673 25.807 110 25.807C92.3269 25.807 78 28.9177 78 32.755C78 36.5923 92.3269 39.7031 110 39.7031Z" fill="#EEF0F4"/>
  <path d="M133 13.6653L122.854 2.24866C122.367 1.47048 121.656 1 120.907 1H99.093C98.344 1 97.633 1.47048 97.146 2.24767L87 13.6663V22.8367H133V13.6653Z" stroke="#0B1623" stroke-opacity=".1"/>
  <path d="M119.613 16.8127C119.613 15.2197 120.607 13.9045 121.84 13.9035H133V31.9059C133 34.0131 131.68 35.7402 130.05 35.7402H89.95C88.32 35.7402 87 34.0121 87 31.9059V13.9035H98.16C99.393 13.9035 100.387 15.2167 100.387 16.8098V16.8316C100.387 18.4247 101.392 19.7111 102.624 19.7111H117.376C118.608 19.7111 119.613 18.4128 119.613 16.8197V16.8127Z" fill="#EEF0F4" stroke="#0B1623" stroke-opacity=".1"/>
</svg>`;

const fileRow = (
  title,
  iconUrl,
  {
    auditId,
    meta = "",
    primary = true,
    actions = "",
    className = "",
    state = "",
    message = "",
  } = {},
) => {
  const stateClass = state === "hover" ? " shlz-file-row--visual-hover" : "";
  const additionalClass = className ? ` ${className}` : "";
  return `<div class="shlz-file-row${stateClass}${additionalClass}" data-component-audit-id="${auditId}"${state === "error" ? ' aria-invalid="true"' : ""}>
  <span class="shlz-file-row__visual" aria-hidden="true">${icon("file-xlsx", "", iconUrl)}</span>
  <span class="shlz-file-row__content">
    ${primary ? `<a class="shlz-file-row__primary" href="#file-row-demo" title="${title}">${title}</a>` : `<span class="shlz-file-row__title" title="${title}">${title}</span>`}
    ${meta ? `<span class="shlz-file-row__meta">${meta}</span>` : ""}
  </span>
  ${actions ? `<span class="shlz-file-row__actions">${actions}</span>` : ""}
  ${message ? `<span class="shlz-file-row__message">${message}</span>` : ""}
</div>`;
};

const documentRow = (
  title,
  type,
  iconUrl,
  {
    auditId,
    compact = false,
    modified = "15.07.2026, 13:57",
    version = "Версия 1",
    size = "17 КБ",
  } = {},
) => `<div class="shlz-document-row${compact ? " shlz-document-row--compact" : ""}" data-file-type="${type}" data-component-audit-id="${auditId}">
  <span class="shlz-document-row__visual" aria-hidden="true">${icon(`file-${type}`, "", iconUrl)}</span>
  <span class="shlz-document-row__content">
    <a class="shlz-document-row__title" href="#file-row-extension-demo" title="${title}">${title}</a>
    <span class="shlz-document-row__meta">${version} · ${size}</span>
    ${compact ? "" : `<span class="shlz-document-row__modified">${modified}</span>`}
  </span>
  <span class="shlz-document-row__actions">${documentAction("download", `Скачать ${title}`, iconUrl)}</span>
</div>`;

export const contentStatesMarkup = (iconUrl, sourceReferenceUrl) => {
  const download = action("download", "Скачать файл", iconUrl);
  const remove = action("delete", "Удалить файл", iconUrl);
  const multiple = `${action("eye", "Просмотреть файл", iconUrl)}${download}`;
  return `
<article id="file-row-demo" data-shlz-visual-addition><h3>File Row</h3><p>A file identity and independent actions. Source examples below are narrow comparison fixtures; the component itself fills its consumer container.</p><div class="shlz-content-state-examples">
  ${fileRow("application040.xlsx", iconUrl, { auditId: "file-row-showcase-default", meta: "20 MB", className: "shlz-file-row-example--source" })}
  ${fileRow("application040.xlsx", iconUrl, { auditId: "file-row-showcase-hover", meta: "20 MB", actions: remove, className: "shlz-file-row-example--source-state", state: "hover" })}
  ${fileRow("application040.xlsx", iconUrl, { auditId: "file-row-showcase-error", meta: "20 MB", actions: remove, className: "shlz-file-row-example--source-state", state: "error", message: "Error text" })}
  ${fileRow("Очень длинное название корпоративного документа с приложениями и дополнениями.xlsx", iconUrl, { auditId: "file-row-content-stress-long", meta: "20 MB", actions: download, className: "shlz-file-row-example--long" })}
  ${fileRow("Протокол заседания.xlsx", iconUrl, { auditId: "file-row-content-stress-actions", meta: "Обновлён 8 августа 2026", actions: multiple, className: "shlz-file-row-example--actions" })}
</div></article>
<article id="file-row-extension-demo" data-shlz-visual-addition><h3>Document Row · SHLZ extension</h3><p>A fluid document-list composition with an independent file visual, content column, and stable action area. The authoritative File Row above remains unchanged.</p><div class="shlz-document-row-showcase">
  <section class="shlz-document-row-showcase__primary"><h4>Metadata-rich list · fluid container</h4><div class="shlz-document-list shlz-document-row-visual-fixture">
    ${documentRow("Сопроводительные материалы 100.pdf", "pdf-default", iconUrl, { auditId: "document-row-showcase-pdf" })}
    ${documentRow("Очень длинное название корпоративного документа с приложениями и дополнениями.docx", "docx", iconUrl, { auditId: "document-row-content-stress-long", modified: "10.08.2026, 09:12", size: "248 КБ" })}
    ${documentRow("Бюджет проекта.xlsx", "xlsx", iconUrl, { auditId: "document-row-showcase-xlsx", modified: "08.08.2026, 17:40", version: "Версия 4", size: "1,2 МБ" })}
  </div></section>
  <section class="shlz-document-row-showcase__compact"><h4>Compact list</h4><div class="shlz-document-list">
    ${documentRow("План.pdf", "pdf-default", iconUrl, { auditId: "document-row-showcase-compact-pdf", compact: true })}
    ${documentRow("Протокол рабочей встречи.docx", "docx", iconUrl, { auditId: "document-row-showcase-compact-docx", compact: true, size: "86 КБ" })}
    ${documentRow("Расчёты.xlsx", "xlsx", iconUrl, { auditId: "document-row-showcase-compact-xlsx", compact: true, version: "Версия 2", size: "740 КБ" })}
  </div></section>
</div></article>
<article id="empty-state-demo" data-shlz-visual-addition><h3>Empty State</h3><p>Three standalone source compositions exposed as variants of one Empty State primitive.</p><div class="shlz-empty-state-examples" data-shlz-empty-state-source-matrix>
  <div class="shlz-empty-state shlz-empty-state--simple" data-empty-state-variant="simple" data-component-audit-id="empty-state-showcase-simple"><span class="shlz-empty-state__visual">${emptySimpleVisual}</span><h4 class="shlz-empty-state__title">Ничего не найдено</h4></div>
  <div class="shlz-empty-state shlz-empty-state--customize" data-empty-state-variant="customize" data-component-audit-id="empty-state-showcase-customize"><span class="shlz-empty-state__visual" aria-hidden="true"><img src="${sourceReferenceUrl("empty-customize")}" alt=""></span><h4 class="shlz-empty-state__title">Ничего не найдено</h4><div class="shlz-empty-state__actions"><button class="shlz-button shlz-button--primary shlz-button--sm" type="button">Загрузить файл</button></div></div>
  <div class="shlz-empty-state shlz-empty-state--basic" data-empty-state-variant="basic" data-component-audit-id="empty-state-showcase-basic"><span class="shlz-empty-state__visual" aria-hidden="true"><img src="${sourceReferenceUrl("empty-basic")}" alt=""></span><h4 class="shlz-empty-state__title">Ничего не найдено</h4><p class="shlz-empty-state__description">Текст</p><div class="shlz-empty-state__actions"><button class="shlz-button shlz-button--primary" type="button">Загрузить файл</button></div></div>
</div></article>`;
};
