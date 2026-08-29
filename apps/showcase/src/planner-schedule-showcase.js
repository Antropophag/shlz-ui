const days = [
  ["16", "Monday", "past"],
  ["17", "Tuesday", "past"],
  ["18", "Wednesday", "today"],
  ["19", "Thursday", "future"],
  ["20", "Friday", "future"],
  ["21", "Saturday · unavailable weekend", "future", "weekend"],
  ["22", "Sunday · unavailable weekend", "future", "weekend"],
];

const times = Array.from({ length: 10 }, (_, index) => `${index + 9}:00`);

const events = [
  {
    id: "installation",
    title: "Cabin installation",
    time: "09:00–10:00",
    meta: "Residential complex South Park",
    day: 0,
    start: 0,
    end: 1.5,
    lane: 0,
    lanes: 2,
    tone: "accent",
  },
  {
    id: "warehouse",
    title: "Warehouse intake",
    time: "09:30–10:30",
    meta: "Warehouse No. 2",
    day: 0,
    start: 0.5,
    end: 2,
    lane: 1,
    lanes: 2,
    tone: "neutral",
    state: "canceled",
    status: "Canceled",
  },
  {
    id: "planning",
    title: "Team planning",
    time: "11:00–13:00",
    meta: "Don Street, building 8",
    day: 0,
    start: 2,
    end: 4,
    tone: "success",
    state: "completed",
    status: "Completed",
  },
  {
    id: "repair",
    title: "On-site repair",
    time: "13:00–14:30",
    meta: "Residential complex Dawn",
    day: 1,
    start: 4,
    end: 5.5,
    tone: "accent",
  },
  {
    id: "diagnostics",
    title: "Defect diagnostics with a long localized title",
    time: "11:00–12:00",
    meta: "BGO warehouse",
    day: 3,
    start: 2,
    end: 3,
    tone: "accent",
  },
  {
    id: "meeting",
    title: "Client call",
    time: "15:00–15:30",
    meta: "Online",
    day: 4,
    start: 6,
    end: 6.5,
    tone: "success",
  },
];

const eventMarkup = (prefix, event) => {
  const popoverId = `${prefix}-${event.id}-detail`;
  const state = event.state ? ` data-state="${event.state}"` : "";
  const status = event.status
    ? `<span class="shlz-visually-hidden">${event.status}. </span>`
    : "";
  return `<li class="shlz-planner-schedule__event-slot" style="--shlz-planner-day:${event.day};--shlz-planner-start:${event.start};--shlz-planner-end:${event.end};--shlz-planner-lane:${event.lane ?? 0};--shlz-planner-lane-count:${event.lanes ?? 1}"><button class="shlz-planner-schedule__event" type="button" data-tone="${event.tone}"${state} data-shlz-popover-trigger="${popoverId}" data-shlz-popover-placement="bottom-start" aria-describedby="${prefix}-day-${event.day}">${status}<span class="shlz-planner-schedule__event-title">${event.title}</span><span class="shlz-planner-schedule__event-time">${event.time}</span><span class="shlz-planner-schedule__event-meta">${event.meta}</span></button></li>`;
};

const detailMarkup = (prefix, event, consumer) =>
  `<div class="shlz-popover shlz-planner-detail" id="${prefix}-${event.id}-detail" data-shlz-popover role="dialog" aria-label="${event.title} details" hidden><div class="shlz-popover__body shlz-popover__body--fluid"><div class="shlz-planner-detail__summary"><strong>${event.title}</strong><span>${event.time}</span></div><div class="shlz-planner-detail__row"><span class="shlz-planner-detail__label">Location</span><span>${event.meta}</span></div><div class="shlz-planner-detail__row"><span class="shlz-planner-detail__label">Participants</span><ul class="shlz-planner-detail__participants"><li>Alex Morgan</li><li>Maria Lee</li></ul></div>${consumer ? `<button class="shlz-button shlz-button--sm" type="button" data-planner-consumer-action>Open application record</button>` : ""}<button class="shlz-button shlz-button--sm" type="button" data-shlz-popover-close>Close details</button></div></div>`;

function schedule(prefix, auditId, consumer = false) {
  const dayMarkup = days
    .map(
      ([primary, secondary, state], index) =>
        `<li class="shlz-planner-schedule__day" id="${prefix}-day-${index}" data-shlz-planner-state="${state}"><span class="shlz-planner-schedule__day-primary">${primary}</span><span class="shlz-planner-schedule__day-secondary">${secondary}</span></li>`,
    )
    .join("");
  const timeMarkup = times
    .map((time) => `<li class="shlz-planner-schedule__time">${time}</li>`)
    .join("");
  const surfaces = days
    .map(
      ([, secondary, state, unavailable], index) =>
        `<div class="shlz-planner-schedule__day-surface" style="--shlz-planner-day:${index}" data-shlz-planner-state="${state}"${unavailable ? ` data-shlz-planner-unavailable="${unavailable}" role="img" aria-label="${secondary}"` : ` aria-hidden="true"`}></div>`,
    )
    .join("");
  const selectedEvents = consumer ? events.slice(0, 4) : events;
  const renderedEvents = selectedEvents
    .map((event) => eventMarkup(prefix, event))
    .join("");
  const details = selectedEvents
    .map((event) => detailMarkup(prefix, event, consumer))
    .join("");
  return `<div class="shlz-planner-schedule" data-shlz-planner-schedule data-component-audit-id="${auditId}" style="--shlz-planner-day-count:7;--shlz-planner-slot-count:10;--shlz-planner-max-block-size:28rem" role="region" aria-label="${consumer ? "Application delivery planner" : "Planner Schedule source and state matrix"}"><div class="shlz-planner-schedule__viewport" tabindex="0" aria-label="Scrollable weekly schedule"><div class="shlz-planner-schedule__canvas"><div class="shlz-planner-schedule__corner">UTC+5</div><ol class="shlz-planner-schedule__days" aria-label="Days">${dayMarkup}</ol><ol class="shlz-planner-schedule__times" aria-label="Times">${timeMarkup}</ol><div class="shlz-planner-schedule__body">${surfaces}<div class="shlz-planner-schedule__unavailable-period" style="--shlz-planner-day:4;--shlz-planner-start:7;--shlz-planner-end:10" role="img" aria-label="Friday after 16:00 is unavailable"></div><ol class="shlz-planner-schedule__events" aria-label="Scheduled events">${renderedEvents}</ol><div class="shlz-planner-schedule__now" style="--shlz-planner-now:3.4;--shlz-planner-now-day:2" role="img" aria-label="Current time 12:24"><span class="shlz-planner-schedule__now-label">12:24</span></div></div></div></div><div data-component-audit-id="button-${prefix}-details"><div data-component-audit-id="popover-${prefix}-details">${details}</div></div></div>`;
}

export const plannerScheduleShowcaseMarkup = `<article id="planner-schedule-demo"><h3>Planner Schedule</h3><p>Bounded day-by-time schedule. Dates, placement, status, and actions are consumer-owned.</p>${schedule("planner-source", "planner-schedule-showcase-source")}<section><h4>Data Workspace consumer</h4><p data-planner-consumer-status>Application action has not run.</p>${schedule("planner-consumer", "planner-schedule-data-workspace", true)}</section></article>`;

export function enhancePlannerScheduleShowcase() {
  document
    .querySelectorAll("[data-planner-consumer-action]")
    .forEach((control) =>
      control.addEventListener("click", () => {
        const status = document.querySelector("[data-planner-consumer-status]");
        if (status)
          status.textContent = "Application record action handled by consumer.";
      }),
    );
}
