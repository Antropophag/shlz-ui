export const speechContracts = {
  input: {
    "name-value": [
      ["field name", /Поиск по заявкам/],
      ["editable role", /edit/],
      ["entered value", /SD-2418/],
    ],
    "invalid-description": [
      ["field name", /Поиск по заявкам/],
      ["invalid state", /invalid/],
      ["consumer error description", /Введите корректный номер заявки/],
    ],
  },
  checkbox: {
    unchecked: [
      ["checkbox name", /checkbox default/],
      ["checkbox role", /check box/],
      ["unchecked state", /not checked/],
    ],
    checked: [
      ["checkbox name", /checkbox default/],
      ["checked state", /check box.*(?<!not )checked/],
    ],
    mixed: [
      ["checkbox name", /checkbox mixed/],
      ["mixed state", /half checked|partially checked/],
    ],
    disabled: [
      ["disabled checkbox name", /checkbox checked-disabled/],
      ["unavailable state", /unavailable/],
    ],
  },
  select: {
    collapsed: [
      ["select name", /Статус заявки/],
      ["combobox role", /combo box/],
      ["collapsed state", /collapsed/],
    ],
    opened: [["first option", /Новая/]],
    "option-next": [["next option", /В работе/]],
    committed: [
      ["committed value", /В работе/],
      ["select role", /combo box/],
    ],
    cancelled: [
      ["original committed value retained", /В работе/],
      ["collapsed state", /collapsed/],
    ],
    disabled: [
      ["disabled select name", /Недоступно/],
      ["unavailable state", /unavailable/],
    ],
  },
  modal: {
    opened: [
      ["dialog name", /Заголовок Modal/],
      ["dialog role", /dialog/],
      ["initial field", /Название/],
    ],
    contained: [
      [
        "dialog control conveyed",
        /Название|Закрыть|Dropdown|Tooltip|Popover|Отмена|Сохранить/,
      ],
    ],
    dismissed: [
      ["opener name", /Открыть Modal/],
      ["opener role", /button/],
    ],
  },
  popover: {
    expanded: [
      ["trigger name", /Interactive content/],
      ["expanded state", /expanded/],
    ],
    input: [
      ["content input name", /Значение/],
      ["editable role", /edit/],
    ],
    action: [
      ["content action name", /Готово/],
      ["button role", /button/],
    ],
    untrapped: [
      ["external control", /Около края/],
      ["external button role", /button/],
    ],
    dismissed: [
      ["trigger name", /Interactive content/],
      ["collapsed state", /collapsed/],
    ],
  },
  "date-picker": {
    opened: [["initial date", /12 августа 2026/]],
    "next-day": [["next date", /13 августа 2026/]],
    committed: [
      ["field name", /Дата поездки/],
      ["committed date value", /13\.08\.2026/],
    ],
    cancelled: [
      ["date field trigger name", /Дата поездки/],
      ["collapsed state", /collapsed/],
    ],
  },
  "file-upload": {
    trigger: [
      ["native file input name", /Нажмите или перетащите файл/],
      ["file chooser role", /button/],
    ],
    selected: [["chosen file name in consumer list", /shlz-at-upload\.txt/]],
    error: [
      ["invalid state", /invalid/],
      ["consumer error", /The consumer rejected this file/],
    ],
    "plain-error": [
      ["plain HTML invalid state", /invalid/],
      [
        "plain HTML error description",
        /One or more files need consumer validation/,
      ],
    ],
    disabled: [
      ["file input name", /Нажмите или перетащите файл/],
      ["unavailable state", /unavailable/],
    ],
  },
};

const audit = (id) => `[data-component-audit-id='${id}']`;
const selectRoot = audit("request-status-empty");
const selectTrigger = selectRoot + " .shlz-select__trigger";
const picker = "[data-single-picker]";
const pickerTrigger = picker + " .shlz-date-field__trigger";
const pickerInput = picker + " .shlz-date-field__input";
const fileInput = (id) => audit(id) + " input[type=file]";
const at = (selector, values, extra = {}) => ({ selector, values, ...extra });

export const stateContracts = {
  input: {
    "name-value": {
      "native value": [at("[data-workspace-search]", { value: "SD-2418" })],
      "consumer filtering": [
        at("[data-workspace-result-count]", { text: "1" }),
      ],
    },
    "invalid-description": {
      "native invalid state": [
        at("[data-workspace-search]", { invalid: "true" }),
      ],
    },
  },
  checkbox: {
    unchecked: {
      "native unchecked": [
        at(audit("checkbox-medium-default"), { checked: false }),
      ],
    },
    checked: {
      "native checked": [
        at(audit("checkbox-medium-default"), { checked: true }),
      ],
    },
    mixed: {
      "native mixed": [at(audit("checkbox-medium-mixed"), { mixed: true })],
    },
    disabled: {
      "native disabled": [
        at(audit("checkbox-medium-disabled"), { disabled: true }),
      ],
    },
  },
  select: {
    collapsed: { "collapsed DOM": [at(selectTrigger, { expanded: "false" })] },
    opened: {
      "expanded DOM": [at(selectTrigger, { expanded: "true" })],
      "first option focused": [
        at(selectRoot + " [role=option]", { active: true }),
      ],
    },
    "option-next": {
      "next option focused": [
        at(selectRoot + " [role=option]:nth-child(2)", { active: true }),
      ],
    },
    committed: {
      "value committed": [
        at(selectRoot + " input[type=hidden]", { value: "В работе" }),
      ],
      "focus returned": [at(selectTrigger, { active: true })],
    },
    cancelled: {
      "value retained": [
        at(selectRoot + " input[type=hidden]", { value: "В работе" }),
      ],
      "closed and returned": [
        at(selectTrigger, { expanded: "false", active: true }),
      ],
    },
    disabled: {
      "native disabled": [
        at(audit("request-status-disabled") + " .shlz-select__trigger", {
          disabled: true,
        }),
      ],
    },
  },
  modal: {
    opened: {
      "dialog open": [at("#showcase-modal", { open: true })],
      autofocus: [at("#modal-autofocus", { active: true })],
    },
    contained: {
      "no background DOM control reached": [
        at(
          "#showcase-modal",
          {},
          { every: true, anyTrue: ["containsFocus", "bodyFocus"] },
        ),
      ],
      "focus in dialog": [at("#showcase-modal", { containsFocus: true })],
    },
    dismissed: {
      "dialog closed": [at("#showcase-modal", { open: false })],
      "focus returned": [
        at("[data-shlz-modal-trigger=showcase-modal]", { active: true }),
      ],
    },
  },
  popover: {
    expanded: {
      "expanded DOM": [
        at("[data-shlz-popover-trigger=popover-interactive]", {
          expanded: "true",
        }),
      ],
    },
    input: { "input focused": [at("#popover-value", { active: true })] },
    action: {
      "action focused": [
        at("#popover-interactive [data-shlz-popover-close]", { active: true }),
      ],
    },
    untrapped: {
      "external control focused": [
        at("[data-shlz-popover-trigger=popover-edge]", { active: true }),
      ],
      "popover still open": [at("#popover-interactive", { hidden: false })],
    },
    dismissed: {
      "surface hidden": [at("#popover-interactive", { hidden: true })],
      "focus returned": [
        at("[data-shlz-popover-trigger=popover-interactive]", { active: true }),
      ],
    },
  },
  "date-picker": {
    opened: {
      "calendar expanded": [at(pickerTrigger, { expanded: "true" })],
      "date focused": [
        at(picker + " button[aria-label*='12 августа 2026']", { active: true }),
      ],
    },
    "next-day": {
      "next day focused": [
        at(picker + " button[aria-label*='13 августа 2026']", { active: true }),
      ],
    },
    committed: {
      "returned to trigger after commit": [
        at(pickerTrigger, { active: true }, { actionIndex: 1 }),
      ],
      "committed field value": [at(pickerInput, { value: "13.08.2026" })],
    },
    cancelled: {
      "calendar closed": [at(pickerTrigger, { expanded: "false" })],
      "focus returned": [at(pickerTrigger, { active: true })],
      "value preserved": [at(pickerInput, { value: "13.08.2026" })],
    },
  },
  "file-upload": {
    trigger: {
      "native input focused": [
        at(fileInput("file-upload-showcase-empty"), { active: true }),
      ],
    },
    selected: {
      "exact native selection": [
        at(fileInput("file-upload-showcase-empty"), {
          files: ["shlz-at-upload.txt"],
        }),
      ],
      "consumer renders selected file": [
        at(
          audit("file-upload-showcase-empty") + " .shlz-file-upload__files",
          {},
          { textIncludes: "shlz-at-upload.txt" },
        ),
      ],
    },
    error: {
      "native invalid state": [
        at(fileInput("file-upload-showcase-error"), { invalid: "true" }),
      ],
    },
    "plain-error": {
      "plain native invalid state": [
        at("#fixture-upload", { invalid: "true" }),
      ],
    },
    disabled: {
      "native disabled": [
        at(fileInput("file-upload-showcase-disabled"), { disabled: true }),
      ],
    },
  },
};
