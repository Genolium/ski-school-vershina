# API Документация

## Базовый URL

- Production: `https://www.ski-school-vershina.ru/api`
- Development: `http://localhost:8080/api`

## Аутентификация

Админ API требует JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

## Публичные эндпоинты

### GET /api/schedule
Получение расписания тренировок.

**Ответ:**
```json
[
  {
    "id": 1,
    "group": "Начальная подготовка",
    "age_range": "4-6 лет",
    "days": "Вт, Чт",
    "time": "16:00 - 17:00",
    "location": "Зал (ул. Брянцева 24)",
    "spots": 5,
    "is_active": true,
    "order": 1
  }
]
```

### GET /api/locations
Получение локаций тренировок.

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "Зал",
    "address": "ул. Брянцева 24",
    "description": "Специализированный зал...",
    "features": "[\"Искусственный склон\",\"...\"]",
    "icon_type": "MapPin",
    "latitude": 60.040836,
    "longitude": 30.406475,
    "order": 1
  }
]
```

### GET /api/camps
Получение информации о сборах.

### GET /api/stats
Получение статистики школы.

### GET /api/about
Получение информации о школе.

### GET /api/coaches
Получение списка тренеров.

### GET /api/media
Получение медиа-галереи.

**Параметры запроса:**
- `category` (опционально) - фильтр по категории
- `type` (опционально) - фильтр по типу (`photo` или `video`)

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "Тренировка",
    "description": "Описание",
    "file_path": "/uploads/image.jpg",
    "media_type": "photo",
    "category": "training",
    "event_date": "2025-01-15T00:00:00Z",
    "order": 0,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/applications
Создание новой заявки на пробное занятие.

**Тело запроса:**
```json
{
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "age": "7-9"
}
```

**Ответ:**
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "age": "7-9",
  "status": "pending",
  "created_at": "2025-01-01T00:00:00Z"
}
```

## Админ API эндпоинты

Все админ эндпоинты требуют аутентификации через JWT токен.

### POST /api/admin/login
Вход в админ-панель.

**Тело запроса:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### POST /api/admin/refresh
Обновление access токена через refresh токен.

**Тело запроса:**
```json
{
  "refresh_token": "abc123..."
}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "xyz789..."
}
```

### GET /api/admin/applications
Получение всех заявок.

**Параметры запроса:**
- `status` (опционально) - фильтр по статусу (`pending`, `contacted`, `completed`, `cancelled`)

### PUT /api/admin/applications/:id
Обновление заявки.

**Тело запроса:**
```json
{
  "status": "contacted",
  "notes": "Связались с клиентом"
}
```

### DELETE /api/admin/applications/:id
Удаление заявки.

### CRUD операции для расписания

- `GET /api/admin/schedule` - получить все группы
- `POST /api/admin/schedule` - создать группу
- `PUT /api/admin/schedule/:id` - обновить группу
- `DELETE /api/admin/schedule/:id` - удалить группу

### CRUD операции для локаций

- `GET /api/admin/locations` - получить все локации
- `POST /api/admin/locations` - создать локацию
- `PUT /api/admin/locations/:id` - обновить локацию
- `DELETE /api/admin/locations/:id` - удалить локацию

### CRUD операции для сборов

- `GET /api/admin/camps` - получить все сборы
- `POST /api/admin/camps` - создать сбор
- `PUT /api/admin/camps/:id` - обновить сбор
- `DELETE /api/admin/camps/:id` - удалить сбор

### CRUD операции для статистики

- `GET /api/admin/stats` - получить всю статистику
- `POST /api/admin/stats` - создать статистику
- `PUT /api/admin/stats/:id` - обновить статистику
- `DELETE /api/admin/stats/:id` - удалить статистику

### CRUD операции для "О нас"

- `GET /api/admin/about` - получить содержимое
- `POST /api/admin/about` - создать содержимое
- `PUT /api/admin/about/:id` - обновить содержимое

### CRUD операции для тренеров

- `GET /api/admin/coaches` - получить всех тренеров
- `POST /api/admin/coaches` - создать тренера
- `PUT /api/admin/coaches/:id` - обновить тренера
- `DELETE /api/admin/coaches/:id` - удалить тренера

### CRUD операции для медиа-галереи

- `GET /api/admin/media` - получить все медиа
- `POST /api/admin/media` - создать медиа
- `PUT /api/admin/media/:id` - обновить медиа
- `DELETE /api/admin/media/:id` - удалить медиа

**Параметры запроса для GET:**
- `category` (опционально) - фильтр по категории
- `type` (опционально) - фильтр по типу

### POST /api/admin/upload
Загрузка файла (фото или видео).

**Формат:** `multipart/form-data`

**Параметры:**
- `file` - файл для загрузки

**Ограничения:**
- Типы файлов: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Максимальный размер: 5MB

**Ответ:**
```json
{
  "url": "/uploads/1234567890_filename.jpg"
}
```

## Коды ошибок

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `404` - Ресурс не найден
- `429` - Слишком много запросов (rate limit)
- `500` - Внутренняя ошибка сервера

## Rate Limiting

- `/api/applications` (POST): 5 запросов в 15 минут
- `/api/admin/login`: 5 попыток входа в 15 минут
- `/api/admin/*`: 200 запросов в минуту (для авторизованных пользователей)

## Кэширование

Публичные эндпоинты кэшируются на 10 минут:
- `/api/schedule`
- `/api/locations`
- `/api/camps`
- `/api/stats`
- `/api/about`
- `/api/coaches`
- `/api/media`

Кэш автоматически инвалидируется при обновлении данных через админ-панель.

