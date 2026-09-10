import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

// The same oracle accepts either the candidate checkout or a known-bad module.
const target = process.argv[2] ?? process.cwd();
const modulePath = (await stat(target)).isDirectory()
  ? path.join(target, "packages/vue/dist/index.js")
  : target;
const { ShlzButton } = await import(pathToFileURL(modulePath));
const render = (props = {}) =>
  renderToString(
    createSSRApp({ render: () => h(ShlzButton, props, () => "Action") }),
  );
const [, , , set, member] = process.argv;
const check = async (setId, value) => {
  const props = {};
  if (setId === "vue-button.variant") props.variant = value;
  else if (setId === "vue-button.size") props.size = value;
  else if (setId === "vue-button.type") props.type = value;
  else if (setId === "vue-button.disabled") props.disabled = value === "true";
  else if (setId === "vue-button.iconOnly") {
    props.iconOnly = value === "true";
    props["aria-label"] = "Action";
  } else throw new Error(`Unknown set ${setId}`);
  const html = await render(props);
  assert.match(html, /^<button\b/);
  assert.match(html, /shlz-button/);
  assert.match(html, /type="(?:button|submit|reset)"/);
  if (setId === "vue-button.variant")
    assert.equal(html.includes(`shlz-button--${value}`), value !== "neutral");
  if (setId === "vue-button.size")
    assert.equal(html.includes(`shlz-button--${value}`), value !== "md");
  if (setId === "vue-button.type") assert.ok(html.includes(`type="${value}"`));
  if (setId === "vue-button.disabled")
    assert.equal(/\sdisabled(?:[\s=>])/.test(html), value === "true");
  if (setId === "vue-button.iconOnly")
    assert.equal(html.includes("shlz-button--icon"), value === "true");
};
if (set) await check(set, member);
else {
  for (const [id, values] of Object.entries({
    variant: ["neutral", "primary", "text"],
    size: ["md", "sm", "xs"],
    type: ["button", "submit", "reset"],
    disabled: ["false", "true"],
    iconOnly: ["false", "true"],
  })) {
    for (const value of values) await check(`vue-button.${id}`, value);
  }
  assert.match(await render(), /type="button"/);
}
