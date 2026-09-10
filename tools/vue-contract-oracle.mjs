import assert from "node:assert/strict";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

// The same oracle accepts either the candidate checkout or a known-bad module.
const root = fileURLToPath(new globalThis.URL("../", import.meta.url));
const target = path.resolve(root, process.argv[2] ?? ".");
const relativeTarget = path.relative(root, target);
if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget))
  throw new Error("Oracle target must stay within this checkout");
const modulePath =
  target === path.resolve(root)
    ? path.join(root, "packages/vue/dist/index.js")
    : target;
const resolvedModule = await realpath(modulePath);
const relativeModule = path.relative(root, resolvedModule);
if (relativeModule.startsWith("..") || path.isAbsolute(relativeModule))
  throw new Error("Oracle target symlink escapes this checkout");
const { ShlzButton } = await import(pathToFileURL(resolvedModule));
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
  } else if (setId === "vue-button.iconSize") {
    const [iconOnly, size] = value.split(":");
    props.iconOnly = iconOnly === "true";
    props.size = size;
  } else throw new Error(`Unknown set ${setId}`);
  const html = await render(props);
  if (setId === "vue-button.iconSize") {
    const expectedSize =
      props.iconOnly && props.size === "xs" ? "sm" : props.size;
    assert.equal(html.includes("shlz-button--xs"), expectedSize === "xs");
    assert.equal(html.includes("shlz-button--sm"), expectedSize === "sm");
    assert.equal(html.includes("shlz-button--icon"), props.iconOnly);
  }
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
    iconSize: [
      "false:md",
      "false:sm",
      "false:xs",
      "true:md",
      "true:sm",
      "true:xs",
    ],
  })) {
    for (const value of values) await check(`vue-button.${id}`, value);
  }
  assert.match(await render(), /type="button"/);
}
