#!/bin/bash

echo "🚀 Starting build process..."

# Установка зависимостей backend
echo "📦 Installing backend dependencies..."
npm install

# Установка зависимостей frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Сборка frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Build completed successfully!"
