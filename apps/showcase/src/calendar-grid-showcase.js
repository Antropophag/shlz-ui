import { enhanceCalendarGrids } from "@shlz/behaviors";
export { enhanceCalendarGrids };

const dates = [
  ["28 Aug", "Past · Friday", "past"],
  ["29 Aug", "Today", "today"],
  ["30 Aug", "Unavailable · weekend", "unavailable"],
  ["31 Aug", "Monday", "unavailable"],
  ["1 Sep", "Future · Tuesday", "future"],
];

const header = (prefix) =>
  dates
    .map(
      ([primary, secondary, state], index) =>
        `<th scope="col" id="${prefix}-date-${index}" data-shlz-calendar-grid-state="${state}"><span class="shlz-calendar-grid__date-primary">${primary}</span><span class="shlz-calendar-grid__date-secondary">${secondary}</span></th>`,
    )
    .join("");
const cell = (prefix, row, date, body, state = dates[date][2]) =>
  `<td headers="${prefix}-row-${row} ${prefix}-date-${date}" data-shlz-calendar-grid-state="${state}">${body}</td>`;
const items = (entries, prefix = "grid") =>
  `<ul class="shlz-calendar-grid__items">${entries.map(([label, tone = "accent", hidden = false], index) => `<li class="shlz-calendar-grid__item" data-tone="${tone}"${hidden ? ` id="${prefix}-overflow-${index}" hidden` : ""}>${label}</li>`).join("")}</ul>`;

function grid(prefix, auditId, consumer = false) {
  return `<div class="shlz-calendar-grid" data-shlz-calendar-grid data-component-audit-id="${auditId}"><table aria-label="${consumer ? "Application delivery calendar" : "Calendar Grid source and state matrix"}"><thead><tr><th scope="col" rowspan="2">Workstream</th><th scope="colgroup" colspan="4">August 2026</th><th scope="colgroup">September 2026</th></tr><tr>${header(prefix)}</tr></thead><tbody>
    <tr><th scope="row" id="${prefix}-row-design">Design<span class="shlz-calendar-grid__row-description">Interface and research</span></th>${cell(prefix, "design", 0, `<span class="shlz-calendar-grid__count" aria-label="2 items">2</span>`)}${cell(
      prefix,
      "design",
      1,
      items(
        [
          ["Review calendar grid", "accent"],
          ["Approve localized labels", "success"],
          ["Resolve content stress", "warning", true],
        ],
        prefix,
      ) +
        `<button class="shlz-button shlz-button--sm shlz-calendar-grid__disclosure" type="button" data-shlz-calendar-grid-disclosure="cell" aria-controls="${prefix}-overflow-2" aria-expanded="false">1 more</button>`,
    )}${cell(prefix, "design", 2, `<span class="shlz-calendar-grid__date-secondary">No work · weekend</span>`)}${cell(prefix, "design", 3, `<span class="shlz-calendar-grid__date-secondary">No work · weekend</span>`)}${cell(prefix, "design", 4, consumer ? `<button class="shlz-button shlz-button--sm" type="button" data-calendar-consumer-action>Open item</button>` : "")}</tr>
    <tr><th scope="row" id="${prefix}-row-engineering"><button class="shlz-button shlz-button--sm" type="button" data-shlz-calendar-grid-disclosure="row" aria-controls="${prefix}-engineering-details" aria-expanded="true">Engineering</button><span class="shlz-calendar-grid__row-description">Long localized description wraps without hiding context</span></th>${cell(prefix, "engineering", 0, items([["Package contract", "success"]]))}${cell(prefix, "engineering", 1, items([["Runtime behavior", "accent"]]))}${cell(prefix, "engineering", 2, "")}${cell(prefix, "engineering", 3, "")}${cell(prefix, "engineering", 4, `<div id="${prefix}-engineering-details">${items([["Consumer integration", "warning"]])}</div>`)}</tr>
  </tbody></table></div>`;
}

export const calendarGridShowcaseMarkup = `<article id="calendar-grid-demo"><h3>Calendar Grid</h3><p>Native row-by-date table. Dates, availability, content, and actions are consumer-owned.</p><div data-component-audit-id="button-calendar-grid-showcase">${grid("showcase-grid", "calendar-grid-showcase-source")}</div><section><h4>Data Workspace consumer</h4><p data-calendar-consumer-status>Application action has not run.</p><div data-component-audit-id="button-calendar-grid-consumer">${grid("workspace-grid", "calendar-grid-data-workspace", true)}</div></section></article>`;

export function enhanceCalendarGridShowcase() {
  const controllers = enhanceCalendarGrids();
  document
    .querySelector("[data-calendar-consumer-action]")
    ?.addEventListener("click", () => {
      const status = document.querySelector("[data-calendar-consumer-status]");
      if (status)
        status.textContent = "Application action handled by the consumer.";
    });
  return controllers;
}
