# Стадия сборки
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Копирование go mod файлов
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Копирование исходного кода
COPY backend/ ./

# Сборка приложения
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server/main.go

# Финальная стадия
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite wget

WORKDIR /app

# Копирование бинарника из стадии сборки
COPY --from=builder /app/server .

# Копирование админ-панели
COPY backend/admin ./admin

# Копирование favicon
COPY public/favicon ./public/favicon

# Создание директорий для данных и загрузок
RUN mkdir -p /app/data /app/data/uploads

# Открытие порта
EXPOSE 8080

# Переменные окружения
ENV PORT=8080
ENV DB_PATH=/app/data/data.db
ENV ENVIRONMENT=production

# Запуск сервера
CMD ["./server"]
