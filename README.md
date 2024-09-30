Простое REST API с использованием NestJS, которое включает в себя аутентификацию, CRUD операции и кэширование данных.

Проект использует PostgreSQL (ORM - TypeORM) для хранения данных и Redis для кэширования.

Как это запускать

1. установить зависимости с помощью команды pnpm install
2. написать переменные окружения. примеры как это должно быть в корне проекта, файл .env.sample
3. запустить миграции с помощью команды pnpm migration:run
4. запустить приложение с помощью команды pnpm start

эндпоинты и примеры что нужно предоставлять в телах запросов и какие должны быть ответы можно посмотреть в swagger по адресу /api/v1/docs
