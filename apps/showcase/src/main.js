import "@shlz/styles";
import "./showcase.css";
import { fidelityMarkup, primaryComponentMarkup } from "./fidelity.js";
import { wave3Markup } from "./wave3.js";
import { contentStatesMarkup } from "./content-states.js";
import tokens from "@shlz/tokens/tokens.json";
import provenance from "@shlz/tokens/provenance.json";
import manifest from "@shlz/icons/manifest.json";
import compatibilityAliases from "@shlz/icons/compatibility-aliases.json";
import { iconHref, iconViewBox } from "@shlz/icons";
import spriteUrl from "@shlz/icons/sprite.svg?url";
import {
  enhanceDrawers,
  enhanceDropdowns,
  enhanceModals,
  enhancePopovers,
  enhanceTabs,
  enhanceTooltips,
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
    ],
  ],
];
const navigationMarkup = navigationGroups
  .map(
    ([label, links]) =>
      `<div class="shlz-docs-nav__group"><h2>${label}</h2>${links.map(([id, title]) => `<a href="#${id}" data-shlz-docs-link>${title}</a>`).join("")}</div>`,
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
<dialog class="shlz-modal" id="showcase-modal" data-shlz-modal data-shlz-modal-backdrop-close aria-labelledby="showcase-modal-title"><div class="shlz-modal__surface"><header class="shlz-modal__header"><h2 class="shlz-modal__title" id="showcase-modal-title">Заголовок Modal</h2><button class="shlz-modal__close" type="button" data-shlz-modal-close aria-label="Закрыть">×</button></header><div class="shlz-modal__body"><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Название</span><input class="shlz-input" id="modal-autofocus" autofocus value="Native dialog"></label><p>Body прокручивается независимо от header и footer. Ниже проверяются floating-компоненты внутри top layer.</p><div class="shlz-cluster"><div class="shlz-dropdown" data-shlz-dropdown><button class="shlz-button shlz-button--sm" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="modal-menu">Dropdown внутри Modal</button><div class="shlz-dropdown__menu" id="modal-menu" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem">Первый пункт</button><button class="shlz-dropdown__item" type="button" role="menuitem">Второй пункт</button></div></div><button class="shlz-button shlz-button--sm" type="button" data-shlz-tooltip-trigger="modal-tooltip" data-shlz-tooltip-open-delay="0">Tooltip внутри Modal</button><div class="shlz-tooltip" id="modal-tooltip" role="tooltip" data-shlz-tooltip hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div><button class="shlz-button shlz-button--sm" type="button" aria-expanded="false" aria-controls="modal-popover" data-shlz-popover-trigger="modal-popover" data-shlz-popover-placement="bottom">Popover внутри Modal</button><div class="shlz-popover" id="modal-popover" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Вложенный Popover</div><div class="shlz-popover__body">Escape сначала закрывает floating surface.</div></div></div><div class="shlz-modal-long-content" data-modal-long-content>${modalLongContent}</div></div></div><footer class="shlz-modal__footer"><button class="shlz-button" type="button" data-shlz-modal-close>Отмена</button><button class="shlz-button shlz-button--primary" type="button" data-shlz-modal-close="save">Сохранить</button></footer></div></dialog>
<dialog class="shlz-modal shlz-modal--compact" id="showcase-confirm" data-shlz-modal aria-labelledby="showcase-confirm-title"><form class="shlz-modal__surface" method="dialog"><div class="shlz-modal__body"><h2 class="shlz-modal__title" id="showcase-confirm-title">Подтвердить действие?</h2><p>Для confirm/cancel доступна нативная форма <code>method=&quot;dialog&quot;</code>.</p></div><footer class="shlz-modal__footer"><button class="shlz-button" value="cancel">Отмена</button><button class="shlz-button shlz-button--primary" value="confirm">Подтвердить</button></footer></form></dialog></article>
<article id="drawer-demo"><h3>Drawer</h3><p><code>Drawer.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 420×900, 64/764/72 regions</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · modal right-side native dialog</span></p><button class="shlz-button shlz-button--primary" type="button" data-shlz-drawer-trigger="showcase-drawer">Открыть Drawer</button><dialog class="shlz-drawer" id="showcase-drawer" data-shlz-drawer data-shlz-drawer-backdrop-close aria-labelledby="showcase-drawer-title"><div class="shlz-drawer__surface"><header class="shlz-drawer__header"><h2 class="shlz-drawer__title" id="showcase-drawer-title">Заголовок Drawer</h2><button class="shlz-drawer__close" type="button" data-shlz-drawer-close aria-label="Закрыть">×</button></header><div class="shlz-drawer__body" data-drawer-scroll><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Параметр</span><input class="shlz-input" autofocus></label><p>Drawer использует ту же native modal lifecycle, но независимую source-derived geometry.</p>${drawerLongContent}</div></div><footer class="shlz-drawer__footer"><button class="shlz-button" type="button" data-shlz-drawer-close>Отмена</button><button class="shlz-button shlz-button--primary" type="button" data-shlz-drawer-close="apply">Применить</button></footer></div></dialog></article>`;

app.innerHTML = `<header class="shlz-hero"><p>SHLZ UI · component library</p><h1>Components and foundations</h1><p>Production contracts and examples, with source verification available on demand.</p></header>
<section id="source-spec" class="shlz-major-section"><p class="shlz-section-kicker">A. SOURCE SPEC</p><h2>Буквальная спецификация Figma ${sourceEvidence}</h2><p><code>Colors.svg</code>, <code>Spacing.svg</code> и human-verified Corner radius source. Имена, группы и значения не нормализованы в искусственные шкалы.</p>
<div class="shlz-source-sheet"><h2>Colors</h2><div class="shlz-source-palette">${colors}</div></div>
<div class="shlz-source-sheet shlz-source-sheet--split"><div><h2>Spacing</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Literal named source values.</p><div class="shlz-stack">${spaces}</div></div><div><h2>Corner radius</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Source labels, not a universal component mapping.</p><div class="shlz-radius-grid">${radii}</div></div></div>
<div class="shlz-source-sheet"><h2>Typography evidence</h2><p class="shlz-type-sample">Аа Бб 0123 — Golos Text</p><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Two Figma Plugin API page exports contain 2,193 text nodes. Golos Text Regular, Medium and SemiBold dominates concrete product paths. The table lists every distinct product-candidate metric, not a semantic scale.</p><div class="shlz-table-wrap"><table class="shlz-foundation-table"><thead><tr><th>Source family/style</th><th>Size / line height</th><th>Letter spacing</th></tr></thead><tbody>${typographyFacts}</tbody></table></div><details><summary>Diagnostics and excluded typography</summary><p>Basic elements: 1,480 nodes / 29 signatures; Interface elements: 713 nodes / 19 signatures; 12 signatures occur across both pages. <span class="shlz-evidence" data-kind="LEGACY">LEGACY</span> Roboto, Suisse Intl and SF Pro Display occur in foreign/older artifacts. <span class="shlz-evidence" data-kind="LEGACY">LEGACY</span> Inter belongs to embedded asset typography. Cover/specification headings and one local override are documentation or outliers. <span class="shlz-evidence" data-kind="UNKNOWN">UNKNOWN</span> Figma provides no authoritative Body/Heading/Caption taxonomy. Full evidence: <code>design-source-index/typography.json</code>.</p></details></div>
<div class="shlz-source-sheet"><h2>Component geometry evidence</h2><p><span class="shlz-evidence" data-kind="FACT">FACT</span> Measurements belong to component families; shared numbers do not prove a global size scale.</p><div class="shlz-table-wrap"><table class="shlz-foundation-table"><thead><tr><th>Family</th><th>Confirmed size</th><th>Radius / form</th></tr></thead><tbody>${geometryFacts}</tbody></table></div></div></section>
<section id="implementation" class="shlz-major-section"><p class="shlz-section-kicker">B. PRODUCTION LIBRARY</p><h2>Engineering abstractions</h2><section><h3>Production typography ${semanticEvidence}</h3><p>The runtime family alias is <code>"Golos Text", system-ui, …, sans-serif</code>. Golos Text is a source fact; this ordered fallback is a decision because no font files, package or <code>@font-face</code> exist in the repository. Components define only source-supported local metrics; SHLZ UI does not invent a named type scale.</p></section><section><h3>Semantic color aliases ${semanticEvidence}</h3><p>Every role below is an <strong>ENGINEERING DECISION</strong> mapped to a literal source color, not a Figma taxonomy. They are retained because production components consume them.</p><div class="shlz-cluster"><div class="shlz-demo-surface">surface.base / text.primary</div><div class="shlz-demo-action">action.primary</div><div class="shlz-demo-status">status.success</div><div class="shlz-demo-danger">status.danger</div></div></section><section><h3>Geometry contract</h3><p><span class="shlz-evidence" data-kind="DECISION">DECISION</span> The legacy 32/40 helper aliases remain for existing consumers, but are not presented as a universal control scale. Production components own their source-backed geometry shown above. Component radii 4, 6, 8, 15, 16 and 20px are not automatically aliases of Min/Regular/Medium/Large/Max.</p></section>
<section id="components"><h2>Components <span class="shlz-evidence" data-kind="FACT">FACT · component sheets</span></h2>
${primaryComponentMarkup}
${wave3Markup(showcaseIconUrl)}
${contentStatesMarkup(showcaseIconUrl, sourceReferenceUrl)}
<article id="dropdown-demo"><h3>Dropdown</h3><p>Menu-only family, separate from migrated Select: 200/216px surfaces composed from extracted Menu item variants.</p><section><h4>Default and search</h4><div class="shlz-cluster"><div class="shlz-dropdown" data-shlz-dropdown><button class="shlz-button shlz-dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-actions">Действия</button><div class="shlz-dropdown__menu" id="showcase-actions" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem"><span class="shlz-dropdown__icon" aria-hidden="true"><img src="${showcaseIconUrl("user")}" alt=""></span>Создать</button><button class="shlz-dropdown__item" type="button" role="menuitem" aria-current="true"><span class="shlz-dropdown__icon" aria-hidden="true"><img src="${showcaseIconUrl("checkmark")}" alt=""></span>Selected</button><button class="shlz-dropdown__item shlz-dropdown__item--visual-highlight" type="button" role="menuitem">Hover</button><button class="shlz-dropdown__item" type="button" role="menuitem" disabled>Недоступно</button><button class="shlz-dropdown__item" type="button" role="menuitem">Длинный пункт меню для проверки ширины</button></div></div><div class="shlz-dropdown" data-shlz-dropdown><button class="shlz-button shlz-button--primary shlz-dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-search-actions">Поиск</button><div class="shlz-dropdown__menu" id="showcase-search-actions" role="menu" hidden><input class="shlz-dropdown__search" aria-label="Поиск в меню" placeholder="Поиск"><button class="shlz-dropdown__item" type="button" role="menuitem">Результат 1</button><button class="shlz-dropdown__item" type="button" role="menuitem">Результат 2</button></div></div></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Menu item 16/16; Dropdown 10/10; dropdown-btns 2/2.</p><p>Menu item axes: Type Text/Switch/Checkbox/Status/Avatar and State Default/Hover/Selected/Default red. Menus cover item counts 2–8, source-spelled Srollbar, Status and Search. Trigger variants are Default/Search at 200×36. Select <code>36:1106</code> is explicitly excluded.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p><code>43:769</code>: 16 rows, normally 200×40; Switch rows 180×35. <code>45:1204</code>: 10 menus, 200/216px wide and 100–352px high. <code>110:15065</code>: 2 triggers. No extraction warnings.</p></div></details></div></details></article>
<article id="popover-demo"><h3>Popover</h3><p><code>Popover.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 236×90, radius 12, four sides</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · 8px offset, flip/shift</span></p><div class="shlz-popover-lab">
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-bottom" data-shlz-popover-trigger="popover-bottom" data-shlz-popover-placement="bottom">Bottom</button><div class="shlz-popover" id="popover-bottom" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-bottom-title">Заголовок</div><div class="shlz-popover__body">Длинный content переносится, не меняя публичный контракт.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-top" data-shlz-popover-trigger="popover-top" data-shlz-popover-placement="top">Top</button><div class="shlz-popover" id="popover-top" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Сверху</div><div class="shlz-popover__body">Предпочтительная сторона сохраняется, пока хватает места.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-left" data-shlz-popover-trigger="popover-left" data-shlz-popover-placement="left">Left</button><div class="shlz-popover" id="popover-left" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Слева</div><div class="shlz-popover__body">Floating surface</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-right" data-shlz-popover-trigger="popover-right" data-shlz-popover-placement="right">Right</button><div class="shlz-popover" id="popover-right" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Справа</div><div class="shlz-popover__body">Floating surface</div></div></div>
</div><div class="shlz-popover-scenarios"><div><button class="shlz-button shlz-button--primary" type="button" aria-expanded="false" aria-controls="popover-interactive" data-shlz-popover-trigger="popover-interactive" data-shlz-popover-placement="bottom-start">Interactive content</button><div class="shlz-popover" id="popover-interactive" data-shlz-popover hidden aria-labelledby="popover-interactive-title"><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-interactive-title">Настройки</div><div class="shlz-popover__body shlz-stack"><label class="shlz-field" for="popover-value"><span class="shlz-field__label">Значение</span><input class="shlz-input shlz-input--sm" id="popover-value"></label><button class="shlz-button shlz-button--sm" type="button" data-shlz-popover-close>Готово</button></div></div></div>
<div class="shlz-popover-edge"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-edge" data-shlz-popover-trigger="popover-edge" data-shlz-popover-placement="right">Около края</button><div class="shlz-popover" id="popover-edge" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Collision</div><div class="shlz-popover__body">Панель остаётся во viewport.</div></div></div></div>
<div class="shlz-popover-scroll" data-popover-scroll><div class="shlz-popover-scroll__content"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-scroll" data-shlz-popover-trigger="popover-scroll" data-shlz-popover-placement="bottom">Scroll anchor</button><div class="shlz-popover" id="popover-scroll" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Scroll</div><div class="shlz-popover__body">Позиция следует за trigger.</div></div></div></div></article>
<article id="tooltip-demo"><h3>Tooltip</h3><p><code>Tooltip.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 100×37, radius 8, 8 placements</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · hover/focus, configurable delay</span></p><div class="shlz-floating-lab">
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-top" data-shlz-tooltip-placement="top" data-shlz-tooltip-open-delay="0">Tooltip top</button><div class="shlz-tooltip" id="tooltip-top" role="tooltip" data-shlz-tooltip hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-bottom-start" data-shlz-tooltip-placement="bottom-start" data-shlz-tooltip-open-delay="0">Tooltip bottom start</button><div class="shlz-tooltip" id="tooltip-bottom-start" role="tooltip" data-shlz-tooltip hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-left" data-shlz-tooltip-placement="left" data-shlz-tooltip-open-delay="0">Tooltip left</button><div class="shlz-tooltip" id="tooltip-left" role="tooltip" data-shlz-tooltip hidden>Подсказка<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
<div><button class="shlz-button" type="button" data-shlz-tooltip-trigger="tooltip-right" data-shlz-tooltip-placement="right" data-shlz-tooltip-open-delay="0">Tooltip right</button><div class="shlz-tooltip" id="tooltip-right" role="tooltip" data-shlz-tooltip hidden>Длинный текст подсказки проверяет перенос у края viewport.<span class="shlz-tooltip__arrow" aria-hidden="true"></span></div></div>
</div></article>
<article id="tabs-demo"><h3>Tabs</h3><p>Переключает связанные панели. Три отдельные source families: underline 61px, pill 40px и boxed 39px.</p><section><h4>Types and states</h4><div class="shlz-component-grid"><div class="shlz-tabs" data-shlz-tabs><div class="shlz-tabs__list" role="tablist" aria-label="Разделы"><button class="shlz-tabs__tab" id="tab-one" type="button" role="tab" aria-selected="true" aria-controls="panel-one">Первый</button><button class="shlz-tabs__tab shlz-tabs__tab--visual-hover" id="tab-two" type="button" role="tab" aria-selected="false" aria-controls="panel-two">Второй</button><button class="shlz-tabs__tab" type="button" role="tab" aria-disabled="true">Disabled</button></div><div class="shlz-tabs__panel" id="panel-one" role="tabpanel" aria-labelledby="tab-one">Содержимое первой панели</div><div class="shlz-tabs__panel" id="panel-two" role="tabpanel" aria-labelledby="tab-two" hidden>Содержимое второй панели.</div></div><div class="shlz-tabs shlz-tabs--pill"><div class="shlz-tabs__list" role="tablist" aria-label="Pill tabs"><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="true">Selected</button><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="false">Default</button></div></div><div class="shlz-tabs shlz-tabs--boxed"><div class="shlz-tabs__list" role="tablist" aria-label="Boxed tabs"><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="true">Selected</button><button class="shlz-tabs__tab" type="button" role="tab" aria-selected="false">Default</button></div></div></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: 14/14 variants across Component Sets <code>52:3213</code>, <code>58:5374</code>, <code>185:15928</code>, plus standalone group <code>52:3256</code>.</p><p>Axes are preserved verbatim: State for underline/pill; Select × State for boxed. No icon property exists. Widths vary by content in source.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Underline: 4 variants, 116–117×61. Pill: 4 variants, 68×40. Boxed: 6 variants, 74–75×39. No extraction warnings or source errors.</p></div></details></div></details></article>
<article id="pagination-demo"><h3>Pagination</h3><p>Навигационная composition из отдельного 40×40 primitive <code>Pagination Btn</code>.</p><section><h4>Composition and states</h4><nav class="shlz-pagination" aria-label="Пагинация примера"><ul class="shlz-pagination__list"><li><span class="shlz-pagination__item shlz-pagination__item--disabled" aria-disabled="true"><img class="shlz-pagination__icon" src="${showcaseIconUrl("arrow-left-md")}" alt=""></span></li><li><a class="shlz-pagination__item" href="#page-1" aria-current="page">1</a></li><li><a class="shlz-pagination__item shlz-pagination__item--visual-hover" href="#page-2">2</a></li><li><a class="shlz-pagination__item" href="#page-3">3</a></li><li><span class="shlz-pagination__item shlz-pagination__item--ellipsis" aria-hidden="true">…</span></li><li><a class="shlz-pagination__item" href="#page-8">8</a></li><li><a class="shlz-pagination__item" href="#page-2" aria-label="Следующая страница"><img class="shlz-pagination__icon" src="${showcaseIconUrl("arrow-right-md")}" alt=""></a></li></ul></nav></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: 20/20 variants in Component Set <code>46:999</code>; standalone Pagination composition <code>49:1377</code> is 320×40.</p><p>Primitive axes: Type = Prev / Next / Number / Ellipsis Prev / Ellipsis Next; State = Default / Hover / Pressed / Disabled. All nodes are 40×40. Arrow glyph substitutes were replaced by normalized source icons.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>20 exported variants, no warnings or errors. Ellipsis Disabled variants are absent from source and are not claimed.</p></div></details></div></details></article>
<article id="tag-demo"><h3>Tag</h3><p>Tag and Person tag are separate source families that share only their 30px shell.</p><section><h4>Tag</h4><div class="shlz-cluster"><span class="shlz-tag">Filled</span><span class="shlz-tag shlz-tag--outlined">Stroke</span></div></section><section><h4>Person tag</h4><div class="shlz-cluster"><span class="shlz-tag shlz-person-tag"><img class="shlz-tag__avatar" src="${showcaseIconUrl("user")}" alt="">Анна Петрова</span><span class="shlz-tag shlz-person-tag"><img class="shlz-tag__avatar" src="${showcaseIconUrl("user")}" alt="">Анна Петрова<button class="shlz-tag__remove" type="button" aria-label="Удалить tag Анны Петровой"><img class="shlz-tag__icon" src="${showcaseIconUrl("close-remove")}" alt=""></button></span></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: Tag 2/2; Person tag 2/2.</p><p>Tag axis is Type=Filled/Stroke at 111×30. Person tag axis is State=Default/Closable at 193/213×30 and contains avatar/removal structure. Production uses source icons instead of letter and × substitutes.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Nodes <code>785:48347</code>, <code>785:48345</code>, <code>371:32590</code>, <code>417:33753</code>; all exported without warnings.</p></div></details></div></details></article>
<article id="segment-demo"><h3>Segment</h3><p>Segmented Group composes source-sized Segmented Items; native radios own single-selection semantics.</p><section><h4>Sizes and states</h4><div class="shlz-stack"><fieldset class="shlz-segment"><legend class="shlz-visually-hidden">Период</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period" checked><span class="shlz-segment__label">День</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period"><span class="shlz-segment__label">Неделя</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period"><span class="shlz-segment__label">Месяц</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="period" disabled><span class="shlz-segment__label">Год</span></label></fieldset><fieldset class="shlz-segment shlz-segment--sm"><legend class="shlz-visually-hidden">Small</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="small" checked><span class="shlz-segment__label">A</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="small"><span class="shlz-segment__label">B</span></label></fieldset><fieldset class="shlz-segment shlz-segment--lg"><legend class="shlz-visually-hidden">Large with icons</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="large" checked><span class="shlz-segment__label"><img class="shlz-segment__icon" src="${showcaseIconUrl("user")}" alt="">Список</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="large"><span class="shlz-segment__label"><img class="shlz-segment__icon" src="${showcaseIconUrl("user")}" alt="">Карточки</span></label></fieldset></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Coverage: Group 6/6; Item 9/9.</p><p>Group axes: Size small/medium/large × Icon false/true. Outer heights 26/33/41 equal item heights 18/25/33 plus 4px shell inset. Group widths are content/composition-driven, not equal-distribution tokens.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Group <code>424:36756</code>: 319/377/419/477px widths. Item <code>424:36728</code>: Selected, Disabled and Size combinations; selected+disabled is absent. No extraction warnings.</p></div></details></div></details></article>
<article id="notification-demo"><h3>Notification</h3><p>384×58 feedback surface; Snackbar is the countdown family, not another visual size.</p><section><h4>Notification variants</h4><div class="shlz-stack"><div class="shlz-notification" role="status"><span class="shlz-notification__icon" aria-hidden="true"><img src="${showcaseIconUrl("checkmark")}" alt=""></span><div class="shlz-notification__content"><p class="shlz-notification__title">Изменения сохранены</p></div><button class="shlz-notification__close" type="button" aria-label="Закрыть уведомление"><img src="${showcaseIconUrl("close")}" alt=""></button></div><div class="shlz-notification shlz-notification--danger" role="alert"><div class="shlz-notification__content"><p class="shlz-notification__title">Не удалось выполнить действие</p></div><button class="shlz-notification__action" type="button">Повторить</button></div></div></section><section><h4>Snackbar countdown</h4><div class="shlz-notification"><span class="shlz-notification__countdown" style="--shlz-progress:.6">3</span><div class="shlz-notification__content"><p class="shlz-notification__title">Отправка сообщения</p></div><button class="shlz-notification__close" type="button" aria-label="Закрыть snackbar"><img src="${showcaseIconUrl("close")}" alt=""></button></div></section><details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--high">HIGH</span> Notification 3/3; Snackbar 6/6. Geometry remains 384×58 with radius 29.</p><p>Notification Type: Default/Error/With button. Snackbar Number: 5/4/3/2/1/0. Existing close/check placeholders were replaced by normalized icons; runtime timing remains UNKNOWN.</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p>Notification <code>89:17043</code>; Snackbar <code>424:37565</code>. Nine exported variants, no extraction warnings.</p></div></details></div></details></article>
${overlayDemos}<article class="shlz-composition"><h3>Framework-free composition</h3><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Заголовок</span><input class="shlz-input" value="Пример композиции"></label><label class="shlz-field"><span class="shlz-field__label">Описание</span><textarea class="shlz-textarea"></textarea></label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" checked>Подтверждение</label><fieldset class="shlz-demo-fieldset"><legend>Вариант</legend><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition" checked>Первый</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition">Второй</label></fieldset><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch">Настройка</label><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Сохранить</button><button class="shlz-button">Отмена</button><span class="shlz-status shlz-status--green">Готово</span></div></div></article></section>
<section><h2>Icons <span class="shlz-evidence" data-kind="FACT">FACT · normalized Basic Elements manifest</span></h2><p>${manifest.length} canonical logical icons. Compatibility aliases are shown as metadata and are not separate canonical icons.</p>${iconGroups}</section></section>
<section id="fidelity" class="shlz-major-section"><p class="shlz-section-kicker">C. VISUAL FIDELITY</p><h2>Raw SVG source vs production implementation</h2><p>Левая колонка генерируется непосредственно из raw SVG через документированный viewBox crop; правая использует production DOM, classes, CSS и tokens. Интерактивные behavior demos находятся в Implementation выше.</p>${fidelityMarkup}</section>
<article id="dropdown-scrollable-demo" data-shlz-dropdown-scrollable-fixture><h3>Dropdown · Items=Srollbar</h3><div class="shlz-dropdown"><div class="shlz-dropdown__menu shlz-dropdown__menu--scrollable" role="menu"><div class="shlz-dropdown__scroll-region">${Array.from({ length: 34 }, (_, index) => `<button class="shlz-dropdown__item" type="button" role="menuitem">${index + 1} menu item</button>`).join("")}</div><span class="shlz-dropdown__scrollbar" aria-hidden="true"></span></div></div></article>`;

for (const checkbox of document.querySelectorAll("[data-shlz-indeterminate]")) {
  checkbox.indeterminate = true;
}

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
enhanceDropdowns();
window.__shlzModalControllers = enhanceModals();
window.__shlzDrawerControllers = enhanceDrawers();
window.__shlzPopoverControllers = enhancePopovers();
window.__shlzTooltipControllers = enhanceTooltips();
window.__shlzTabsControllers = enhanceTabs();

const foundations = document.querySelector("#implementation");
const dangerNotification = document.querySelector(
  "#notification-demo .shlz-notification--danger",
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
const sidebar = document.createElement("aside");
sidebar.className = "shlz-docs-sidebar";
sidebar.setAttribute("aria-label", "Showcase navigation");
sidebar.innerHTML = `<a class="shlz-docs-home" href="#top">SHLZ UI</a><nav>${navigationMarkup}</nav>`;
const content = document.createElement("div");
content.className = "shlz-docs-content";
const topAnchor = document.createElement("span");
topAnchor.id = "top";
content.append(topAnchor, ...app.childNodes);
shell.append(sidebar, content);
app.append(shell);

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
