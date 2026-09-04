# History Timeline source contract

## Authority and reusable boundary

- `source-fact`: sole visual authority is `shlz-design-source/raw/svg/History of changes.svg`, SHA-256 `83d8c9ab89fa7c3677ed6d4105a150f55676bcf732160892b06773d6d4ac0e76`, canvas 873×1558.
- `source-fact`: one dashed source frame occupies `(80.5,480.5)` at 463×997.
- `repository-decision`: the reusable seam is the framed consumer-ordered event list, not the surrounding Service Desk title/logo canvas.
- `unknown`: the static frame does not establish chronology, sorting, timezone/locale formatting, event generation, filtering, permissions, pagination, persistence, live updates, announcements, disclosure behavior, attachment behavior, or mutations.

## Source event ledger

The frame contains seven visibly distinct event presentations:

1. record creation with a standalone title and timestamp;
2. actor/action text plus old-to-new status pills and timestamp;
3. actor/action text plus a quoted-comment surface and timestamp;
4. actor/action text plus old-to-new field values and timestamp;
5. actor/action text plus two tag pills and timestamp;
6. actor/action text plus four visible employee chips, a `Посмотреть всех` disclosure affordance, and timestamp;
7. actor/action text plus one file card and timestamp.

`source-fact`: the frame does not depict an avatar rail, vertical connector, colored current marker, period heading, or generic one-description-row presentation. Those elements in the previous fixture are repository inventions and cannot serve as source-fidelity evidence.

## Exact observed geometry and paint

- `source-fact`: event content begins at x=100 inside the source canvas, 19.5px from the dashed frame's left edge.
- `source-fact`: the quoted comment surface is 424×137 and uses `#F5F5F5` with an observed 8px radius.
- `source-fact`: the old status pill is 66×30 and the new status treatment occupies 119×35; the transition arrow is visible between them.
- `source-fact`: tag pills are 137×30 and 111×30 and use `#EEF0F4`.
- `source-fact`: four employee chips form a two-column/two-row group. Each outlined chip is 156×29 with 24×24 imagery; horizontal positions are x=100.5 and x=261.5, and rows begin at y=1184.5 and y=1218.5.
- `source-fact`: the file card is 239×54 with a 1px `#E0E0E0` stroke; its file-type artwork contains the source success green `#079455`.
- `source-fact`: repeated colors include primary `#0B1623`/`#222A36`, secondary `#939CA5`, brand `#253D98`, success `#57965C`/`#079455`, neutral `#EEF0F4`/`#F5F5F5`, border `#E0E0E0`, and white `#FFFFFF`.
- `derived-pattern`: actor names carry primary emphasis, action phrasing is secondary, changed values/content are the visual scan anchor, and timestamps follow each event.
- `derived-pattern`: exact font family/weight/line height must use the repository typography contract because source text is outlined.

## Component and ownership decisions

- `repository-decision`: preserve a native list with consumer-owned DOM order and use additive presentation parts for creation, status, quoted comment, field transition, tags, employees/disclosure, and attachment.
- `repository-decision`: active secondary text uses the accessible supporting role and green status surfaces use primary readable text; original source paints remain recorded as source facts.
- `repository-decision`: compose existing Status, Tag, Person Tag/Avatar, File/Document Row, Link and Button primitives only where their independent contracts match source geometry.
- `repository-decision`: no JavaScript event parser or history data model is introduced.
- `repository-decision`: narrow layout, 200% text, focus and forced-colors behavior are accessibility/containment decisions, not Figma facts.

`History of changes.svg` remains unchanged. Evidence for every nested primitive remains independent.
