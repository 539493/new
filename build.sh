#!/bin/bash

echo "🚀 Building frontend for Render..."

# Устанавливаем зависимости
echo "📦 Installing dependencies..."
npm install

# Собираем проект
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output in dist/ directory"
