import { clipBarChartMark } from "./bar-chart-mark.js";
import {
  barChartNeighbor,
  barChartLayout,
  createBarChartModel,
  firstBarChartDatumId,
  setBarChartSeriesVisibility,
  type BarChartData,
  type BarChartDatum,
  type BarChartModel,
} from "./bar-chart-model.js";

export interface BarChartVisibilityChangeDetail {
  visibleSeriesIds: string[];
}

const controllers = new WeakMap<HTMLElement, BarChartController>();
let chartSequence = 0;
const svgNamespace = "http://www.w3.org/2000/svg";

function textElement<K extends keyof HTMLElementTagNameMap>(
  name: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(name);
  element.className = className;
  element.textContent = text;
  return element;
}

export class BarChartController {
  readonly root: HTMLElement;
  #model: BarChartModel;
  #abort = new AbortController();
  #destroyed = false;
  #focusId = "";
  #tableOpen = false;
  #instanceId = `shlz-chart-${++chartSequence}`;
  #activeDatum: BarChartDatum | null = null;
  #resize: ResizeObserver | null = null;

  constructor(root: HTMLElement, data: BarChartData) {
    if (!root.matches("[data-shlz-bar-chart]"))
      throw new TypeError("Bar Chart requires a [data-shlz-bar-chart] root.");
    const model = createBarChartModel(data);
    controllers.get(root)?.destroy();
    this.root = root;
    this.#model = model;
    this.#focusId = firstBarChartDatumId(this.#model);
    controllers.set(root, this);
    this.#render();
  }

  get visibleSeriesIds(): string[] {
    return [...this.#model.visibleSeriesIds];
  }

  update(data: BarChartData): void {
    this.#ensureActive();
    const previousVisible = new Set(this.#model.visibleSeriesIds);
    const previousSeries = new Set(this.#model.data.series.map(({ id }) => id));
    const previousFocus = this.#model.dataById.get(this.#focusId);
    this.#model = createBarChartModel(
      data,
      data.series
        .map(({ id }) => id)
        .filter((id) => previousVisible.has(id) || !previousSeries.has(id)),
    );
    const same =
      this.#model.dataById.has(this.#focusId) &&
      this.#model.visibleSeriesIds.includes(
        this.#model.dataById.get(this.#focusId)!.seriesId,
      );
    if (!same && previousFocus) {
      const category = data.categories.find(
        ({ id }) => id === previousFocus.categoryId,
      );
      const originalIndex = data.series.findIndex(
        ({ id }) => id === previousFocus.seriesId,
      );
      const series = data.series
        .filter(({ id }) => this.#model.visibleSeriesIds.includes(id))
        .sort(
          (left, right) =>
            Math.abs(data.series.indexOf(left) - originalIndex) -
            Math.abs(data.series.indexOf(right) - originalIndex),
        )[0];
      this.#focusId =
        category && series
          ? `${encodeURIComponent(category.id)}::${encodeURIComponent(series.id)}`
          : firstBarChartDatumId(this.#model);
    } else if (!same) this.#focusId = firstBarChartDatumId(this.#model);
    this.#render();
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#abort.abort();
    this.#resize?.disconnect();
    this.root.replaceChildren();
    delete this.root.dataset.shlzBarChartReady;
    if (controllers.get(this.root) === this) controllers.delete(this.root);
  }

  #render(): void {
    const active = this.root.contains(document.activeElement)
      ? document.activeElement?.closest<HTMLElement>("[data-datum-id]")?.dataset
          .datumId
      : undefined;
    const restoreFocus = Boolean(active);
    if (
      active &&
      this.#model.dataById.has(active) &&
      this.#model.visibleSeriesIds.includes(
        this.#model.dataById.get(active)!.seriesId,
      )
    )
      this.#focusId = active;
    this.#activeDatum = null;
    this.#resize?.disconnect();
    this.#abort.abort();
    this.#abort = new AbortController();
    this.root.replaceChildren();
    this.root.classList.add("shlz-bar-chart");
    this.root.dataset.shlzBarChartReady = "true";

    const legend = document.createElement("div");
    legend.className = "shlz-bar-chart__legend";
    legend.setAttribute(
      "aria-label",
      this.root.dataset.legendLabel || "Chart series",
    );
    const visible = new Set(this.#model.visibleSeriesIds);
    this.#model.data.series.forEach((series, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shlz-bar-chart__legend-item";
      button.dataset.seriesId = series.id;
      button.setAttribute("aria-pressed", String(visible.has(series.id)));
      button.disabled = visible.has(series.id) && visible.size === 1;
      if (button.disabled)
        button.setAttribute(
          "aria-label",
          `${series.label}. At least one series must remain visible.`,
        );
      const key = document.createElement("span");
      key.className = `shlz-bar-chart__legend-key shlz-bar-chart__series-${index + 1}${series.tone ? ` shlz-bar-chart__tone-${series.tone}` : ""}`;
      key.setAttribute("aria-hidden", "true");
      button.append(key, document.createTextNode(series.label));
      button.addEventListener("click", () => this.#toggle(series.id), {
        signal: this.#abort.signal,
      });
      legend.append(button);
    });

    const viewport = document.createElement("div");
    viewport.className = "shlz-bar-chart__viewport";
    viewport.setAttribute("role", "region");
    viewport.setAttribute(
      "aria-label",
      this.root.dataset.plotLabel || "Grouped bar chart plot",
    );
    const categoryCount = this.#model.data.categories.length;
    const seriesCount = this.#model.visibleSeriesIds.length;
    const layout = barChartLayout(this.#model);
    const { width, height, plotWidth, plotHeight, groupWidth, gap, barWidth } =
      layout;
    const padding = { top: 16, right: 16, bottom: 52, left: 48 };
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.classList.add("shlz-bar-chart__plot");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("role", "group");
    svg.setAttribute(
      "aria-label",
      this.root.dataset.plotLabel || "Grouped bar chart plot",
    );
    for (let index = 0; index < 6; index += 1) {
      const y = padding.top + (plotHeight * index) / 5;
      const line = document.createElementNS(svgNamespace, "line");
      line.classList.add("shlz-bar-chart__grid-line");
      line.setAttribute("x1", String(padding.left));
      line.setAttribute("x2", String(width - padding.right));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      svg.append(line);
      const label = document.createElementNS(svgNamespace, "text");
      label.classList.add("shlz-bar-chart__axis-label");
      label.setAttribute("x", String(padding.left - 12));
      label.setAttribute("y", String(y + 4));
      label.setAttribute("text-anchor", "end");
      label.setAttribute("aria-hidden", "true");
      label.textContent = String(
        Number((layout.maximum * ((5 - index) / 5)).toPrecision(6)),
      );
      svg.append(label);
    }
    const visibleSeries = this.#model.data.series.filter(({ id }) =>
      visible.has(id),
    );
    this.#model.data.categories.forEach((category, categoryIndex) => {
      const groupBarsWidth = seriesCount * barWidth + (seriesCount - 1) * gap;
      const groupStart =
        padding.left +
        groupWidth * categoryIndex +
        (groupWidth - groupBarsWidth) / 2;
      visibleSeries.forEach((series, visibleIndex) => {
        const datum = [...this.#model.dataById.values()].find(
          (item) =>
            item.categoryId === category.id && item.seriesId === series.id,
        )!;
        const ratio = datum.value / layout.maximum;
        const renderedHeight = ratio * plotHeight;
        const rect = document.createElementNS(svgNamespace, "rect");
        rect.classList.add(
          "shlz-bar-chart__bar",
          `shlz-bar-chart__series-${datum.seriesIndex + 1}`,
        );
        if (series.tone)
          rect.classList.add(`shlz-bar-chart__tone-${series.tone}`);
        rect.dataset.datumId = datum.id;
        rect.dataset.categoryIndex = String(categoryIndex);
        rect.setAttribute(
          "x",
          String(groupStart + visibleIndex * (barWidth + gap)),
        );
        rect.setAttribute(
          "y",
          String(padding.top + plotHeight - renderedHeight),
        );
        rect.setAttribute("width", String(barWidth));
        rect.setAttribute("height", String(renderedHeight));
        svg.append(
          clipBarChartMark(
            rect,
            `${this.#instanceId}-bar-${categoryIndex}-${visibleIndex}`,
          ),
        );
        if (datum.value === 0) {
          const visual = rect.cloneNode() as SVGRectElement;
          visual.classList.remove("shlz-bar-chart__bar");
          delete visual.dataset.datumId;
          visual.setAttribute("aria-hidden", "true");
          svg.append(visual);
          // Interaction geometry only: retain zero quantitative paint.
          rect.classList.add("shlz-bar-chart__bar--zero");
          rect.removeAttribute("clip-path");
          rect.setAttribute("height", "12");
          rect.setAttribute("y", String(padding.top + plotHeight - 12));
        }
        rect.setAttribute("tabindex", datum.id === this.#focusId ? "0" : "-1");
        rect.setAttribute("role", "img");
        rect.setAttribute(
          "aria-label",
          `${datum.categoryLabel}, ${datum.seriesLabel}: ${datum.displayValue}`,
        );
        this.#bindBar(rect, datum, viewport);
        svg.append(rect);
      });
      const tick = document.createElementNS(svgNamespace, "line");
      tick.classList.add("shlz-bar-chart__tick");
      const center = padding.left + groupWidth * (categoryIndex + 0.5);
      tick.setAttribute("x1", String(center));
      tick.setAttribute("x2", String(center));
      tick.setAttribute("y1", String(padding.top + plotHeight));
      tick.setAttribute("y2", String(padding.top + plotHeight + 6));
      svg.append(tick);
      if (
        layout.sparse &&
        ![0, Math.floor((categoryCount - 1) / 2), categoryCount - 1].includes(
          categoryIndex,
        )
      )
        return;
      const label = document.createElementNS(svgNamespace, "text");
      label.classList.add("shlz-bar-chart__axis-label");
      label.setAttribute(
        "x",
        String(padding.left + groupWidth * (categoryIndex + 0.5)),
      );
      label.setAttribute("y", String(height - 18));
      label.setAttribute("text-anchor", "middle");
      label.textContent =
        category.label.length > 16
          ? `${category.label.slice(0, 15)}…`
          : category.label;
      label.setAttribute("aria-hidden", "true");
      svg.append(label);
    });
    const guide = document.createElementNS(svgNamespace, "line");
    guide.classList.add("shlz-bar-chart__guide");
    guide.setAttribute("y1", String(padding.top));
    guide.setAttribute("y2", String(padding.top + plotHeight));
    guide.setAttribute("visibility", "hidden");
    svg.append(guide);
    const badge = document.createElementNS(svgNamespace, "g");
    badge.classList.add("shlz-bar-chart__active-period");
    badge.setAttribute("visibility", "hidden");
    badge.setAttribute("aria-hidden", "true");
    const badgeRect = document.createElementNS(svgNamespace, "rect");
    badgeRect.setAttribute("height", "22");
    badgeRect.setAttribute("rx", "8");
    const badgeText = document.createElementNS(svgNamespace, "text");
    badgeText.setAttribute("text-anchor", "middle");
    badgeText.setAttribute("y", "15");
    badge.append(badgeRect, badgeText);
    svg.append(badge);
    viewport.append(svg);

    const tooltip = document.createElement("div");
    tooltip.className = "shlz-bar-chart__tooltip";
    tooltip.id = `${this.#instanceId}-tooltip`;
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;

    const details = document.createElement("details");
    details.className = "shlz-bar-chart__data";
    details.open = this.#tableOpen;
    const summary = document.createElement("summary");
    summary.textContent = this.root.dataset.tableLabel || "Show data table";
    details.append(summary, this.#table());
    details.addEventListener(
      "toggle",
      () => {
        this.#tableOpen = details.open;
      },
      { signal: this.#abort.signal },
    );
    this.root.append(legend, viewport, tooltip, details);
    viewport.addEventListener("scroll", () => this.#positionTooltip(), {
      signal: this.#abort.signal,
    });
    this.#resize = new ResizeObserver(() => this.#positionTooltip());
    this.#resize.observe(this.root);
    this.root.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") this.#hideTooltip();
      },
      { signal: this.#abort.signal },
    );
    if (restoreFocus)
      this.root
        .querySelector<SVGRectElement>(
          `[data-datum-id="${CSS.escape(this.#focusId)}"]`,
        )
        ?.focus({ preventScroll: true });
  }

  #table(): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "shlz-bar-chart__table-wrap";
    const table = document.createElement("table");
    table.className = "shlz-bar-chart__table";
    const caption = document.createElement("caption");
    caption.textContent = this.root.dataset.tableCaption || "Chart data";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const categoryHead = textElement(
      "th",
      "",
      this.root.dataset.categoryLabel || "Category",
    );
    categoryHead.scope = "col";
    headRow.append(categoryHead);
    const visible = new Set(this.#model.visibleSeriesIds);
    for (const series of this.#model.data.series.filter(({ id }) =>
      visible.has(id),
    )) {
      const header = textElement("th", "", series.label);
      header.scope = "col";
      headRow.append(header);
    }
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    for (const category of this.#model.data.categories) {
      const row = document.createElement("tr");
      const header = textElement("th", "", category.label);
      header.scope = "row";
      row.append(header);
      for (const series of this.#model.data.series.filter(({ id }) =>
        visible.has(id),
      )) {
        const datum = [...this.#model.dataById.values()].find(
          (item) =>
            item.categoryId === category.id && item.seriesId === series.id,
        )!;
        row.append(textElement("td", "", datum.displayValue));
      }
      tbody.append(row);
    }
    table.append(caption, thead, tbody);
    wrapper.append(table);
    return wrapper;
  }

  #bindBar(
    rect: SVGRectElement,
    datum: BarChartDatum,
    viewport: HTMLElement,
  ): void {
    const show = () => this.#showTooltip(datum);
    rect.addEventListener(
      "pointerenter",
      () => {
        if (!this.root.querySelector(".shlz-bar-chart__bar:focus")) show();
      },
      { signal: this.#abort.signal },
    );
    rect.addEventListener(
      "pointerleave",
      () => {
        if (!this.root.querySelector(".shlz-bar-chart__bar:focus"))
          this.#hideTooltip();
      },
      { signal: this.#abort.signal },
    );
    rect.addEventListener(
      "blur",
      (event) => {
        if (
          !(event.relatedTarget instanceof SVGRectElement) ||
          !this.root.contains(event.relatedTarget)
        )
          this.#hideTooltip();
      },
      { signal: this.#abort.signal },
    );
    rect.addEventListener(
      "focus",
      () => {
        this.#focusId = datum.id;
        for (const bar of this.root.querySelectorAll<SVGRectElement>(
          "[data-datum-id]",
        ))
          bar.setAttribute("tabindex", bar === rect ? "0" : "-1");
        show();
      },
      { signal: this.#abort.signal },
    );
    rect.addEventListener(
      "keydown",
      (event) => {
        if (
          ![
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ].includes(event.key)
        )
          return;
        event.preventDefault();
        const next = barChartNeighbor(
          this.#model,
          datum.id,
          event.key as Parameters<typeof barChartNeighbor>[2],
        );
        const target = this.root.querySelector<SVGRectElement>(
          `[data-datum-id="${CSS.escape(next)}"]`,
        );
        if (target && target !== rect) {
          this.#focusId = next;
          target.focus({ preventScroll: true });
          target.scrollIntoView({ block: "nearest", inline: "nearest" });
          viewport.scrollTop = 0;
        }
      },
      { signal: this.#abort.signal },
    );
  }

  #showTooltip(datum: BarChartDatum): void {
    const tooltip = this.root.querySelector<HTMLElement>(
      ".shlz-bar-chart__tooltip",
    );
    if (!tooltip) return;
    this.#activeDatum = datum;
    for (const bar of this.root.querySelectorAll<SVGRectElement>(
      ".shlz-bar-chart__bar",
    )) {
      if (bar.dataset.datumId === datum.id)
        bar.setAttribute("aria-describedby", tooltip.id);
      else bar.removeAttribute("aria-describedby");
    }
    tooltip.replaceChildren(
      textElement(
        "strong",
        "shlz-bar-chart__tooltip-period",
        datum.categoryLabel,
      ),
    );
    this.#model.data.series.forEach((series, index) => {
      if (!this.#model.visibleSeriesIds.includes(series.id)) return;
      const value = series.values.find(
        (item) => item.categoryId === datum.categoryId,
      )!;
      const row = document.createElement("div");
      row.className = "shlz-bar-chart__tooltip-row";
      const key = document.createElement("i");
      key.className = `shlz-bar-chart__legend-key shlz-bar-chart__series-${index + 1}${series.tone ? ` shlz-bar-chart__tone-${series.tone}` : ""}`;
      key.setAttribute("aria-hidden", "true");
      row.append(
        key,
        textElement(
          "span",
          "shlz-bar-chart__tooltip-label",
          `${series.label}: `,
        ),
        textElement(
          "span",
          "shlz-bar-chart__tooltip-value",
          value.displayValue,
        ),
      );
      tooltip.append(row);
    });
    for (const bar of this.root.querySelectorAll<SVGRectElement>(
      ".shlz-bar-chart__bar",
    )) {
      bar.classList.toggle(
        "shlz-bar-chart__bar--muted",
        bar.dataset.categoryIndex !== String(datum.categoryIndex),
      );
    }
    const layout = barChartLayout(this.#model);
    const center = 48 + layout.groupWidth * (datum.categoryIndex + 0.5);
    const guide = this.root.querySelector<SVGLineElement>(
      ".shlz-bar-chart__guide",
    )!;
    guide.setAttribute("x1", String(center));
    guide.setAttribute("x2", String(center));
    guide.setAttribute("visibility", "visible");
    const badge = this.root.querySelector<SVGGElement>(
      ".shlz-bar-chart__active-period",
    )!;
    const text =
      datum.categoryLabel.length > 18
        ? `${datum.categoryLabel.slice(0, 17)}…`
        : datum.categoryLabel;
    const badgeText = badge.querySelector("text")!;
    badgeText.textContent = text;
    const badgeWidth = Math.min(
      layout.groupWidth,
      Math.max(64, badgeText.getComputedTextLength() + 16),
    );
    badge.querySelector("rect")!.setAttribute("width", String(badgeWidth));
    badgeText.setAttribute("x", String(badgeWidth / 2));
    badge.setAttribute(
      "transform",
      `translate(${center - badgeWidth / 2}, ${layout.height - 33})`,
    );
    badge.setAttribute("visibility", "visible");
    tooltip.hidden = false;
    this.#positionTooltip();
  }

  #positionTooltip(): void {
    if (!this.#activeDatum) return;
    const tooltip = this.root.querySelector<HTMLElement>(
      ".shlz-bar-chart__tooltip",
    );
    const plot = this.root.querySelector<SVGSVGElement>(
      ".shlz-bar-chart__plot",
    );
    if (!tooltip || !plot || tooltip.hidden) return;
    const layout = barChartLayout(this.#model);
    const rootBox = this.root.getBoundingClientRect();
    const plotBox = plot.getBoundingClientRect();
    const scale = plotBox.width / layout.width;
    const center =
      plotBox.left -
      rootBox.left +
      (48 + layout.groupWidth * (this.#activeDatum.categoryIndex + 0.5)) *
        scale;
    const left = Math.max(
      8,
      Math.min(
        center - tooltip.offsetWidth / 2,
        this.root.clientWidth - tooltip.offsetWidth - 8,
      ),
    );
    const below = this.#model.data.presentation?.tooltipPlacement === "below";
    tooltip.dataset.placement = below ? "below" : "above";
    const top = below
      ? plotBox.top - rootBox.top + (16 + layout.plotHeight) * scale + 38
      : Math.max(
          0,
          plotBox.top - rootBox.top + 16 * scale - tooltip.offsetHeight - 10,
        );
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.setProperty(
      "--shlz-chart-arrow-x",
      `${Math.max(12, Math.min(tooltip.offsetWidth - 12, center - left))}px`,
    );
    // Reserve space inside clipping widget shells for below-axis disclosure.
    const viewport = this.root.querySelector<HTMLElement>(
      ".shlz-bar-chart__viewport",
    )!;
    viewport.style.marginBottom = below ? `${tooltip.offsetHeight + 24}px` : "";
  }

  #hideTooltip(): void {
    this.#activeDatum = null;
    const tooltip = this.root.querySelector<HTMLElement>(
      ".shlz-bar-chart__tooltip",
    );
    if (tooltip) tooltip.hidden = true;
    for (const bar of this.root.querySelectorAll(
      ".shlz-bar-chart__bar[aria-describedby]",
    ))
      bar.removeAttribute("aria-describedby");
    const viewport = this.root.querySelector<HTMLElement>(
      ".shlz-bar-chart__viewport",
    );
    if (viewport) viewport.style.marginBottom = "";
    for (const bar of this.root.querySelectorAll(".shlz-bar-chart__bar--muted"))
      bar.classList.remove("shlz-bar-chart__bar--muted");
    for (const decoration of this.root.querySelectorAll(
      ".shlz-bar-chart__guide, .shlz-bar-chart__active-period",
    ))
      decoration.setAttribute("visibility", "hidden");
  }

  #toggle(seriesId: string): void {
    const visible = this.#model.visibleSeriesIds.includes(seriesId);
    const focus = this.#model.dataById.get(this.#focusId);
    this.#model = setBarChartSeriesVisibility(this.#model, seriesId, !visible);
    if (focus && !this.#model.visibleSeriesIds.includes(focus.seriesId)) {
      const fallbackSeries = this.#model.visibleSeriesIds[0];
      this.#focusId = `${encodeURIComponent(focus.categoryId)}::${encodeURIComponent(fallbackSeries)}`;
    }
    this.#render();
    const legend = this.root.querySelector<HTMLButtonElement>(
      `button[data-series-id="${CSS.escape(seriesId)}"]`,
    );
    if (legend && !legend.disabled) legend.focus({ preventScroll: true });
    this.root.dispatchEvent(
      new CustomEvent<BarChartVisibilityChangeDetail>(
        "shlz:bar-chart-visibility-change",
        {
          bubbles: true,
          detail: { visibleSeriesIds: [...this.#model.visibleSeriesIds] },
        },
      ),
    );
  }

  #ensureActive(): void {
    if (this.#destroyed) throw new Error("Bar Chart controller is destroyed.");
  }
}

export function enhanceBarCharts(
  scope: ParentNode = document,
): BarChartController[] {
  const roots: HTMLElement[] = [];
  if (scope instanceof HTMLElement && scope.matches("[data-shlz-bar-chart]"))
    roots.push(scope);
  roots.push(...scope.querySelectorAll<HTMLElement>("[data-shlz-bar-chart]"));
  return roots.map((root) => {
    const existing = controllers.get(root);
    if (existing) return existing;
    const script = root.querySelector<HTMLScriptElement>(
      'script[type="application/json"][data-shlz-bar-chart-data]',
    );
    if (!script?.textContent)
      throw new TypeError("Bar Chart requires JSON data.");
    return new BarChartController(
      root,
      JSON.parse(script.textContent) as BarChartData,
    );
  });
}
