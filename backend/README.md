# Backend API для Школы горнолыжного спорта "Вершина"

Go бэкенд с REST API и админ-панелью для управления контентом сайта.

## Технологии

- Go 1.21+
- Gin (HTTP веб-фреймворк)
- GORM (ORM)
- SQLite (база данных)
- JWT (аутентификация)

## Установка и запуск

```bash
# Перейти в папку backend
cd backend

# Установить зависимости
go mod download

# Запустить сервер
go run cmd/server/main.go

# Или собрать и запустить
go build -o server cmd/server/main.go
./server
```

## Конфигурация

Настройки можно изменить через переменные окружения:

- `PORT` - порт сервера (по умолчанию: 8080)
- `DB_PATH` - путь к SQLite базе данных (по умолчанию: data.db)
- `JWT_SECRET` - секретный ключ для JWT (по умолчанию: your-secret-key-change-in-production)
- `CORS_ORIGINS` - разрешенные источники для CORS (по умолчанию: http://localhost:5173)
- `ENVIRONMENT` - окружение (development/production)

Пример:

```bash
PORT=8080 DB_PATH=./data.db JWT_SECRET=my-secret-key go run cmd/server/main.go
```

## API Endpoints

### Публичные эндпоинты

- `GET /api/schedule` - получить расписание
- `GET /api/locations` - получить локации
- `GET /api/camps` - получить информацию о сборах
- `GET /api/stats` - получить статистику
- `GET /api/about` - получить контент "О нас"
- `POST /api/applications` - создать заявку

### Админ эндпоинты (требуют JWT токен)

- `POST /api/admin/login` - авторизация
- `GET /api/admin/applications` - список заявок
- `PUT /api/admin/applications/:id` - обновить заявку
- `DELETE /api/admin/applications/:id` - удалить заявку
- CRUD операции для schedule, locations, camps, stats, about

## Админ-панель

Админ-панель доступна по адресу: `http://localhost:8080/admin`

**Дефолтные учетные данные:**
- Имя пользователя: `admin`
- Пароль: `admin123`

**ВАЖНО:** Измените пароль после первого входа!

## База данных

SQLite база данных создается автоматически при первом запуске. Также автоматически создаются:
- Дефолтный администратор (admin/admin123)
- Начальные данные (расписание, локации, статистика, сборы)

## Структура проекта

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа
├── internal/
│   ├── config/              # Конфигурация
│   ├── database/            # Подключение к БД
│   ├── handlers/            # HTTP обработчики
│   ├── middleware/          # Middleware (auth, CORS)
│   ├── models/             # GORM модели
│   ├── services/           # Бизнес-логика
│   └── utils/              # Утилиты (JWT)
├── admin/                  # Статические файлы админки
└── migrations/             # SQL миграции
```

## Разработка

Для разработки рекомендуется использовать `air` для горячей перезагрузки:

```bash
go install github.com/cosmtrek/air@latest
air
```

## Лицензия

MIT

