const emptyWidget = ({ id, title, stress = false }) => `
  <article class="shlz-chart-widget" data-component-audit-id="${id}" aria-labelledby="${id}-title">
    <header class="shlz-chart-widget__header">
      <h3 class="shlz-chart-widget__title" id="${id}-title">${title}</h3>
      <div class="shlz-chart-widget__actions"><button class="shlz-button shlz-button--text shlz-button--sm" data-component-audit-id="button-${id}-settings" type="button">Настроить</button></div>
    </header>
    <div class="shlz-chart-widget__controls"><span class="shlz-status" data-component-audit-id="status-${id}">Месяц</span><span class="shlz-tag" data-component-audit-id="tag-${id}">Статусы</span></div>
    <div class="shlz-chart-widget__plot"><div class="shlz-chart-widget__empty"><span>${stress ? "Нет данных по выбранным параметрам и дополнительным условиям отчёта" : "Нет данных по выбранным параметрам"}</span><button class="shlz-button shlz-button--primary" data-component-audit-id="button-${id}-reset" type="button">Сбросить фильтры</button></div></div>
  </article>`;

export const reportingDashboardShowcaseMarkup = `
<section id="reporting-dashboard-demo" class="shlz-major-section">
  <p class="shlz-section-kicker">REPORTING COMPOSITIONS</p>
  <h2>Dashboard and Chart Widget</h2>
  <p><code>Dashboard.svg</code> and <code>Дашборды.svg</code> · chart rendering remains consumer-owned.</p>
  <div class="shlz-dashboard" data-component-audit-id="dashboard-showcase-default">
    <section class="shlz-dashboard__section" aria-labelledby="dashboard-showcase-title">
      <h3 class="shlz-dashboard__heading" id="dashboard-showcase-title">Дашборды</h3>
      <div class="shlz-dashboard__grid">
        ${emptyWidget({ id: "chart-widget-showcase-default", title: "Рекламации в разрезе статусов и времени" })}
        ${emptyWidget({ id: "chart-widget-content-stress", title: "Количество рекламаций с очень длинным локализованным названием отчётного показателя", stress: true })}
      </div>
    </section>
  </div>
</section>
<section id="reporting-dashboard-consumer" class="shlz-major-section">
  <h2>Reporting consumer</h2>
  <div class="shlz-dashboard" data-component-audit-id="dashboard-reporting-consumer">
    <section class="shlz-dashboard__section" aria-labelledby="reporting-consumer-title">
      <h3 class="shlz-dashboard__heading" id="reporting-consumer-title">Сводка по обращениям</h3>
      <div class="shlz-dashboard__grid">
        <article class="shlz-chart-widget" data-component-audit-id="chart-widget-reporting-consumer" aria-labelledby="consumer-widget-title">
          <header class="shlz-chart-widget__header"><h4 class="shlz-chart-widget__title" id="consumer-widget-title">Обращения по статусам</h4></header>
          <div class="shlz-chart-widget__controls"><span class="shlz-status" data-component-audit-id="status-chart-widget-consumer">Выполнено</span><a class="shlz-link" data-component-audit-id="link-chart-widget-consumer" href="#table-demo">Открыть таблицу</a></div>
          <div class="shlz-chart-widget__plot"><div class="shlz-chart-widget__empty">Визуализация будет предоставлена приложением вместе с доступной таблицей данных.</div></div>
        </article>
      </div>
    </section>
  </div>
</section>`;
