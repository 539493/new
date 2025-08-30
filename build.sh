#!/bin/bash

echo "🚀 Starting build process..."

# Установка зависимостей с legacy-peer-deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Сборка фронтенда
echo "🔨 Building frontend..."
npm run build

# Проверка, что dist папка создана
if [ -d "dist" ]; then
    echo "✅ Frontend build completed successfully"
    ls -la dist/
else
    echo "❌ Frontend build failed - dist folder not found"
    exit 1
fi

echo "🎉 Build process completed!"
