const normalizePage = (value) => {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(page) && page >= 1 && page <= 3 ? page : 1;
};

export const paginationConsumerMarkup = (search, iconUrl) => {
  const currentPage = normalizePage(
    new window.URLSearchParams(search).get("page"),
  );
  const result = [
    "Заявки SD-2401–SD-2420",
    "Заявки SD-2421–SD-2440",
    "Заявки SD-2441–SD-2460",
  ][currentPage - 1];
  const item = (page) =>
    `<li><a class="shlz-pagination__item" href="/?page=${page}#pagination-consumer"${page === currentPage ? ' aria-current="page"' : ""}>${page}</a></li>`;
  const direction = (kind, page, unavailable) => {
    const label =
      kind === "previous" ? "Предыдущая страница" : "Следующая страница";
    const icon = kind === "previous" ? "arrow-left-md" : "arrow-right-md";
    const content = `<img class="shlz-pagination__icon" src="${iconUrl(icon)}" alt="">`;
    return unavailable
      ? `<li><span class="shlz-pagination__item shlz-pagination__item--disabled" aria-disabled="true">${content}<span class="shlz-visually-hidden">${label} недоступна</span></span></li>`
      : `<li><a class="shlz-pagination__item" href="/?page=${page}#pagination-consumer" aria-label="${label}">${content}</a></li>`;
  };

  return `<section id="pagination-consumer" data-pagination-consumer data-shlz-visual-addition>
    <h4>Executable consumer boundary</h4>
    <p>Application-owned URL state: <code>?page=${currentPage}</code></p>
    <p data-pagination-result>${result}</p>
    <div class="shlz-table-wrap"><table class="shlz-table" data-component-audit-id="table-pagination-consumer">
      <caption>Первые две заявки страницы ${currentPage}</caption>
      <thead class="shlz-table__head"><tr><th class="shlz-table__cell" scope="col">Номер</th><th class="shlz-table__cell" scope="col">Тема</th></tr></thead>
      <tbody>${[1, 2].map((offset) => `<tr class="shlz-table__row"><td class="shlz-table__cell">SD-${2400 + (currentPage - 1) * 20 + offset}</td><td class="shlz-table__cell">Заявка на обслуживание ${offset}</td></tr>`).join("")}</tbody>
    </table></div>
    <nav class="shlz-pagination" aria-label="Страницы consumer validation">
      <ul class="shlz-pagination__list">
        ${direction("previous", currentPage - 1, currentPage === 1)}
        ${[1, 2, 3].map(item).join("")}
        ${direction("next", currentPage + 1, currentPage === 3)}
      </ul>
    </nav>
  </section>`;
};
