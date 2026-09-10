import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const dir = mkdtempSync(path.join(tmpdir(), "shlz-vue-consumer-"));
const run = (args, cwd = root) =>
  execFileSync(path.join(path.dirname(process.execPath), "npm"), args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
try {
  run(["run", "build:packages"]);
  const tarballs = path.join(dir, "tarballs");
  mkdirSync(tarballs);
  const targets = ["tokens", "styles", "vue"].map((name) => {
    const packed = JSON.parse(
      run(
        ["pack", "--json", "--pack-destination", tarballs],
        path.join(root, "packages", name),
      ),
    );
    return path.join(
      tarballs,
      (Array.isArray(packed) ? packed[0] : Object.values(packed)[0]).filename,
    );
  });
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      ...targets,
      "vue@3.5.42",
      "typescript@5.9.2",
    ],
    dir,
  );
  writeFileSync(
    path.join(dir, "consumer.ts"),
    `import { h, ref } from 'vue';
import { ShlzButton, type ButtonHandle, type ButtonVariant, type ButtonSize } from '@shlz/vue';
const buttonRef = ref<InstanceType<typeof ShlzButton> | null>(null);
const native: HTMLButtonElement | null | undefined = buttonRef.value?.element; void native;
// @ts-expect-error exposed element is a button, not a string
const wrongElement: string = buttonRef.value?.element; void wrongElement;
type PublicProps = InstanceType<typeof ShlzButton>['$props'];
const attrs: PublicProps = { name: 'command', value: 'save', form: 'editor', 'aria-label': 'Save', onClick(event) { const mouse: MouseEvent = event; mouse.preventDefault(); } };
h(ShlzButton, attrs);
// @ts-expect-error click handler receives MouseEvent, not a string
const badEvent: PublicProps = { onClick(event: string) {} }; void badEvent;
// @ts-expect-error native button type is a closed set
const badType: PublicProps = { type: 'navigation' }; void badType;
declare const dynamicIcon: boolean;
const dynamicSafe: PublicProps[] = [{ iconOnly: dynamicIcon }, { iconOnly: dynamicIcon, size: 'md' }, { iconOnly: dynamicIcon, size: 'sm' }]; void dynamicSafe;
// @ts-expect-error a dynamic boolean cannot guarantee that xs is not icon-only
const dynamicUnsafe: PublicProps = { iconOnly: dynamicIcon, size: 'xs' }; void dynamicUnsafe;
const validIcon: PublicProps = { iconOnly: true, size: 'sm', 'aria-label': 'Add' }; void validIcon;
const validSmall: PublicProps = { size: 'xs' }; void validSmall;
// @ts-expect-error xs is not a supported icon-only size
const invalidIcon: PublicProps = { iconOnly: true, size: 'xs' }; void invalidIcon;
const variant: ButtonVariant = 'primary'; const size: ButtonSize = 'sm';
h(ShlzButton, { variant, size, disabled: false, type: 'submit' }, () => 'Save');
const focus = (handle: ButtonHandle) => handle.element?.focus(); void focus;
// @ts-expect-error unsupported mode
const invalid: ButtonVariant = 'loading'; void invalid;
`,
  );
  run(
    [
      "exec",
      "tsc",
      "--",
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--target",
      "ES2022",
      "consumer.ts",
    ],
    dir,
  );
  writeFileSync(
    path.join(dir, "consumer.mjs"),
    String.raw`import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { ShlzButton } from '@shlz/vue';
assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
const render = (label, props={}) => renderToString(createSSRApp({render: () => h(ShlzButton, props, () => label)}));
const [a,b] = await Promise.all([render('First'), render('Second', {variant:'primary',size:'sm',disabled:true,'aria-label':'Save',class:'custom'})]);
assert.match(a, /type="button"/); assert.match(a, />First<\/button>/); assert.ok(!a.includes('Second'));
assert.match(b, /disabled/); assert.match(b, /shlz-button--primary/); assert.match(b, /shlz-button--sm/); assert.match(b, /custom/); assert.match(b, /aria-label="Save"/); assert.ok(!b.includes('First'));
console.log('Packed Vue consumer: types, server-safe import, SSR and isolated requests passed');
`,
  );
  process.stdout.write(
    execFileSync(process.execPath, ["consumer.mjs"], {
      cwd: dir,
      encoding: "utf8",
    }),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
