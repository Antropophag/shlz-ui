# @shlz/behaviors

## 0.2.0

### Minor Changes

- 194b3e6: Complete Bar Chart presentation with eight-series support, nine explicit tones, source density and top contours, numeric axes, grouped period inspection, and above/below tooltips. Add a shared decorative palette-swatch factory and restore the chart widget's source empty illustration.

  Existing data, lifecycle calls and the first four positional color overrides remain supported. Consumers can opt into `series[].tone` and `presentation` without migrating existing calls; hover and keyboard inspection now disclose all visible series in a period.

### Patch Changes

- 152bc95: Consumers can render a framework-agnostic grouped Bar Chart with stable data identity, pointer and keyboard inspection, series visibility controls, an accessible table alternative, and responsive local overflow.
- b43bf1d: Add private corporate GitLab release metadata and a governed fixed-version release pipeline. Runtime package interfaces are unchanged.

## 0.1.0

- Initial framework-neutral behavior package baseline.
