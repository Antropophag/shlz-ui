import "@shlz/styles";
import "./showcase.css";
import tokens from "@shlz/tokens/tokens.json";
import provenance from "@shlz/tokens/provenance.json";
import manifest from "@shlz/icons/manifest.json";

const iconUrls = import.meta.glob(
  "../../../packages/icons/dist/{icons,file-types}/*.svg",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const app = document.querySelector("#app");
const label = (group) => {
  const item = provenance.groups[group];
  return `<span class="shlz-evidence" data-kind="${item.classification}">${item.classification} · ${item.confidence}</span>`;
};
const entries = (record, prefix = "") =>
  Object.entries(record).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? entries(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );
const colors = entries(tokens.color)
  .map(
    ([name, value]) =>
      `<div class="shlz-swatch"><i style="--shlz-swatch:${value}"></i><b>${name}</b><code>${value}</code></div>`,
  )
  .join("");
const spaces = Object.entries(tokens.space)
  .map(
    ([name, value]) =>
      `<div class="shlz-measure"><i style="inline-size:${value}"></i><code>${name} · ${value}</code></div>`,
  )
  .join("");
const radii = Object.entries(tokens.radius)
  .map(
    ([name, value]) =>
      `<div class="shlz-radius" style="border-radius:${value}"><code>${name} · ${value}</code></div>`,
  )
  .join("");
const iconCards = manifest
  .map(({ name, file, colorMode, uncertainty }) => {
    const url = Object.entries(iconUrls).find(([source]) =>
      source.endsWith(file),
    )?.[1];
    return `<figure class="shlz-icon-card" title="${uncertainty ?? ""}"><img src="${url}" alt=""/><figcaption>${name}<small>${colorMode}</small></figcaption></figure>`;
  })
  .join("");

app.innerHTML = `<header class="shlz-hero"><p>SHLZ UI · iteration 1</p><h1>Foundation evidence showcase</h1><p>Инструмент визуальной проверки, не каталог готовых компонентов.</p></header>
<section><h2>Primitive colors ${label("color")}</h2><div class="shlz-palette">${colors}</div></section>
<section><h2>Semantic mapping ${label("semantic")}</h2><div class="shlz-cluster"><div class="shlz-demo-surface">surface.base / text.primary</div><div class="shlz-demo-action">action.primary</div><div class="shlz-demo-status">status.success</div><div class="shlz-demo-danger">status.danger</div></div></section>
<section><h2>Spacing ${label("space")}</h2><div class="shlz-stack">${spaces}</div></section>
<section><h2>Radii, borders, effects ${label("radius")} ${label("shadow")}</h2><div class="shlz-cluster">${radii}<div class="shlz-surface shlz-effect">surface shadow</div></div></section>
<section><h2>Control geometry ${label("control")}</h2><div class="shlz-cluster"><input class="shlz-control" aria-label="Пример поля" value="40 px control"/><button class="shlz-control shlz-focusable">Focus me</button><button class="shlz-control" data-size="sm">32 px</button><button class="shlz-control" disabled>Disabled</button></div><p>Typography: ${label("typography")} — consumer supplies font variables.</p></section>
<section><h2>Icons <span class="shlz-evidence" data-kind="DERIVED">DERIVED · manifest</span></h2><div class="shlz-icon-grid">${iconCards}</div></section>`;
