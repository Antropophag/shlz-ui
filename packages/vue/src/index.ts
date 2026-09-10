import { defineComponent, h, ref, type PropType } from "vue";

export type ButtonVariant = "neutral" | "primary" | "text";
export type ButtonSize = "md" | "sm" | "xs";
export interface ButtonHandle {
  readonly element: HTMLButtonElement | null;
}

/** Native SHLZ Button. Load @shlz/styles/shlz.css in the consuming application. */
export const ShlzButton = defineComponent({
  name: "ShlzButton",
  props: {
    variant: { type: String as PropType<ButtonVariant>, default: "neutral" },
    size: { type: String as PropType<ButtonSize>, default: "md" },
    iconOnly: { type: Boolean, default: false },
    type: {
      type: String as PropType<"button" | "submit" | "reset">,
      default: "button",
    },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, expose }) {
    const element = ref<HTMLButtonElement | null>(null);
    expose({ element });
    return () =>
      h(
        "button",
        {
          ref: element,
          type: props.type,
          disabled: props.disabled,
          class: [
            "shlz-button",
            props.variant !== "neutral" && `shlz-button--${props.variant}`,
            props.size !== "md" && `shlz-button--${props.size}`,
            props.iconOnly && "shlz-button--icon",
          ],
        },
        slots.default?.(),
      );
  },
});
