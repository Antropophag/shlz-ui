import {
  defineComponent,
  h,
  ref,
  type ButtonHTMLAttributes,
  type PropType,
} from "vue";

export type ButtonVariant = "neutral" | "primary" | "text";
export type ButtonSize = "md" | "sm" | "xs";
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes,
  "type" | "disabled"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}
export interface ButtonHandle {
  readonly element: HTMLButtonElement | null;
}

/** Native SHLZ Button. Load @shlz/styles/shlz.css in the consuming application. */
const ButtonImplementation = defineComponent(
  (props: ButtonProps, { slots, expose }) => {
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
  {
    name: "ShlzButton",
    // Only adapter-owned props are consumed; native attrs/listeners fall through.
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
  },
);

// Vue's setup-function overload does not infer expose(); bind the tested handle
// to the public instance while retaining native prop and listener inference.
export const ShlzButton =
  ButtonImplementation as typeof ButtonImplementation & {
    new (): InstanceType<typeof ButtonImplementation> & ButtonHandle;
  };
