# Comment Feed source contract

## Authority and reusable boundary

- `source-fact`: sole visual authority is `shlz-design-source/raw/svg/Комментарии.svg`, SHA-256 `20e2dc809b8fa832cc73bd078abd57678c9614a70da7dbf376ab1a1f25458a88`, canvas 8480×2830.
- `source-fact`: the sheet contains seven 1440×1000 application frames at `(340,340)`, `(1930,340)`, `(3520,340)`, `(5110,340)`, `(6700,340)`, `(1930,1490)`, and `(5110,1490)`.
- `repository-decision`: the reusable boundary is the comment list, contextual comment affordances, composer shell, and locally composed feedback; the 72px application sidebar, ticket header, tabs, profile and search are excluded.
- `unknown`: static frames do not establish data fetching, identity/permission rules, edit/delete/reply mutations, mention lookup, upload lifecycle, submission, timer, undo, persistence, synchronization, pagination, moderation, or announcements.

## Frame/state ledger

1. `default`: four left-aligned comments, author/avatar/relative-date rows, two-file and one-file attachments, attachment counts/sizes, mention treatment, and the empty bottom composer.
2. `composer-populated`: three attached file tiles with remove controls, rich-text toolbar, populated textarea, character count, and circular submit control.
3. `comment-added`: a new fifth comment plus a 384×58 success feedback surface; the source depicts outcome presentation but not submission behavior.
4. `own-comment-actions`: emphasized own-comment row plus a 230×100 anchored Edit/Delete menu.
5. `other-comment-reply`: emphasized other-comment row plus a 230×60 anchored Reply surface.
6. `mention-suggestions`: populated composer plus a 260×120 anchored two-person suggestion surface.
7. `comment-deleted`: a 384×58 countdown/undo feedback surface; the source depicts feedback but not deletion, countdown, or restoration behavior.

## Exact observed geometry and paint

- `source-fact`: each application frame is 1440×1000; the application background excluding the sidebar is `#F4F6F9`.
- `source-fact`: the white comments panel is 1304px wide in every frame. The default content region is 1304×769; bottom composer regions are 1304×79 in five frames and expand to 99/120/321px in source states that add contextual or composer content.
- `source-fact`: comment avatars are 32×32 circles. The default frame places the first avatar at source `(476,660.99)` and its content at x=524, a 16px separation after the avatar box.
- `source-fact`: compact attached-file cards are 229×54 with a 1px `#E0E0E0` stroke and approximately 12px radius. The first pair starts at x=524.5 and x=762.5, leaving a 9px inter-card gap.
- `source-fact`: the default composer input starts at `(520,1245)`, is 1196×39, has 8px radius, and uses `#F5F5F5`; its leading avatar is 32×32 at `(476,1245)`.
- `source-fact`: repeated source colors include primary `#0B1623`, secondary `#939CA5`, brand `#253D98`, link/accent `#155EEF`, error `#D92D20`/`#CC1F1F`, success `#079455`, border `#E0E0E0`/`#D1D8DF`, neutral `#EEF0F4`/`#F5F5F5`, and surface `#FFFFFF`.
- `derived-pattern`: visual inspection of all seven frames shows a single left-aligned stream; comments do not use incoming/outgoing bubble polarity or delivery/read metadata.
- `derived-pattern`: author and mention text use brand blue, body uses primary text, and relative date/file size use secondary text. Exact font family/weight/line height must be verified through the repository typography tokens because exported text is outlined.

## Component and ownership decisions

- `repository-decision`: use native list/article/time/form/button/link semantics and consumer-provided text.
- `repository-decision`: active secondary and placeholder text use the accessible supporting/placeholder roles from `docs/accessibility-source-contrast.md`; source `#939CA5` remains recorded rather than silently relabelled.
- `repository-decision`: compose existing Avatar, document/file, textarea, toolbar, button, link, menu/popover, and notification/snackbar primitives only where their contracts match the source; their evidence stays independent.
- `repository-decision`: contextual eligibility and every mutation remain consumer-owned. Component attributes/classes select presentation only.
- `repository-decision`: narrow layout, 200% text, focus, forced-colors and content-stress behavior preserve hierarchy and containment but are not Figma facts.
