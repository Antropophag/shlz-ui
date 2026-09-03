const rgba = (value) => {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) throw new Error(`Not RGB: ${value}`);
  return [channels[0], channels[1], channels[2], channels[3] ?? 1];
};

const composite = (foreground, background) => {
  const [red, green, blue, alpha] = Array.isArray(foreground)
    ? foreground
    : rgba(foreground);
  return [
    red * alpha + background[0] * (1 - alpha),
    green * alpha + background[1] * (1 - alpha),
    blue * alpha + background[2] * (1 - alpha),
  ];
};

const luminance = (value) => {
  const linear = (Array.isArray(value) ? value : rgba(value).slice(0, 3)).map(
    (channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    },
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

export const contrastRatio = (foreground, background) => {
  const renderedBackground = Array.isArray(background)
    ? background
    : composite(background, [255, 255, 255]);
  const renderedForeground = composite(foreground, renderedBackground);
  const values = [
    luminance(renderedForeground),
    luminance(renderedBackground),
  ].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

export const contrastThreshold = (fontSize, fontWeight) =>
  fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;

export const textContrastEvidence = async (locator, pseudo = null) => {
  const { color, backgrounds, fontSize, fontWeight } = await locator.evaluate(
    (element, pseudoElement) => {
      const style = window.getComputedStyle(element, pseudoElement);
      const layers = [];
      let current = element;
      while (current) {
        layers.push(window.getComputedStyle(current).backgroundColor);
        current = current.parentElement;
      }
      return {
        color: style.color,
        backgrounds: layers,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseInt(style.fontWeight, 10) || 400,
      };
    },
    pseudo,
  );
  const background = backgrounds
    .reverse()
    .reduce((paint, layer) => composite(layer, paint), [255, 255, 255]);
  return {
    color,
    background,
    fontSize,
    fontWeight,
    ratio: contrastRatio(color, background),
  };
};
