import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

const read = (path) =>
  readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("typography profiles preserve Golos default and expose inherited Fira", async () => {
  const [tokens, profiles, bundle] = await Promise.all([
    read("packages/tokens/tokens.json"),
    read("packages/styles/typography-profiles.css"),
    read("packages/styles/dist/shlz.css"),
  ]);

  assert.match(
    tokens,
    /"family": "\\"Golos Text\\", system-ui, -apple-system, BlinkMacSystemFont, \\"Segoe UI\\", sans-serif"/,
  );
  assert.match(tokens, /"golos": "\\"Golos Text\\"/);
  assert.match(tokens, /"fira": "\\"Fira Sans\\"/);
  assert.match(profiles, /\[data-shlz-font="golos"\]/);
  assert.match(profiles, /\[data-shlz-font="fira"\]/);
  assert.doesNotMatch(profiles, /shlz-(?:button|table|field)--fira/);
  assert.match(bundle, /--shlz-semantic-typography-family-fira:/);
});

test("profile roles keep the canonical shared geometry outside typography", async () => {
  const tokens = JSON.parse(await read("packages/tokens/tokens.json"));
  const typography = tokens.semantic.typography;

  assert.deepEqual(typography.weight, {
    regular: "400",
    medium: "500",
    semibold: "600",
  });
  assert.deepEqual(typography.role["interactive-label"], {
    size: "15px",
    "line-height": "19.5px",
    "letter-spacing": "-0.01em",
  });
  assert.equal(tokens.semantic.control["height-medium"], "40px");
  assert.equal(tokens.semantic.control["height-small"], "32px");
});
