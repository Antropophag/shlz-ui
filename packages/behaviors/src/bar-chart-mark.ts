import { barChartTones, type BarChartTone } from "./bar-chart-model.js";

const svgNamespace = "http://www.w3.org/2000/svg";
let swatchSequence = 0;

// Source top contours normalized from Dashboard.svg; shaft height is data-owned.
const sourceTops: Record<string, Array<[string, ...number[]]>> = {
  "24.0": [
    ["M", 0.0, 9.6],
    ["C", 0.0, 6.24, 0.0, 4.56, 0.654, 3.276],
    ["C", 1.229, 2.147, 2.147, 1.229, 3.276, 0.654],
    ["C", 4.56, 0.0, 6.24, 0.0, 9.6, 0.0],
    ["H", 14.4],
    ["C", 17.76, 0.0, 19.44, 0.0, 20.724, 0.654],
    ["C", 21.853, 1.229, 22.771, 2.147, 23.346, 3.276],
    ["C", 24.0, 4.56, 24.0, 6.24, 24.0, 9.6],
  ],
  "21.0": [
    ["M", 0.0, 9.6],
    ["C", 0.0, 6.24, 0.0, 4.56, 0.654, 3.28],
    ["C", 1.229, 2.15, 2.147, 1.23, 3.276, 0.66],
    ["C", 4.56, 0.0, 6.24, 0.0, 9.6, 0.0],
    ["H", 11.4],
    ["C", 14.76, 0.0, 16.44, 0.0, 17.724, 0.66],
    ["C", 18.853, 1.23, 19.771, 2.15, 20.346, 3.28],
    ["C", 21.0, 4.56, 21.0, 6.24, 21.0, 9.6],
  ],
  "96.0": [
    ["M", 0.0, 19.2],
    ["C", 0.0, 12.48, 0.0, 9.12, 1.308, 6.55],
    ["C", 2.458, 4.3, 4.294, 2.46, 6.552, 1.31],
    ["C", 9.119, 0.0, 12.479, 0.0, 19.2, 0.0],
    ["H", 76.8],
    ["C", 83.521, 0.0, 86.881, 0.0, 89.448, 1.31],
    ["C", 91.706, 2.46, 93.542, 4.3, 94.692, 6.55],
    ["C", 96.0, 9.12, 96.0, 12.48, 96.0, 19.2],
  ],
  "7.0": [
    ["M", 0.0, 3.2],
    ["C", 0.0, 2.08, 0.0, 1.52, 0.22, 1.09],
    ["C", 0.41, 0.72, 0.72, 0.41, 1.09, 0.22],
    ["C", 1.52, 0.0, 2.08, 0.0, 3.2, 0.0],
    ["H", 3.8],
    ["C", 4.92, 0.0, 5.48, 0.0, 5.91, 0.22],
    ["C", 6.28, 0.41, 6.59, 0.72, 6.78, 1.09],
    ["C", 7.0, 1.52, 7.0, 2.08, 7.0, 3.2],
  ],
  "12.33": [
    ["M", 0.0, 4.8],
    ["C", 0.0, 3.12, 0.0, 2.28, 0.33, 1.64],
    ["C", 0.61, 1.07, 1.07, 0.62, 1.64, 0.33],
    ["C", 2.28, 0.0, 3.12, 0.0, 4.8, 0.0],
    ["H", 7.53],
    ["C", 9.21, 0.0, 10.05, 0.0, 10.7, 0.33],
    ["C", 11.26, 0.62, 11.72, 1.07, 12.01, 1.64],
    ["C", 12.33, 2.28, 12.33, 3.12, 12.33, 4.8],
  ],
  "12.34": [
    ["M", 0.0, 4.8],
    ["C", 0.0, 3.12, 0.0, 2.28, 0.33, 1.64],
    ["C", 0.62, 1.07, 1.08, 0.62, 1.64, 0.33],
    ["C", 2.28, 0.0, 3.12, 0.0, 4.8, 0.0],
    ["H", 7.54],
    ["C", 9.22, 0.0, 10.06, 0.0, 10.7, 0.33],
    ["C", 11.26, 0.62, 11.72, 1.07, 12.01, 1.64],
    ["C", 12.34, 2.28, 12.34, 3.12, 12.34, 4.8],
  ],
  "62.75": [
    ["M", 0.0, 19.2],
    ["C", 0.0, 12.48, 0.0, 9.12, 1.31, 6.55],
    ["C", 2.46, 4.3, 4.29, 2.46, 6.55, 1.31],
    ["C", 9.12, 0.0, 12.48, 0.0, 19.2, 0.0],
    ["H", 43.55],
    ["C", 50.27, 0.0, 53.63, 0.0, 56.2, 1.31],
    ["C", 58.46, 2.46, 60.29, 4.3, 61.44, 6.55],
    ["C", 62.75, 9.12, 62.75, 12.48, 62.75, 19.2],
  ],
  "62.67": [
    ["M", 0.0, 19.2],
    ["C", 0.0, 12.48, 0.0, 9.12, 1.31, 6.55],
    ["C", 2.46, 4.3, 4.29, 2.46, 6.55, 1.31],
    ["C", 9.12, 0.0, 12.48, 0.0, 19.2, 0.0],
    ["H", 43.47],
    ["C", 50.19, 0.0, 53.55, 0.0, 56.11, 1.31],
    ["C", 58.37, 2.46, 60.21, 4.3, 61.36, 6.55],
    ["C", 62.67, 9.12, 62.67, 12.48, 62.67, 19.2],
  ],
  "62.66": [
    ["M", 0.0, 19.2],
    ["C", 0.0, 12.48, 0.0, 9.12, 1.3, 6.55],
    ["C", 2.46, 4.3, 4.29, 2.46, 6.55, 1.31],
    ["C", 9.12, 0.0, 12.48, 0.0, 19.2, 0.0],
    ["H", 43.46],
    ["C", 50.18, 0.0, 53.54, 0.0, 56.11, 1.31],
    ["C", 58.37, 2.46, 60.21, 4.3, 61.36, 6.55],
    ["C", 62.66, 9.12, 62.66, 12.48, 62.66, 19.2],
  ],
};

/** Shared quantitative shape: preserve source top curves and a square baseline. */
export function clipBarChartMark(
  mark: SVGRectElement,
  id: string,
): SVGClipPathElement {
  const width = Number(mark.getAttribute("width"));
  const height = Number(mark.getAttribute("height"));
  const x = Number(mark.getAttribute("x") ?? 0);
  const y = Number(mark.getAttribute("y") ?? 0);
  const clip = document.createElementNS(svgNamespace, "clipPath");
  clip.id = id;
  const matchedWidth = Object.keys(sourceTops).find(
    (value) => Math.abs(Number(value) - width) < 0.006,
  );
  const shape = document.createElementNS(svgNamespace, "path");
  if (matchedWidth) {
    const commands = sourceTops[matchedWidth];
    const topHeight = commands[0][2];
    const scaleY = Math.min(1, height / Math.max(1, topHeight));
    const top = commands
      .map(
        ([command, ...values]) =>
          command +
          values
            .map((value, index) =>
              command === "H" || index % 2 === 0
                ? x + (value * width) / Number(matchedWidth)
                : y + value * scaleY,
            )
            .join(" "),
      )
      .join("");
    shape.setAttribute("d", `${top}V${y + height + topHeight}H${x}Z`);
  } else {
    // Arbitrary-width dataset fallback; only the named source widths are exact contours.
    let nominalRadius = 16;
    if (width <= 24) nominalRadius = 8;
    if (width < 16) nominalRadius = 4;
    const radius = Math.min(nominalRadius, width / 2, height / 2);
    shape.setAttribute(
      "d",
      `M${x} ${y + radius}Q${x} ${y} ${x + radius} ${y}H${x + width - radius}Q${x + width} ${y} ${x + width} ${y + radius}V${y + height + radius}H${x}Z`,
    );
  }
  clip.append(shape);
  mark.setAttribute("clip-path", `url(#${id})`);
  return clip;
}

/** Decorative 24×200 source swatch; callers supply its visible label. */
export function createBarChartSwatch(
  tone: BarChartTone,
  muted = false,
): SVGSVGElement {
  if (!barChartTones.includes(tone))
    throw new TypeError("Unknown Bar Chart tone.");
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 200");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "200");
  svg.setAttribute("aria-hidden", "true");
  const mark = document.createElementNS(svgNamespace, "rect");
  mark.setAttribute("width", "24");
  mark.setAttribute("height", "200");
  mark.classList.add(`shlz-bar-chart__tone-${tone}`);
  if (muted) mark.classList.add("shlz-bar-chart__bar--muted");
  svg.append(
    clipBarChartMark(mark, `shlz-chart-swatch-${++swatchSequence}`),
    mark,
  );
  return svg;
}
