# History Timeline

History Timeline is a framework-neutral semantic list for consumer-ordered activity. The library owns connector and entry presentation; consumers own chronology, sorting, timezone/locale formatting, audit semantics, filtering, permissions, persistence, live updates, announcements, and actions.

```html
<ol class="shlz-history-timeline" aria-label="История изменений">
  <li class="shlz-history-timeline__period">
    <span id="history-period-today">Сегодня</span>
  </li>
  <li
    class="shlz-history-timeline__entry"
    aria-describedby="history-period-today"
  >
    <span class="shlz-avatar shlz-avatar--40" aria-hidden="true">ЕК</span>
    <span class="shlz-history-timeline__marker" aria-hidden="true"></span>
    <article class="shlz-history-timeline__content">
      <header class="shlz-history-timeline__header">
        <span class="shlz-history-timeline__actor">Елена Крылова</span>
        <time class="shlz-history-timeline__time">12:05</time>
      </header>
      <p class="shlz-history-timeline__description">Изменила статус заявки.</p>
    </article>
  </li>
</ol>
```

DOM order is authoritative; the component never parses or sorts dates. A period uses a native list-item wrapper whose visible, consumer-identified label is referenced by every following entry through `aria-describedby` until the next period. The wrapper preserves valid list structure and the label's supplied position. Marker and rail are decorative. Compose native actions and existing attachment primitives inside entry content.

The supported interface is a bounded, non-virtualized list tested with period groups, current emphasis, long localized text, sparse entries, attachments, narrow containers, and 200% text.
