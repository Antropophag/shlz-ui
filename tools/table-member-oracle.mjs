import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { tableCellsMarkup } from "../apps/showcase/src/table-cells.js";
import { tableCompositionsMarkup } from "../apps/showcase/src/table-compositions.js";
import { tableSorter, tableFilter } from "../apps/showcase/src/table-parts.js";

const [set, member] = process.argv.slice(2);
const matrix = JSON.parse(
  await readFile("docs/component-audits/table-source-matrix.json", "utf8"),
);
const css = await readFile("packages/styles/dist/shlz.css", "utf8");
const iconUrl = (name) => `https://source-icons.invalid/${name}.svg`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  let markup;
  if (set === "table-cell") markup = tableCellsMarkup(iconUrl);
  else if (set === "table-composition")
    markup = tableCompositionsMarkup(iconUrl);
  else {
    const sort = set === "table-sorter" ? member : "none";
    const filterAttributes = member === "active" ? 'aria-pressed="true"' : "";
    markup = `<table class="shlz-table"><thead class="shlz-table__head"><tr><th class="shlz-table__cell" aria-sort="${sort}">${tableSorter("Sort")}${tableFilter("Filter", filterAttributes)}</th></tr></thead></table>`;
  }
  // Static state evidence uses real production HTML/CSS. Runtime flows live in
  // the separate Playwright consumer specs; this oracle never claims those.
  await page.route("https://source-icons.invalid/**", async (route) => {
    const name = new globalThis.URL(route.request().url()).pathname
      .split("/")
      .pop();
    assert.ok(
      [
        "flag-filled.svg",
        "flag.svg",
        "plus-alt-2.svg",
        "plus-circle.svg",
        "copy-2.svg",
      ].includes(name),
      "Unknown table fixture icon",
    );
    await route.fulfill({
      contentType: "image/svg+xml",
      body: await readFile(`packages/icons/dist/icons/${name}`),
    });
  });
  await page.setContent(`<style>${css}</style>${markup}`);
  if (set === "table-cell") {
    const entry = matrix.cellVariants.find((row) => String(row[0]) === member);
    assert.ok(entry, `unknown cell ${member}`);
    const [, type, state, editable, kind, filled, width] = entry;
    const root = page.locator(`[data-table-source-cell="${member}"]`);
    const cell = root.locator(".shlz-table__cell");
    const actual = await cell.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        divider: style.borderBottomWidth,
        border: style.borderBottomColor,
        background: style.backgroundColor,
        text: el.textContent.trim(),
        input: el.querySelector("input")?.value,
        checked: el.querySelector("input")?.checked,
      };
    });
    assert.equal(actual.tag, kind === "Header" ? "TH" : "TD");
    assert.equal(actual.width, width);
    assert.equal(actual.height, 50);
    assert.equal(actual.divider, "1px");
    assert.equal(actual.fontSize, kind === "Header" ? "12px" : "15px");
    assert.equal(actual.lineHeight, kind === "Header" ? "18px" : "19.5px");
    const editing = editable && ["Pressed", "Typing"].includes(state);
    let border = "rgb(209, 216, 223)";
    if (editing) border = "rgb(37, 61, 152)";
    else if ([12, 13, 37, 38, 39, 40, 41].includes(Number(member)))
      border = "rgb(223, 226, 240)";
    assert.equal(actual.border, border);
    assert.equal(
      actual.background,
      state === "Hover" && kind === "Row"
        ? "rgb(238, 240, 244)"
        : "rgba(0, 0, 0, 0)",
    );
    if (
      type === "Empty" ||
      (!filled &&
        ["Text", "Status", "Dropdown"].includes(type) &&
        !["Typing", "Pressed"].includes(state) &&
        kind === "Row")
    )
      assert.equal(actual.text, "");
    if (type === "Text" && filled && kind === "Row")
      assert.equal(actual.input ?? actual.text, editable ? "3" : "Номер");
    if (type === "Check" || type === "Switch")
      assert.equal(actual.checked, filled);
    if (type === "Check")
      assert.equal(
        await cell
          .locator("input")
          .evaluate((el) => el.getBoundingClientRect().width),
        20,
      );
    if (type === "Switch")
      assert.deepEqual(
        await cell.locator("input").evaluate((el) => ({
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height,
        })),
        { width: 38, height: 20 },
      );
    if (type === "Status" && filled)
      assert.equal(actual.text, editable ? "Отгружен" : "Новое");
    if (type === "Button") {
      assert.equal(actual.text, "Добавить строку");
      assert.equal(
        await cell
          .locator("button")
          .evaluate((el) => window.getComputedStyle(el).color),
        state === "Pressed" ? "rgb(37, 61, 152)" : "rgb(147, 156, 165)",
      );
    }
    if (kind === "Header") {
      const colors = await cell
        .locator(".shlz-table__sorter path")
        .evaluateAll((paths) =>
          paths.map((p) => window.getComputedStyle(p).fill),
        );
      assert.deepEqual(colors, [
        state.toLowerCase().includes("descending")
          ? "rgb(37, 61, 152)"
          : "rgb(147, 156, 165)",
        state.toLowerCase().includes("ascending")
          ? "rgb(37, 61, 152)"
          : "rgb(147, 156, 165)",
      ]);
      assert.equal(
        await cell
          .locator(".shlz-table__actions")
          .evaluate((el) => window.getComputedStyle(el).opacity),
        state === "Default" ? "0" : "1",
      );
    }
    if ([42, 43, 49].includes(Number(member))) {
      const popup = cell.locator("[data-table-source-popup]");
      assert.equal(await popup.count(), 1);
      assert.equal(
        await popup.locator(".shlz-table__cell-choice-option").count(),
        2,
      );
      assert.equal(
        await popup.evaluate((el) => el.getBoundingClientRect().height),
        100,
      );
    }
  } else if (set === "table-composition") {
    const [family, order] = member.split(":");
    assert.ok(matrix.domainCompositions.some((item) => item.slug === family));
    const row = page.locator(
      `[data-table-composition-family="${family}"] [data-table-composition-variant="${order}"]`,
    );
    assert.equal(await row.count(), 1, `unique source row ${member}`);
    const expectedColumns = {
      appeals: 9,
      "status-management": 4,
      "organization-management": 4,
      "profile-management": 4,
      "linked-profiles": 9,
      "category-management": 7,
      "auto-assignment": 6,
      directories: 3,
    };
    const actual = await row.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      count: el.cells.length,
      state: el.dataset.sourceState,
      paint: window.getComputedStyle(el.cells[0]).backgroundColor,
    }));
    assert.equal(actual.height, 50);
    if (family === "field-management")
      assert.ok([4, 10].includes(actual.count));
    else assert.equal(actual.count, expectedColumns[family]);
    let paint = "rgba(0, 0, 0, 0)";
    if (["hover", "dots-pressed"].includes(actual.state))
      paint = "rgb(238, 240, 244)";
    else if (actual.state === "active") paint = "rgb(244, 246, 249)";
    assert.equal(actual.paint, paint);
  } else if (set === "table-sorter") {
    assert.ok(["none", "ascending", "descending"].includes(member));
    assert.deepEqual(
      await page
        .locator(".shlz-table__sorter path")
        .evaluateAll((paths) =>
          paths.map((p) => window.getComputedStyle(p).fill),
        ),
      [
        member === "descending" ? "rgb(37, 61, 152)" : "rgb(147, 156, 165)",
        member === "ascending" ? "rgb(37, 61, 152)" : "rgb(147, 156, 165)",
      ],
    );
  } else if (set === "table-filter") {
    assert.ok(["default", "hover", "active"].includes(member));
    if (member === "hover") await page.locator(".shlz-table__filter").hover();
    assert.equal(
      await page
        .locator(".shlz-table__filter path")
        .evaluate((el) => window.getComputedStyle(el).fill),
      {
        active: "rgb(37, 61, 152)",
        hover: "rgb(209, 216, 223)",
        default: "rgb(147, 156, 165)",
      }[member],
    );
  } else throw new Error(`unknown set ${set}`);
  console.log(`PASS ${set} ${member}`);
} finally {
  await browser.close();
}
