FROM golang:1.21-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY go.mod go.sum ./
RUN go mod download

# Копируем весь код
COPY . .

# Собираем приложение
RUN go build -o skyflow .

# Копируем статические файлы
RUN mkdir -p static
COPY static/ ./static/

# Открываем порт
EXPOSE 8080

# Запускаем приложение с переменной окружения для Docker
CMD ["./skyflow"]