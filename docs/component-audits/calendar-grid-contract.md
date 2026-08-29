# Calendar Grid source contract

Primary authority is `shlz-design-source/raw/svg/Calendar.svg` (SHA-256 `da5c97cd453930458634ec3317452dced33b8de41c418d744bf253ed75af8714`). It remains unchanged.

Supplemental user-supplied exports observed on 2026-08-29 include `Календарь для начальника.svg` (`f1f333c90049545ed02cc85d8791ce35298be141ef476cbf20353237a8d2b8de`), `Календарь и праздники.svg` (`a2352f0f291778da17dc2cc1104db26224be717b744100041b37a59643637a73`), and `Календарь.svg` (`3e58e149069aa28fc17657f72e043a64c837057647c1840cfc8a4ad08b5686d6`). They supplement but never override the raw repository SVG.

- Source facts: dense row/date matrix, restrained borders, compact item surfaces, count indicators, muted/unavailable dates, and expanded/collapsed examples.
- Supplemental evidence: full-screen operational compositions show sticky-looking date/row context and two-axis scrolling.
- Repository decisions: native table semantics, contained native scrolling, explicit consumer temporal attributes, generic tone names, and one disclosure controller.
- Assumptions: sticky behavior is inferred from the supplied operational layouts and degrades to table flow; the component is bounded and non-virtualized.
- Unsupported: date calculation, locale/timezone policy, work-calendar inference, fetching, filtering, selection, persistence, virtualization, drag/drop, and application actions.

The supplied screens' identity, profile, tabs, filters, statistics, statuses, and routing are application evidence only and are excluded from the module interface.
