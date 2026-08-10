import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = () =>
  Promise.all([
    readFile("packages/styles/components/file-row.css", "utf8"),
    readFile("packages/styles/components/empty-state.css", "utf8"),
    readFile("apps/showcase/src/content-states.js", "utf8"),
  ]);

test("file row keeps primary and trailing actions as siblings", async () => {
  const [css, , showcase] = await files();
  assert.match(showcase, /shlz-file-row__primary/);
  assert.match(showcase, /shlz-file-row__actions/);
  assert.doesNotMatch(showcase, /<a class="shlz-file-row"/);
  assert.match(showcase, /type="button" aria-label=/);
  assert.match(css, /\.shlz-file-row__primary:focus-visible/);
  assert.match(css, /\.shlz-file-row__action:focus-visible/);
});

test("file row truncates names and fixes source-backed icon geometry", async () => {
  const [css] = await files();
  assert.match(css, /text-overflow: ellipsis/);
  assert.match(css, /white-space: nowrap/);
  assert.match(css, /flex: 0 0 38px/);
  assert.match(css, /inline-size: 38px/);
  assert.match(css, /block-size: 38px/);
});

test("file row exposes source-backed hover and error states", async () => {
  const [css, , showcase] = await files();
  assert.match(
    css,
    /background: var\(--shlz-source-color-background-primary\)/,
  );
  assert.match(css, /\.shlz-file-row\[aria-invalid="true"\]/);
  assert.match(css, /\.shlz-file-row__message/);
  assert.match(showcase, /state: "hover"/);
  assert.match(showcase, /state: "error"/);
});

test("file row has no accidental root activation target", async () => {
  const [, , showcase] = await files();
  assert.match(showcase, /shlz-file-row__title/);
  assert.doesNotMatch(showcase, /data-shlz-file-row|onclick=/);
});

test("empty state regions are optional CSS composition", async () => {
  const [, css, showcase] = await files();
  for (const region of ["visual", "title", "description", "actions"])
    assert.match(css, new RegExp(`\\.shlz-empty-state__${region}`));
  assert.match(showcase, /shlz-empty-state__actions/);
  assert.match(showcase, /class="shlz-empty-state shlz-empty-state--simple"/);
  assert.doesNotMatch(css, /min-inline-size:/);
  assert.doesNotMatch(css, /border:|border-radius:|background:/);
  assert.match(showcase, /viewBox="78 1 64 39"/);
  for (const variant of ["simple", "customize", "basic"])
    assert.match(css, new RegExp(`\\.shlz-empty-state--${variant}`));
  assert.match(showcase, /data-empty-state-variant="customize"/);
  assert.match(showcase, /data-empty-state-variant="basic"/);
  assert.match(showcase, /empty-customize/);
  assert.match(showcase, /empty-basic/);
});
