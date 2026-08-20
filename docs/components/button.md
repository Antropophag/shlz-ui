# Button

## Status

`Executable / Production`. Showcase дополнительно содержит `Visual fixture` для принудительного отображения source-backed hover/active rows; эти helper classes не являются application state API.

## Purpose

Button запускает, подтверждает или отменяет действие. Публичный контракт основан на native `<button>` и не требует behavior layer.

## Use when

- Пользователь запускает действие в текущем workflow.
- Нужно подтвердить или отменить форму, dialog либо panel action.
- Нужен компактный icon-only action с однозначным accessible name.

## Avoid when

- Для перехода на URL или раздел используйте Link, а не Button.
- Для выбора одного значения используйте Select/Radio, а не набор action buttons.
- Не используйте `disabled` как замену loading: loading contract отсутствует.

## Dependencies and setup

Обязателен standalone stylesheet `@shlz/styles/shlz.css`. Behavior package не нужен.

Serve/copy экспортированный CSS как application asset, затем подключите его:

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<button class="shlz-button shlz-button--primary" type="button">
  Сохранить
</button>
```

Внутри `<form>` всегда задавайте `type`: browser default для `<button>` — submit.

## Public HTML contract

| Contract    | Supported value                                                |
| ----------- | -------------------------------------------------------------- |
| Element     | Native `<button>`                                              |
| Base class  | `.shlz-button`                                                 |
| Modes       | default neutral, `.shlz-button--primary`, `.shlz-button--text` |
| Sizes       | default 40px, `.shlz-button--sm` 32px, `.shlz-button--xs` 26px |
| Icon-only   | `.shlz-button--icon`; accessible name remains mandatory        |
| Icon child  | `.shlz-button__icon` on package icon/SVG                       |
| State owner | Native `:hover`, `:active`, `:focus-visible`, `:disabled`      |
| Behavior    | Not applicable                                                 |

## Variants and states

- Source modes: primary, neutral Secondary and text.
- Source sizes: 40, 32 and 26px.
- Label buttons exist in all three sizes; icon-only source variants exist at 32 and 40px.
- Runtime states: default, hover, active, focus-visible and disabled.
- `.shlz-button--visual-hover` and `.shlz-button--visual-active` exist for fidelity diagnostics, not application state management.
- Loading, read-only and error are unsupported Button states.

## Accessibility

- Native button owns Enter/Space activation and disabled behavior.
- Text label normally provides the accessible name.
- Icon-only controls require `aria-label` or another valid accessible-name relationship.
- Focus-visible outline is a repository accessibility decision because Figma does not prove keyboard behavior.
- Disabled Button must not be used when the action remains discoverable but needs an explanation; that product pattern is not defined by this primitive.

## Composition

Button composes with SHLZ icons through `.shlz-button__icon`, and appears in forms, Modal, Drawer, Notification and toolbar patterns. The application owns command handling, pending state, permissions and error recovery.

## Limitations

- No loading API or spinner placement contract.
- No full-width modifier; container layout may stretch the native element where needed.
- No link-button mode: navigation remains Link semantics.
- Source fixed specimen widths are not public width enums.

## Traceability

| Layer                | Location                                               |
| -------------------- | ------------------------------------------------------ |
| Authoritative source | `shlz-design-source/raw/svg/Buttons.svg`               |
| Provenance           | `packages/tokens/provenance.json`                      |
| Tokens               | `packages/tokens/tokens.json`                          |
| Styles               | `packages/styles/components/button.css`                |
| Standalone bundle    | `packages/styles/dist/shlz.css`                        |
| Showcase             | `apps/showcase/src/fidelity.js#button-demo`            |
| Source crop tooling  | `tools/source-references.mjs`                          |
| Snippet tests        | `tools/tests/component-documentation.test.mjs`         |
| Browser/visual tests | `tools/playwright/primitives.spec.js` and its snapshot |

## Source interpretation

| Classification | Evidence                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| FACT           | `Buttons.svg`: 26/32/40px pill controls, square icon-only variants, source paints and icon/text combinations. |
| FACT           | Label typography: Golos Text Regular 15/19.5 at 40px and 14/18.2 at 32/26px, with -1% tracking.               |
| DERIVED        | Repeated source rows map to primary/neutral default, hover, active and disabled visual states.                |
| DECISION       | Native disabled ownership, focus-visible outline, class API and content-owned width.                          |
| UNKNOWN        | Loading behavior and progress announcement.                                                                   |
