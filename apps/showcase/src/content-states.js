const icon = (name, label, iconUrl, className = "") =>
  `<img class="${className}" src="${iconUrl(name)}" alt="${label}">`;

const action = (name, label, iconUrl) =>
  `<button class="shlz-file-row__action" type="button" aria-label="${label}">${icon(name, "", iconUrl)}</button>`;

const emptySimpleVisual = `<svg viewBox="78 1 64 39" role="img" aria-label="Пустая коробка">
  <path d="M110 39.7031C127.673 39.7031 142 36.5923 142 32.755C142 28.9177 127.673 25.807 110 25.807C92.3269 25.807 78 28.9177 78 32.755C78 36.5923 92.3269 39.7031 110 39.7031Z" fill="#EEF0F4"/>
  <path d="M133 13.6653L122.854 2.24866C122.367 1.47048 121.656 1 120.907 1H99.093C98.344 1 97.633 1.47048 97.146 2.24767L87 13.6663V22.8367H133V13.6653Z" stroke="#0B1623" stroke-opacity=".1"/>
  <path d="M119.613 16.8127C119.613 15.2197 120.607 13.9045 121.84 13.9035H133V31.9059C133 34.0131 131.68 35.7402 130.05 35.7402H89.95C88.32 35.7402 87 34.0121 87 31.9059V13.9035H98.16C99.393 13.9035 100.387 15.2167 100.387 16.8098V16.8316C100.387 18.4247 101.392 19.7111 102.624 19.7111H117.376C118.608 19.7111 119.613 18.4128 119.613 16.8197V16.8127Z" fill="#EEF0F4" stroke="#0B1623" stroke-opacity=".1"/>
</svg>`;

const fileRow = (
  title,
  iconUrl,
  {
    meta = "",
    primary = true,
    actions = "",
    className = "",
    state = "",
    message = "",
  } = {},
) => `<div class="shlz-file-row${state === "hover" ? " shlz-file-row--visual-hover" : ""}${className ? ` ${className}` : ""}"${state === "error" ? ' aria-invalid="true"' : ""}>
  <span class="shlz-file-row__visual" aria-hidden="true">${icon("file-xlsx", "", iconUrl)}</span>
  <span class="shlz-file-row__content">
    ${primary ? `<a class="shlz-file-row__primary" href="#file-row-demo" title="${title}">${title}</a>` : `<span class="shlz-file-row__title" title="${title}">${title}</span>`}
    ${meta ? `<span class="shlz-file-row__meta">${meta}</span>` : ""}
  </span>
  ${actions ? `<span class="shlz-file-row__actions">${actions}</span>` : ""}
  ${message ? `<span class="shlz-file-row__message">${message}</span>` : ""}
</div>`;

export const contentStatesMarkup = (iconUrl) => {
  const download = action("download", "Скачать файл", iconUrl);
  const remove = action("delete", "Удалить файл", iconUrl);
  const multiple = `${action("eye", "Просмотреть файл", iconUrl)}${download}`;
  return `
<article id="file-row-demo" data-shlz-visual-addition><h3>File Row</h3><p>A file identity and independent actions. Source examples below are narrow comparison fixtures; the component itself fills its consumer container.</p><div class="shlz-content-state-examples">
  ${fileRow("application040.xlsx", iconUrl, { meta: "20 MB", className: "shlz-file-row-example--source" })}
  ${fileRow("application040.xlsx", iconUrl, { meta: "20 MB", actions: remove, className: "shlz-file-row-example--source-state", state: "hover" })}
  ${fileRow("application040.xlsx", iconUrl, { meta: "20 MB", actions: remove, className: "shlz-file-row-example--source-state", state: "error", message: "Error text" })}
  ${fileRow("Очень длинное название корпоративного документа с приложениями и дополнениями.xlsx", iconUrl, { meta: "20 MB", actions: download, className: "shlz-file-row-example--long" })}
  ${fileRow("Протокол заседания.xlsx", iconUrl, { meta: "Обновлён 8 августа 2026", actions: multiple, className: "shlz-file-row-example--actions" })}
</div></article>
<article id="empty-state-demo" data-shlz-visual-addition><h3>Empty State</h3><div class="shlz-empty-state-examples">
  <div class="shlz-empty-state"><span class="shlz-empty-state__visual">${emptySimpleVisual}</span><h4 class="shlz-empty-state__title">Ничего не найдено</h4></div>
  <div class="shlz-empty-state"><span class="shlz-empty-state__visual">${emptySimpleVisual}</span><h4 class="shlz-empty-state__title">Документы не добавлены</h4><p class="shlz-empty-state__description">Добавьте первый документ, когда он будет готов.</p><div class="shlz-empty-state__actions"><button class="shlz-button shlz-button--primary" type="button">Добавить документ</button></div></div>
</div></article>`;
};
