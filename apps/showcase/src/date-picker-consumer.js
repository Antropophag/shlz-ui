import { DatePickerController } from "@shlz/behaviors/date-picker";

export const datePickerConsumerMarkup = `
<section class="shlz-date-picker-consumer" data-date-picker-consumer>
  <h4>Application form consumer</h4>
  <p>A delivery-filter form owned by Showcase. It composes the published behavior entry point and native form data without library-private imports.</p>
  <form class="shlz-date-picker-consumer__form" data-date-picker-consumer-form>
    <div data-date-picker-consumer-root data-component-audit-id="date-picker-calendar-showcase-form-consumer"></div>
    <div class="shlz-cluster">
      <button class="shlz-button shlz-button--primary" type="submit">Применить дату</button>
      <button class="shlz-button" type="reset">Сбросить</button>
    </div>
  </form>
  <output class="shlz-date-picker-consumer__result" data-date-picker-consumer-result aria-live="polite">Фильтр ещё не применён</output>
</section>`;

export function enhanceDatePickerConsumer(root = document) {
  const form = root.querySelector("[data-date-picker-consumer-form]");
  const host = root.querySelector("[data-date-picker-consumer-root]");
  const result = root.querySelector("[data-date-picker-consumer-result]");
  if (!(form instanceof globalThis.HTMLFormElement) || !host || !result)
    return null;

  const controller = new DatePickerController(host, {
    mode: "single",
    label: "Дата поставки для фильтра",
    calendarLabel: "Календарь даты поставки",
    name: "deliveryDate",
    value: "2026-08-12",
    visibleMonth: "2026-08",
    locale: "ru-RU",
    min: "2026-08-01",
    max: "2026-09-30",
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new globalThis.FormData(form);
    result.value = `Дата поставки: ${data.get("deliveryDate") || "не выбрана"}`;
  });
  return controller;
}
