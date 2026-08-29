import { DatePickerController } from "@shlz/behaviors";

const sourceVariants = [
  {
    sourceKey: "large-default-empty-single",
    size: "large",
    state: "default",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "large-default-empty-range",
    size: "large",
    state: "default",
    filled: false,
    ranged: true,
  },
  {
    sourceKey: "large-hover-empty-single",
    size: "large",
    state: "hover",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "medium-default-empty-single",
    size: "medium",
    state: "default",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "medium-default-empty-range",
    size: "medium",
    state: "default",
    filled: false,
    ranged: true,
  },
  {
    sourceKey: "medium-hover-empty-single",
    size: "medium",
    state: "hover",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "large-focused-empty-single",
    size: "large",
    state: "focused",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "large-focused-filled-single",
    size: "large",
    state: "focused",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "medium-focused-empty-single",
    size: "medium",
    state: "focused",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "medium-focused-filled-single",
    size: "medium",
    state: "focused",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "large-default-filled-single",
    size: "large",
    state: "default",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "large-hover-filled-single",
    size: "large",
    state: "hover",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "medium-default-filled-single",
    size: "medium",
    state: "default",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "medium-hover-filled-single",
    size: "medium",
    state: "hover",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "large-disabled-filled-single",
    size: "large",
    state: "disabled",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "medium-disabled-filled-single",
    size: "medium",
    state: "disabled",
    filled: true,
    ranged: false,
  },
  {
    sourceKey: "large-disabled-empty-single",
    size: "large",
    state: "disabled",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "medium-disabled-empty-single",
    size: "medium",
    state: "disabled",
    filled: false,
    ranged: false,
  },
  {
    sourceKey: "large-default-filled-range",
    size: "large",
    state: "default",
    filled: true,
    ranged: true,
  },
  {
    sourceKey: "medium-default-filled-range",
    size: "medium",
    state: "default",
    filled: true,
    ranged: true,
  },
];

const stressScenarios = [
  {
    id: "single",
    title: "Single selection",
    options: {
      mode: "single",
      label: "Дата поставки",
      name: "deliveryDate",
      value: "2026-08-12",
    },
  },
  {
    id: "range",
    title: "Range selection",
    options: {
      mode: "range",
      label: "Начало",
      endLabel: "Окончание",
      startName: "rangeStart",
      endName: "rangeEnd",
      value: { start: "2026-08-12", end: "2026-08-15" },
    },
  },
  {
    id: "constraints",
    title: "Minimum, maximum and disabled dates",
    options: {
      mode: "single",
      label: "Разрешённая дата",
      min: "2026-08-10",
      max: "2026-08-24",
      isDateDisabled: (date) => date === "2026-08-18",
    },
  },
  {
    id: "invalid-input",
    title: "Invalid manual input",
    options: {
      mode: "single",
      label: "Дата проверки",
      error: "Введите полную существующую дату",
    },
    invalidText: "31.02.2026",
  },
  {
    id: "one-month",
    title: "One month",
    options: { mode: "single", label: "Один месяц", monthCount: 1 },
  },
  {
    id: "two-month",
    title: "Two months",
    wide: true,
    options: {
      mode: "range",
      label: "Начало периода",
      endLabel: "Конец периода",
      monthCount: 2,
    },
  },
  {
    id: "narrow",
    title: "Narrow container",
    narrow: true,
    options: {
      mode: "range",
      label: "Начало",
      endLabel: "Конец",
      monthCount: 2,
    },
  },
  {
    id: "long-label",
    title: "Long label",
    options: {
      mode: "single",
      label: "Дата завершения обязательной повторной технической экспертизы",
    },
  },
  {
    id: "locale",
    title: "Locale stress",
    options: {
      mode: "single",
      label: "Realisierungsüberprüfungsdatum",
      locale: "de-DE",
      value: "2026-09-05",
    },
  },
];

const rootMarkup = (id, attributes = "") =>
  `<div class="shlz-date-picker-showcase__fixture" data-date-picker-root="${id}" data-component-audit-id="date-picker-calendar-showcase-${id}" ${attributes}></div>`;

export const datePickerShowcaseMarkup = `
<article id="date-picker-demo" class="shlz-date-picker-showcase" data-shlz-visual-addition data-component-audit-id="popover-date-picker-showcase-consumers">
  <h3>Date Field, Calendar and Date Picker</h3>
  <p><code>Date-Picker.svg</code> supplies the two sizes and twenty visual variants. Calendar behavior, constraints, locale handling and responsive month count are repository decisions from the approved OpenSpec contract.</p>
  <section aria-labelledby="date-picker-source-matrix-title">
    <h4 id="date-picker-source-matrix-title">Authoritative size and state matrix</h4>
    <div class="shlz-date-picker-showcase__matrix">
      ${sourceVariants.map(({ sourceKey }) => rootMarkup(`source-${sourceKey}`, `data-date-picker-source-variant="${sourceKey}"`)).join("")}
    </div>
  </section>
  <section aria-labelledby="date-picker-stress-title">
    <h4 id="date-picker-stress-title">Interaction and content stress</h4>
    <div class="shlz-date-picker-showcase__stress">
      ${stressScenarios.map(({ id, title, narrow, wide }) => `<section class="shlz-date-picker-showcase__scenario${narrow ? " shlz-date-picker-showcase__scenario--narrow" : ""}${wide ? " shlz-date-picker-showcase__scenario--wide" : ""}" data-date-picker-scenario="${id}"><h5>${title}</h5>${rootMarkup(`scenario-${id}`)}</section>`).join("")}
    </div>
  </section>
</article>`;

const baseOptions = {
  calendarLabel: "Календарь Showcase",
  visibleMonth: "2026-08",
  locale: "ru-RU",
};

const sourceVariantValue = (variant, mode) => {
  if (!variant.filled) return undefined;
  if (mode === "range") return { start: "2026-08-12", end: "2026-08-15" };
  return "2026-08-12";
};

const enhanceSourceVariants = (root) => {
  const controllers = [];
  for (const variant of sourceVariants) {
    const host = root.querySelector(
      `[data-date-picker-root="source-${variant.sourceKey}"]`,
    );
    if (!host) continue;
    const mode = variant.ranged ? "range" : "single";
    const controller = new DatePickerController(host, {
      ...baseOptions,
      mode,
      size: variant.size,
      label: variant.ranged ? "Начало периода" : "Дата события",
      ...(mode === "range" ? { endLabel: "Конец периода" } : {}),
      value: sourceVariantValue(variant, mode),
      disabled: variant.state === "disabled",
    });
    controller.root.dataset.showcaseState = variant.state;
    controllers.push(controller);
  }
  return controllers;
};

const enhanceStressScenarios = (root) => {
  const controllers = [];
  for (const scenario of stressScenarios) {
    const host = root.querySelector(
      `[data-date-picker-root="scenario-${scenario.id}"]`,
    );
    if (!host) continue;
    const controller = new DatePickerController(host, {
      ...baseOptions,
      calendarLabel: `${scenario.title}: календарь`,
      ...scenario.options,
    });
    if (scenario.invalidText) {
      controller.field.input.value = scenario.invalidText;
      controller.field.input.dispatchEvent(
        new globalThis.Event("change", { bubbles: true }),
      );
    }
    controllers.push(controller);
  }
  return controllers;
};

export function enhanceDatePickerShowcase(root = document) {
  return [...enhanceSourceVariants(root), ...enhanceStressScenarios(root)];
}
