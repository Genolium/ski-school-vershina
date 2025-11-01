# Школа горнолыжного спорта «Вершина»

Современный веб-сайт для горнолыжной школы с React фронтендом и Go бэкендом.

## Быстрый старт через Docker

```bash
# Запустить весь проект
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить проект
docker-compose down
```

После запуска:
- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:8080/api
- **Админ-панель**: http://localhost:8080/admin

**Важно**: Для первого запуска необходимо установить переменную окружения `ADMIN_PASSWORD`:
```bash
export ADMIN_PASSWORD=your-secure-password
docker-compose up -d
```

Подробнее про Docker: [DOCKER.md](./DOCKER.md)

## Переменные окружения

### Обязательные для production:
- `ADMIN_PASSWORD` - пароль администратора (обязательно!)
- `JWT_SECRET` - секретный ключ для JWT токенов (минимум 32 символа)

### Для PostgreSQL:
- `DB_TYPE=postgres` - тип базы данных
- `DB_HOST` - хост PostgreSQL
- `DB_PORT` - порт PostgreSQL (по умолчанию 5432)
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь PostgreSQL
- `DB_PASSWORD` - пароль PostgreSQL

### Для Telegram уведомлений (опционально):
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_CHAT_ID` - ID чата для уведомлений

### Для Яндекс.Метрики (опционально):
- `VITE_YANDEX_METRIKA_ID` - ID счетчика Яндекс.Метрики

**Подробная инструкция по настройке Telegram и Яндекс.Метрики:** [SETUP_TELEGRAM_METRIKA.md](./SETUP_TELEGRAM_METRIKA.md)

## Локальная разработка

### Фронтенд

```bash
npm install
npm run dev
```

### Бэкенд

```bash
cd backend
go mod download
export ADMIN_PASSWORD=your-password
go run cmd/server/main.go
```

Подробнее про бэкенд: [backend/README.md](./backend/README.md)

## Технологии

### Фронтенд
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Бэкенд
- Go 1.21+
- Gin
- GORM
- PostgreSQL / SQLite
- JWT с refresh токенами

## Бэкапы базы данных

Для создания бэкапа PostgreSQL используйте скрипт:
```bash
backend/scripts/backup.sh
```

Для восстановления:
```bash
backend/scripts/restore.sh /path/to/backup.sql.gz
```

Или используйте Go скрипт:
```bash
cd backend
go run scripts/backup.go
```

## Миграция на PostgreSQL

Для миграции данных из SQLite в PostgreSQL:
```bash
cd backend
go run scripts/migrate_data.go /path/to/sqlite.db "postgresql://user:pass@host:port/dbname"
```

## Структура проекта

```
.
├── src/                    # React фронтенд
│   ├── components/        # Компоненты
│   ├── pages/            # Страницы
│   └── lib/              # Утилиты и API клиент
├── backend/              # Go бэкенд
│   ├── cmd/server/      # Точка входа
│   ├── internal/        # Внутренние пакеты
│   ├── scripts/         # Скрипты для бэкапов и миграций
│   └── admin/           # Админ-панель
├── docker-compose.yml   # Docker оркестрация
└── Dockerfile           # Docker образ для фронтенда
```

## Лицензия

MIT

