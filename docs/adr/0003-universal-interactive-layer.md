# ADR 0003: Universal interactive layer

Status: proposed.

Use standards-based custom elements selectively for interaction-heavy reusable widgets after contracts are researched. Native HTML plus CSS remains preferred for buttons and form primitives. Web Components are a candidate universal layer for popovers, dialogs, and composite widgets because they cross framework boundaries, but they introduce form-association, SSR/declarative-shadow-DOM, styling, and upgrade-timing costs.

No interactive component is implemented in iteration one. A representative accessible component should validate plain HTML, server-rendered PHP, and Vue integration before this proposal becomes accepted. Framework adapters should add ergonomics and typing, not fork behavior.
