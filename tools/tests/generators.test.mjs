import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  flatten,
  hash,
  json,
  normalizeMonochromeSvg,
  resolveAliases,
} from "../lib.mjs";

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

test("calendar collision preserves two distinct source geometries", async () => {
  const manifest = await json("packages/icons/dist/manifest.json");
  const calendars = manifest.filter(({ name }) => name.startsWith("calendar"));
  assert.deepEqual(calendars.map(({ name }) => name).sort(), [
    "calendar",
    "calendar-sidebar-uncertain",
  ]);
  const geometries = await Promise.all(
    calendars.map(async ({ file }) =>
      hash(
        (await readFile(`packages/icons/dist/${file}`, "utf8")).match(
          /d="([^"]+)"/,
        )[1],
      ),
    ),
  );
  assert.equal(new Set(geometries).size, 2);
  assert.deepEqual(
    calendars.find(({ name }) => name === "calendar-sidebar-uncertain")
      .provenance.sourceIds,
    ["path41"],
  );
});
