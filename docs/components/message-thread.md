# Message Thread

Message Thread is a framework-neutral semantic list for consumer-owned messages. The library owns presentation and responsive containment; consumers own ordering, sanitization, delivery/read state, synchronization, pagination, persistence, moderation, announcements, attachment lifecycle, and actions.

```html
<ol class="shlz-message-thread" aria-label="Project discussion">
  <li class="shlz-message-thread__item" data-direction="incoming">
    <span class="shlz-avatar shlz-avatar--40" aria-hidden="true">АП</span>
    <article class="shlz-message-thread__message">
      <header class="shlz-message-thread__header">
        <span class="shlz-message-thread__author">Анна Петрова</span>
        <time
          class="shlz-message-thread__time"
          datetime="2026-08-30T09:15:00+03:00"
          >09:15</time
        >
      </header>
      <div class="shlz-message-thread__bubble">
        <div class="shlz-message-thread__body"><p>Текст сообщения.</p></div>
      </div>
    </article>
  </li>
</ol>
```

Use `data-direction="incoming"` or `outgoing` only as presentation. Always provide a visible author and meaningful time label. Compose File Row or Document Row inside `__attachments`; those remain independent components. Use ordinary native links and buttons for consumer actions. No behavior controller is required.

The supported interface is a bounded, non-virtualized list tested with long localized text, absent optional metadata, attachments, narrow containers, and 200% text.
