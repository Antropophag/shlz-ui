import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from "@floating-ui/dom";

const placements = new Set<Placement>([
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
]);

const oppositeSide = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
} as const;

export function readFloatingPlacement(
  value: string | undefined,
  fallback: Placement,
): Placement {
  return value && placements.has(value as Placement)
    ? (value as Placement)
    : fallback;
}

export function readNonNegativeNumber(
  value: string | undefined,
  fallback: number,
): number {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export async function positionFloating(
  reference: Element,
  floating: HTMLElement,
  options: {
    placement: Placement;
    offset: number;
    arrow?: HTMLElement | null;
    arrowPadding?: number;
  },
): Promise<void> {
  const result = await computePosition(reference, floating, {
    placement: options.placement,
    strategy: "fixed",
    middleware: [
      offset(options.offset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      options.arrow &&
        arrow({ element: options.arrow, padding: options.arrowPadding ?? 8 }),
    ],
  });
  Object.assign(floating.style, {
    left: `${result.x}px`,
    top: `${result.y}px`,
    position: result.strategy,
  });
  floating.dataset.placement = result.placement;

  if (options.arrow) {
    const side = result.placement.split("-")[0] as keyof typeof oppositeSide;
    const data = result.middlewareData.arrow;
    Object.assign(options.arrow.style, {
      left: data?.x == null ? "" : `${data.x}px`,
      top: data?.y == null ? "" : `${data.y}px`,
      right: "",
      bottom: "",
      [oppositeSide[side]]: "-5px",
    });
  }
}

export function observeFloating(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
): () => void {
  return autoUpdate(reference, floating, update);
}
