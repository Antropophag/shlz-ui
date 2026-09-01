import "@shlz/styles";
import "./golos-text.css";
import "./fira-sans.css";
import "./showcase.css";
import { fidelityMarkup, primaryComponentMarkup } from "./fidelity.js";
import { renderComponentDocumentation } from "./component-docs.js";
import { paginationConsumerMarkup } from "./pagination-consumer.js";
import {
  enhanceNotificationConsumer,
  notificationConsumerMarkup,
} from "./notification-consumer.js";
import { wave3Markup } from "./wave3.js";
import { contentStatesMarkup } from "./content-states.js";
import { cardCompositionsMarkup } from "./card-compositions.js";
import {
  datePickerShowcaseMarkup,
  enhanceDatePickerShowcase,
} from "./date-picker-showcase.js";
import {
  datePickerConsumerMarkup,
  enhanceDatePickerConsumer,
} from "./date-picker-consumer.js";
import {
  consumerWorkspaceMarkup,
  enhanceConsumerWorkspace,
} from "./consumer-workspace.js";
import {
  calendarGridShowcaseMarkup,
  enhanceCalendarGridShowcase,
  enhanceCalendarGrids,
} from "./calendar-grid-showcase.js";
import {
  enhancePlannerScheduleShowcase,
  plannerScheduleShowcaseMarkup,
} from "./planner-schedule-showcase.js";
import {
  enhanceMessagingHistoryShowcase,
  messagingHistoryShowcaseMarkup,
} from "./messaging-history-showcase.js";
import {
  enhanceFileUploadShowcase,
  fileUploadShowcaseMarkup,
} from "./file-upload-showcase.js";
import {
  composerConsumerMarkup,
  composerShowcaseMarkup,
  enhanceComposerShowcase,
} from "./composer-showcase.js";
import tokens from "@shlz/tokens/tokens.json";
import provenance from "@shlz/tokens/provenance.json";
import manifest from "@shlz/icons/manifest.json";
import compatibilityAliases from "@shlz/icons/compatibility-aliases.json";
import { iconHref, iconViewBox } from "@shlz/icons";
import spriteUrl from "@shlz/icons/sprite.svg?url";
import sidebarSourceUrl from "../../../shlz-design-source/raw/svg/Sidebar.svg?url";
import {
  enhanceDrawers,
  enhanceDropdowns,
  enhanceModals,
  enhancePopovers,
  enhanceSelects,
  enhanceTabs,
  enhanceTooltips,
  enhanceFileUploads,
} from "@shlz/behaviors";

const iconUrls = import.meta.glob(
  "../../../packages/icons/dist/{icons,file-types}/*.svg",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);
const sourceReferenceUrls = import.meta.glob(
  "../generated/source-references/{empty-customize,empty-basic}.svg",
  { eager: true, query: "?url", import: "default" },
);
const app = document.querySelector("#app");
const showcaseIconUrl = (name) =>
  Object.entries(iconUrls).find(([source]) =>
    source.endsWith(`/${name}.svg`),
  )?.[1];
const sourceReferenceUrl = (name) =>
  Object.entries(sourceReferenceUrls).find(([source]) =>
    source.endsWith(`/${name}.svg`),
  )?.[1];
const evidenceLabel = (item) =>
  `<span class="shlz-evidence" data-kind="${item.classification}">${item.classification} · ${item.confidence}</span>`;
const sourceEvidence = evidenceLabel(provenance.layers.source);
const semanticEvidence = evidenceLabel(provenance.layers.semantic);
const colors = Object.entries(tokens.source.color)
  .map(
    ([group, values]) =>
      `<article class="shlz-source-group"><h3>${group}</h3><div class="shlz-source-swatches">${Object.entries(
        values,
      )
        .map(
          ([name, value]) =>
            `<div class="shlz-swatch"><i style="--shlz-swatch:${value}"></i><b>${name}</b><code>${value}</code></div>`,
        )
        .join("")}</div></article>`,
  )
  .join("");
const spaces = Object.entries(tokens.source.spacing)
  .map(
    ([name, value]) =>
      `<div class="shlz-measure"><i style="inline-size:${value}"></i><code>${name} · ${value}</code></div>`,
  )
  .join("");
const radii = Object.entries(tokens.source.radius)
  .map(
    ([name, value]) =>
      `<div class="shlz-radius" style="border-radius:${value}"><b>${name}</b><code>${value}</code></div>`,
  )
  .join("");
const typographyFacts = [
  ["Regular", "12 / 15.6", "−1%"],
  ["Medium uppercase", "12 / 18", "0%"],
  ["Regular", "14 / 18.2", "−1%"],
  ["Regular", "14 / 20", "−1%"],
  ["Regular", "15 / 19.5", "−1%"],
  ["Regular", "16 / 20.8", "−1%"],
  ["Regular", "16 / 20", "−1%"],
  ["Medium", "15 / 19.5", "−1%"],
  ["Medium", "16 / 20.8", "−1%"],
  ["Medium", "20 / 26", "−1%"],
  ["SemiBold", "20 / 26", "0%"],
  ["Medium", "24 / 31.2", "−1%"],
  ["Medium", "28 / 36.4", "−1%"],
  ["Regular / Medium", "32 / 41.6", "−1.5%"],
]
  .map(
    ([weight, metrics, tracking]) =>
      `<tr><td>Golos Text ${weight}</td><td>${metrics}px</td><td>${tracking}</td></tr>`,
  )
  .join("");
const geometryFacts = [
  ["Button", "26 / 32 / 40 high", "pill; family-local sizes"],
  ["Input", "Large 40; Medium 32", "radius 20 / 16"],
  ["Textarea", "source examples ≈58 high", "radius 8"],
  ["Select", "Large 40; Medium 32", "radius 20 / 16"],
  ["Checkbox", "20 / 16", "radius 6 / 4"],
  ["Radio", "20", "circular"],
  ["Switch", "Medium 38×20; Small 24×14", "pill"],
  ["Status", "30 high", "radius 15"],
  ["Badge", "16 / 23 high", "dot and count forms"],
]
  .map(
    ([family, size, geometry]) =>
      `<tr><th scope="row">${family}</th><td>${size}px</td><td>${geometry}</td></tr>`,
  )
  .join("");
const navigationGroups = [
  [
    "Foundations",
    [
      ["foundations", "Overview"],
      ["colors", "Colors"],
      ["typography", "Typography"],
      ["spacing", "Spacing"],
      ["geometry", "Geometry"],
    ],
  ],
  [
    "Components",
    [
      ["button", "Button"],
      ["input", "Input"],
      ["textarea", "Textarea"],
      ["select", "Select"],
      ["checkbox", "Checkbox"],
      ["radio", "Radio"],
      ["switch", "Switch"],
      ["status", "Status"],
      ["badge", "Badge"],
      ["link", "Link"],
      ["avatar", "Avatar"],
      ["table", "Table"],
      ["tabs", "Tabs"],
      ["pagination", "Pagination"],
      ["tag", "Tag"],
      ["person-tag", "Person Tag"],
      ["segment", "Segment"],
      ["notification", "Notification"],
      ["dropdown", "Dropdown"],
      ["file-row", "File Row"],
      ["empty-state", "Empty State"],
      ["date-picker-demo", "Date Picker"],
      ["calendar-grid-demo", "Calendar Grid"],
      ["planner-schedule-demo", "Planner Schedule"],
      ["message-thread-demo", "Message Thread"],
      ["history-timeline-demo", "History Timeline"],
      ["file-upload-demo", "File Upload"],
      ["composer-demo", "Composer / Rich Text Toolbar"],
      ["card-with-action-demo", "Card with action"],
      ["report-card-demo", "Report card"],
      ["cover-demo", "Cover"],
    ],
  ],
  ["Validation", [["consumer-validation", "Data workspace"]]],
];
const navigationIcons = [
  "circle-grid-interface-sidebar",
  "ai-brain-network",
  "bar-chart-square-plus",
  "cloud-refresh",
  "data-set",
  "delivery-4",
  "docs",
  "document-paper-2-lines",
  "graph",
  "setting-tool-circle",
  "user-sidebar",
];
let navigationIconIndex = 0;
const navigationMarkup = navigationGroups
  .map(
    ([label, links]) =>
      `<div class="shlz-docs-nav__group"><h2>${label}</h2>${links
        .map(([id, title]) => {
          const icon =
            navigationIcons[navigationIconIndex % navigationIcons.length];
          navigationIconIndex += 1;
          return `<a href="#${id}" title="${title}" data-shlz-docs-link><span class="shlz-docs-nav__icon" aria-hidden="true"><img src="${showcaseIconUrl(icon)}" alt=""></span><span class="shlz-docs-nav__label">${title}</span></a>`;
        })
        .join("")}</div>`,
  )
  .join("");
const groupBy = (items, getKey) =>
  items.reduce((groups, item) => {
    const key = getKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map());
const aliasesByTarget = groupBy(compatibilityAliases, ({ target }) => target);
const iconGroups = [...groupBy(manifest, ({ category }) => category)]
  .map(([category, icons]) => {
    const cards = icons.map(({ name, file, colorMode, comment, variants }) => {
      const url = Object.entries(iconUrls).find(([source]) =>
        source.endsWith(file),
      )?.[1];
      const aliases = aliasesByTarget.get(name) ?? [];
      return `<figure class="shlz-icon-card" data-icon-name="${name}" title="${comment ?? ""}"><img src="${url}" alt=""/><figcaption>${name}<small>${colorMode} · ${variants.length} variant${variants.length === 1 ? "" : "s"}</small>${aliases.length ? `<small>compat: ${aliases.map(({ alias }) => alias).join(", ")}</small>` : ""}</figcaption></figure>`;
    });
    return `<section class="shlz-icon-category"><h3>${category} <small>${icons.length} canonical</small></h3><div class="shlz-icon-grid">${cards.join("")}</div></section>`;
  })
  .join("");

const modalLongContent = Array.from(
  { length: 12 },
  (_, index) => `<p>Строка длинного содержимого ${index + 1}</p>`,
).join("");
const drawerLongContent = Array.from(
  { length: 24 },
  (_, index) => `<p>Прокручиваемая строка ${index + 1}</p>`,
).join("");
const overlayDemos = `
<article id="modal-demo"><h3>Modal</h3><p><code>Modal.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 572px, radius 16, structured regions</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · native dialog, opt-in backdrop dismissal</span></p><div class="shlz-cluster"><button class="shlz-button shlz-button--primary" type="button" data-shlz-modal-trigger="showcase-modal">Открыть Modal</button><button class="shlz-button" type="button" data-shlz-modal-trigger="showcase-confirm">Подтверждение</button></div>
<dialog class="shlz-modal" id="showcase-modal" data-shlz-modal data-shlz-modal-backdrop-close data-component-audit-id="modal-showcase-structured" aria-labelledby="showcase-modal-title"><div class="shlz-modal__surface"><header class="shlz-modal__header"><h2 class="shlz-modal__title" id="showcase-modal-title">Заголовок Modal</h2><button class="shlz-modal__close" type="button" data-shlz-modal-close aria-label="Закрыть">×</button></header><div class="shlz-modal__body"><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Название</span><input class="shlz-input" id="modal-autofocus" autofocus value="Native dialog"></label><p>Body прокручивается независимо от header и footer. Ниже проверяются floating-компоненты внутри top layer.</p><div class="shlz-cluster"><div class="shlz-dropdown" data-shlz-dropdown data-component-audit-id="dropdown-modal-consumer"><button class="shlz-button shlz-button--sm" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="modal-menu">Dropdown внутри Modal</button><div class="shlz-dropdown__menu" id="modal-menu" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem">Первый пункт</button><button class="shlz-dropdown__item" type="button" role="menuitem">Второй пункт</button></div></div><button class="shlz-button shlz-button--sm" type="button" data-shlz-tooltip-trigger="modal-tooltip" data-shlz-tooltip-open-delay="0">Tooltip внутри Modal</button><div class="shlz-tooltip" id="modal-tooltip" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-modal-consumer" hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div><button class="shlz-button shlz-button--sm" type="button" aria-expanded="false" aria-controls="modal-popover" data-shlz-popover-trigger="modal-popover" data-shlz-popover-placement="bottom">Popover внутри Modal</button><div class="shlz-popover" id="modal-popover" data-shlz-popover data-component-audit-id="popover-modal-consumer" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Вложенный Popover</div><div class="shlz-popover__body">Escape сначала закрывает floating surface.</div></div></div><div class="shlz-modal-long-content" data-modal-long-content>${modalLongContent}</div></div></div><footer class="shlz-modal__footer"><button class="shlz-button" type="button" data-shlz-modal-close>Отмена</button><button class="shlz-button shlz-button--primary" type="button" data-shlz-modal-close="save">Сохранить</button></footer></div></dialog>
<dialog class="shlz-modal shlz-modal--compact" id="showcase-confirm" data-shlz-modal data-component-audit-id="modal-showcase-compact" aria-labelledby="showcase-confirm-title"><form class="shlz-modal__surface" method="dialog"><div class="shlz-modal__body"><h2 class="shlz-modal__title" id="showcase-confirm-title">Подтвердить действие?</h2><p>Для confirm/cancel доступна нативная форма <code>method=&quot;dialog&quot;</code>.</p></div><footer class="shlz-modal__footer"><button class="shlz-button" value="cancel">Отмена</button><button class="shlz-button shlz-button--primary" value="confirm">Подтвердить</button></footer></form></dialog></article>
<article id="drawer-demo"><h3>Drawer</h3><p><code>Drawer.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 420×900, 64/764/72 regions</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · modal right-side native dialog</span></p><button class="shlz-button shlz-button--primary" type="button" data-shlz-drawer-trigger="showcase-drawer">Открыть Drawer</button><dialog class="shlz-drawer" id="showcase-drawer" data-shlz-drawer data-shlz-drawer-backdrop-close data-component-audit-id="drawer-showcase" aria-labelledby="showcase-drawer-title"><div class="shlz-drawer__surface"><header class="shlz-drawer__header"><h2 class="shlz-drawer__title" id="showcase-drawer-title">Заголовок Drawer</h2><button class="shlz-drawer__close" type="button" data-shlz-drawer-close aria-label="Закрыть">×</button></header><div class="shlz-drawer__body" data-drawer-scroll><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Параметр</span><input class="shlz-input" autofocus></label><p>Drawer использует ту же native modal lifecycle, но независимую source-derived geometry.</p>${drawerLongContent}</div></div><footer class="shlz-drawer__footer"><button class="shlz-button" type="button" data-shlz-drawer-close>Отмена</button><button class="shlz-button shlz-button--primary" type="button" data-shlz-drawer-close="apply">Применить</button></footer></div></dialog></article>`;

const typographySelectMarkup = `<div class="shlz-field shlz-field--select shlz-select-root" data-shlz-select data-component-audit-id="typography-assignee">
  <span class="shlz-field__label" id="typography-select-label">Ответственный</span>
  <button class="shlz-field__control shlz-select__trigger shlz-select__trigger--selected" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="typography-select-options" aria-labelledby="typography-select-label typography-select-value"><span id="typography-select-value" data-shlz-select-value data-placeholder="Выберите ответственного">Александр Александрович Александров</span><svg class="shlz-select__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5 12 15.5 19 8.5"/></svg></button>
  <div class="shlz-select__listbox" id="typography-select-options" role="listbox" aria-labelledby="typography-select-label" hidden><button class="shlz-select__option" type="button" role="option" aria-selected="true" data-value="Александр Александрович Александров">Александр Александрович Александров</button><button class="shlz-select__option" type="button" role="option" aria-selected="false" data-value="Мария Петрова">Мария Петрова</button></div>
  <input type="hidden" name="typography-assignee" value="Александр Александрович Александров">
</div>`;

const typographyCompatibilityMarkup = `
<section id="typography-compatibility" class="shlz-major-section shlz-type-stress" data-shlz-visual-addition>
  <h2>Typography profile compatibility</h2>
  <p>Одинаковые production-компоненты и geometry; профиль меняет только наследуемую типографику.</p>
  <div class="shlz-type-stress__samples" data-shlz-type-stress>
    <div class="shlz-cluster">
      <button class="shlz-button shlz-button--primary" type="button">В проведении испытаний отказано</button>
      <span class="shlz-status shlz-status--red" data-component-audit-id="status-typography-stress">Отклонено</span>
      <span class="shlz-badge shlz-badge--count" data-component-audit-id="badge-typography-stress">0123456789</span>
      <span class="shlz-tag" data-component-audit-id="tag-typography-stress">Требуют вашего внимания</span>
    </div>
    <label class="shlz-field"><span class="shlz-field__label">Регистрация заявки на проведение испытаний</span><span class="shlz-field__control"><input class="shlz-input" value="Щербинский лифтостроительный завод"></span></label>
    ${typographySelectMarkup}
    <div class="shlz-tabs shlz-tabs--pill"><div class="shlz-tabs__list"><button class="shlz-tabs__tab" type="button">ABCDEFGHIJKLMNOPQRSTUVWXYZ</button><button class="shlz-tabs__tab" type="button">abcdefghijklmnopqrstuvwxyz</button></div></div>
    <nav class="shlz-pagination" aria-label="Typography pagination"><ul class="shlz-pagination__list"><li><span class="shlz-pagination__item">1</span></li><li><span class="shlz-pagination__item">2</span></li><li><span class="shlz-pagination__item">…</span></li><li><span class="shlz-pagination__item">99</span></li></ul></nav>
    <div class="shlz-dropdown" data-component-audit-id="dropdown-typography-stress" aria-hidden="true"><div class="shlz-dropdown__menu shlz-type-stress__dropdown" role="presentation"><span class="shlz-dropdown__item">Регистрация заявки на проведение испытаний</span><span class="shlz-dropdown__item">0123456789</span></div></div>
    <div class="shlz-table-wrap"><table class="shlz-table" data-component-audit-id="table-typography-stress"><caption class="shlz-visually-hidden">Проверка табличной типографики</caption><thead class="shlz-table__head"><tr class="shlz-table__row"><th class="shlz-table__cell" scope="col">Заявитель</th><th class="shlz-table__cell" scope="col">Статус</th><th class="shlz-table__cell shlz-table__cell--numeric" scope="col">Номер</th><th class="shlz-table__cell" scope="col">Действия</th></tr></thead><tbody><tr class="shlz-table__row"><td class="shlz-table__cell"><span class="shlz-table__truncate">Александр Александрович Александров</span></td><td class="shlz-table__cell"><span class="shlz-status shlz-status--red" data-component-audit-id="status-typography-table">Отклонено</span></td><td class="shlz-table__cell shlz-table__cell--numeric">0123456789</td><td class="shlz-table__cell"><button class="shlz-button shlz-button--sm" type="button">Открыть</button></td></tr></tbody></table></div>
    <div class="shlz-type-stress__rows"><div class="shlz-file-row" data-component-audit-id="file-row-typography-stress"><div class="shlz-file-row__content"><span class="shlz-file-row__title">Очень длинное имя файла с результатами проведения испытаний и дополнительными материалами.pdf</span></div></div><div class="shlz-document-row" data-component-audit-id="document-row-typography-stress"><div class="shlz-document-row__content"><a class="shlz-document-row__title" href="#typography-compatibility">Щербинский лифтостроительный завод — комплект документов для проведения испытаний</a><span class="shlz-document-row__meta">ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789</span></div></div></div>
    <div class="shlz-empty-state shlz-empty-state--simple" data-component-audit-id="empty-state-typography-stress"><div class="shlz-empty-state__content"><h3 class="shlz-empty-state__title">Требуют вашего внимания</h3><p class="shlz-empty-state__description">Регистрация заявки на проведение испытаний</p></div></div>
  </div>
</section>`;

app.innerHTML = `<header class="shlz-hero"><div class="shlz-hero__intro"><p>SHLZ UI · component library</p><h1>Components and foundations</h1><p>Production contracts and examples, with source verification available on demand.</p></div><div class="shlz-hero__actions"><label class="shlz-shell-search"><span class="shlz-visually-hidden">Search components and foundations</span><input type="search" placeholder="Search components" autocomplete="off" data-shlz-shell-search></label><span class="shlz-shell-avatar" role="img" aria-label="Showcase profile"><img src="${showcaseIconUrl("user")}" alt=""></span></div><fieldset class="shlz-font-switch" data-shlz-visual-addition><legend>Typography profile</legend><label><input type="radio" name="shlz-font-profile" value="golos" checked>Golos Text</label><label><input type="radio" name="shlz-font-profile" value="fira">Fira Sans</label></fieldset></header>
<section id="source-spec" class="shlz-major-section"><p class="shlz-section-kicker">A. SOURCE SPEC</p><h2>Буквальная спецификация Figma ${sourceEvidence}</h2><p><code>Colors.svg</code>, <code>Spacing.svg</code> и human-verified Corner radius source. Имена, группы и значения не нормализованы в искусственные шкалы.</p>
<div class="shlz-source-sheet"><h2>Colors</h2><div class="shlz-source-palette">${colors}</div></div>
<div class="shlz-source-sheet shlz-source-sheet--split"><div><h2>Spacing</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Literal named source values.</p><div class="shlz-stack">${spaces}</div></div><div><h2>Corner radius</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Source labels, not a universal component mapping.</p><div class="shlz-radius-grid">${radii}</div></div></div>
<div class="shlz-source-sheet"><h2>Typography evidence</h2><p class="shlz-type-sample">Аа Бб 0123 — Golos Text</p><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Two Figma Plugin API page exports contain 2,193 text nodes. Golos Text Regular, Medium and SemiBold dominates concrete product paths. The table lists every distinct product-candidate metric, not a semantic scale.</p><div class="shlz-table-wrap"><table class="shlz-foundation-table"><thead><tr><th>Source family/style</th><th>Size / line height</th><th>Letter spacing</th></tr></thead><tbody>${typographyFacts}</tbody></table></div><details><summary>Diagnostics and excluded typography</summary><p>Basic elements: 1,480 nodes / 29 signatures; Interface elements: 713 nodes / 19 signatures; 12 signatures occur across both pages. <span class="shlz-evidence" data-kind="LEGACY">LEGACY</span> Roboto, Suisse Intl and SF Pro Display occur in foreign/older artifacts. <span class="shlz-evidence" data-kind="LEGACY">LEGACY</span> Inter belongs to embedded asset typography. Cover/specification headings and one local override are documentation or outliers. <span class="shlz-evidence" data-kind="UNKNOWN">UNKNOWN</span> Figma provides no authoritative Body/Heading/Caption taxonomy. Full evidence: <code>design-source-index/typography.json</code>.</p></details></div>
<div class="shlz-source-sheet"><h2>Component geometry evidence</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Measurements belong to component families; shared numbers do not prove a global size scale.</p><div class="shlz-table-wrap"><table class="shlz-foundation-table"><thead><tr><th>Family</th><th>Confirmed size</th><th>Radius / form</th></tr></thead><tbody>${geometryFacts}</tbody></table></div></div></section>
<section id="implementation" class="shlz-major-section"><p class="shlz-section-kicker">B. PRODUCTION LIBRARY</p><h2>Engineering abstractions</h2><section><h3>Production typography ${semanticEvidence}</h3><p>The runtime family alias is <code>"Golos Text", system-ui, …, sans-serif</code>. Golos Text is a source fact; the showcase self-hosts its used weights for deterministic source comparison, while production consumers retain control of font delivery and the ordered fallback stack. Components define only source-supported local metrics; SHLZ UI does not invent a named type scale.</p></section><section><h3>Semantic color aliases ${semanticEvidence}</h3><p>Every role below is an <strong>ENGINEERING DECISION</strong> mapped to a literal source color, not a Figma taxonomy. They are retained because production components consume them.</p><div class="shlz-cluster"><div class="shlz-demo-surface">surface.base / text.primary</div><div class="shlz-demo-action">action.primary</div><div class="shlz-demo-status">status.success</div><div class="shlz-demo-danger">status.danger</div></div></section><section><h3>Geometry contract</h3><p><span class="shlz-evidence" data-kind="DECISION">DECISION</span> The legacy 32/40 helper aliases remain for existing consumers, but are not presented as a universal control scale. Production components own their source-backed geometry shown above. Component radii 4, 6, 8, 15, 16 and 20px are not automatically aliases of Min/Regular/Medium/Large/Max.</p></section>
<section id="components"><h2>Components <span class="shlz-evidence" data-kind="FACT">FACT · component sheets</span></h2>
${primaryComponentMarkup}
${wave3Markup(showcaseIconUrl)}
${contentStatesMarkup(showcaseIconUrl, sourceReferenceUrl)}
<article id="dropdown-demo"><h3>Dropdown</h3><p>Menu-only family, separate from migrated Select: 200/216px surfaces composed from extracted Menu item variants.</p><section><h4>Default and search</h4><div class="shlz-cluster"><div class="shlz-dropdown" data-shlz-dropdown data-component-audit-id="dropdown-showcase-actions"><button class="shlz-button shlz-dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-actions">Действия</button><div class="shlz-dropdown__menu" id="showcase-actions" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem"><span class="shlz-dropdown__icon" aria-hidden="true"><img src="${showcaseIconUrl("user")}" alt=""></span>Создать</button><button class="shlz-dropdown__item" type="button" role="menuitem" aria-current="true"><span class="shlz-dropdown__icon" aria-hidden="true"><img src="${showcaseIconUrl("checkmark")}" alt=""></span>Selected</button><button class="shlz-dropdown__item shlz-dropdown__item--visual-highlight" type="button" role="menuitem">Hover</button><button class="shlz-dropdown__item" type="button" role="menuitem" disabled>Недоступно</button><button class="shlz-dropdown__item" type="button" role="menuitem">Длинный пункт меню для проверки ширины</button></div></div><div class="shlz-dropdown" data-shlz-dropdown data-component-audit-id="dropdown-showcase-search"><button class="shlz-button shlz-button--primary shlz-dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-search-actions">Поиск</button><div class="shlz-dropdown__menu" id="showcase-search-actions" role="menu" hidden><input class="shlz-dropdown__search" aria-label="Поиск в меню" placeholder="Поиск"><button class="shlz-dropdown__item" type="button" role="menuitem">Результат 1</button><button class="shlz-dropdown__item" type="button" role="menuitem">Результат 2</button></div></div></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Menu item 16/16; Dropdown 10/10; dropdown-btns 2/2.</p><p>Menu item axes: Type Text/Switch/Checkbox/Status/Avatar and State Default/Hover/Selected/Default red. Menus cover item counts 2–8, source-spelled Srollbar, Status and Search. Trigger variants are Default/Search at 200×36. Select <code>36:1106</code> is explicitly excluded.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p><code>43:769</code>: 16 rows, normally 200×40; Switch rows 180×35. <code>45:1204</code>: 10 menus, 200/216px wide and 100–352px high. <code>110:15065</code>: 2 triggers. No extraction warnings.</p></div></details></div></details></article>
<article id="popover-demo"><h3>Popover</h3><p><code>Popover.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 236×90, radius 12, four sides</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · 8px offset, flip/shift</span></p><div class="shlz-popover-lab">
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-bottom" data-shlz-popover-trigger="popover-bottom" data-shlz-popover-placement="bottom">Bottom</button><div class="shlz-popover" id="popover-bottom" data-shlz-popover data-component-audit-id="popover-showcase-bottom" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-bottom-title">Заголовок</div><div class="shlz-popover__body">Длинный content переносится, не меняя публичный контракт.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-top" data-shlz-popover-trigger="popover-top" data-shlz-popover-placement="top">Top</button><div class="shlz-popover" id="popover-top" data-shlz-popover data-component-audit-id="popover-showcase-top" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Сверху</div><div class="shlz-popover__body">Предпочтительная сторона сохраняется, пока хватает места.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-left" data-shlz-popover-trigger="popover-left" data-shlz-popover-placement="left">Left</button><div class="shlz-popover" id="popover-left" data-shlz-popover data-component-audit-id="popover-showcase-left" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Слева</div><div class="shlz-popover__body">Floating surface</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-right" data-shlz-popover-trigger="popover-right" data-shlz-popover-placement="right">Right</button><div class="shlz-popover" id="popover-right" data-shlz-popover data-component-audit-id="popover-showcase-right" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Справа</div><div class="shlz-popover__body">Floating surface</div></div></div>
</div><div class="shlz-popover-scenarios"><div><button class="shlz-button shlz-button--primary" type="button" aria-expanded="false" aria-controls="popover-interactive" data-shlz-popover-trigger="popover-interactive" data-shlz-popover-placement="bottom-start">Interactive content</button><div class="shlz-popover" id="popover-interactive" data-shlz-popover data-component-audit-id="popover-showcase-interactive" hidden aria-labelledby="popover-interactive-title"><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-interactive-title">Настройки</div><div class="shlz-popover__body shlz-popover__body--fluid shlz-stack"><label class="shlz-field" for="popover-value"><span class="shlz-field__label">Значение</span><input class="shlz-input shlz-input--sm" id="popover-value"></label><button class="shlz-button shlz-button--sm" type="button" data-shlz-popover-close>Готово</button></div></div></div>
<div class="shlz-popover-edge"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-edge" data-shlz-popover-trigger="popover-edge" data-shlz-popover-placement="right">Около края</button><div class="shlz-popover" id="popover-edge" data-shlz-popover data-component-audit-id="popover-edge-stress" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Collision</div><div class="shlz-popover__body">Панель остаётся во viewport.</div></div></div></div>
<div class="shlz-popover-scroll" data-popover-scroll><div class="shlz-popover-scroll__content"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-scroll" data-shlz-popover-trigger="popover-scroll" data-shlz-popover-placement="bottom">Scroll anchor</button><div class="shlz-popover" id="popover-scroll" data-shlz-popover data-component-audit-id="popover-scroll-stress" hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Scroll</div><div class="shlz-popover__body">Позиция следует за trigger.</div></div></div></div></article>
<article id="tooltip-demo"><h3>Tooltip</h3><p><code>Tooltip.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 100×37, radius 8, 8 placements</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · hover/focus, configurable delay</span></p><div class="shlz-floating-lab">
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-top" data-shlz-tooltip-placement="top" data-shlz-tooltip-open-delay="0">Tooltip top</button><div class="shlz-tooltip" id="tooltip-top" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-showcase-top" hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-bottom-start" data-shlz-tooltip-placement="bottom-start" data-shlz-tooltip-open-delay="0">Tooltip bottom start</button><div class="shlz-tooltip" id="tooltip-bottom-start" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-showcase-bottom-start" hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-left" data-shlz-tooltip-placement="left" data-shlz-tooltip-open-delay="0">Tooltip left</button><div class="shlz-tooltip" id="tooltip-left" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-showcase-left" hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-right" data-shlz-tooltip-placement="right" data-shlz-tooltip-open-delay="0">Tooltip right</button><div class="shlz-tooltip" id="tooltip-right" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-showcase-right" hidden>Длинный текст подсказки проверяет перенос у края viewport.<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
</div></article>
<article id="tabs-demo"><h3>Tabs</h3><p>Переключает связанные панели. Три отдельные source families: underline 61px, pill 40px и boxed 39px.</p><section><h4>Types and states</h4><div class="shlz-component-grid"><div class="shlz-tabs" data-shlz-tabs><div class="shlz-tabs__list" role="tablist" aria-label="Разделы"><button class="shlz-tabs__tab" id="tab-one" type="button" role="tab" aria-selected="true" aria-controls="panel-one">Первый</button><button class="shlz-tabs__tab shlz-tabs__tab--visual-hover" id="tab-two" type="button" role="tab" aria-selected="false" aria-controls="panel-two">Второй</button><button class="shlz-tabs__tab" id="tab-disabled" type="button" role="tab" aria-selected="false" aria-controls="panel-disabled" aria-disabled="true">Disabled</button></div><div class="shlz-tabs__panel" id="panel-one" role="tabpanel" aria-labelledby="tab-one">Содержимое первой панели</div><div class="shlz-tabs__panel" id="panel-two" role="tabpanel" aria-labelledby="tab-two" hidden>Содержимое второй панели.</div><div class="shlz-tabs__panel" id="panel-disabled" role="tabpanel" aria-labelledby="tab-disabled" hidden>Недоступная панель.</div></div><div class="shlz-tabs shlz-tabs--pill"><div class="shlz-tabs__list" role="tablist" aria-label="Pill tabs"><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="true">Selected</button><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="false">Default</button></div></div><div class="shlz-tabs shlz-tabs--boxed"><div class="shlz-tabs__list" role="tablist" aria-label="Boxed tabs"><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="true">Selected</button><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="false">Default</button></div></div></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: 14/14 variants across Component Sets <code>52:3213</code>, <code>58:5374</code>, <code>185:15928</code>, plus standalone group <code>52:3256</code>.</p><p>Axes are preserved verbatim: State for underline/pill; Select × State for boxed. No icon property exists. Widths vary by content in source.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Underline: 4 variants, 116–117×61. Pill: 4 variants, 68×40. Boxed: 6 variants, 74–75×39. No extraction warnings or source errors.</p></div></details></div></details></article>
<article id="pagination-demo"><h3>Pagination</h3><p>Навигационная composition из отдельного 40×40 primitive <code>Pagination Btn</code>.</p>${renderComponentDocumentation("pagination")}${paginationConsumerMarkup(window.location.search, showcaseIconUrl)}<section><h4>Composition and states</h4><nav class="shlz-pagination" aria-label="Пагинация примера"><ul class="shlz-pagination__list"><li><span class="shlz-pagination__item shlz-pagination__item--disabled" aria-disabled="true"><img class="shlz-pagination__icon" src="${showcaseIconUrl("arrow-left-md")}" alt=""><span class="shlz-visually-hidden">Предыдущая страница недоступна</span></span></li><li><a class="shlz-pagination__item" href="#page-1" aria-current="page">1</a></li><li><a class="shlz-pagination__item shlz-pagination__item--visual-hover" href="#page-2">2</a></li><li><a class="shlz-pagination__item" href="#page-3">3</a></li><li><span class="shlz-pagination__item shlz-pagination__item--ellipsis" aria-hidden="true">…</span></li><li><a class="shlz-pagination__item" href="#page-8">8</a></li><li><a class="shlz-pagination__item" href="#page-2" aria-label="Следующая страница"><img class="shlz-pagination__icon" src="${showcaseIconUrl("arrow-right-md")}" alt=""></a></li></ul></nav></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: 20/20 variants in Component Set <code>46:999</code>; standalone Pagination composition <code>49:1377</code> is 320×40.</p><p>Primitive axes: Type = Prev / Next / Number / Ellipsis Prev / Ellipsis Next; State = Default / Hover / Pressed / Disabled. All nodes are 40×40. Arrow glyph substitutes were replaced by normalized source icons.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>20 exported variants, no warnings or errors. Ellipsis Disabled variants are absent from source and are not claimed.</p></div></details></div></details></article>
<article id="tag-demo"><h3>Tag</h3><p>Tag and Person tag are separate source families that share only their 30px shell.</p>${renderComponentDocumentation("tag")}${renderComponentDocumentation("person-tag")}<section><h4>Tag</h4><div class="shlz-cluster"><span class="shlz-tag" data-component-audit-id="tag-showcase-filled">Filled</span><span class="shlz-tag shlz-tag--outlined" data-component-audit-id="tag-showcase-outlined">Stroke</span></div></section><section><h4>Person tag</h4><div class="shlz-cluster"><span class="shlz-tag shlz-person-tag" data-component-audit-id="person-tag-showcase-static"><img class="shlz-tag__avatar" src="${showcaseIconUrl("user")}" alt=""><span class="shlz-person-tag__label">Анна Петрова</span></span><span class="shlz-tag shlz-person-tag" data-person-tag-consumer data-component-audit-id="person-tag-showcase-removable"><img class="shlz-tag__avatar" src="${showcaseIconUrl("user")}" alt=""><span class="shlz-person-tag__label">Анна Петрова</span><button class="shlz-tag__remove" type="button" aria-label="Удалить Анну Петрову" data-person-tag-remove><img class="shlz-tag__icon" src="${showcaseIconUrl("close-remove")}" alt=""></button></span><span class="shlz-tag shlz-person-tag" data-component-audit-id="person-tag-content-stress"><span class="shlz-avatar shlz-avatar--24" aria-hidden="true">ЕК</span><span class="shlz-person-tag__label">Екатерина Константинопольская-Смирнова</span><button class="shlz-tag__remove" type="button" aria-label="Удалить Екатерину Константинопольскую-Смирнову" disabled><img class="shlz-tag__icon" src="${showcaseIconUrl("close-remove")}" alt=""></button></span></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: Tag 2/2; Person tag 2/2.</p><p>Tag axis is Type=Filled/Stroke at 111×30. Person tag axis is State=Default/Closable at 193/213×30 and contains avatar/removal structure. Production uses source icons instead of letter and × substitutes.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Nodes <code>785:48347</code>, <code>785:48345</code>, <code>371:32590</code>, <code>417:33753</code>; all exported without warnings.</p></div></details></div></details></article>
<article id="segment-demo"><h3>Segment</h3><p>Segmented Group composes source-sized Segmented Items; native radios own single-selection semantics.</p>${renderComponentDocumentation("segment")}<section><h4>Sizes and states</h4><div class="shlz-stack"><fieldset class="shlz-segment"><legend class="shlz-visually-hidden">Период</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period" checked><span class="shlz-segment__label">День</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period"><span class="shlz-segment__label">Неделя</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period"><span class="shlz-segment__label">Месяц</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period" disabled><span class="shlz-segment__label">Год</span></label></fieldset><fieldset class="shlz-segment shlz-segment--sm"><legend class="shlz-visually-hidden">Small</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="small" checked><span class="shlz-segment__label">A</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="small"><span class="shlz-segment__label">B</span></label></fieldset><fieldset class="shlz-segment shlz-segment--lg"><legend class="shlz-visually-hidden">Large with icons</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="large" checked><span class="shlz-segment__label"><img class="shlz-segment__icon" src="${showcaseIconUrl("user")}" alt="">Список</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="large"><span class="shlz-segment__label"><img class="shlz-segment__icon" src="${showcaseIconUrl("user")}" alt="">Карточки</span></label></fieldset></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: Group 6/6; Item 9/9.</p><p>Group axes: Size small/medium/large × Icon false/true. Outer heights 26/33/41 equal item heights 18/25/33 plus 4px shell inset. Group widths are content/composition-driven, not equal-distribution tokens.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Group <code>424:36756</code>: 319/377/419/477px widths. Item <code>424:36728</code>: Selected, Disabled and Size combinations; selected+disabled is absent. No extraction warnings.</p></div></details></div></details></article>
<article id="notification-demo"><h3>Notification</h3><p>384×58 feedback surface; Snackbar is the countdown family, not another visual size.</p>${renderComponentDocumentation("notification")}${notificationConsumerMarkup(showcaseIconUrl)}<section data-notification-visual-matrix><h4>Notification variants</h4><p data-shlz-visual-addition>Static visual matrix; controls illustrate source-backed appearance and are not wired.</p><div class="shlz-stack"><div class="shlz-notification" role="status"><span class="shlz-notification__icon" aria-hidden="true"><img src="${showcaseIconUrl("checkmark")}" alt=""></span><div class="shlz-notification__content"><p class="shlz-notification__title">Изменения сохранены</p></div><button class="shlz-notification__close" type="button" aria-label="Закрыть уведомление"><img src="${showcaseIconUrl("close")}" alt=""></button></div><div class="shlz-notification shlz-notification--danger" role="alert"><div class="shlz-notification__content"><p class="shlz-notification__title">Не удалось выполнить действие</p></div><button class="shlz-notification__action" type="button">Повторить</button></div></div></section><section data-notification-visual-matrix><h4>Snackbar countdown</h4><p data-shlz-visual-addition>Static visual matrix; countdown timing and controls are not wired.</p><div class="shlz-notification"><span class="shlz-notification__countdown" style="--shlz-progress:.6">3</span><div class="shlz-notification__content"><p class="shlz-notification__title">Отправка сообщения</p></div><button class="shlz-notification__close" type="button" aria-label="Закрыть snackbar"><img src="${showcaseIconUrl("close")}" alt=""></button></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Notification 3/3; Snackbar 6/6. Geometry remains 384×58 with radius 29.</p><p>Notification Type: Default/Error/With button. Snackbar Number: 5/4/3/2/1/0. Existing close/check placeholders were replaced by normalized icons; runtime timing remains UNKNOWN.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Notification <code>89:17043</code>; Snackbar <code>424:37565</code>. Nine exported variants, no extraction warnings.</p></div></details></div></details></article>
${overlayDemos}<article class="shlz-composition"><h3>Framework-free composition</h3><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Заголовок</span><input class="shlz-input" value="Пример композиции"></label><label class="shlz-field"><span class="shlz-field__label">Описание</span><textarea class="shlz-textarea"></textarea></label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" checked>Подтверждение</label><fieldset class="shlz-demo-fieldset"><legend>Вариант</legend><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition" checked>Первый</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition">Второй</label></fieldset><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch">Настройка</label><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Сохранить</button><button class="shlz-button">Отмена</button><span class="shlz-status shlz-status--green" data-component-audit-id="status-framework-composition">Готово</span></div></div></article></section>
<section><h2>Icons <span class="shlz-evidence" data-kind="FACT">FACT · normalized Basic Elements manifest</span></h2><p>${manifest.length} canonical logical icons. Compatibility aliases are shown as metadata and are not separate canonical icons.</p>${iconGroups}</section></section>
<section id="fidelity" class="shlz-major-section"><p class="shlz-section-kicker">C. VISUAL FIDELITY</p><h2>Raw SVG source vs production implementation</h2><p>Левая колонка генерируется непосредственно из raw SVG через документированный viewBox crop; правая использует production DOM, classes, CSS и tokens. Интерактивные behavior demos находятся в Implementation выше.</p>${fidelityMarkup}</section>
<article id="dropdown-scrollable-demo" data-shlz-dropdown-scrollable-fixture><h3>Dropdown · Items=Srollbar</h3><div class="shlz-dropdown" data-shlz-dropdown data-component-audit-id="dropdown-scrollable-stress"><button class="shlz-button shlz-dropdown__trigger" data-component-audit-id="button-dropdown-scrollable-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-scrollable-menu">Много действий</button><div class="shlz-dropdown__menu shlz-dropdown__menu--scrollable" id="showcase-scrollable-menu" role="menu" hidden><div class="shlz-dropdown__scroll-region">${Array.from({ length: 34 }, (_, index) => `<button class="shlz-dropdown__item" type="button" role="menuitem">${index + 1} menu item</button>`).join("")}</div><span class="shlz-dropdown__scrollbar" aria-hidden="true"></span></div></div></article><article id="tooltip-stress-demo"><h3>Tooltip · content stress</h3><div class="shlz-popover-edge"><button class="shlz-button" data-component-audit-id="button-tooltip-stress-trigger" type="button" data-shlz-tooltip-trigger="tooltip-edge-stress" data-shlz-tooltip-placement="right" data-shlz-tooltip-open-delay="0">Tooltip edge stress</button><div class="shlz-tooltip shlz-tooltip--multiline" id="tooltip-edge-stress" role="tooltip" data-shlz-tooltip data-component-audit-id="tooltip-edge-stress" hidden>Длинный текст подсказки проверяет перенос у края viewport.<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div></article>${typographyCompatibilityMarkup}
${consumerWorkspaceMarkup(showcaseIconUrl, composerConsumerMarkup)}
${datePickerShowcaseMarkup}
${datePickerConsumerMarkup}
${calendarGridShowcaseMarkup}
${plannerScheduleShowcaseMarkup}`;
app.insertAdjacentHTML("beforeend", fileUploadShowcaseMarkup);
app.insertAdjacentHTML("beforeend", composerShowcaseMarkup);
app.insertAdjacentHTML("beforeend", cardCompositionsMarkup);
app.insertAdjacentHTML("beforeend", messagingHistoryShowcaseMarkup);

const componentAuditRoots = [
  ["#table-demo .shlz-table", "table-showcase-mixed"],
  ["#popover-value", "input-popover-value"],
  ["#modal-autofocus", "input-modal-autofocus"],
  ["#showcase-drawer input[autofocus]", "input-drawer-parameter"],
  [".shlz-composition .shlz-input", "input-framework-composition"],
  ["#typography-compatibility .shlz-input", "input-typography-stress"],
  [".shlz-composition .shlz-textarea", "textarea-framework-composition"],
  [
    "#table-demo .shlz-checkbox[aria-label='Select all rows']",
    "checkbox-table-select-all",
  ],
  [
    "#table-demo .shlz-checkbox[aria-label='Select Alpha']",
    "checkbox-table-alpha",
  ],
  [
    "#table-demo .shlz-checkbox[aria-label='Select Beta']",
    "checkbox-table-beta",
  ],
  [".shlz-composition .shlz-checkbox", "checkbox-framework-composition"],
  [".shlz-composition .shlz-switch__input", "switch-framework-composition"],
  ["#button-demo", "button-showcase-contract"],
  ["#input-demo .shlz-api-size-switch", "button-input-size-switch"],
  ["#table-demo", "button-table-actions"],
  ["#dropdown-demo", "button-dropdown-triggers"],
  ["#popover-demo", "button-popover-actions"],
  ["#tooltip-demo", "button-tooltip-triggers"],
  ["[data-notification-consumer]", "button-notification-consumer"],
  ["#modal-demo", "button-modal-actions"],
  ["#drawer-demo", "button-drawer-actions"],
  [".shlz-composition", "button-framework-composition"],
  [
    "#typography-compatibility .shlz-type-stress__samples > .shlz-cluster",
    "button-typography-stress",
  ],
  ["#typography-compatibility .shlz-table-wrap", "button-typography-table"],
  [
    "[data-consumer-workspace] .shlz-consumer-workspace__toolbar",
    "button-workspace-filter-trigger",
  ],
  [
    "[data-consumer-workspace] [data-workspace-bulk]",
    "button-workspace-bulk-clear",
  ],
  [
    "[data-consumer-workspace] [data-workspace-empty] .shlz-empty-state__actions",
    "button-workspace-empty-reset",
  ],
  [
    "#consumer-validation .shlz-drawer__footer",
    "button-workspace-drawer-actions",
  ],
  ["#empty-state-demo", "button-empty-state-actions"],
  ["#link-demo", "link-showcase-contract"],
  [
    "[data-consumer-workspace] [data-workspace-body]",
    "link-workspace-request-navigation",
  ],
  ["#segment-demo", "segment-showcase-choice"],
  ["#tabs-demo", "tabs-showcase-contract"],
  ["#typography-compatibility .shlz-tabs", "tabs-typography-stress"],
  ["#pagination-demo", "pagination-showcase-and-consumer"],
  [
    "#typography-compatibility .shlz-pagination",
    "pagination-typography-stress",
  ],
];
for (const [selector, auditId] of componentAuditRoots) {
  const element = document.querySelector(selector);
  if (element) element.dataset.componentAuditId = auditId;
}

for (const textarea of document.querySelectorAll(
  "#textarea-demo > section:has(h4) .shlz-textarea",
)) {
  const sectionLabel = textarea
    .closest("section")
    ?.querySelector("h5")?.textContent;
  const state = {
    Default: "default",
    Hover: "visual-hover",
    Focused: "visual-focus",
    Error: "error",
    Disabled: "disabled",
  }[sectionLabel];
  const auditId = state
    ? `textarea-${state}-${textarea.value ? "filled" : "empty"}`
    : textarea.closest("section")?.querySelector("h4")?.textContent ===
        "Counter"
      ? "textarea-counter"
      : null;
  if (!auditId) continue;
  textarea.dataset.componentAuditId = auditId;
  const message = textarea
    .closest("label")
    ?.querySelector(".shlz-field__message");
  if (message) {
    message.id = `${auditId}-message`;
    textarea.setAttribute("aria-describedby", message.id);
  }
}

const checkboxAuditIds = {
  "checkbox default": "checkbox-medium-default",
  "checkbox checked": "checkbox-medium-checked",
  "checkbox mixed": "checkbox-medium-mixed",
  "checkbox checked-disabled": "checkbox-medium-disabled",
};
for (const checkbox of document.querySelectorAll(
  "#checkbox-demo > section:has(> h4) .shlz-checkbox--sm",
)) {
  if (
    checkbox.closest("section")?.querySelector(":scope > h4")?.textContent !==
    "Medium"
  )
    continue;
  const auditId = checkboxAuditIds[checkbox.getAttribute("aria-label")];
  if (auditId) checkbox.dataset.componentAuditId = auditId;
}

for (const radio of document.querySelectorAll(
  ".shlz-composition .shlz-radio",
)) {
  const label = radio.closest("label")?.textContent.trim();
  if (label === "Первый")
    radio.dataset.componentAuditId = "radio-framework-primary";
  if (label === "Второй")
    radio.dataset.componentAuditId = "radio-framework-secondary";
}

for (const toggle of document.querySelectorAll(
  "#switch-demo section:has(> h4) .shlz-switch__input",
)) {
  if (
    toggle.closest("section")?.querySelector(":scope > h4")?.textContent !==
    "With label"
  )
    continue;
  toggle.dataset.componentAuditId = toggle.disabled
    ? "switch-labelled-disabled"
    : "switch-labelled-on";
}

for (const checkbox of document.querySelectorAll("[data-shlz-indeterminate]")) {
  checkbox.indeterminate = true;
}

for (const control of document.querySelectorAll('[name="shlz-font-profile"]')) {
  control.addEventListener("change", () => {
    document.body.dataset.shlzFont = control.value;
    window.localStorage.setItem("shlz-font-profile", control.value);
  });
}
const savedFontProfile = window.localStorage.getItem("shlz-font-profile");
if (savedFontProfile === "fira") {
  document.body.dataset.shlzFont = savedFontProfile;
  document.querySelector('[name="shlz-font-profile"][value="fira"]').checked =
    true;
}

document
  .querySelector("#tabs-demo > h3")
  ?.insertAdjacentHTML("afterend", renderComponentDocumentation("tabs"));

const modalAutofocus = document.querySelector("#modal-autofocus");
const modalInputControl = document.createElement("span");
modalInputControl.className = "shlz-field__control";
modalAutofocus.before(modalInputControl);
modalInputControl.append(modalAutofocus);

const drawerAutofocus = document.querySelector(
  "#showcase-drawer input[autofocus]",
);
const drawerInputControl = document.createElement("span");
drawerInputControl.className = "shlz-field__control";
drawerAutofocus.before(drawerInputControl);
drawerInputControl.append(drawerAutofocus);

document
  .querySelector("#showcase-confirm .shlz-modal__surface")
  ?.classList.add("shlz-modal__surface--compact", "shlz-modal__surface--info");
document
  .querySelector("#modal-demo")
  ?.insertAdjacentHTML(
    "beforeend",
    ["success", "warning", "error"]
      .map(
        (state) =>
          `<button class="shlz-button shlz-button--sm shlz-wave7-material-trigger" type="button" tabindex="-1" data-shlz-modal-trigger="showcase-${state}">${state}</button><dialog class="shlz-modal shlz-modal--compact" id="showcase-${state}" data-shlz-modal data-component-audit-id="modal-showcase-${state}" aria-labelledby="showcase-${state}-title"><div class="shlz-modal__surface shlz-modal__surface--compact shlz-modal__surface--${state}"><div class="shlz-modal__compact-content"><span class="shlz-modal__variant-icon" aria-hidden="true">i</span><div class="shlz-modal__compact-copy"><h2 id="showcase-${state}-title">${state}</h2><p>Some contents...</p></div></div><div class="shlz-modal__compact-actions"><button class="shlz-button shlz-button--sm" type="button" data-shlz-modal-close>Cancel</button><button class="shlz-button shlz-button--primary shlz-button--sm" type="button" data-shlz-modal-close="done">Done</button></div></div></dialog>`,
      )
      .join(""),
  );

for (const button of document.querySelectorAll("[data-shlz-input-size]")) {
  button.addEventListener("click", () => {
    const selectedSize = button.dataset.shlzInputSize;
    for (const sizeButton of document.querySelectorAll(
      "[data-shlz-input-size]",
    )) {
      const selected = sizeButton === button;
      sizeButton.setAttribute("aria-pressed", String(selected));
      sizeButton.classList.toggle("shlz-button--primary", selected);
    }
    for (const panel of document.querySelectorAll(
      "[data-shlz-input-size-panel]",
    )) {
      panel.hidden = panel.dataset.shlzInputSizePanel !== selectedSize;
    }
  });
}
window.__shlzEnhanceDropdowns = enhanceDropdowns;
window.__shlzDropdownControllers = enhanceDropdowns();
window.__shlzSelectControllers = enhanceSelects();
window.__shlzEnhanceSelects = enhanceSelects;
window.__shlzModalControllers = enhanceModals();
window.__shlzEnhanceModals = enhanceModals;
window.__shlzDrawerControllers = enhanceDrawers();
window.__shlzEnhanceDrawers = enhanceDrawers;
window.__shlzPopoverControllers = enhancePopovers();
window.__shlzTooltipControllers = enhanceTooltips();
window.__shlzEnhancePopovers = enhancePopovers;
window.__shlzEnhanceTooltips = enhanceTooltips;
window.__shlzEnhanceTabs = enhanceTabs;
window.__shlzTabsControllers = enhanceTabs();
window.__shlzConsumerWorkspace = enhanceConsumerWorkspace();
window.__shlzDatePickerShowcaseControllers = enhanceDatePickerShowcase();
window.__shlzDatePickerConsumer = enhanceDatePickerConsumer();
window.__shlzCalendarGridControllers = enhanceCalendarGridShowcase();
enhancePlannerScheduleShowcase();
enhanceMessagingHistoryShowcase();
window.__shlzEnhanceCalendarGrids = enhanceCalendarGrids;
window.__shlzFileUploadControllers = enhanceFileUploadShowcase();
enhanceComposerShowcase();
window.__shlzEnhanceFileUploads = enhanceFileUploads;
window.__shlzEnhanceNotificationConsumer = enhanceNotificationConsumer;
enhanceNotificationConsumer();

const notificationVisualMatrices = [
  ...document.querySelectorAll(
    "#notification-demo [data-notification-visual-matrix]",
  ),
];
for (const matrix of notificationVisualMatrices) matrix.inert = true;
notificationVisualMatrices[1]
  ?.querySelector(".shlz-notification")
  ?.classList.add("shlz-snackbar");

document
  .querySelector("[data-component-audit-id='person-tag-content-stress']")
  ?.setAttribute("data-shlz-visual-addition", "");
document
  .querySelector(
    "[data-component-audit-id='person-tag-content-stress'] .shlz-avatar",
  )
  ?.setAttribute("data-component-audit-id", "avatar-person-tag-stress");

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-person-tag-remove]");
  if (!remove) return;
  remove.closest("[data-person-tag-consumer]")?.remove();
});

const foundations = document.querySelector("#implementation");
const dangerNotification = document.querySelector(
  "#notification-demo [data-notification-visual-matrix] .shlz-notification--danger",
);
dangerNotification.insertAdjacentHTML(
  "afterbegin",
  `<span class="shlz-notification__icon" aria-hidden="true"><img src="${showcaseIconUrl("checkmark")}" alt=""></span>`,
);
const iconSection = document.querySelector("#components + section");
const iconCatalog = document.createElement("details");
iconCatalog.className = "shlz-icon-catalog";
iconCatalog.innerHTML = `<summary>Icon catalog · ${manifest.length} canonical icons</summary>`;
iconSection.before(iconCatalog);
iconCatalog.append(iconSection);
const sourceSpecification = document.querySelector("#source-spec");
const sourceEvidenceDetails = document.createElement("details");
sourceEvidenceDetails.className = "shlz-foundation-evidence";
sourceEvidenceDetails.innerHTML =
  "<summary>Source specification and foundation evidence</summary>";
sourceEvidenceDetails.append(sourceSpecification);
foundations.append(sourceEvidenceDetails);
const foundationsAnchor = document.createElement("span");
foundationsAnchor.id = "foundations";
foundationsAnchor.className = "shlz-docs-anchor";
foundations.before(foundationsAnchor);

const fidelity = document.querySelector("#fidelity");
const verificationDetails = document.createElement("details");
verificationDetails.className = "shlz-verification-harness";
verificationDetails.innerHTML =
  "<summary>Verification harness · Source ↔ Implementation</summary>";
fidelity.before(verificationDetails);
verificationDetails.append(fidelity);

// An external SVG loaded through <img> owns a separate CSS tree and therefore
// cannot inherit currentColor. Upgrade only manifest-classified monochrome
// assets to sprite-backed inline SVG; preserved-paint assets remain <img>.
const monochromeIconNames = new Set([
  ...manifest
    .filter(({ colorMode }) => colorMode === "currentColor")
    .map(({ name }) => name),
  ...compatibilityAliases
    .filter(({ colorMode }) => colorMode === "currentColor")
    .map(({ alias }) => alias),
]);
const monochromeIconUrls = new Map(
  Object.entries(iconUrls)
    .map(([source, url]) => [
      new window.URL(url, document.baseURI).pathname,
      source
        .split("/")
        .pop()
        .replace(/\.svg$/, ""),
    ])
    .filter(([, name]) => monochromeIconNames.has(name)),
);
for (const image of document.querySelectorAll("img[src]")) {
  const name = monochromeIconUrls.get(new window.URL(image.src).pathname);
  if (!name) continue;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", `shlz-icon ${image.className}`.trim());
  svg.setAttribute("viewBox", iconViewBox(name));
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  if (image.alt) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", image.alt);
  } else {
    svg.setAttribute("aria-hidden", "true");
  }
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", iconHref(spriteUrl, name));
  svg.append(use);
  image.replaceWith(svg);
}

const legacyTargets = new Map([
  ["button", "button-demo"],
  ["input", "input-demo"],
  ["textarea", "textarea-demo"],
  ["select", "select-demo"],
  ["checkbox", "checkbox-demo"],
  ["radio", "radio-demo"],
  ["switch", "switch-demo"],
  ["status", "status-demo"],
  ["badge", "badge-demo"],
  ["tabs", "tabs-demo"],
  ["pagination", "pagination-demo"],
  ["tag", "tag-demo"],
  ["person-tag", "tag-demo"],
  ["segment", "segment-demo"],
  ["notification", "notification-demo"],
  ["dropdown", "dropdown-demo"],
]);

for (const [id, targetId] of legacyTargets) {
  const target = document.querySelector(`#${targetId}`);
  const anchor = document.createElement("span");
  anchor.id = id;
  anchor.className = "shlz-docs-anchor";
  target.before(anchor);
}

for (const [id, selector] of [
  ["colors", ".shlz-source-sheet:nth-of-type(1)"],
  ["spacing", ".shlz-source-sheet--split"],
  ["typography", ".shlz-type-sample"],
  ["geometry", ".shlz-foundation-table:last-of-type"],
]) {
  const target = sourceSpecification.querySelector(selector);
  const anchor = document.createElement("span");
  anchor.id = id;
  anchor.className = "shlz-docs-anchor";
  target.before(anchor);
}

const shell = document.createElement("div");
shell.className = "shlz-docs-shell";
shell.dataset.componentAuditId = "sidebar-application-shell-showcase";
const sidebar = document.createElement("aside");
sidebar.className = "shlz-docs-sidebar";
sidebar.setAttribute("aria-label", "Showcase navigation");
sidebar.innerHTML = `<div class="shlz-docs-sidebar__header"><a class="shlz-docs-home" href="#top"><span class="shlz-docs-home__mark" aria-hidden="true"><img class="shlz-docs-home__mark-source" src="${sidebarSourceUrl}" alt=""></span><span class="shlz-docs-home__label">SHLZ UI</span></a><button class="shlz-docs-sidebar__toggle" type="button" aria-pressed="false" aria-label="Use compact showcase navigation" data-shlz-sidebar-toggle><span aria-hidden="true">‹</span></button></div><nav id="showcase-navigation" aria-label="Components and foundations">${navigationMarkup}</nav>`;
const content = document.createElement("div");
content.className = "shlz-docs-content";
const topAnchor = document.createElement("span");
topAnchor.id = "top";
content.append(topAnchor, ...app.childNodes);
shell.append(sidebar, content);
app.append(shell);

const sidebarToggle = sidebar.querySelector("[data-shlz-sidebar-toggle]");
const setSidebarOpen = (open) => {
  shell.classList.toggle("shlz-docs-shell--closed", !open);
  sidebarToggle.setAttribute("aria-pressed", String(!open));
  sidebarToggle.setAttribute(
    "aria-label",
    open
      ? "Use compact showcase navigation"
      : "Use expanded showcase navigation",
  );
  sidebarToggle.querySelector("[aria-hidden]").textContent = open ? "‹" : "›";
};
sidebarToggle.addEventListener("click", () =>
  setSidebarOpen(sidebarToggle.getAttribute("aria-pressed") === "true"),
);

const revealHashTarget = () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;
  for (const details of target.closest("details")
    ? [target.closest("details")]
    : []) {
    details.open = true;
  }
  window.requestAnimationFrame(() => target.scrollIntoView());
  for (const link of document.querySelectorAll("[data-shlz-docs-link]")) {
    const active = link.hash === window.location.hash;
    link.classList.toggle("shlz-docs-nav__link--active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
};
window.addEventListener("hashchange", revealHashTarget);
revealHashTarget();

const navLinks = [...document.querySelectorAll("[data-shlz-docs-link]")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);
const setActiveLink = (id) => {
  for (const link of navLinks) {
    const active = link.hash === `#${id}`;
    link.classList.toggle("shlz-docs-nav__link--active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
};
const sectionObserver = new window.IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter(({ isIntersecting }) => isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveLink(visible.target.id);
  },
  { rootMargin: "-15% 0px -70%", threshold: [0, 0.1, 0.5] },
);
for (const section of observedSections) sectionObserver.observe(section);
