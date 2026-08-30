# Message Thread source contract

- Authority: `shlz-design-source/raw/svg/Messages.svg` (`b61167bf011d15e5956d409d6746b5440cf4417522f1f14d6d27084bfb4b5357`).
- Source fact: the 1504×7405 sheet contains five dashed composition frames and static message, author, editor, employee, timestamp, and attachment artwork.
- Repository decision: the reusable seam is a semantic message list with incoming/outgoing presentation, not the full Messages application.
- Consumer-owned: ordering, sanitization, delivery/read state, synchronization, pagination, moderation, persistence, announcements, attachment lifecycle, composer, and actions.
- Unsupported assumption: static artwork does not establish realtime, editor, or transport behavior.

`Messages.svg` remains unchanged. Existing Avatar, File Row, and Document Row modules retain independent contracts and evidence.
