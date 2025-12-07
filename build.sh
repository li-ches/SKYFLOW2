#!/bin/bash
# build.sh

echo "🚀 Building SKYFLOW project..."

# 1. Build frontend
echo "📱 Building frontend..."
cd frontend
npm run build

# 2. Copy to backend
echo "📦 Copying frontend to backend..."
cd ..
rm -rf backend/static
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

# 3. Build backend
echo "⚡ Building backend..."
cd backend
go mod download
go build -o skyflow-app .

echo "✅ Build completed!"
echo ""
echo "📁 Files:"
echo "   backend/skyflow-app    - Backend executable"
echo "   backend/static/        - Built frontend"
echo ""
echo "🚀 To run:"
echo "   cd backend && ./skyflow-app"
echo ""
echo "🌐 Website: http://localhost:8080"
echo "🔐 Login: admin / 0000"