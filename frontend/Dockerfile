FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# Копируем nginx конфиг
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Устанавливаем права
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]