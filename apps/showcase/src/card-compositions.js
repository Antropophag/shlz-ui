const reportDecoration = `
  <svg class="shlz-report-card__decoration" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 16.5V3.5h10.4l-2.1 4 2.1 3.9-10.4.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export const reportCardMarkup = ({
  auditId,
  eyebrow,
  title,
  value,
  meta,
  muted = false,
  fluid = false,
  link = "",
}) => `
  <article class="shlz-report-card${muted ? " shlz-report-card--muted" : ""}${fluid ? " shlz-report-card--fluid" : ""}" data-component-audit-id="${auditId}">
    <p class="shlz-report-card__eyebrow">${eyebrow}</p>
    <h4 class="shlz-report-card__title">${title}</h4>
    <p class="shlz-report-card__value">${value}</p>
    <p class="shlz-report-card__meta">${meta}</p>
    ${link ? `<a class="shlz-link shlz-report-card__link" data-component-audit-id="link-report-card-action" href="${link}">Открыть отчёт</a>` : ""}
    ${reportDecoration}
  </article>`;

export const cardCompositionsMarkup = `
<article id="card-with-action-demo">
  <h3>Card with action</h3>
  <p><code>Card with button.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 314×230, radius 16, #DFE2F0</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · semantic DOM, nested Button owns action</span></p>
  <div class="shlz-card-composition-grid">
    <article class="shlz-card-with-action" data-component-audit-id="card-with-action-showcase-source" aria-labelledby="card-action-title">
      <div class="shlz-card-with-action__content"><h4 class="shlz-card-with-action__title" id="card-action-title">Настройте профиль</h4><p class="shlz-card-with-action__description">Добавьте контактные данные для заявок.</p></div>
      <div class="shlz-card-with-action__actions"><button class="shlz-button shlz-button--primary" data-component-audit-id="button-card-with-action-command" type="button">Настроить</button></div>
      <svg class="shlz-card-with-action__visual" viewBox="0 0 120 130" aria-hidden="true"><circle cx="86" cy="42" r="20" fill="#566DB2" opacity=".18"/><path d="M30 128c8-38 23-59 45-65 17-5 32 2 45 20v45H30Z" fill="#566DB2" opacity=".22"/><circle cx="81" cy="55" r="14" fill="#566DB2"/></svg>
    </article>
    <article class="shlz-card-with-action shlz-card-with-action--fluid" data-component-audit-id="card-with-action-content-stress" aria-labelledby="card-action-stress-title">
      <div class="shlz-card-with-action__content"><h4 class="shlz-card-with-action__title" id="card-action-stress-title">Регистрация заявки на проведение испытаний</h4><p class="shlz-card-with-action__description">Длинный текст переносится и сохраняет действие доступным.</p></div>
      <div class="shlz-card-with-action__actions"><a class="shlz-button shlz-button--primary" data-component-audit-id="button-card-with-action-navigation" href="#consumer-validation">Продолжить</a></div>
    </article>
  </div>
</article>
<article id="report-card-demo">
  <h3>Report card</h3>
  <p><code>Reports card.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 314×230, white/muted surfaces, trailing decoration</span></p>
  <div class="shlz-card-composition-grid">
    ${reportCardMarkup({ auditId: "report-card-showcase-default", eyebrow: "Заявки", title: "Обработано за месяц", value: "128", meta: "+12 к прошлому месяцу", link: "#consumer-validation" })}
    ${reportCardMarkup({ auditId: "report-card-showcase-muted", eyebrow: "Испытания", title: "Требуют внимания", value: "7", meta: "Обновлено сегодня", muted: true })}
    ${reportCardMarkup({ auditId: "report-card-content-stress", eyebrow: "Годовой отчёт", title: "Регистрация заявок на проведение испытаний", value: "12 845", meta: "ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789", fluid: true })}
  </div>
</article>
<article id="cover-demo">
  <h3>Cover</h3>
  <p><code>Cover.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 874×400 white static composition</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · structured text, fluid modifier</span></p>
  <div class="shlz-cover" data-component-audit-id="cover-showcase-default" aria-labelledby="cover-title">
    <p class="shlz-cover__eyebrow">Щербинский лифтостроительный завод</p><h4 class="shlz-cover__title" id="cover-title">Корпоративная дизайн-система SHLZ</h4><p class="shlz-cover__description">Компоненты и правила для согласованных интерфейсов.</p><p class="shlz-cover__meta">Wave 10 · 2026</p>
  </div>
  <div class="shlz-cover shlz-cover--fluid shlz-cover-stress" data-component-audit-id="cover-content-stress" aria-labelledby="cover-stress-title">
    <p class="shlz-cover__eyebrow">Документация</p><h4 class="shlz-cover__title" id="cover-stress-title">Регистрация заявки на проведение испытаний и подготовку сопроводительных материалов</h4><p class="shlz-cover__description">Проверка длинного содержимого и узкого контейнера без обрезки смыслового текста.</p><p class="shlz-cover__meta">ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789</p>
  </div>
</article>`;
