#!/bin/bash

echo "🚀 SKYFLOW Airport System - Docker"
echo "=================================="

# Получаем IP адрес
get_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # MacOS
        ipconfig getifaddr en0 || ipconfig getifaddr en1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}'
    else
        echo "localhost"
    fi
}

HOST_IP=$(get_ip)

echo ""
echo "📍 Ваш IP адрес в сети: $HOST_IP"
echo ""
echo "📱 Для доступа с телефона:"
echo "   1. Подключите телефон к той же Wi-Fi сети"
echo "   2. Откройте браузер на телефоне"
echo "   3. Введите адрес: http://$HOST_IP:3000"
echo "   4. Или отсканируйте QR код с компьютера"
echo ""
echo "🔑 Логин админа: admin / 0000"
echo ""
echo "⚡ Запуск Docker контейнеров..."
echo ""

# Запускаем Docker
docker-compose up --build