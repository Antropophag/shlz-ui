# Person Tag

## Status

`Executable / Production`. Person Tag is structurally distinct from generic Tag and owns avatar plus optional removal composition.

## Purpose

Person Tag displays a compact selected/associated person identity using their visible name and an avatar/fallback image.

## Use when

- A form, filter or summary needs to show an associated person compactly.
- The visible name remains the primary identity text.
- The closable source variant corresponds to a real consumer-owned remove action.

## Avoid when

- Do not use Person Tag as authentication identity, account navigation or a full profile card.
- Use generic Tag for categories and Status for a business state.
- Do not show a decorative close icon without a working native button and specific accessible name.

## Dependencies and setup

Required:

- `@shlz/styles/shlz.css`;
- an avatar image or fallback, such as `@shlz/icons/icons/user.svg`.

No behavior package is provided. Serve the chosen icon/image as an application asset.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<span class="shlz-tag shlz-person-tag">
  <img class="shlz-tag__avatar" src="/assets/icons/user.svg" alt="" />
  Анна Петрова
</span>
```

The empty image `alt` is intentional because the adjacent visible name already identifies the person.

## Public HTML contract

| Contract        | Supported value                                                        |
| --------------- | ---------------------------------------------------------------------- |
| Root            | `span.shlz-tag.shlz-person-tag`                                        |
| Avatar          | `img.shlz-tag__avatar`; empty `alt` when visible text repeats identity |
| Name            | Visible text content                                                   |
| Optional remove | Native `button.shlz-tag__remove[type="button"]`                        |
| Remove icon     | Decorative `.shlz-tag__icon` inside the named button                   |
| Behavior        | No removal controller; consumer handles activation and state           |

Closable composition:

```html
<span class="shlz-tag shlz-person-tag" data-person-tag>
  <img class="shlz-tag__avatar" src="/assets/icons/user.svg" alt="" />
  Анна Петрова
  <button
    class="shlz-tag__remove"
    type="button"
    aria-label="Удалить Анну Петрову"
  >
    <img class="shlz-tag__icon" src="/assets/icons/close-remove.svg" alt="" />
  </button>
</span>
```

The design system does not remove the element or update application data. A standalone DOM integration can make the example operational:

```js
const removeButton = document.querySelector(
  "[data-person-tag] .shlz-tag__remove",
);

removeButton?.addEventListener("click", () => {
  // For a stateful app, update its source state and re-render instead.
  removeButton.closest("[data-person-tag]")?.remove();
});
```

`data-person-tag` is an application hook in this example, not a package selector. React/Vue or another stateful consumer must update its source state rather than mutating rendered DOM.

## Variants and states

- Default 193×30 source composition and Closable 213×30 source composition.
- Production width remains content-driven; source specimen widths are not enums.
- Remove hover/focus-visible belongs to the nested native button.
- No selected, disabled, loading, pending-removal or error state is defined.

## Accessibility

- The visible person name is the primary identity; repeated avatar/fallback imagery uses empty `alt`.
- A remove button needs `type="button"` so it does not submit a surrounding form accidentally.
- Its accessible name must identify both the action and person, for example `Удалить Анну Петрову`.
- Focus and activation remain native. After removal, the consumer owns sensible focus placement and any necessary announcement.

## Composition

Person Tag composes in assignee/participant fields, filters and summaries. Identity lookup, avatar URL/privacy, navigation, removal, persistence and error recovery belong to the application.

## Limitations

- No avatar loading/fallback controller or initials generation.
- No identity/profile-link behavior.
- No removal controller, pending state, undo or error recovery. The shown DOM handler is only a standalone integration; stateful applications own their update lifecycle.
- Consumer-provided images require an application asset/privacy policy.

## Traceability

| Layer                | Location                                       |
| -------------------- | ---------------------------------------------- |
| Authoritative source | `shlz-design-source/raw/svg/Tag.svg`           |
| Source specification | `docs/components/tag-source.md`                |
| Provenance           | `packages/tokens/provenance.json`              |
| Tokens               | `packages/tokens/tokens.json`                  |
| Styles               | `packages/styles/components/tag.css`           |
| Standalone bundle    | `packages/styles/dist/shlz.css`                |
| Showcase             | `apps/showcase/src/main.js#tag-demo`           |
| Snippet tests        | `tools/tests/component-documentation.test.mjs` |
| Source tests         | `tools/tests/tag-source.test.mjs`              |
| Browser tests        | `tools/playwright/fidelity.spec.js`            |

## Source interpretation

- `FACT`: Person tag Component Set `371:32592` has Default 193×30 and Closable 213×30 variants.
- `DECISION`: decorative repeated avatar, native removal button and consumer-owned action lifecycle.
- `UNKNOWN/UNSUPPORTED`: avatar fallback/loading, identity lookup, removal persistence and post-removal focus policy.
