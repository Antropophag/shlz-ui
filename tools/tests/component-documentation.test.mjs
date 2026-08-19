import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import {
  componentDocumentation,
  renderComponentDocumentation,
} from "../../apps/showcase/src/component-docs.js";

const read = (path) => readFile(path, "utf8");
const normalize = (value) => value.replaceAll(/\s+/g, " ").trim();

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

test("Select copyable markup and initialization match production exports", async () => {
  const [fieldCss, selectCss, behavior, packageJson] = await Promise.all([
    read("packages/styles/components/field.css"),
    read("packages/styles/components/select.css"),
    read("packages/behaviors/src/select.ts"),
    read("packages/behaviors/package.json").then(JSON.parse),
  ]);
  const html = componentDocumentation.select.snippets.find(
    ({ id }) => id === "select-html",
  ).code;
  const js = componentDocumentation.select.snippets.find(
    ({ id }) => id === "select-js",
  ).code;

  assert.match(
    html,
    /class="shlz-field shlz-field--select shlz-selectbox" data-shlz-select/,
  );
  assert.match(html, /<label class="shlz-field__label" for="request-type"/);
  assert.match(html, /<select class="shlz-select" id="request-type"/);
  assert.match(html, /class="shlz-field__indicator" aria-hidden="true"/);
  assert.match(html, /class="shlz-field__icon"/);
  assert.match(fieldCss, /\.shlz-field--select \.shlz-field__control/);
  assert.match(selectCss, /\.shlz-selectbox__trigger/);

  assert.match(js, /from "@shlz\/behaviors\/select"/);
  assert.match(js, /enhanceSelects\(\)/);
  assert.match(
    js,
    /function destroySelects\(\) \{\s+for \(const controller of controllers\) controller\.destroy\(\);\s+\}/,
  );
  assert.doesNotMatch(
    js,
    /const controllers = enhanceSelects\(\);\s+for \(const controller/,
  );
  assert.ok(packageJson.exports["./select"]);
  assert.match(behavior, /export function enhanceSelects/);
  assert.match(behavior, /destroy\(\): void/);
});
