# Как вносить изменения

`main` — стабильная ветка и источник пакетов `@shlz/*`. Обычный путь любого изменения: короткоживущая ветка, локальные проверки, Pull Request в `main`, CI и merge.

## Начало работы

Создавайте ветку от свежего `origin/main`:

```bash
git fetch origin
git switch main
git pull --ff-only
git switch -c fix/example
```

Используйте имена `feature/<name>`, `fix/<name>`, `chore/<name>` или, при необходимости, `refactor/<name>`.

Если основной checkout содержит незавершённую работу, для изолированной задачи — особенно при работе через Codex — предпочтителен отдельный worktree:

```bash
git fetch origin
git worktree add -b fix/example ~/code/shlz-ui-fix-example origin/main
```

Не сбрасывайте и не очищайте существующую пользовательскую рабочую директорию. Не переписывайте историю `main` и не делайте force-push в `main`.

## Pull Request

Через PR должны проходить изменения компонентов, CSS, tokens, icons, behavior, exports, tests и source-fidelity. Документационные и очевидные maintenance-изменения по умолчанию также идут через PR; отдельная сложная политика исключений не нужна.

PR должен быть небольшим, логически атомарным и не содержать unrelated cleanup. Понятные commit messages, например `fix(dropdown): restore scrollable source contract`, приветствуются, но Conventional Commits не являются обязательным gate.

[design-decision] Если design-fidelity исправление основано на source data, укажите в PR authoritative source. Первичный источник истины — оригинальные SVG из `shlz-design-source/raw/svg/`; production-приложения могут служить контекстом проверки, но не источником визуального дизайна.

Перед PR выполните существующий набор проверок:

```bash
npm ci
npm run check
```

Если Chromium для Playwright ещё не установлен:

```bash
npx playwright install chromium
```

## Workflow для Codex

Перед началом работы Codex должен:

1. выполнить `git fetch origin`;
2. определить актуальный `origin/main`;
3. создать отдельную feature/fix/chore ветку или worktree;
4. не изменять пользовательский checkout, если в нём есть незакоммиченная работа.

После работы Codex должен:

1. показать diff/stat;
2. выполнить релевантные проверки;
3. сделать атомарный commit;
4. push ветки;
5. создать PR в `main`;
6. дать в итоговом отчёте URL PR и результаты проверок.

Codex не должен напрямую push'ить изменения в `main`, выполнять destructive reset пользовательской рабочей директории или force-push.
