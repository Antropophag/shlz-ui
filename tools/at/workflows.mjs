import { pause } from "./runtime.mjs";

const audit = (id) => `[data-component-audit-id='${id}']`;
const home = (settings) => settings.baseURL + "/?full=1";
const fixture = (settings, name) =>
  settings.baseURL + "/@fs" + settings.repoPosix + "/tools/fixtures/" + name;

async function read(session, selector) {
  return session.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error("Missing state target");
    const active = document.activeElement;
    return {
      active: active === element,
      containsFocus: element.contains(active),
      bodyFocus: active === document.body,
      value: element.value ?? null,
      text: element.textContent?.trim(),
      checked: element.checked ?? null,
      mixed: element.indeterminate ?? null,
      disabled: element.disabled ?? null,
      hidden: element.hidden,
      expanded: element.getAttribute("aria-expanded"),
      invalid: element.getAttribute("aria-invalid"),
      files: Array.from(element.files ?? [], (file) => file.name),
      open: element.open ?? null,
    };
  }, selector);
}

export const workflows = [
  {
    id: "input",
    async run(t, settings) {
      await t.goto(home(settings));
      const selector = "[data-workspace-search]";
      await t.focus(selector);
      await t.checkpoint(
        "name-value",
        async () => {
          await t.key("Ctrl+A");
          await t.type("SD-2418");
        },
        [
          ["field name", /Поиск по заявкам/],
          ["editable role", /edit/],
          ["entered value", /SD-2418/],
        ],
        async () => [
          ["native value", (await read(t, selector)).value === "SD-2418"],
          [
            "consumer filtering",
            (await read(t, "[data-workspace-result-count]")).text === "1",
          ],
        ],
      );
      await t.evaluate((selector) => {
        const input = document.querySelector(selector);
        const error = document.createElement("p");
        error.id = "at-consumer-error";
        error.textContent = "Введите корректный номер заявки";
        input.closest("label").after(error);
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", error.id);
      }, selector);
      await t.checkpoint(
        "invalid-description",
        async () => {},
        [
          ["field name", /Поиск по заявкам/],
          ["invalid state", /invalid/],
          ["consumer error description", /Введите корректный номер заявки/],
        ],
        async () => [
          [
            "native invalid state",
            (await read(t, selector)).invalid === "true",
          ],
        ],
      );
    },
  },
  {
    id: "checkbox",
    async run(t, settings) {
      await t.goto(home(settings));
      const normal = audit("checkbox-medium-default");
      const mixed = audit("checkbox-medium-mixed");
      const disabled = audit("checkbox-medium-disabled");
      await t.focus(normal);
      await t.checkpoint(
        "unchecked",
        async () => {},
        [
          ["checkbox name", /checkbox default/],
          ["checkbox role", /check box/],
          ["unchecked state", /not checked/],
        ],
        async () => [
          ["native unchecked", (await read(t, normal)).checked === false],
        ],
      );
      await t.checkpoint(
        "checked",
        () => t.key("Space"),
        [
          ["checkbox name", /checkbox default/],
          ["checked state", /check box.*(?<!not )checked/],
        ],
        async () => [
          ["native checked", (await read(t, normal)).checked === true],
        ],
      );
      await t.focus(mixed);
      await t.checkpoint(
        "mixed",
        async () => {},
        [
          ["checkbox name", /checkbox mixed/],
          ["mixed state", /half checked|partially checked/],
        ],
        async () => [["native mixed", (await read(t, mixed)).mixed === true]],
      );
      await t.mode("browse");
      await t.checkpoint(
        "disabled",
        () => t.key("F"),
        [
          ["disabled checkbox name", /checkbox checked-disabled/],
          ["unavailable state", /unavailable/],
        ],
        async () => [
          ["native disabled", (await read(t, disabled)).disabled === true],
        ],
        { reportFocus: false },
      );
    },
  },
  {
    id: "select",
    async run(t, settings) {
      await t.goto(home(settings));
      const root = audit("request-status-empty");
      const trigger = root + " .shlz-select__trigger";
      const value = root + " input[type=hidden]";
      await t.focus(trigger);
      await t.checkpoint(
        "collapsed",
        async () => {},
        [
          ["select name", /Статус заявки/],
          ["combobox role", /combo box/],
          ["collapsed state", /collapsed/],
        ],
        async () => [
          ["collapsed DOM", (await read(t, trigger)).expanded === "false"],
        ],
      );
      await t.checkpoint(
        "opened",
        () => t.key("Enter"),
        [["first option", /Новая/]],
        async () => [
          ["expanded DOM", (await read(t, trigger)).expanded === "true"],
          [
            "first option focused",
            (await read(t, root + " [role=option]")).active,
          ],
        ],
      );
      await t.checkpoint(
        "option-next",
        () => t.key("ArrowDown"),
        [["next option", /В работе/]],
        async () => [
          [
            "next option focused",
            (await read(t, root + " [role=option]:nth-child(2)")).active,
          ],
        ],
      );
      await t.checkpoint(
        "committed",
        () => t.key("Enter"),
        [
          ["committed value", /В работе/],
          ["select role", /combo box/],
        ],
        async () => [
          ["value committed", (await read(t, value)).value === "В работе"],
          ["focus returned", (await read(t, trigger)).active],
        ],
      );
      await t.key("Enter");
      await t.key("ArrowDown");
      await t.checkpoint(
        "cancelled",
        async () => {
          await t.key("Escape");
          if ((await read(t, trigger)).expanded === "true")
            await t.key("Escape");
        },
        [
          ["original committed value retained", /В работе/],
          ["collapsed state", /collapsed/],
        ],
        async () => [
          ["value retained", (await read(t, value)).value === "В работе"],
          [
            "closed and returned",
            (await read(t, trigger)).expanded === "false" &&
              (await read(t, trigger)).active,
          ],
        ],
      );
      await t.focus(audit("request-status-focus") + " .shlz-select__trigger");
      await t.mode("browse");
      await t.checkpoint(
        "disabled",
        () => t.key("F"),
        [
          ["disabled select name", /Недоступно/],
          ["unavailable state", /unavailable/],
        ],
        async () => [
          [
            "native disabled",
            (
              await read(
                t,
                audit("request-status-disabled") + " .shlz-select__trigger",
              )
            ).disabled,
          ],
        ],
        { reportFocus: false },
      );
    },
  },
  {
    id: "modal",
    async run(t, settings) {
      await t.goto(home(settings));
      const trigger = "[data-shlz-modal-trigger=showcase-modal]";
      await t.focus(trigger);
      await t.checkpoint(
        "opened",
        () => t.key("Enter"),
        [
          ["dialog name", /Заголовок Modal/],
          ["dialog role", /dialog/],
          ["initial field", /Название/],
        ],
        async () => [
          ["dialog open", (await read(t, "#showcase-modal")).open],
          ["autofocus", (await read(t, "#modal-autofocus")).active],
        ],
      );
      let contained = true;
      await t.checkpoint(
        "contained",
        async () => {
          for (let index = 0; index < 24; index++) {
            await t.key("Tab");
            const state = await read(t, "#showcase-modal");
            contained &&= state.containsFocus || state.bodyFocus;
            if (index > 0 && (await read(t, "#modal-autofocus")).active) break;
          }
          await t.key("Shift+Tab");
        },
        [
          [
            "dialog control conveyed",
            /Название|Закрыть|Dropdown|Tooltip|Popover|Отмена|Сохранить/,
          ],
        ],
        async () => [
          ["no background DOM control reached", contained],
          ["focus in dialog", (await read(t, "#showcase-modal")).containsFocus],
        ],
      );
      await t.checkpoint(
        "dismissed",
        () => t.key("Escape"),
        [
          ["opener name", /Открыть Modal/],
          ["opener role", /button/],
        ],
        async () => [
          ["dialog closed", !(await read(t, "#showcase-modal")).open],
          ["focus returned", (await read(t, trigger)).active],
        ],
      );
    },
  },
  {
    id: "popover",
    async run(t, settings) {
      await t.goto(home(settings));
      const trigger = "[data-shlz-popover-trigger=popover-interactive]";
      await t.focus(trigger);
      await t.checkpoint(
        "expanded",
        () => t.key("Enter"),
        [
          ["trigger name", /Interactive content/],
          ["expanded state", /expanded/],
        ],
        async () => [
          ["expanded DOM", (await read(t, trigger)).expanded === "true"],
        ],
      );
      await t.checkpoint(
        "input",
        () => t.key("Tab"),
        [
          ["content input name", /Значение/],
          ["editable role", /edit/],
        ],
        async () => [
          ["input focused", (await read(t, "#popover-value")).active],
        ],
      );
      await t.checkpoint(
        "action",
        () => t.key("Tab"),
        [
          ["content action name", /Готово/],
          ["button role", /button/],
        ],
        async () => [
          [
            "action focused",
            (await read(t, "#popover-interactive [data-shlz-popover-close]"))
              .active,
          ],
        ],
      );
      await t.checkpoint(
        "dismissed",
        () => t.key("Enter"),
        [
          ["trigger name", /Interactive content/],
          ["collapsed state", /collapsed/],
        ],
        async () => [
          ["surface hidden", (await read(t, "#popover-interactive")).hidden],
          ["focus returned", (await read(t, trigger)).active],
        ],
      );
    },
  },
  {
    id: "date-picker",
    async run(t, settings) {
      await t.goto(fixture(settings, "date-picker.html"));
      const root = "[data-single-picker]";
      const trigger = root + " .shlz-date-field__trigger";
      const input = root + " .shlz-date-field__input";
      await t.focus(trigger);
      await t.checkpoint(
        "opened",
        () => t.key("Enter"),
        [["initial date", /12 августа 2026/]],
        async () => [
          ["calendar expanded", (await read(t, trigger)).expanded === "true"],
          [
            "date focused",
            (await read(t, root + " button[aria-label*='12 августа 2026']"))
              .active,
          ],
        ],
      );
      await t.checkpoint(
        "next-day",
        async () => {
          await t.mode("focus");
          await t.key("ArrowRight");
        },
        [["next date", /13 августа 2026/]],
        async () => [
          [
            "next day focused",
            (await read(t, root + " button[aria-label*='13 августа 2026']"))
              .active,
          ],
        ],
      );
      let returned = false;
      await t.checkpoint(
        "committed",
        async () => {
          await t.key("Enter");
          returned = (await read(t, trigger)).active;
          await t.key("Shift+Tab");
        },
        [
          ["field name", /Дата поездки/],
          ["committed date value", /13.08.2026/],
        ],
        async () => [
          ["returned to trigger after commit", returned],
          [
            "committed field value",
            (await read(t, input)).value === "13.08.2026",
          ],
        ],
      );
      await t.key("Tab");
      await t.key("Enter");
      await t.checkpoint(
        "cancelled",
        async () => {
          await t.key("Escape");
          if ((await read(t, trigger)).expanded === "true")
            await t.key("Escape");
        },
        [
          ["date field trigger name", /Дата поездки/],
          ["collapsed state", /collapsed/],
        ],
        async () => [
          ["calendar closed", (await read(t, trigger)).expanded === "false"],
          ["focus returned", (await read(t, trigger)).active],
          ["value preserved", (await read(t, input)).value === "13.08.2026"],
        ],
      );
    },
  },
  {
    id: "file-upload",
    async run(t, settings) {
      await t.goto(home(settings));
      const input = audit("file-upload-showcase-empty") + " input[type=file]";
      await t.focus(input);
      await t.checkpoint(
        "trigger",
        async () => {},
        [
          ["native file input name", /Нажмите или перетащите файл/],
          ["file chooser role", /button/],
        ],
        async () => [["native input focused", (await read(t, input)).active]],
      );
      await t.checkpoint(
        "selected",
        async () => {
          await t.key("Enter");
          await pause(600);
          await t.key("Ctrl+A", { nativeDialog: true });
          await t.type(settings.sampleFile, { nativeDialog: true });
          await t.key("Enter", { nativeDialog: true });
          await t.waitFor(
            (selector) => document.querySelector(selector).files.length === 1,
            input,
          );
          await t.resetSpeechCapture();
          await t.mode("browse");
          await t.key("L");
          for (let index = 0; index < 5; index++) {
            if ((await t.capturedSpeech()).includes("shlz-at-upload.txt"))
              break;
            await t.key("ArrowDown");
          }
        },
        [["chosen file name in consumer list", /shlz-at-upload.txt/]],
        async () => [
          [
            "exact native selection",
            (await read(t, input)).files[0] === "shlz-at-upload.txt",
          ],
          [
            "consumer renders selected file",
            (
              await read(
                t,
                audit("file-upload-showcase-empty") +
                  " .shlz-file-upload__files",
              )
            ).text.includes("shlz-at-upload.txt"),
          ],
        ],
        { reportFocus: false },
      );
      const error = audit("file-upload-showcase-error") + " input[type=file]";
      await t.focus(error);
      await t.checkpoint(
        "error",
        async () => {},
        [
          ["invalid state", /invalid/],
          ["consumer error", /The consumer rejected this file/],
        ],
        async () => [
          ["native invalid state", (await read(t, error)).invalid === "true"],
        ],
      );
      await t.goto(fixture(settings, "file-upload.html"));
      await t.focus("#fixture-upload");
      await t.checkpoint(
        "plain-error",
        async () => {},
        [
          ["plain HTML invalid state", /invalid/],
          [
            "plain HTML error description",
            /One or more files need consumer validation/,
          ],
        ],
        async () => [
          [
            "plain native invalid state",
            (await read(t, "#fixture-upload")).invalid === "true",
          ],
        ],
      );
      await t.goto(home(settings));
      await t.focus(
        audit("file-upload-showcase-populated") + " .shlz-file-row__action",
      );
      await t.mode("browse");
      await t.checkpoint(
        "disabled",
        () => t.key("F"),
        [
          ["file input name", /Нажмите или перетащите файл/],
          ["unavailable state", /unavailable/],
        ],
        async () => [
          [
            "native disabled",
            (
              await read(
                t,
                audit("file-upload-showcase-disabled") + " input[type=file]",
              )
            ).disabled,
          ],
        ],
        { reportFocus: false },
      );
    },
  },
];
