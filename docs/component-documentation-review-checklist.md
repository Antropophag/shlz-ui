# Component documentation review checklist

Checklist применяется после написания страницы и перед переводом component documentation в завершённый статус.

## Truthfulness and scope

- [ ] Документация описывает текущий production contract, а не желаемый будущий API.
- [ ] Authoritative source и source-derived evidence не изменялись.
- [ ] Visual values и public API не изменены побочно.
- [ ] `FACT`, `DERIVED`, `DECISION`, `UNKNOWN` и unsupported modes различимы.
- [ ] Visual/source diagnostic fixture не назван production example.
- [ ] Неприменимые состояния не добавлены ради полноты шаблона.

## Developer path

- [ ] Purpose, use when, avoid when и alternatives понятны без чтения implementation source.
- [ ] Dependencies и способ подключения assets/styles описаны.
- [ ] Minimal example копируем и использует public exports.
- [ ] Behavior initialization и cleanup присутствуют, если применимо.
- [ ] Public selectors, attributes, functions, events и responsibilities описаны.
- [ ] Variants, states и limitations соответствуют production implementation.

## Accessibility

- [ ] Используется правильный native semantic owner.
- [ ] Accessible-name responsibility указана.
- [ ] Keyboard и focus behavior совпадают с кодом и browser tests.
- [ ] Disabled/read-only/error/open описаны только там, где применимы.
- [ ] Нет неподтверждённых заявлений о screen-reader поддержке.

## Traceability

- [ ] Source/provenance/tokens/styles/behavior/docs/fixture/tests имеют существующие пути либо помечены `Not applicable`.
- [ ] Showcase production example визуально отделён от diagnostics.
- [ ] Ссылки не ведут на private/internal API как на public contract.

## Verification

- [ ] Snippets защищены простым contract test или executable fixture.
- [ ] Local/external links проверены.
- [ ] Relevant unit, browser, visual, lint и docs checks зелёные.
- [ ] Полный diff прошёл self-review на scope creep и duplication.
- [ ] Независимый reviewer не оставил нерешённых P1/P2.
- [ ] P3 либо исправлен, либо disposition записан с value/risk обоснованием.
