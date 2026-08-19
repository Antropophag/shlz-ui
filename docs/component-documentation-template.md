# Component documentation template

Этот шаблон сформирован на реальных контрактах Button и Select. Он применяется к production components, но не требует заполнять неприменимые состояния или придумывать отсутствующий API.

## Component name

### Status

Указать одно или несколько значений и пояснить область:

- `Executable / Production` — пример использует публичный production contract;
- `Visual fixture` — принудительно показывает визуальное состояние и не является application API;
- `Source diagnostic` — сравнивает реализацию с source evidence;
- `Source only` — implementation contract отсутствует;
- `Unsupported` — вариант явно не поддерживается.

### Purpose

Одно краткое описание задачи компонента. Не пересказывать его внешний вид.

### Use when

- Подтверждённые сценарии применения.
- Критерии выбора относительно соседних компонентов.

### Avoid when

- Сценарии, для которых существует более подходящий компонент.
- Unsupported modes и известные смысловые ограничения.

### Dependencies and setup

Перечислить только существующие зависимости:

- stylesheet/package export;
- icons/assets;
- optional behavior import;
- необходимые условия consumer environment.

Объяснить, как standalone asset попадает по URL, если snippet использует `<link>` или `<img>`.

### Minimal executable example

Пример должен:

- использовать public package contract;
- содержать semantic HTML, обязательные classes/attributes/ARIA;
- показывать behavior initialization и cleanup, если они нужны;
- сохранять native/no-JS fallback, если он является частью контракта;
- проходить snippet validation.

### Public HTML/API contract

Таблица применимых сущностей:

- root/element;
- selectors/modifiers;
- attributes/data attributes;
- functions/controllers;
- events;
- native/consumer/component responsibilities;
- lifecycle.

### Variants and states

Разделить:

- source-backed variants;
- native runtime states;
- repository decisions;
- visual diagnostic helpers;
- unsupported/unknown states.

Не добавлять state только ради симметричной матрицы.

### Accessibility

Зафиксировать:

- semantic owner и accessible name;
- keyboard behavior;
- focus contract;
- disabled/read-only/error announcements, где применимо;
- что реализует component, а что обязан сделать consumer;
- уровень фактической проверки без неподтверждённых screen-reader claims.

### Composition

Перечислить соседние components/patterns и границу ответственности приложения. Application composition не становится core contract автоматически.

### Limitations

Явно перечислить unsupported modes, неизвестные semantics и условия, требующие отдельного решения.

### Traceability

Дать существующие пути:

```text
authoritative source
→ provenance / tokens
→ styles
→ behavior
→ documentation
→ executable Showcase fixture
→ contract/browser/visual tests
```

Если слоя нет, написать `Not applicable`; не создавать фиктивную ссылку.

### Source interpretation

Кратко разделить `FACT`, `DERIVED`, `DECISION`, `UNKNOWN`. Внешний референс может обосновывать структуру документации, но не visual value или SHLZ variant.
