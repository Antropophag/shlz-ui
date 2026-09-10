import { tablePriority, tableEditIcon, tableMoreIcon } from "./table-parts.js";

const check = (label, checked = false) =>
  `<input class="shlz-checkbox" type="checkbox" aria-label="${label}"${checked ? " checked" : ""}>`;
const status = (label = "Новое") =>
  `<span class="shlz-status${label === "В работе у ОГО" ? " shlz-status--source-blue" : ""}">${label}</span>`;
const toggle = (label) =>
  `<input class="shlz-switch__input" type="checkbox" role="switch" aria-label="${label}" checked>`;
const img = (iconUrl, name, label = "") =>
  `<img class="shlz-table__cell-icon" src="${iconUrl(name)}" alt="${label}">`;
const action = (iconUrl, name, label) =>
  `<button class="shlz-table__icon-action" type="button" tabindex="-1" aria-label="${label}">${name === "edit" ? tableEditIcon() : tableMoreIcon()}</button>`;
// Source decorative gutters/edit slots are folded into logical columns rather
// than exposed as meaningless extra data columns. Widths sum to the source row.
const widths = {
  appeals: [56, 114, 48, 240, 200, 140, 193, 193, 120],
  "status-management": [56, 616, 560, 72],
  "organization-management": [56, 540, 400, 308],
  "profile-management": [56, 400, 400, 448],
  "linked-profiles": [40, 250, 200, 180, 180, 240, 340, 200, 200],
  "category-management": [56, 48, 360, 150, 220, 220, 250],
  "field-management-short": [56, 532, 400, 316],
  "field-management-long": [56, 280, 190, 130, 240, 240, 180, 130, 190, 206],
  "auto-assignment": [56, 340, 200, 220, 260, 230],
  directories: [56, 636, 612],
};
const leadingAction = new Set([
  "status-management",
  "profile-management",
  "field-management-short",
  "field-management-long",
  "auto-assignment",
  "directories",
]);
const head = (order, cells) => ({ order, cells });
const row = (order, cells, state = "default") => ({ order, cells, state });
const table = ({ slug, family, title, width, header, rows }) => {
  const cell = (content, index, isHead) => {
    const tag = isHead ? "th" : "td";
    const classes = ["shlz-table__cell"];
    if (index === 0) classes.push("shlz-table__cell--check");
    if (index === 0 && slug !== "linked-profiles")
      classes.push("shlz-table-composition__leading-gutter");
    if (
      (slug === "appeals" && index === 2) ||
      (slug === "category-management" && index === 1)
    )
      classes.push("shlz-table__cell--priority");
    if (index === 1 && leadingAction.has(slug)) {
      const action = content.match(/<button\b[\s\S]*?<\/button>/)?.[0] ?? "";
      content = `<span class="shlz-table-composition__edit-slot">${action}</span>${content.replace(action, "").trim()}`;
    }
    return `<${tag} class="${classes.join(" ")}"${isHead ? ' scope="col"' : ""}>${content}</${tag}>`;
  };
  const renderRow = (record, isHead = false) =>
    `<tr class="shlz-table__row${["hover", "dots-pressed"].includes(record.state) ? " shlz-table__row--visual-hover" : record.state === "active" ? " shlz-table__row--visual-active" : ""}" data-table-composition-variant="${record.order}" data-source-state="${record.state ?? "default"}" data-source-height="50">${record.cells.map((value, index) => cell(value, index, isHead)).join("")}</tr>`;
  return `<figure class="shlz-table-composition" data-table-composition-family="${family}"><figcaption>${title} · source width ${width}px</figcaption><div class="shlz-table-wrap" data-table-source-scroll tabindex="0" role="region" aria-label="Полная таблица: ${title}"><table class="shlz-table" inert aria-hidden="true" data-component-audit-id="table-composition-${slug}" style="inline-size:${width}px;table-layout:fixed"><caption class="shlz-visually-hidden">${title}, inert Table.svg source composition</caption><colgroup>${widths[slug].map((size) => `<col style="inline-size:${size}px">`).join("")}</colgroup><thead class="shlz-table__head">${renderRow(header, true)}</thead><tbody>${rows.map((record) => renderRow(record)).join("")}</tbody></table></div></figure>`;
};

export const tableCompositionsMarkup = (iconUrl) => {
  const edit = () => action(iconUrl, "edit", "Редактировать");
  const dots = () => action(iconUrl, "more-vertical", "Другие действия");
  const tables = [
    table({
      slug: "appeals",
      family: "appeals",
      title: "Обращения",
      width: 1304,
      header: head(1, [
        check("Выбрать все обращения"),
        "№ обращения",
        img(iconUrl, "flag-filled", "Приоритет"),
        "Тема",
        "Статус",
        "Дата создания",
        "Ответственный ОГО",
        "Ответственный ОКС",
        "Источник",
      ]),
      rows: [
        row(2, [
          check("Выбрать обращение 000040"),
          "000040",
          tablePriority("Приоритет"),
          "Рекламация",
          status("В работе у ОГО"),
          "12.02.2024",
          "Александр Васильев",
          "Панкрещенко Максим",
          "Почта",
        ]),
        row(
          3,
          [
            check("Выбрать обращение 000040"),
            "000040",
            tablePriority("Приоритет"),
            "Рекламация",
            status("В работе у ОГО"),
            "12.02.2024",
            "Александр Васильев",
            "Панкрещенко Максим",
            "Почта",
          ],
          "hover",
        ),
        row(
          4,
          [
            check("Выбрать обращение 000040", true),
            "000040",
            tablePriority("Приоритет"),
            "Рекламация",
            status("В работе у ОГО"),
            "12.02.2024",
            "Александр Васильев",
            "Панкрещенко Максим",
            "Почта",
          ],
          "active",
        ),
      ],
    }),
    table({
      slug: "status-management",
      family: "status-management",
      title: "Управление обращениями — Управление статусами",
      width: 1304,
      header: head(1, [
        check("Выбрать все статусы"),
        "Статус",
        "Дата создания",
        "",
      ]),
      rows: [
        row(2, [check("Выбрать статус"), status(), "12.02.2024", ""]),
        row(
          3,
          [
            check("Выбрать статус"),
            `${edit()} ${status()}`,
            "12.02.2024",
            dots(),
          ],
          "hover",
        ),
        row(
          4,
          [
            check("Выбрать статус"),
            `${edit()} ${status()}`,
            "12.02.2024",
            dots(),
          ],
          "dots-pressed",
        ),
      ],
    }),
    table({
      slug: "organization-management",
      family: "organization-management",
      title: "Управление обращениями — Управление организациями",
      width: 1304,
      header: head(1, [
        check("Выбрать все организации"),
        "Название",
        "Привязанные профили",
        "Обращения",
      ]),
      rows: [
        row(2, [
          check("Выбрать организацию"),
          "УК ‘ГородКомСервис’",
          "92 профиля",
          "12 обращений",
        ]),
        row(
          3,
          [
            check("Выбрать организацию"),
            "УК ‘ГородКомСервис’",
            "92 профиля",
            "12 обращений",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "profile-management",
      family: "profile-management",
      title: "Управление обращениями — Управление профилями",
      width: 1304,
      header: head(1, [
        check("Выбрать все профили"),
        "Имя пользователя",
        "Email",
        "Привязанная организация",
      ]),
      rows: [
        row(2, [
          check("Выбрать профиль"),
          "София Ильина",
          "s.ilina@gmail.com",
          "МУП ‘Лифт-Сервис’",
        ]),
        row(
          3,
          [
            check("Выбрать профиль"),
            `${edit()} София Ильина`,
            "s.ilina@gmail.com",
            "МУП ‘Лифт-Сервис’",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "linked-profiles",
      family: "linked-profiles",
      title: "Управление профилями — Привязанные профили",
      width: 1830,
      header: head(1, [
        check("Выбрать все профили"),
        "ФИО пользователя",
        "Должность",
        "Номер телефона",
        "Доп. номер",
        "Email",
        "Адрес",
        "Дата создания профиля",
        "Дата изменения профиля",
      ]),
      rows: [
        row(2, [
          check("Выбрать профиль"),
          "София Ильина",
          "Менеджер",
          "+7 902 26 76 457",
          "",
          "s.ilina@gmail.com",
          "г. Москва, ул. Центральная, д. 15, офис 20",
          "12.04.2026",
          "",
        ]),
      ],
    }),
    table({
      slug: "category-management",
      family: "category-management",
      title: "Управление обращениями — Управление категориями",
      width: 1304,
      header: head(1, [
        check("Выбрать все категории"),
        img(iconUrl, "flag-filled", "Приоритет"),
        "Название обращения",
        "Активность",
        "Название подкатегории",
        "Тип подкатегории",
        "Отдел",
      ]),
      rows: [
        row(2, [
          check("Выбрать категорию"),
          tablePriority(),
          "Рекламация",
          toggle("Активность категории"),
          "Претензия",
          "Категория 1",
          "ОКС, ОГО, БГО",
        ]),
        row(
          3,
          [
            check("Выбрать категорию"),
            tablePriority(),
            "Рекламация",
            toggle("Активность категории"),
            "Претензия",
            "Категория 1",
            "ОКС, ОГО, БГО",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "field-management-short",
      family: "field-management",
      title: "Управление полями — короткая строка",
      width: 1304,
      header: head(2, [
        check("Выбрать все поля"),
        "Название поля",
        "Тип поля",
        "Обязательность",
      ]),
      rows: [
        row(3, [check("Выбрать поле"), "Тема обращения", "Текстовое", "Да"]),
        row(
          4,
          [
            check("Выбрать поле"),
            `${edit()} Тема обращения`,
            "Текстовое",
            "Да",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "field-management-long",
      family: "field-management",
      title: "Управление полями — длинная строка",
      width: 1842,
      header: head(1, [
        check("Выбрать все поля"),
        "Название поля",
        "Тип поля",
        "Обязательность",
        "Описание",
        "Возможные значения",
        "Максимальная длина",
        "Формат даты",
        "Минимальное значение",
        "Максимальное значение",
      ]),
      rows: [
        row(5, [
          check("Выбрать поле"),
          "Тема обращения",
          "Текстовое",
          "Да",
          "Введите тему обращения",
          "–",
          "255",
          "YYYY-MM-DD",
          "10",
          "150",
        ]),
        row(
          6,
          [
            check("Выбрать поле"),
            `${edit()} Тема обращения`,
            "Текстовое",
            "Да",
            "Введите тему обращения",
            "–",
            "255",
            "YYYY-MM-DD",
            "10",
            "150",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "auto-assignment",
      family: "auto-assignment",
      title: "Управление обращениями — Управление автоназначениями",
      width: 1306,
      header: head(1, [
        check("Выбрать все правила"),
        "Название правила",
        "Активность",
        "Статус обращения",
        "Тип распределения",
        "Отдел",
      ]),
      rows: [
        row(2, [
          check("Выбрать правило"),
          "Новые заявки",
          toggle("Активность правила"),
          status(),
          "Карусель",
          "ОКС",
        ]),
        row(
          3,
          [
            check("Выбрать правило"),
            `${edit()} Новые заявки`,
            toggle("Активность правила"),
            status(),
            "Карусель",
            "ОКС",
          ],
          "hover",
        ),
      ],
    }),
    table({
      slug: "directories",
      family: "directories",
      title: "Управление обращениями — Управление справочниками",
      width: 1304,
      header: head(3, [
        check("Выбрать все справочники"),
        "Название справочника",
        "Подкатегория",
      ]),
      rows: [
        row(1, [check("Выбрать справочник"), "Сотрудники", "Подкатегория 1"]),
        row(
          2,
          [
            check("Выбрать справочник"),
            `${edit()} Сотрудники`,
            "Подкатегория 1",
          ],
          "hover",
        ),
      ],
    }),
  ];
  return `<div class="shlz-table-compositions" aria-label="Table.svg source composition evidence">${tables.join("")}</div>`;
};
