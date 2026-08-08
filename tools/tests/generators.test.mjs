import assert from "node:assert/strict";
import test from "node:test";
import { flatten, normalizeMonochromeSvg, resolveAliases } from "../lib.mjs";

test("flattens and resolves token aliases", () => {
  const flat = flatten({
    color: { base: "#fff" },
    surface: { base: "{color.base}" },
  });
  assert.deepEqual(resolveAliases(flat), {
    "color.base": "#fff",
    "surface.base": "#fff",
  });
});

test("rejects unknown aliases", () =>
  assert.throws(() => resolveAliases({ a: "{missing}" })));

test("normalizes only known monochrome paints", () => {
  assert.match(
    normalizeMonochromeSvg('<svg><path fill="#0B1623"/></svg>'),
    /currentColor/,
  );
  assert.match(
    normalizeMonochromeSvg('<svg><path fill="#CC1F1F"/></svg>'),
    /#CC1F1F/,
  );
});
