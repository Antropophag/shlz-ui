import "@shlz/styles";
import "./showcase.css";
import tokens from "@shlz/tokens/tokens.json";
import provenance from "@shlz/tokens/provenance.json";
import manifest from "@shlz/icons/manifest.json";
import { enhanceDropdowns, enhancePopovers } from "@shlz/behaviors";

const iconUrls = import.meta.glob(
  "../../../packages/icons/dist/{icons,file-types}/*.svg",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const app = document.querySelector("#app");
const label = (group) => {
  const item = provenance.groups[group];
  return `<span class="shlz-evidence" data-kind="${item.classification}">${item.classification} · ${item.confidence}</span>`;
};
const entries = (record, prefix = "") =>
  Object.entries(record).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? entries(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );
const colors = entries(tokens.color)
  .map(
    ([name, value]) =>
      `<div class="shlz-swatch"><i style="--shlz-swatch:${value}"></i><b>${name}</b><code>${value}</code></div>`,
  )
  .join("");
const spaces = Object.entries(tokens.space)
  .map(
    ([name, value]) =>
      `<div class="shlz-measure"><i style="inline-size:${value}"></i><code>${name} · ${value}</code></div>`,
  )
  .join("");
const radii = Object.entries(tokens.radius)
  .map(
    ([name, value]) =>
      `<div class="shlz-radius" style="border-radius:${value}"><code>${name} · ${value}</code></div>`,
  )
  .join("");
const iconCards = manifest
  .map(({ name, file, colorMode, uncertainty }) => {
    const url = Object.entries(iconUrls).find(([source]) =>
      source.endsWith(file),
    )?.[1];
    return `<figure class="shlz-icon-card" title="${uncertainty ?? ""}"><img src="${url}" alt=""/><figcaption>${name}<small>${colorMode}</small></figcaption></figure>`;
  })
  .join("");

app.innerHTML = `<header class="shlz-hero"><p>SHLZ UI · iteration 2</p><h1>Foundation and native primitives</h1><p>Инструмент визуальной проверки source evidence и framework-free HTML/CSS contracts.</p></header>
<section><h2>Primitive colors ${label("color")}</h2><div class="shlz-palette">${colors}</div></section>
<section><h2>Semantic mapping ${label("semantic")}</h2><div class="shlz-cluster"><div class="shlz-demo-surface">surface.base / text.primary</div><div class="shlz-demo-action">action.primary</div><div class="shlz-demo-status">status.success</div><div class="shlz-demo-danger">status.danger</div></div></section>
<section><h2>Spacing ${label("space")}</h2><div class="shlz-stack">${spaces}</div></section>
<section><h2>Radii, borders, effects ${label("radius")} ${label("shadow")}</h2><div class="shlz-cluster">${radii}<div class="shlz-surface shlz-effect">surface shadow</div></div></section>
<section><h2>Control geometry ${label("control")}</h2><div class="shlz-cluster"><input class="shlz-control" aria-label="Пример поля" value="40 px control"/><button class="shlz-control shlz-focusable">Focus me</button><button class="shlz-control" data-size="sm">32 px</button><button class="shlz-control" disabled>Disabled</button></div><p>Typography: ${label("typography")} — consumer supplies font variables.</p></section>
<section id="components"><h2>Components <span class="shlz-evidence" data-kind="FACT">FACT · component sheets</span></h2>
<article><h3>Button</h3><p><code>Buttons.svg</code> · 26/32/40 px, primary/neutral, icon forms.</p><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Создать</button><button class="shlz-button">Отмена</button><button class="shlz-button shlz-button--primary shlz-button--sm">32 px</button><button class="shlz-button shlz-button--xs">26 px</button><button class="shlz-button shlz-button--primary shlz-button--icon" aria-label="Добавить">+</button><button class="shlz-button shlz-button--primary" disabled>Недоступно</button></div></article>
<article><h3>Input and textarea</h3><p><code>Select.svg</code>, <code>Input Number.svg</code>, <code>Textarea.svg</code> · input-like geometry only.</p><div class="shlz-component-grid"><label class="shlz-field"><span class="shlz-field__label">Название</span><input class="shlz-input" placeholder="Введите название"></label><label class="shlz-field"><span class="shlz-field__label">32 px</span><input class="shlz-input shlz-input--sm" value="Заполнено"></label><label class="shlz-field"><span class="shlz-field__label">Ошибка</span><input class="shlz-input" aria-invalid="true" value="Некорректно"><span class="shlz-field__message">Проверьте значение</span></label><label class="shlz-field"><span class="shlz-field__label">Комментарий</span><textarea class="shlz-textarea">Длинный текст проверяет перенос и вертикальный ритм.</textarea></label><label class="shlz-field"><span class="shlz-field__label">Disabled</span><input class="shlz-input" disabled value="Недоступно"></label></div></article>
<article><h3>Checkbox, radio and switch</h3><p><code>Checkbox.svg</code>, <code>Radio.svg</code>, <code>Switch.svg</code> · state is owned by native inputs.</p><div class="shlz-cluster"><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox">Unchecked</label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" checked>Checked</label><label class="shlz-choice"><input class="shlz-checkbox" data-indeterminate type="checkbox">Indeterminate</label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" disabled>Disabled</label></div><fieldset class="shlz-demo-fieldset"><legend>Native radio group</legend><label class="shlz-choice"><input class="shlz-radio" type="radio" name="demo-radio" checked>Первый</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="demo-radio">Второй</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="demo-radio" disabled>Disabled</label></fieldset><div class="shlz-cluster"><label class="shlz-switch"><input class="shlz-switch__input shlz-switch__input--sm" type="checkbox" role="switch" checked>Small</label><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch">Medium</label><label class="shlz-switch"><input class="shlz-switch__input shlz-switch__input--lg" type="checkbox" role="switch" checked>Large</label></div></article>
<article><h3>Status / Badge</h3><p><code>Status.svg</code>, <code>Bage.svg</code> · color meaning remains UNKNOWN.</p><div class="shlz-cluster"><span class="shlz-status">Blue</span><span class="shlz-status shlz-status--green">Green</span><span class="shlz-status shlz-status--orange">Orange</span><span class="shlz-status shlz-status--purple">Purple</span><span class="shlz-status shlz-status--cyan">Cyan</span><span class="shlz-status shlz-status--neutral">Neutral</span><span class="shlz-badge" aria-label="3 уведомления">3</span><span class="shlz-badge shlz-badge--lg shlz-badge--neutral">12</span></div></article>
<article id="dropdown-demo"><h3>Dropdown menu</h3><p><code>Dropdown menu.svg</code> · FACT: 200/216 px menu, 40 px items, 12 px radius, 20 px icon slots. Highlight semantics remain UNKNOWN.</p><div class="shlz-cluster"><div class="shlz-dropdown" data-shlz-dropdown><button class="shlz-button" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-actions">Действия</button><div class="shlz-dropdown__menu" id="showcase-actions" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem"><span class="shlz-dropdown__icon" aria-hidden="true">＋</span>Создать</button><button class="shlz-dropdown__item" type="button" role="menuitem" aria-current="true"><span class="shlz-dropdown__icon" aria-hidden="true">✓</span>Текущий пункт</button><hr class="shlz-dropdown__separator" role="separator"><button class="shlz-dropdown__item" type="button" role="menuitem" disabled>Недоступно</button><button class="shlz-dropdown__item" type="button" role="menuitem">Длинный пункт меню для проверки ширины</button></div></div><div class="shlz-dropdown" data-shlz-dropdown><button class="shlz-button shlz-button--primary" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="showcase-wide-actions">Широкое меню</button><div class="shlz-dropdown__menu shlz-dropdown__menu--wide" id="showcase-wide-actions" role="menu" hidden><button class="shlz-dropdown__item" type="button" role="menuitem">Первый пункт</button><button class="shlz-dropdown__item" type="button" role="menuitem">Второй пункт</button></div></div></div></article>
<article id="popover-demo"><h3>Popover</h3><p><code>Popover.svg</code> · <span class="shlz-evidence" data-kind="FACT">FACT · 236×90, radius 12, four sides</span> <span class="shlz-evidence" data-kind="DECISION">DECISION · 8px offset, flip/shift</span></p><div class="shlz-popover-lab">
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-bottom" data-shlz-popover-trigger="popover-bottom" data-shlz-popover-placement="bottom">Bottom</button><div class="shlz-popover" id="popover-bottom" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-bottom-title">Заголовок</div><div class="shlz-popover__body">Длинный content переносится, не меняя публичный контракт.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-top" data-shlz-popover-trigger="popover-top" data-shlz-popover-placement="top">Top</button><div class="shlz-popover" id="popover-top" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Сверху</div><div class="shlz-popover__body">Предпочтительная сторона сохраняется, пока хватает места.</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-left" data-shlz-popover-trigger="popover-left" data-shlz-popover-placement="left">Left</button><div class="shlz-popover" id="popover-left" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Слева</div><div class="shlz-popover__body">Floating surface</div></div></div>
<div><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-right" data-shlz-popover-trigger="popover-right" data-shlz-popover-placement="right">Right</button><div class="shlz-popover" id="popover-right" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Справа</div><div class="shlz-popover__body">Floating surface</div></div></div>
</div><div class="shlz-popover-scenarios"><div><button class="shlz-button shlz-button--primary" type="button" aria-expanded="false" aria-controls="popover-interactive" data-shlz-popover-trigger="popover-interactive" data-shlz-popover-placement="bottom-start">Interactive content</button><div class="shlz-popover" id="popover-interactive" data-shlz-popover hidden aria-labelledby="popover-interactive-title"><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header" id="popover-interactive-title">Настройки</div><div class="shlz-popover__body shlz-stack"><label class="shlz-field" for="popover-value"><span class="shlz-field__label">Значение</span><input class="shlz-input shlz-input--sm" id="popover-value"></label><button class="shlz-button shlz-button--sm" type="button" data-shlz-popover-close>Готово</button></div></div></div>
<div class="shlz-popover-edge"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-edge" data-shlz-popover-trigger="popover-edge" data-shlz-popover-placement="right">Около края</button><div class="shlz-popover" id="popover-edge" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Collision</div><div class="shlz-popover__body">Панель остаётся во viewport.</div></div></div></div>
<div class="shlz-popover-scroll" data-popover-scroll><div class="shlz-popover-scroll__content"><button class="shlz-button" type="button" aria-expanded="false" aria-controls="popover-scroll" data-shlz-popover-trigger="popover-scroll" data-shlz-popover-placement="bottom">Scroll anchor</button><div class="shlz-popover" id="popover-scroll" data-shlz-popover hidden><span class="shlz-popover__arrow" aria-hidden="true"></span><div class="shlz-popover__header">Scroll</div><div class="shlz-popover__body">Позиция следует за trigger.</div></div></div></div></article>
<article class="shlz-composition"><h3>Framework-free composition</h3><div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Заголовок</span><input class="shlz-input" value="Пример композиции"></label><label class="shlz-field"><span class="shlz-field__label">Описание</span><textarea class="shlz-textarea"></textarea></label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" checked>Подтверждение</label><fieldset class="shlz-demo-fieldset"><legend>Вариант</legend><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition" checked>Первый</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="composition">Второй</label></fieldset><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch">Настройка</label><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Сохранить</button><button class="shlz-button">Отмена</button><span class="shlz-status shlz-status--green">Готово</span></div></div></article></section>
<section><h2>Icons <span class="shlz-evidence" data-kind="DERIVED">DERIVED · manifest</span></h2><div class="shlz-icon-grid">${iconCards}</div></section>`;

document.querySelector("[data-indeterminate]").indeterminate = true;
enhanceDropdowns();
window.__shlzPopoverControllers = enhancePopovers();
