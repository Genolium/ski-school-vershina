# Руководство по деплою

## Производственный домен
**https://www.ski-school-vershina.ru/**

## Требования перед деплоем

### 1. SSL сертификаты
Получите SSL сертификаты (Let's Encrypt рекомендован):
```bash
# Используя certbot
certbot certonly --standalone -d www.ski-school-vershina.ru -d ski-school-vershina.ru
```

### 2. Переменные окружения для продакшена

Создайте файл `.env.production`:

```env
# Backend
JWT_SECRET=<сгенерируйте надежный секретный ключ минимум 32 символа>
ADMIN_PASSWORD=<создайте надежный пароль администратора минимум 8 символов>
CORS_ORIGINS=https://www.ski-school-vershina.ru,https://ski-school-vershina.ru
ENVIRONMENT=production
PORT=8080

# База данных (PostgreSQL рекомендуется для production)
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ski_school
DB_USER=ski_school
DB_PASSWORD=<надежный пароль для PostgreSQL>

# Telegram уведомления (опционально)
TELEGRAM_BOT_TOKEN=<токен бота от @BotFather>
TELEGRAM_CHAT_ID=<ID чата для уведомлений>

# Frontend
VITE_API_URL=/api
VITE_YANDEX_METRIKA_ID=<ID счетчика Яндекс.Метрики>
```

### 3. Генерация секретных ключей

```bash
# JWT Secret (используйте длинную случайную строку)
openssl rand -base64 32

# Admin Password (используйте надежный пароль)
# Рекомендуется использовать менеджер паролей
```

## Деплой на сервер

### Вариант 1: Docker Compose (рекомендуется)

1. Скопируйте проект на сервер:
```bash
scp -r ski-school-vershina user@server:/opt/
```

2. На сервере обновите docker-compose.yml для продакшена:
```bash
cd /opt/ski-school-vershina
# Обновите CORS_ORIGINS и другие переменные окружения
```

3. Запустите:
```bash
docker-compose -f docker-compose.yml --env-file .env.production up -d --build
```

### Вариант 2: С nginx как reverse proxy

1. Установите nginx на сервере
2. Скопируйте `nginx-ssl.conf` в `/etc/nginx/sites-available/ski-school-vershina`
3. Создайте символическую ссылку:
```bash
ln -s /etc/nginx/sites-available/ski-school-vershina /etc/nginx/sites-enabled/
```
4. Обновите пути к SSL сертификатам в конфигурации
5. Перезапустите nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Настройка DNS

Настройте DNS записи для домена:
- A запись: `www.ski-school-vershina.ru` → IP адрес сервера
- A запись: `ski-school-vershina.ru` → IP адрес сервера

## Проверка после деплоя

1. Проверьте доступность сайта:
```bash
curl https://www.ski-school-vershina.ru/health
```

2. Проверьте SSL:
```bash
openssl s_client -connect www.ski-school-vershina.ru:443
```

3. Проверьте админ-панель:
```
https://www.ski-school-vershina.ru/admin
```

## Безопасность

- ✅ Всегда используйте сильные пароли в продакшене
- ✅ Регулярно обновляйте зависимости
- ✅ Настройте автоматические бэкапы базы данных
- ✅ Мониторьте логи приложения
- ✅ Настройте rate limiting для защиты от DDoS

## Мониторинг

Рекомендуется настроить:
- Логирование в файлы или централизованный сервис
- Мониторинг доступности (UptimeRobot, Pingdom)
- Алерты при ошибках (email, Telegram бот)

## Бэкапы

### PostgreSQL

Настройте автоматическое резервное копирование базы данных PostgreSQL:

```bash
# Использование shell скрипта
0 2 * * * /path/to/backend/scripts/backup.sh

# Или использование Go скрипта
0 2 * * * cd /path/to/backend && go run scripts/backup.go
```

Скрипт автоматически:
- Создает бэкап с timestamp в имени файла
- Сжимает бэкап с помощью gzip
- Удаляет старые бэкапы (старше 7 дней)

### Восстановление из бэкапа

```bash
backend/scripts/restore.sh /path/to/backup.sql.gz
```

### Настройка Telegram бота

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Найдите ID чата (можно использовать @userinfobot или создать группу и добавить бота)
4. Добавьте переменные окружения `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`

### Настройка Яндекс.Метрики

1. Создайте счетчик в Яндекс.Метрике
2. Получите ID счетчика
3. Добавьте переменную окружения `VITE_YANDEX_METRIKA_ID`
4. Настройте цель "Отправка заявки" с идентификатором `submit_application`

