# Тестовое задание (YADRO)

Angular 20 + NG-ZORRO. Приложение получает список пользователей из публичного REST API
[JSONPlaceholder](https://jsonplaceholder.typicode.com/) и позволяет просматривать, создавать, редактировать и удалять записи.

## Стек

- Angular CLI 20.3
- TypeScript 5.9
- ng-zorro-antd 20.4
- RxJS 7.8
- Standalone-компоненты, lazy-loaded маршруты, control flow `@if` / `@for`

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

JSONPlaceholder — мок-API. `UserService` хранит локальный кэш в `BehaviorSubject`, чтобы интерфейс оставался консистентным внутри сессии (созданным пользователям присваиваются локальные `id > 1000`).

## Скрипты

- `npm start` — запуск dev-сервера
- `npm run build` — production-сборка в `dist/users-app/browser`
- `npm run build:gh-pages` — та же сборка с `--base-href ./` для GitHub Pages
- `npm run deploy` — сборка и публикация в ветку `gh-pages`
- `npm test` — unit-тесты через Karma
