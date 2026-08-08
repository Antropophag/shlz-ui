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

test("preserves the literal Figma source scales and named palette groups", async () => {
  const tokens = await json("packages/tokens/tokens.json");
  assert.deepEqual(Object.values(tokens.source.spacing), [
    "4px",
    "8px",
    "16px",
    "24px",
    "32px",
    "40px",
    "48px",
    "56px",
    "64px",
  ]);
  assert.deepEqual(tokens.source.radius, {
    Min: "8px",
    Regular: "12px",
    Medium: "16px",
    Large: "48px",
    Max: "100px",
  });
  assert.deepEqual(Object.keys(tokens.source.color), [
    "Dark Blue",
    "Blue",
    "Gray",
    "White",
    "Background",
    "Aditional",
  ]);
  assert.deepEqual(tokens.source.color, {
    "Dark Blue": {
      "Dark blue": "#0B1623",
      "Dark blue 50%": "rgb(11 22 35 / 50%)",
      "Dark blue 25%": "rgb(11 22 35 / 25%)",
      "Dark blue 10%": "rgb(11 22 35 / 10%)",
    },
    Blue: {
      "Blue 300": "#162773",
      "Blue 200": "#253D98",
      "Blue 200 15%": "rgb(37 61 152 / 15%)",
      "Blue 100": "#DFE2F0",
      "Blue 50": "#EEF0F4",
    },
    Gray: {
      "Gray 200": "#939CA5",
      "Gray 100": "#D1D8DF",
      "Gray 75": "#E0E0E0",
      "Gray 50": "#F5F5F5",
    },
    White: {
      White: "#FFFFFF",
      "White 15%": "rgb(255 255 255 / 15%)",
      "White 10%": "rgb(255 255 255 / 10%)",
    },
    Background: {
      Primary: "#F4F6F9",
      Filter: "#EEF0F4",
      Secondary: "#DFE2F0",
    },
    Aditional: {
      "Red 100": "#CC1F1F",
      "Red 100 15%": "rgb(204 31 31 / 15%)",
      "Red 50": "#FBD5D5",
      "Bright green": "#25983E",
      "Bright green 15%": "rgb(37 152 62 / 15%)",
      Green: "#57965C",
      "Green 15%": "rgb(87 150 92 / 15%)",
      Brown: "#9B7E46",
      "Brown 15%": "rgb(155 126 70 / 15%)",
      Orange: "#D47E2E",
      "Orange 15%": "rgb(212 126 46 / 15%)",
      Blue: "#245B99",
      "Blue 15%": "rgb(36 91 153 / 15%)",
      "Bright blue": "#3D88DE",
      "Bright blue 15%": "rgb(61 136 222 / 15%)",
      Turquoise: "#4191B3",
      "Turquoise 15%": "rgb(65 145 179 / 15%)",
      Violet: "#8131A7",
      "Violet 15%": "rgb(129 49 167 / 15%)",
      Pink: "#A942A7",
      "Pink 15%": "rgb(169 66 167 / 15%)",
    },
  });
  assert.equal(
    tokens.semantic.color.action.primary,
    "{source.color.Blue.Blue 200}",
  );
  assert.match(tokens.semantic.font.family, /system-ui/);
  assert.equal(tokens.space, undefined);
  assert.equal(tokens.radius, undefined);
  assert.equal(tokens.color, undefined);
});

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
