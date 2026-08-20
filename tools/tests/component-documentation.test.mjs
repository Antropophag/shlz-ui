import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import {
  componentDocumentation,
  renderComponentDocumentation,
} from "../../apps/showcase/src/component-docs.js";

const read = (path) => readFile(path, "utf8");
const normalize = (value) =>
  value
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s+>/g, ">")
    .replaceAll(/>\s+</g, "><")
    .trim();

test("documented components expose the validated component-page contract", async () => {
  assert.deepEqual(Object.keys(componentDocumentation), [
    "button",
    "input",
    "textarea",
    "checkbox",
    "radio",
    "switch",
    "status",
    "badge",
    "tag",
    "person-tag",
    "segment",
    "link",
    "avatar",
    "tabs",
    "pagination",
    "notification",
    "select",
  ]);

  for (const [name, docs] of Object.entries(componentDocumentation)) {
    for (const field of [
      "status",
      "purpose",
      "use",
      "avoid",
      "dependencies",
      "snippets",
      "contract",
      "accessibility",
      "limitations",
      "traceability",
    ]) {
      assert.ok(docs[field]?.length, `${name}.${field} must be documented`);
    }
    const rendered = renderComponentDocumentation(name);
    assert.match(rendered, new RegExp(`data-component-docs="${name}"`));
    assert.match(rendered, /data-shlz-visual-addition/);
    assert.match(rendered, /Developer usage/);
    assert.match(rendered, /Copyable usage/);
    assert.match(rendered, /Public contract/);
    assert.match(rendered, /Accessibility/);
    assert.match(rendered, /Limitations/);

    for (const [, path] of docs.traceability) await access(path);

    const markdown = await read(`docs/components/${name}.md`);
    for (const snippet of docs.snippets) {
      assert.ok(
        normalize(markdown).includes(normalize(snippet.code)),
        `${name} Markdown must contain the ${snippet.id} Showcase snippet`,
      );
    }
  }
});

test("Select separates production examples from unsupported source diagnostics", async () => {
  const showcase = await read("apps/showcase/src/fidelity.js");
  assert.match(showcase, /data-select-production-fixtures/);
  assert.match(showcase, /Production single-select/);
  assert.match(showcase, /Executable trigger, source chevron/);
  assert.match(showcase, /SHLZ option surface/);
  assert.match(showcase, /data-select-source-fixtures/);
  assert.match(showcase, /Source diagnostics · unsupported runtime/);
  assert.match(showcase, /<details[^>]+data-select-source-fixtures/);
});

test("Button copyable markup uses only the shipped native CSS contract", async () => {
  const css = await read("packages/styles/components/button.css");
  const html = componentDocumentation.button.snippets.find(
    ({ id }) => id === "button-html",
  ).code;

  assert.match(html, /<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /class="shlz-button shlz-button--primary"/);
  assert.doesNotMatch(html, /shlz-button--visual-/);
  assert.match(css, /\.shlz-button--primary/);
});

test("Input and Textarea snippets preserve native field semantics", async () => {
  const css = await read("packages/styles/components/field.css");
  const input = componentDocumentation.input.snippets.find(
    ({ id }) => id === "input-html",
  ).code;
  const textarea = componentDocumentation.textarea.snippets.find(
    ({ id }) => id === "textarea-html",
  ).code;

  assert.match(input, /^<label class="shlz-field">/);
  assert.match(input, /<input class="shlz-input" type="text" name="title"/);
  assert.doesNotMatch(input, /shlz-field--visual-/);
  assert.match(textarea, /<label class="shlz-field shlz-field--textarea">/);
  assert.match(textarea, /<textarea class="shlz-textarea" name="comment"/);
  assert.doesNotMatch(textarea, /\srows=/);
  assert.doesNotMatch(textarea, /shlz-field--visual-/);

  for (const selector of [
    ".shlz-field__control",
    ".shlz-input",
    ".shlz-textarea",
    ".shlz-field--textarea",
  ]) {
    assert.ok(css.includes(selector), `${selector} must be shipped`);
  }
});

test("Checkbox and Radio snippets keep native labeling and grouping", async () => {
  const css = await read("packages/styles/components/choice.css");
  const checkbox = componentDocumentation.checkbox.snippets.find(
    ({ id }) => id === "checkbox-html",
  ).code;
  const radio = componentDocumentation.radio.snippets.find(
    ({ id }) => id === "radio-html",
  ).code;

  assert.match(checkbox, /^<label class="shlz-choice">/);
  assert.match(
    checkbox,
    /<input class="shlz-checkbox" type="checkbox" name="notifications" value="yes"/,
  );
  assert.match(radio, /^<fieldset>/);
  assert.match(radio, /<legend>Режим<\/legend>/);
  assert.equal(radio.match(/name="mode"/g)?.length, 2);
  assert.deepEqual(
    [...radio.matchAll(/value="([^"]+)"/g)].map((match) => match[1]),
    ["standard", "advanced"],
  );
  assert.match(css, /\.shlz-checkbox--sm/);
  assert.match(css, /\.shlz-checkbox:indeterminate/);
  assert.match(css, /\.shlz-radio:checked/);
});

test("Switch snippet keeps native state and an application-owned change hook", async () => {
  const css = await read("packages/styles/components/choice.css");
  const html = componentDocumentation.switch.snippets.find(
    ({ id }) => id === "switch-html",
  ).code;
  const js = componentDocumentation.switch.snippets.find(
    ({ id }) => id === "switch-js",
  ).code;

  assert.match(html, /^<label class="shlz-switch">/);
  assert.match(
    html,
    /class="shlz-switch__input" type="checkbox" role="switch" name="alerts" value="enabled"/,
  );
  assert.match(js, /addEventListener\("change"/);
  assert.match(js, /control\.checked/);
  assert.match(css, /--shlz-switch-width: 38px/);
  assert.match(css, /--shlz-switch-width: 24px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Status and Badge snippets keep text-owned semantics", async () => {
  const [css, foundation] = await Promise.all([
    read("packages/styles/components/status-badge.css"),
    read("packages/styles/foundation.css"),
  ]);
  const status = componentDocumentation.status.snippets.find(
    ({ id }) => id === "status-html",
  ).code;
  const badge = componentDocumentation.badge.snippets.find(
    ({ id }) => id === "badge-html",
  ).code;

  assert.match(status, /shlz-status shlz-status--green">Выполнено/);
  assert.match(badge, /class="shlz-badge"/);
  assert.match(badge, /shlz-visually-hidden/);
  assert.match(badge, /непрочитанных уведомлений/);
  assert.match(css, /\.shlz-status--green/);
  assert.match(css, /\.shlz-badge--lg/);
  assert.match(css, /\.shlz-badge-dot/);
  assert.match(foundation, /\.shlz-visually-hidden/);
});

test("Tag families keep presentation and removal ownership separate", async () => {
  const css = await read("packages/styles/components/tag.css");
  const tag = componentDocumentation.tag.snippets.find(
    ({ id }) => id === "tag-html",
  ).code;
  const person = componentDocumentation["person-tag"].snippets.find(
    ({ id }) => id === "person-tag-html",
  ).code;
  const closable = componentDocumentation["person-tag"].snippets.find(
    ({ id }) => id === "person-tag-closable-html",
  ).code;
  const removal = componentDocumentation["person-tag"].snippets.find(
    ({ id }) => id === "person-tag-js",
  ).code;

  assert.match(tag, /^<span class="shlz-tag shlz-tag--outlined">/);
  assert.doesNotMatch(tag, /button|tabindex|role=/);
  assert.match(person, /class="shlz-tag shlz-person-tag"/);
  assert.match(person, /class="shlz-tag__avatar"[^>]+alt=""/);
  assert.match(
    closable,
    /data-person-tag>[\s\S]*class="shlz-tag__remove" type="button" aria-label="Удалить Анну Петрову"/,
  );
  assert.match(closable, /close-remove\.svg" alt=""/);
  assert.match(removal, /addEventListener\("click"/);
  assert.match(removal, /closest\("\[data-person-tag\]"\)\?\.remove\(\)/);
  assert.match(removal, /stateful app/);
  assert.match(css, /\.shlz-person-tag/);
  assert.match(css, /\.shlz-tag__remove:focus-visible/);
});

test("Segment snippet preserves native radio grouping and sibling styling", async () => {
  const [css, foundation] = await Promise.all([
    read("packages/styles/components/segment.css"),
    read("packages/styles/foundation.css"),
  ]);
  const html = componentDocumentation.segment.snippets.find(
    ({ id }) => id === "segment-html",
  ).code;

  assert.match(html, /^<fieldset class="shlz-segment">/);
  assert.match(html, /<legend class="shlz-visually-hidden">Период<\/legend>/);
  assert.equal(html.match(/name="period"/g)?.length, 2);
  assert.equal(html.match(/\schecked/g)?.length, 1);
  assert.deepEqual(
    [...html.matchAll(/value="([^"]+)"/g)].map((match) => match[1]),
    ["day", "week"],
  );
  assert.equal(html.match(/class="shlz-segment__label"/g)?.length, 2);
  assert.equal(
    html.match(
      /<input(?:(?!<input)[\s\S])*?\/>\s*<span class="shlz-segment__label">/g,
    )?.length,
    2,
  );
  assert.match(css, /\.shlz-segment__input:checked \+ \.shlz-segment__label/);
  assert.match(css, /\.shlz-segment--sm/);
  assert.match(css, /\.shlz-segment--lg/);
  assert.match(foundation, /\.shlz-visually-hidden/);
});

test("Link and Avatar snippets preserve native semantics and shipped content contracts", async () => {
  const [linkCss, avatarCss] = await Promise.all([
    read("packages/styles/components/link.css"),
    read("packages/styles/components/avatar.css"),
  ]);
  const link = componentDocumentation.link.snippets.find(
    ({ id }) => id === "link-html",
  ).code;
  const avatarText = componentDocumentation.avatar.snippets.find(
    ({ id }) => id === "avatar-text-html",
  ).code;
  const avatarImage = componentDocumentation.avatar.snippets.find(
    ({ id }) => id === "avatar-image-html",
  ).code;

  assert.match(link, /^<a class="shlz-link" href="\/requests\/42">/);
  assert.doesNotMatch(link, /--visual-|aria-disabled/);
  assert.match(linkCss, /\.shlz-link:focus-visible/);
  assert.match(linkCss, /\.shlz-link--disabled/);

  assert.match(avatarText, /shlz-avatar shlz-avatar--32/);
  assert.match(avatarText, /role="img" aria-label="Анна Петрова"/);
  assert.match(avatarImage, /shlz-avatar shlz-avatar--40/);
  assert.match(avatarImage, /class="shlz-avatar__image"/);
  assert.match(avatarImage, /alt="Анна Петрова"/);
  for (const size of [24, 32, 40, 64]) {
    assert.match(avatarCss, new RegExp(`\\.shlz-avatar--${size}`));
  }
  assert.match(avatarCss, /\.shlz-avatar__image/);
  assert.match(avatarCss, /\.shlz-avatar__icon/);
});

test("Tabs snippet preserves the ARIA relationship and deferred behavior lifecycle", async () => {
  const [css, behavior, packageJson] = await Promise.all([
    read("packages/styles/components/tabs.css"),
    read("packages/behaviors/src/tabs.ts"),
    read("packages/behaviors/package.json").then(JSON.parse),
  ]);
  const html = componentDocumentation.tabs.snippets.find(
    ({ id }) => id === "tabs-html",
  ).code;
  const js = componentDocumentation.tabs.snippets.find(
    ({ id }) => id === "tabs-js",
  ).code;

  assert.match(html, /^<div class="shlz-tabs" data-shlz-tabs>/);
  assert.match(html, /role="tablist" aria-label="Карточка заявки"/);
  assert.equal(html.match(/role="tab"/g)?.length, 2);
  assert.match(
    html,
    /id="details-tab"[^>]+aria-selected="true"[^>]+aria-controls="details-panel"/,
  );
  assert.match(
    html,
    /id="history-tab"[^>]+aria-selected="false"[^>]+aria-controls="history-panel"[^>]+tabindex="-1"/,
  );
  assert.equal(html.match(/role="tabpanel"/g)?.length, 2);
  assert.match(
    html,
    /id="details-panel" role="tabpanel" aria-labelledby="details-tab" tabindex="0"/,
  );
  assert.match(
    html,
    /id="history-panel" role="tabpanel" aria-labelledby="history-tab" tabindex="0" hidden/,
  );
  assert.equal(html.match(/aria-selected="true"/g)?.length, 1);
  assert.equal(html.match(/tabindex="-1"/g)?.length, 1);

  assert.match(js, /from "@shlz\/behaviors\/tabs"/);
  assert.match(js, /const controllers = enhanceTabs\(\)/);
  assert.match(js, /function destroyTabs\(\)[\s\S]+controller\.destroy\(\)/);
  assert.doesNotMatch(js, /enhanceTabs\(\);\s+for \(const controller/);
  assert.ok(packageJson.exports["./tabs"]);
  assert.match(behavior, /export function enhanceTabs/);
  assert.match(behavior, /ArrowLeft/);
  assert.match(css, /\.shlz-tabs--pill/);
  assert.match(css, /\.shlz-tabs--boxed/);
});

test("Select copyable markup matches the shipped listbox contract", async () => {
  const [fieldCss, packageJson] = await Promise.all([
    read("packages/styles/components/field.css"),
    read("packages/behaviors/package.json").then(JSON.parse),
  ]);
  const html = componentDocumentation.select.snippets.find(
    ({ id }) => id === "select-html",
  ).code;
  const js = componentDocumentation.select.snippets.find(
    ({ id }) => id === "select-js",
  ).code;
  assert.match(html, /data-shlz-select/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /role="option"/);
  assert.match(html, /class="shlz-select__chevron"/);
  assert.match(html, /<input type="hidden" name="requestType"/);
  assert.match(fieldCss, /\.shlz-field--select \.shlz-field__control/);
  assert.match(js, /enhanceSelects/);
  assert.ok(packageJson.exports["./select"]);
});

test("Pagination snippets preserve native navigation and consumer ownership", async () => {
  const [css, behaviors] = await Promise.all([
    read("packages/styles/components/pagination.css"),
    read("packages/behaviors/package.json").then(JSON.parse),
  ]);
  const snippets = Object.fromEntries(
    componentDocumentation.pagination.snippets.map(({ id, code }) => [
      id,
      code,
    ]),
  );
  const minimal = snippets["pagination-html"];
  const ellipsis = snippets["pagination-ellipsis-html"];
  const boundary = snippets["pagination-boundary-html"];

  assert.match(minimal, /^<nav class="shlz-pagination" aria-label=/);
  assert.equal(minimal.match(/<a class="shlz-pagination__item"/g)?.length, 5);
  assert.equal(minimal.match(/href="[^"]+"/g)?.length, 5);
  assert.equal(minimal.match(/aria-current="page"/g)?.length, 1);
  assert.equal(
    minimal.match(/aria-label="(?:Предыдущая|Следующая) страница"/g)?.length,
    2,
  );
  assert.equal(
    minimal.match(/class="shlz-pagination__icon"[^>]+alt=""/g)?.length,
    2,
  );
  assert.doesNotMatch(minimal, /<button|data-shlz|addEventListener/);

  assert.equal(ellipsis.match(/shlz-pagination__item--ellipsis/g)?.length, 2);
  assert.equal(ellipsis.match(/aria-hidden="true"/g)?.length, 2);
  assert.doesNotMatch(ellipsis, /<a[^>]+--ellipsis/);

  assert.match(
    boundary,
    /<span class="shlz-pagination__item shlz-pagination__item--disabled" aria-disabled="true"/,
  );
  assert.match(
    boundary,
    /class="shlz-visually-hidden">Предыдущая страница недоступна<\/span>/,
  );
  assert.doesNotMatch(boundary, /aria-label="Предыдущая страница"/);
  assert.doesNotMatch(boundary, /<a[^>]+--disabled/);
  assert.equal(boundary.match(/aria-current="page"/g)?.length, 1);

  for (const selector of [
    ".shlz-pagination__list",
    ".shlz-pagination__item",
    ".shlz-pagination__icon",
    ".shlz-pagination__item--disabled",
    ".shlz-pagination__item--ellipsis",
  ]) {
    assert.ok(css.includes(selector), `${selector} must be shipped`);
  }
  assert.match(css, /flex-wrap: wrap/);
  assert.match(css, /a\.shlz-pagination__item:focus-visible/);
  assert.equal(behaviors.exports["./pagination"], undefined);
});

test("Notification snippets keep semantics and lifecycle application-owned", async () => {
  const [css, behaviors] = await Promise.all([
    read("packages/styles/components/notification.css"),
    read("packages/behaviors/package.json").then(JSON.parse),
  ]);
  const snippets = Object.fromEntries(
    componentDocumentation.notification.snippets.map(({ id, code }) => [
      id,
      code,
    ]),
  );

  assert.match(snippets["notification-html"], /role="status"/);
  assert.match(snippets["notification-html"], /data-notification-close/);
  assert.match(
    snippets["notification-html"],
    /data-notification-focus-return="notification-focus-return"/,
  );
  assert.match(
    snippets["notification-html"],
    /aria-label="Закрыть уведомление"/,
  );
  assert.match(snippets["notification-action-html"], /role="alert"/);
  assert.match(
    snippets["notification-action-html"],
    /data-notification-action="retry-save"/,
  );
  assert.match(snippets["notification-js"], /addEventListener\("click"/);
  assert.match(snippets["notification-js"], /notification\.remove\(\)/);
  assert.match(snippets["notification-js"], /focusReturn\.focus\(\)/);
  assert.match(snippets["notification-js"], /document\.getElementById/);
  assert.match(snippets["notification-js"], /new WeakSet\(\)/);
  assert.match(snippets["notification-js"], /enhancedNotifications\.has/);
  assert.match(snippets["notification-js"], /app:notification-action/);
  assert.match(snippets["notification-js"], /bubbles: true/);
  assert.match(snippets["notification-js"], /detail: \{ action \}/);
  assert.doesNotMatch(snippets["notification-js"], /setTimeout|setInterval/);

  for (const selector of [
    ".shlz-notification__content",
    ".shlz-notification__title",
    ".shlz-notification__action",
    ".shlz-notification__close",
  ]) {
    assert.ok(css.includes(selector), `${selector} must be shipped`);
  }
  assert.equal(behaviors.exports["./notification"], undefined);
});
