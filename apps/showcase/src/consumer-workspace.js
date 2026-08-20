const records = [
  { id: "SD-2418", title: "Не открывается карточка заявки", status: "Новая" },
  {
    id: "SD-2415",
    title: "Добавить сотрудника в рабочую группу",
    status: "В работе",
  },
  {
    id: "SD-2409",
    title: "Ошибка загрузки спецификации",
    status: "Требует внимания",
  },
];

const row = ({ id, title, status }) => `
  <tr class="shlz-table__row" data-workspace-row data-search-value="${`${id} ${title} ${status}`.toLocaleLowerCase("ru")}" data-status="${status}">
    <td class="shlz-table__cell shlz-table__cell--check"><input class="shlz-checkbox shlz-checkbox--sm" type="checkbox" aria-label="Выбрать заявку ${id}" data-workspace-select></td>
    <td class="shlz-table__cell"><a class="shlz-link" href="#consumer-workspace">${id}</a></td>
    <td class="shlz-table__cell" data-workspace-title>${title}</td>
    <td class="shlz-table__cell"><span class="shlz-status">${status}</span></td>
  </tr>`;

export const consumerWorkspaceMarkup = (iconUrl) => `
<section id="consumer-validation" class="shlz-major-section" data-shlz-visual-addition>
  <p class="shlz-section-kicker">D. CONSUMER VALIDATION</p>
  <h2>ServiceDesk Data Workspace</h2>
  <p>Framework-neutral, ServiceDesk-inspired validation scenario. <span class="shlz-evidence" data-kind="DECISION">CONSUMER EVIDENCE</span> validates a bounded composition and application state; it is not a copy of the delivered application or visual authority.</p>
  <article id="consumer-workspace" class="shlz-consumer-workspace" data-consumer-workspace>
    <header class="shlz-consumer-workspace__header">
      <div><h3>Заявки ServiceDesk</h3><p>Поиск, фильтрация и групповые действия.</p></div>
    </header>
    <div class="shlz-consumer-workspace__body">
      <div class="shlz-consumer-workspace__toolbar">
        <label class="shlz-field shlz-consumer-workspace__search"><span class="shlz-field__label">Поиск по заявкам</span><span class="shlz-field__control"><input class="shlz-input" type="search" placeholder="Номер, тема или статус" data-workspace-search></span></label>
        <button class="shlz-button" type="button" data-shlz-drawer-trigger="workspace-filter-drawer"><img src="${iconUrl("filter")}" alt="">Фильтры <span data-workspace-filter-count hidden>1</span></button>
      </div>
      <div class="shlz-consumer-workspace__bulk" data-workspace-bulk hidden aria-live="polite"><strong><span data-workspace-selected-count>0</span> выбрано</strong><button class="shlz-button shlz-button--sm" type="button" data-workspace-clear>Снять выбор</button></div>
      <p class="shlz-consumer-workspace__results" aria-live="polite">Найдено: <span data-workspace-result-count>${records.length}</span></p>
      <div class="shlz-table-wrap">
        <table class="shlz-table"><caption class="shlz-visually-hidden">Заявки ServiceDesk</caption><thead class="shlz-table__head"><tr>
          <th class="shlz-table__cell shlz-table__cell--check" scope="col"><input class="shlz-checkbox shlz-checkbox--sm" type="checkbox" aria-label="Выбрать все видимые заявки" data-workspace-select-all></th>
          <th class="shlz-table__cell" scope="col">Номер</th>
          <th class="shlz-table__cell" scope="col" aria-sort="none"><button class="shlz-table__affordance" type="button" data-workspace-sort>Тема <span class="shlz-visually-hidden">Сортировать</span></button></th>
          <th class="shlz-table__cell" scope="col">Статус</th>
        </tr></thead><tbody data-workspace-body>${records.map(row).join("")}</tbody></table>
        <div class="shlz-consumer-workspace__empty" data-workspace-empty hidden><h4>Заявки не найдены</h4><p>Измените запрос или сбросьте фильтр.</p><button class="shlz-button" type="button" data-workspace-reset>Сбросить условия</button></div>
      </div>
    </div>
  </article>
  <dialog class="shlz-drawer" id="workspace-filter-drawer" data-shlz-drawer aria-labelledby="workspace-filter-title">
    <form class="shlz-drawer__surface" method="dialog">
      <header class="shlz-drawer__header"><h2 class="shlz-drawer__title" id="workspace-filter-title">Фильтры заявок</h2><button class="shlz-drawer__close" type="button" data-shlz-drawer-close aria-label="Закрыть"><img src="${iconUrl("close")}" alt=""></button></header>
      <div class="shlz-drawer__body"><div class="shlz-field shlz-field--select shlz-select-root" data-shlz-select data-component-audit-id="workspace-status">
        <span class="shlz-field__label" id="workspace-status-label">Статус</span>
        <button class="shlz-field__control shlz-select__trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="workspace-status-options" aria-labelledby="workspace-status-label workspace-status-value"><span id="workspace-status-value" data-shlz-select-value data-placeholder="Все статусы">Все статусы</span><svg class="shlz-select__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5 12 15.5 19 8.5"/></svg></button>
        <div class="shlz-select__listbox" id="workspace-status-options" role="listbox" aria-labelledby="workspace-status-label" hidden>
          <button class="shlz-select__option" type="button" role="option" aria-selected="false" data-value="">Все статусы</button>
          <button class="shlz-select__option" type="button" role="option" aria-selected="false" data-value="Новая">Новая</button>
          <button class="shlz-select__option" type="button" role="option" aria-selected="false" data-value="В работе">В работе</button>
          <button class="shlz-select__option" type="button" role="option" aria-selected="false" data-value="Требует внимания">Требует внимания</button>
          <button class="shlz-select__option" type="button" role="option" aria-selected="false" aria-disabled="true" data-value="Архивная">Архивная</button>
        </div>
        <input type="hidden" name="status" value="" data-workspace-status-filter>
      </div></div>
      <footer class="shlz-drawer__footer"><button class="shlz-button" type="button" data-workspace-reset-filter>Сбросить</button><button class="shlz-button shlz-button--primary" value="apply" data-workspace-apply-filter>Применить</button></footer>
    </form>
  </dialog>
</section>`;

export const enhanceConsumerWorkspace = (scope = document) => {
  const workspace = scope.querySelector("[data-consumer-workspace]");
  if (!workspace) return null;
  const abortController = new window.AbortController();
  const { signal } = abortController;
  const rows = [...workspace.querySelectorAll("[data-workspace-row]")];
  const search = workspace.querySelector("[data-workspace-search]");
  const status = scope.querySelector("[data-workspace-status-filter]");
  const filterDrawer = scope.querySelector("#workspace-filter-drawer");
  const statusController = enhanceSelects(filterDrawer)[0];
  const table = workspace.querySelector(".shlz-table");
  const body = workspace.querySelector("[data-workspace-body]");
  const empty = workspace.querySelector("[data-workspace-empty]");
  const resultCount = workspace.querySelector("[data-workspace-result-count]");
  const selectAll = workspace.querySelector("[data-workspace-select-all]");
  const bulk = workspace.querySelector("[data-workspace-bulk]");
  const selectedCount = workspace.querySelector(
    "[data-workspace-selected-count]",
  );
  const filterCount = workspace.querySelector("[data-workspace-filter-count]");
  let appliedStatus = "";
  let ascending = true;

  const visibleRows = () => rows.filter((item) => !item.hidden);
  const updateSelection = () => {
    const visible = visibleRows();
    const selected = visible.filter(
      (item) => item.querySelector("[data-workspace-select]").checked,
    );
    selectedCount.textContent = String(selected.length);
    bulk.hidden = selected.length === 0;
    selectAll.checked =
      visible.length > 0 && selected.length === visible.length;
    selectAll.indeterminate =
      selected.length > 0 && selected.length < visible.length;
  };
  const applyConditions = () => {
    const query = search.value.trim().toLocaleLowerCase("ru");
    for (const item of rows) {
      item.hidden = !(
        item.dataset.searchValue.includes(query) &&
        (!appliedStatus || item.dataset.status === appliedStatus)
      );
      if (item.hidden)
        item.querySelector("[data-workspace-select]").checked = false;
    }
    const count = visibleRows().length;
    resultCount.textContent = String(count);
    empty.hidden = count > 0;
    table.hidden = count === 0;
    updateSelection();
  };
  const resetAll = () => {
    search.value = "";
    statusController.setValue("");
    appliedStatus = "";
    filterCount.hidden = true;
    applyConditions();
  };

  search.addEventListener("input", applyConditions, { signal });
  for (const checkbox of workspace.querySelectorAll("[data-workspace-select]"))
    checkbox.addEventListener("change", updateSelection, { signal });
  selectAll.addEventListener(
    "change",
    () => {
      for (const item of visibleRows())
        item.querySelector("[data-workspace-select]").checked =
          selectAll.checked;
      updateSelection();
    },
    { signal },
  );
  workspace.querySelector("[data-workspace-clear]").addEventListener(
    "click",
    () => {
      for (const checkbox of workspace.querySelectorAll(
        "[data-workspace-select]",
      ))
        checkbox.checked = false;
      updateSelection();
    },
    { signal },
  );
  workspace.querySelector("[data-workspace-sort]").addEventListener(
    "click",
    (event) => {
      ascending = !ascending;
      rows.sort(
        (left, right) =>
          left
            .querySelector("[data-workspace-title]")
            .textContent.localeCompare(
              right.querySelector("[data-workspace-title]").textContent,
              "ru",
            ) * (ascending ? 1 : -1),
      );
      body.append(...rows);
      event.currentTarget
        .closest("th")
        .setAttribute("aria-sort", ascending ? "ascending" : "descending");
    },
    { signal },
  );
  scope.querySelector("[data-workspace-apply-filter]").addEventListener(
    "click",
    () => {
      appliedStatus = status.value;
      filterCount.hidden = !appliedStatus;
      applyConditions();
    },
    { signal },
  );
  scope
    .querySelector("[data-workspace-reset-filter]")
    .addEventListener("click", () => statusController.setValue(""), { signal });
  filterDrawer.addEventListener(
    "close",
    () => {
      statusController.setValue(appliedStatus);
    },
    { signal },
  );
  workspace.querySelector("[data-workspace-reset]").addEventListener(
    "click",
    () => {
      resetAll();
      search.focus();
    },
    { signal },
  );

  return { destroy: () => abortController.abort() };
};
import { enhanceSelects } from "@shlz/behaviors/select";
