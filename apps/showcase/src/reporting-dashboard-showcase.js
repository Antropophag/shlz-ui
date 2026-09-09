import emptyIllustration from "../generated/source-references/empty-customize.svg?url";

const emptyWidget = ({ id, title, stress = false }) => `
  <article class="shlz-chart-widget" data-component-audit-id="${id}" aria-labelledby="${id}-title">
    <header class="shlz-chart-widget__header">
      <h4 class="shlz-chart-widget__title" id="${id}-title">${title}</h4>
      <div class="shlz-chart-widget__actions"><button class="shlz-button shlz-button--text shlz-button--sm" data-component-audit-id="button-${id}-settings" type="button">Настроить</button></div>
    </header>
    <div class="shlz-chart-widget__controls"><span class="shlz-status" data-component-audit-id="status-${id}">Месяц</span><span class="shlz-tag" data-component-audit-id="tag-${id}">Статусы</span></div>
    <div class="shlz-chart-widget__plot"><div class="shlz-chart-widget__empty"><div class="shlz-chart-widget__empty-illustration" aria-hidden="true"><img src="${emptyIllustration}" alt=""></div><span>${stress ? "Нет данных по выбранным параметрам и дополнительным условиям отчёта" : "Нет данных по выбранным параметрам"}</span><button class="shlz-button shlz-button--primary" data-component-audit-id="button-${id}-reset" type="button">Сбросить фильтры</button></div></div>
  </article>`;

const chartData = {
  categories: [
    { id: "week-1", label: "1–7 сентября" },
    { id: "week-2", label: "8–14 сентября" },
    { id: "week-3", label: "15–21 сентября" },
    { id: "week-4", label: "22–28 сентября" },
    {
      id: "week-5",
      label: "Очень длинный локализованный период 29 сентября – 5 октября",
    },
  ],
  series: [
    {
      id: "new",
      label: "Новые",
      tone: "blue",
      values: [4, 7, 5, 9, 6].map((value, index) => ({
        categoryId: `week-${index + 1}`,
        value,
        displayValue: `${value}`,
      })),
    },
    {
      id: "in-work",
      label: "В работе",
      tone: "green",
      values: [6, 5, 8, 4, 7].map((value, index) => ({
        categoryId: `week-${index + 1}`,
        value,
        displayValue: `${value}`,
      })),
    },
    {
      id: "completed",
      label: "Выполнено",
      tone: "bright-green",
      values: [0, 6, 4, 8, 10].map((value, index) => ({
        categoryId: `week-${index + 1}`,
        value,
        displayValue: `${value}`,
      })),
    },
  ],
};

const chartRoot = (id, data = chartData) => `<div
  id="${id}"
  data-shlz-bar-chart
  data-component-audit-id="${id}"
  data-plot-label="Сгруппированная диаграмма обращений"
  data-legend-label="Статусы обращений"
  data-table-label="Показать данные диаграммы"
  data-table-caption="Обращения по неделям и статусам"
  data-category-label="Период"
><script type="application/json" data-shlz-bar-chart-data>${JSON.stringify(data)}</script></div>`;

const sourceSeries = [
  ["new", "Новое", "blue"],
  ["in-work-oks", "В работе ОКС", "green"],
  ["transferred-ogo", "Передано в ОГО", "orange"],
  ["in-work-ogo", "В работе у ОГО", "deep-blue"],
  ["transferred-supplier", "Передано поставщику", "violet"],
  ["solution-implementation", "Реализация решения", "turquoise"],
  ["transferred-bgo", "Передано в БГО", "pink"],
  ["completed", "Выполнено", "bright-green"],
  ["closed", "Закрыто", "gray"],
];
const sourceData = (periodCount, seriesIndices, placement = "above") => {
  const categories = Array.from({ length: periodCount }, (_, index) => ({
    id: `p${index}`,
    label: `${index + 1}–${index + 7} мая`,
  }));
  return {
    categories,
    series: seriesIndices.map((sourceIndex, index) => ({
      id: sourceSeries[sourceIndex][0],
      label: sourceSeries[sourceIndex][1],
      tone: sourceSeries[sourceIndex][2],
      values: categories.map((category, categoryIndex) => ({
        categoryId: category.id,
        value: ((categoryIndex + index) % 9) + 1,
        displayValue: String(((categoryIndex + index) % 9) + 1),
      })),
    })),
    presentation: {
      density: "source",
      scaleMaximum: 10,
      tooltipPlacement: placement,
    },
  };
};
const sourceDensities = [
  ["five-eight", 5, [0, 1, 2, 3, 4, 5, 6, 7], "21 px · 5 периодов × 8 серий"],
  ["five-two", 5, [0, 5], "96 px · 5 периодов × 2 серии"],
  [
    "fourteen-eight",
    14,
    [0, 1, 2, 3, 4, 5, 6, 7],
    "7 px · 14 периодов × 8 серий",
  ],
  ["twenty-three-three", 23, [0, 5, 6], "≈12,33 px · 23 периода × 3 серии"],
  ["two-eight", 2, [0, 1, 2, 3, 4, 5, 6, 7], "62,75 px · 2 периода × 8 серий"],
  ["five-three", 5, [0, 5, 6], "≈62,67 px · 5 периодов × 3 серии"],
];
const sourceGallery = `
<section id="dashboard-source-gallery" class="shlz-major-section">
  <h2>Палитра и варианты графиков</h2>
  <p>Девять цветов, состояния и плотность из Dashboard.svg. Числа в диаграммах — демонстрационные данные.</p>
  <div class="shlz-chart-palette" aria-label="Палитра баров: обычное и приглушённое состояние">
    ${sourceSeries.map(([, label, tone]) => `<figure><div class="shlz-chart-palette__pair" aria-hidden="true"><span class="shlz-chart-palette__bar shlz-bar-chart__tone-${tone}"></span><span class="shlz-chart-palette__bar shlz-bar-chart__tone-${tone} shlz-bar-chart__bar--muted"></span></div><figcaption>${label}</figcaption></figure>`).join("")}
  </div>
  <p>Слева — обычное состояние, справа — приглушённое. Наведите на столбец ниже или перейдите к нему клавишей Tab, чтобы увидеть все серии периода.</p>
  ${sourceDensities.map(([id, count, indices, label]) => `<section class="shlz-chart-specimen" aria-labelledby="density-${id}"><h3 id="density-${id}">${label}</h3>${chartRoot(`bar-chart-density-${id}`, sourceData(count, indices))}</section>`).join("")}
  <section class="shlz-chart-specimen" aria-labelledby="chart-below-title"><h3 id="chart-below-title">Подсказка под осью · закрытые обращения</h3>${chartRoot("bar-chart-tooltip-below", sourceData(5, [0, 5, 8], "below"))}</section>
</section>`;

export const reportingDashboardShowcaseMarkup = `
<section id="reporting-dashboard-demo" class="shlz-major-section">
  <p class="shlz-section-kicker">REPORTING COMPOSITIONS</p>
  <h2>Dashboard and Chart Widget</h2>
  <p><code>Dashboard.svg</code> and <code>Дашборды.svg</code> · графики отображает Bar Chart; данные и фильтры задаёт приложение.</p>
  <div class="shlz-dashboard" data-component-audit-id="dashboard-showcase-default">
    <section class="shlz-dashboard__section" aria-labelledby="dashboard-showcase-title">
      <h3 class="shlz-dashboard__heading" id="dashboard-showcase-title">Дашборды</h3>
      <div class="shlz-dashboard__grid">
        ${emptyWidget({ id: "chart-widget-showcase-default", title: "Рекламации в разрезе статусов и времени" })}
        ${emptyWidget({ id: "chart-widget-content-stress", title: "Количество рекламаций с очень длинным локализованным названием отчётного показателя", stress: true })}
        <article class="shlz-chart-widget" data-component-audit-id="chart-widget-bar-chart-showcase" aria-labelledby="bar-chart-showcase-title">
          <header class="shlz-chart-widget__header"><h4 class="shlz-chart-widget__title" id="bar-chart-showcase-title">Обращения по статусам</h4></header>
          <div class="shlz-chart-widget__plot">${chartRoot("bar-chart-showcase-source")}</div>
        </article>
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
          <div class="shlz-chart-widget__controls" data-bar-chart-consumer-controls>
            <span class="shlz-status" data-component-audit-id="status-chart-widget-consumer">Выполнено</span>
            <a class="shlz-link" data-component-audit-id="link-chart-widget-consumer" href="#table-demo">Открыть таблицу</a>
            <fieldset class="shlz-segment shlz-segment--sm" data-component-audit-id="segment-bar-chart-consumer-period"><legend class="shlz-visually-hidden">Период диаграммы</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="chart-period" value="month" checked><span class="shlz-segment__label">30 дней</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="chart-period" value="quarter"><span class="shlz-segment__label">90 дней</span></label></fieldset>
          </div>
          <div class="shlz-chart-widget__plot">${chartRoot("bar-chart-reporting-consumer")}</div>
        </article>
      </div>
    </section>
  </div>
</section>
${sourceGallery}`;

export const enhanceReportingBarCharts = (enhance) => {
  const controllers = enhance(
    document.querySelector("#reporting-dashboard-demo")?.parentElement ||
      document,
  );
  const consumer = controllers.find(
    ({ root }) => root.id === "bar-chart-reporting-consumer",
  );
  document
    .querySelector("[data-bar-chart-consumer-controls]")
    ?.addEventListener("change", (event) => {
      const input = event.target;
      if (
        !(input instanceof globalThis.HTMLInputElement) ||
        !input.checked ||
        !consumer
      )
        return;
      const multiplier = input.value === "quarter" ? 3 : 1;
      consumer.update({
        ...chartData,
        series: chartData.series.map((series) => ({
          ...series,
          values: series.values.map((datum) => ({
            ...datum,
            value: datum.value * multiplier,
            displayValue: `${datum.value * multiplier}`,
          })),
        })),
      });
    });
  return controllers;
};
