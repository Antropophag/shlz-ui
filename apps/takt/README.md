# ЩЛЗ ТАКТ

Статический одностраничный концепт продуктового бренда. Работает без backend, runtime API и внешних ресурсов.

## Локальный запуск

Из корня репозитория:

```bash
npm install
npm run dev:takt
npm run build -w @shlz/takt
```

Или из `apps/takt`:

```bash
npm install
npm run dev
npm run build
```

Vite печатает адрес локального сервера в терминале. Для открытия с другого устройства в сети используется адрес из строки `Network` — скрипт `dev` уже запускает Vite с `--host 0.0.0.0`.

Основная версия использует корпоративную палитру ЩЛЗ. Предыдущая концептуальная палитра сохранена и доступна по адресу `/?theme=concept`.

Production-сборка создаётся в корневом `dist/`. Относительный `base` позволяет публиковать её как в корне, так и по пути `https://<user>.github.io/<repo>/`.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` по push в `main` собирает workspace `@shlz/takt` и публикует `dist/`. В настройках репозитория выберите **Settings → Pages → Source: GitHub Actions**.
