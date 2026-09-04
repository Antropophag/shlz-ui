# History Timeline

History Timeline is a framework-neutral semantic list for consumer-ordered activity derived from `shlz-design-source/raw/svg/History of changes.svg`. The library owns source-backed event presentation; consumers own chronology, sorting, timezone/locale formatting, audit semantics, filtering, permissions, persistence, live updates, announcements, and actions.

```html
<ol class="shlz-history-timeline" aria-label="История изменений">
  <li class="shlz-history-timeline__period">
    <span id="history-period-today">Сегодня</span>
  </li>
  <li
    class="shlz-history-timeline__entry"
    data-history-kind="status"
    aria-describedby="history-period-today"
  >
    <article class="shlz-history-timeline__content">
      <header class="shlz-history-timeline__header">
        <span class="shlz-history-timeline__actor">Елена Крылова</span>
        <time class="shlz-history-timeline__time">12:05</time>
      </header>
      <p class="shlz-history-timeline__values">
        <span class="shlz-history-timeline__old-value">Новое</span
        ><span class="shlz-history-timeline__transition" aria-label="на">→</span
        ><span class="shlz-history-timeline__new-value">В работе ОКС</span>
      </p>
    </article>
  </li>
</ol>
```

DOM order is authoritative; the component never parses or sorts dates. A period uses a native list-item wrapper whose visible, consumer-identified label is referenced by every following entry through `aria-describedby` until the next period. Source-observed presentation parts cover creation, status transitions, quoted comments, before/after values, tags, people/disclosure and attachments. Compose native actions and existing primitives inside entry content; their behavior remains consumer-owned.

The supported interface is a bounded, non-virtualized list tested with period groups, current emphasis, long localized text, sparse entries, attachments, narrow containers, and 200% text.
