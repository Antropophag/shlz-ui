import {
  defineComponent,
  h,
  ref,
  type ButtonHTMLAttributes,
  type PropType,
  type VNodeProps,
} from "vue";

export type ButtonVariant = "neutral" | "primary" | "text";
export type ButtonSize = "md" | "sm" | "xs";
export type ButtonProps = Omit<ButtonHTMLAttributes, "type" | "disabled"> & {
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
} & (
    | { iconOnly?: false; size?: ButtonSize }
    | { iconOnly: true; size?: Exclude<ButtonSize, "xs"> }
  );
type RuntimeButtonProps = Omit<ButtonProps, "iconOnly" | "size"> & {
  iconOnly?: boolean;
  size?: ButtonSize;
};

export interface ButtonHandle {
  readonly element: HTMLButtonElement | null;
}

/** Native SHLZ Button. Load @shlz/styles/shlz.css in the consuming application. */
const ButtonImplementation = defineComponent(
  (props: RuntimeButtonProps, { slots, expose }) => {
    const element = ref<HTMLButtonElement | null>(null);
    expose({ element });
    return () => {
      const requestedSize = props.size;
      const iconOnly = props.iconOnly;
      const size = iconOnly && requestedSize === "xs" ? "sm" : requestedSize;
      return h(
        "button",
        {
          ref: element,
          type: props.type,
          disabled: props.disabled,
          class: [
            "shlz-button",
            props.variant !== "neutral" && `shlz-button--${props.variant}`,
            size !== "md" && `shlz-button--${size}`,
            props.iconOnly && "shlz-button--icon",
          ],
        },
        slots.default?.(),
      );
    };
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

// Runtime inputs can bypass TypeScript; expose the stricter supported contract
// and the tested native handle without retaining a permissive constructor.
export const ShlzButton = ButtonImplementation as unknown as {
  new (): Omit<InstanceType<typeof ButtonImplementation>, "$props"> & {
    $props: ButtonProps & VNodeProps;
  } & ButtonHandle;
};
