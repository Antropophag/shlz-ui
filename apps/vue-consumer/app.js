import { createSSRApp, defineComponent, h, ref } from "vue";
import { ShlzButton } from "@shlz/vue";

export function createConsumer() {
  return createSSRApp(
    defineComponent({
      setup() {
        const count = ref(0);
        const submitted = ref(0);
        const disabled = ref(false);
        const visible = ref(true);
        const variant = ref("neutral");
        const button = ref(null);
        const icon = () =>
          h("img", {
            class: "shlz-button__icon",
            src: "/packages/icons/dist/icons/plus.svg",
            alt: "",
          });
        const action = (label, props = {}) => h(ShlzButton, props, () => label);
        return () =>
          h(
            "main",
            {
              class: "shlz-scope",
              style: "max-width:720px;margin:24px auto;padding:16px",
            },
            [
              h("h1", "Vue Button consumer"),
              h(
                "section",
                { "data-component-audit-id": "button-vue-consumer" },
                [
                  h(
                    "form",
                    {
                      id: "action-form",
                      onSubmit: (event) => {
                        event.preventDefault();
                        submitted.value++;
                      },
                    },
                    [
                      h("label", [
                        "Draft ",
                        h("input", { name: "draft", value: "Initial" }),
                      ]),
                      visible.value &&
                        action(`Actions: ${count.value}`, {
                          ref: button,
                          id: "reactive-button",
                          class: "consumer-class",
                          style: "vertical-align:middle",
                          "aria-label": "Run action",
                          disabled: disabled.value,
                          variant: variant.value,
                          onClick: () => count.value++,
                        }),
                      action("Submit", {
                        type: "submit",
                        name: "command",
                        value: "save",
                      }),
                      action("Reset", { type: "reset" }),
                    ],
                  ),
                  action("External submit", {
                    type: "submit",
                    form: "action-form",
                    name: "command",
                    value: "external",
                  }),
                  action("Toggle disabled", {
                    onClick: () => {
                      disabled.value = !disabled.value;
                    },
                  }),
                  action("Toggle mount", {
                    onClick: () => {
                      visible.value = !visible.value;
                    },
                  }),
                  action("Change variant", {
                    onClick: () => {
                      variant.value =
                        variant.value === "neutral" ? "primary" : "neutral";
                    },
                  }),
                  action("Focus action", {
                    onClick: () => button.value?.element?.focus(),
                  }),
                  h(
                    "output",
                    { id: "submissions" },
                    `Submissions: ${submitted.value}`,
                  ),
                ],
              ),
              h(
                "section",
                {
                  "data-component-audit-id": "button-vue-matrix",
                  "aria-label": "Button matrix",
                  style:
                    "display:flex;flex-wrap:wrap;gap:16px;margin-block:24px",
                },
                ["neutral", "primary", "text"].flatMap((mode) =>
                  ["md", "sm", "xs"].map((size) =>
                    action(`${mode} ${size}`, {
                      variant: mode,
                      size,
                      "data-case": `${mode}-${size}`,
                    }),
                  ),
                ),
              ),
              h(
                "section",
                {
                  "data-component-audit-id": "button-vue-stress",
                  style: "width:180px;max-width:100%;display:grid;gap:16px",
                },
                [
                  action(
                    "ОченьДлиннаяНеразрывнаяПодписьКнопкиДляПроверкиПереноса",
                    { id: "long-label" },
                  ),
                  h(
                    ShlzButton,
                    {
                      iconOnly: true,
                      style: "justify-self:start",
                      "aria-label": "Add",
                      size: "sm",
                    },
                    icon,
                  ),
                  h(
                    ShlzButton,
                    {
                      iconOnly: true,
                      style: "justify-self:start",
                      "aria-label": "Add large",
                    },
                    icon,
                  ),
                  h(ShlzButton, { id: "leading-icon" }, () => [
                    icon(),
                    "Leading",
                  ]),
                  h(ShlzButton, { id: "trailing-icon" }, () => [
                    "Trailing",
                    icon(),
                  ]),
                ],
              ),
            ],
          );
      },
    }),
  );
}
