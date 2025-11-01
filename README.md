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
- **Админ-панель**: http://localhost:8080/admin (логин: admin, пароль: admin123)

Подробнее про Docker: [DOCKER.md](./DOCKER.md)

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
- SQLite
- JWT

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
│   └── admin/           # Админ-панель
├── docker-compose.yml   # Docker оркестрация
└── Dockerfile           # Docker образ для фронтенда
```

## Лицензия

MIT

