# Status

## Status

`Executable / Production`. Source paint families are implemented; their business meanings remain consumer-owned decisions.

## Purpose

Status is a compact persistent textual label for an application-defined business state, commonly inside a table, card or record summary.

## Use when

- A short status must remain visible while users scan data.
- The visible text can state the meaning without relying on color.
- A product has one centrally documented mapping from its states to SHLZ paint modifiers.

## Avoid when

- For a compact count or dot use Badge.
- For transient feedback use Notification/Snackbar rather than a persistent status pill.
- Do not infer `success`, `warning` or `error` from a modifier name without an approved product mapping.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<span class="shlz-status shlz-status--green">Выполнено</span>
```

The visible text owns the meaning. The modifier selects only a source-backed paint family.

## Public HTML contract

| Contract        | Supported value                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| Element         | Text-bearing `span.shlz-status`                                                          |
| Default paint   | Blue foreground/surface pair                                                             |
| Paint modifiers | `--green`, `--bright-green`, `--source-blue`, `--orange`, `--purple`, `--cyan`, `--pink` |
| Neutral paint   | `.shlz-status--neutral`                                                                  |
| Semantics       | Visible text and consumer context own business meaning                                   |
| Interaction     | None; Status is not a control                                                            |

## Variants and states

- All Status pills have the source-backed 30px minimum height.
- Modifiers expose observed color pairs, not a semantic success/warning/error taxonomy.
- Status has no hover, pressed, selected, disabled or dismissible state.
- Dynamic replacement of the text is normal application rendering; it is not announced automatically.

## Accessibility

- State meaning must be present in text, not color alone.
- Keep the label in normal reading order and use concise domain language.
- Do not add button semantics or keyboard focus to a non-interactive Status.
- If a dynamic change must be announced, the containing application/pattern owns an appropriately scoped live region. The Status primitive has no implicit live semantics.

## Composition

Status composes in tables, cards, details and summary lists. The application owns status vocabulary, translation, mapping to paint families, transition rules and any adjacent actions.

## Limitations

- No repository-wide mapping from paint modifiers to business states.
- No icon, dismiss, interactive, tooltip, transition or live-announcement contract.
- Modifier names are source paint descriptions and must not become domain enums.

## Traceability

| Layer                | Location                                                     |
| -------------------- | ------------------------------------------------------------ |
| Authoritative source | `shlz-design-source/raw/svg/Status.svg`                      |
| Source sets          | `shlz-design-source/raw/svg/UI Kit – Interface elements.zip` |
| Provenance           | `packages/tokens/provenance.json`                            |
| Tokens               | `packages/tokens/tokens.json`                                |
| Styles               | `packages/styles/components/status-badge.css`                |
| Standalone bundle    | `packages/styles/dist/shlz.css`                              |
| Showcase             | `apps/showcase/src/fidelity.js#status-demo`                  |
| Snippet tests        | `tools/tests/component-documentation.test.mjs`               |
| Source tests         | `tools/tests/choice-status-source.test.mjs`                  |
| Browser tests        | `tools/playwright/choice-status.spec.js`                     |

## Source interpretation

- `FACT`: 30px pill geometry and observed foreground/surface color pairs.
- `DERIVED`: repeated source pairs form reusable paint families.
- `DECISION`: CSS modifier names and text-owned semantics.
- `UNKNOWN/CONSUMER-OWNED`: domain meaning and state-to-paint mapping.
