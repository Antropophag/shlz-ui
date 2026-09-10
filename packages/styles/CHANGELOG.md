# @shlz/styles

## 0.2.0

### Minor Changes

- 194b3e6: Complete Bar Chart presentation with eight-series support, nine explicit tones, source density and top contours, numeric axes, grouped period inspection, and above/below tooltips. Add a shared decorative palette-swatch factory and restore the chart widget's source empty illustration.

  Existing data, lifecycle calls and the first four positional color overrides remain supported. Consumers can opt into `series[].tone` and `presentation` without migrating existing calls; hover and keyboard inspection now disclose all visible series in a period.

- 3bdb2ac: Complete source-backed table header controls, cell editing and embedded content presentation. Restore visible 15px table typography, independent sorter/filter states, source dividers and accessible production text while preserving native table semantics and consumer-owned data behavior.

### Patch Changes

- 6063c26: Add a source-backed Comment Feed and correct History Timeline event presentation so consumers can reproduce the authoritative Comments and History of changes compositions without conflating comments with messages.
- 9a47f93: Render Composer and File Upload File Row attachments as compact 229px cards that
  wrap and shrink to narrow containers instead of growing into spare row space.
  Use the established accessible supporting color for attachment metadata.
  Existing markup and consumer-owned selection and removal behavior remain compatible;
  no migration is required.
- d5ad4f0: Improve File Upload icon contrast for consumers by restoring the source
  Gray 200 color. The previous Gray 75 made the arrow and translucent cloud
  nearly disappear on the surface.
- 152bc95: Consumers can render a framework-agnostic grouped Bar Chart with stable data identity, pointer and keyboard inspection, series visibility controls, an accessible table alternative, and responsive local overflow.
- b43bf1d: Add private corporate GitLab release metadata and a governed fixed-version release pipeline. Runtime package interfaces are unchanged.
- 592c51d: Add source-traceable Dashboard and Chart Widget presentation contracts for reporting consumers while keeping chart rendering, data semantics, editing, and persistence application-owned.
- bdc063e: For consumers, correct fractional Switch thumb alignment, compact Tabs and Field geometry,
  localized label containment in Notification, Empty State and History, and
  text-button typography inheritance. Preserve native interactions and source
  size minima while allowing readable content to reflow.
- 3458bbc: Consumers receive readable Status foregrounds for green, bright-green, orange, cyan, pink, and neutral paint families, and accessible supporting text for Empty State secondary copy. Existing markup and behavior are unchanged.
- Updated dependencies [b43bf1d]
- Updated dependencies [3458bbc]
  - @shlz/tokens@0.2.0

## 0.1.0

- Initial framework-neutral style package baseline.
