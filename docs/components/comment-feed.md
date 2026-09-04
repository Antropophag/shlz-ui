# Comment Feed

Comment Feed reproduces the reusable comments composition from the authoritative `shlz-design-source/raw/svg/Комментарии.svg`. It is separate from Message Thread, which remains derived from `Messages.svg`.

Use a native ordered or unordered list with `.shlz-comment-feed`. Each item contains an optional 32px Avatar and an article with visible author, `time`, body, optional mention text, File Row attachments, and attachment summary. The optional composer uses native form controls. Contextual Edit, Delete, and Reply buttons, mention suggestions, and Notification/Snackbar feedback are consumer-selected presentation states.

All data, mutation, and lifecycle concerns are consumer-owned: comment identity, order, author and mention data, sanitization, permissions, editing/deletion/reply eligibility, submission, upload lifecycle, search, pagination, synchronization, persistence, moderation, feedback lifecycle, and rerendering. The component is presentation-only and adds no controller.

Desktop geometry follows `docs/component-audits/comment-feed-contract.md`. Narrow layout, enlarged text, forced colors, focus and missing-content behavior are repository decisions rather than Figma facts.
