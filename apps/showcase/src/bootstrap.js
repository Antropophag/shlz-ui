import "@shlz/styles";
import "./golos-text.css";
import "./fira-sans.css";
import "./showcase.css";
import navigation from "./showcase-navigation.json";

const navigationGroups = navigation.map(({ label, links }) => [label, links]);

export const sectionIndex = Object.freeze(
  navigationGroups.flatMap(([, links]) =>
    links.map(([id, title]) => Object.freeze({ id, title, owner: "showcase" })),
  ),
);

const app = document.querySelector("#app");
const navigationMarkup = navigationGroups
  .map(
    ([label, links]) =>
      `<div class="shlz-docs-nav__group"><h2>${label}</h2>${links
        .map(
          ([id, title]) =>
            `<a href="#${id}" title="${title}" data-shlz-docs-link data-showcase-target="${id}"><span class="shlz-docs-nav__label">${title}</span></a>`,
        )
        .join("")}</div>`,
  )
  .join("");

app.innerHTML = `<header class="shlz-hero"><div class="shlz-hero__intro"><p>SHLZ UI · component library</p><h1>Components and foundations</h1><p>Production contracts and examples, with source verification available on demand.</p></div><div class="shlz-hero__actions"><label class="shlz-shell-search"><span class="shlz-visually-hidden">Search components and foundations</span><input type="search" placeholder="Search components" autocomplete="off" data-shlz-shell-search></label></div><fieldset class="shlz-font-switch" data-shlz-visual-addition><legend>Typography profile</legend><label><input type="radio" name="shlz-font-profile" value="golos" checked>Golos Text</label><label><input type="radio" name="shlz-font-profile" value="fira">Fira Sans</label></fieldset></header>
<div class="shlz-docs-shell" data-shlz-docs-shell><aside class="shlz-docs-sidebar"><div class="shlz-docs-sidebar__header"><a class="shlz-docs-home" href="#top"><span class="shlz-docs-home__label">SHLZ UI</span></a></div><nav id="showcase-navigation" aria-label="Components and foundations">${navigationMarkup}</nav></aside><div class="shlz-docs-main"><section id="foundations" class="shlz-major-section"><h2>Foundation overview</h2><p>SHLZ UI provides source-derived color, typography, spacing, geometry, and framework-neutral component contracts.</p><div class="shlz-component-grid"><article id="colors"><h3>Colors</h3><p>Canonical palettes are generated from the authoritative design source.</p></article><article id="typography"><h3>Typography</h3><p>Golos Text and Fira Sans profiles remain available without loading component diagnostics.</p></article><article id="spacing"><h3>Spacing</h3><p>Spacing follows the generated token contract.</p></article><article id="geometry"><h3>Geometry</h3><p>Component geometry remains documented with its source evidence.</p></article></div></section><section class="shlz-major-section shlz-showcase-loader" data-showcase-loader aria-labelledby="showcase-loader-title"><h2 id="showcase-loader-title">Component documentation</h2><div role="status" aria-live="polite" data-showcase-loader-status>Choose a component to load its documentation and source evidence.</div></section></div></div>`;

document.querySelector("[data-shlz-docs-shell]").dataset.componentAuditId =
  "sidebar-application-shell-showcase";

const loader = document.querySelector("[data-showcase-loader]");
const status = document.querySelector("[data-showcase-loader-status]");
const fullDocumentMode = new window.URLSearchParams(window.location.search).has(
  "full",
);
let state = "idle";
let pending;

const setActiveTarget = (id) => {
  for (const link of document.querySelectorAll("[data-shlz-docs-link]")) {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("shlz-docs-nav__link--active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
};

const importShowcase = () => {
  const override = globalThis.__SHLZ_SHOWCASE_IMPORT__;
  if (typeof override === "function") {
    const result = override();
    if (result) return result;
  }
  return import("./main.js");
};

export const loadShowcase = () => {
  if (state === "ready") return Promise.resolve();
  if (state === "loading") return pending;
  state = "loading";
  loader.dataset.state = state;
  loader.setAttribute("aria-busy", "true");
  status.textContent = "Loading component documentation…";
  const focusedTarget = document.activeElement?.closest?.(
    "[data-showcase-target]",
  )?.dataset.showcaseTarget;
  const eagerHeader = app.querySelector(":scope > .shlz-hero");
  pending = importShowcase()
    .then(() => {
      const loadedContent = app.querySelector(".shlz-docs-content");
      const loadedShell = app.querySelector(".shlz-docs-shell");
      if (!fullDocumentMode && eagerHeader && loadedShell && loadedContent) {
        loadedContent.querySelector(":scope > .shlz-hero")?.remove();
        app.replaceChildren(eagerHeader, loadedShell);
      }
      state = "ready";
      setActiveTarget(window.location.hash.slice(1));
      if (focusedTarget) {
        document
          .querySelector(`[data-shlz-docs-link][href="#${focusedTarget}"]`)
          ?.focus({ preventScroll: true });
      }
    })
    .catch((error) => {
      state = "error";
      loader.dataset.state = state;
      loader.removeAttribute("aria-busy");
      status.innerHTML = `Component documentation could not be loaded. <button class="shlz-button shlz-button--sm" type="button" data-showcase-retry>Retry</button>`;
      throw error;
    });
  return pending;
};

const requestTarget = (id) => {
  if (!id) return;
  setActiveTarget(id);
  loadShowcase().catch(() => {});
};

window.addEventListener("hashchange", () => {
  if (state === "idle") requestTarget(window.location.hash.slice(1));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-showcase-target]");
  if (link) requestTarget(link.dataset.showcaseTarget);
  if (event.target.closest("[data-showcase-retry]")) {
    pending = undefined;
    requestTarget(window.location.hash.slice(1) || "foundations");
  }
});

document
  .querySelector("[data-shlz-shell-search]")
  ?.addEventListener("input", (event) => {
    const query = event.currentTarget.value.trim().toLocaleLowerCase();
    document
      .querySelectorAll("[data-showcase-target], [data-shlz-docs-link]")
      .forEach((link) => {
        link.hidden = Boolean(
          query && !link.textContent.toLocaleLowerCase().includes(query),
        );
      });
  });

document.querySelectorAll('[name="shlz-font-profile"]').forEach((control) => {
  control.addEventListener("change", () => {
    document.body.dataset.shlzFont = control.value;
  });
});

window.__shlzShowcaseLoader = Object.freeze({
  load: loadShowcase,
  get state() {
    return state;
  },
});

const initialTarget = window.location.hash.slice(1);
if (initialTarget) requestTarget(initialTarget);
if (fullDocumentMode) await loadShowcase();
