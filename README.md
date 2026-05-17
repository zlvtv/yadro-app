# Тестовое задание (YADRO)

Angular 20 + NG-ZORRO. Приложение получает список пользователей из публичного REST API
[JSONPlaceholder](https://jsonplaceholder.typicode.com/) и позволяет просматривать, создавать, редактировать и удалять записи.

## Стек

- Angular CLI 20.3
- TypeScript 5.9
- ng-zorro-antd 20.4
- RxJS 7.8
- Standalone-компоненты, lazy-loaded маршруты, control flow `@if` / `@for`

## Требования

- Node.js 20+ и npm 10+
- Git

## Установка

```bash
git clone https://github.com/<ваш-логин>/<репозиторий>.git
cd <репозиторий>
npm install
```

## Локальный запуск

```bash
npm start
```

Dev-сервер откроется на <http://localhost:4200/>. Hot reload включён по умолчанию.

## Production-сборка

```bash
npm run build           # сборка в dist/users-app/browser
npm run build:gh-pages  # та же сборка с base-href ./ для GitHub Pages
```

## Деплой на GitHub Pages

1. Создайте публичный репозиторий на GitHub.
2. Запушьте проект в `main`:
   ```bash
   git remote add origin https://github.com/<ваш-логин>/<репозиторий>.git
   git push -u origin main
   ```
3. Запустите деплой:
   ```bash
   npm run deploy
   ```
   Команда соберёт проект с `--base-href ./` и запушит содержимое `dist/users-app/browser/` в ветку `gh-pages`.
4. В настройках репозитория (Settings → Pages) выберите источник `Deploy from a branch`, ветку `gh-pages` и папку `/ (root)`.

## Маршруты

- `/users` — список с поиском и пагинацией
- `/users/new` — создание пользователя
- `/users/:id` — детали пользователя
- `/users/:id/edit` — редактирование

## API

Используются эндпоинты JSONPlaceholder:

- `GET    https://jsonplaceholder.typicode.com/users`
- `GET    https://jsonplaceholder.typicode.com/users/{id}`
- `POST   https://jsonplaceholder.typicode.com/users`
- `PUT    https://jsonplaceholder.typicode.com/users/{id}`
- `DELETE https://jsonplaceholder.typicode.com/users/{id}`

JSONPlaceholder — мок-API. `UserService` хранит локальный кэш в `BehaviorSubject`, чтобы интерфейс оставался консистентным внутри сессии. После перезагрузки страницы данные возвращаются к 10 исходным пользователям API.

## Скрипты

- `npm start` — запуск dev-сервера
- `npm run build` — production-сборка в `dist/users-app/browser`
- `npm run build:gh-pages` — та же сборка с `--base-href ./` для GitHub Pages
- `npm run deploy` — сборка и публикация в ветку `gh-pages`
- `npm test` — unit-тесты через Karma
