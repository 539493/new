# 🚀 Инструкция по деплою на Render

## ✅ Проект готов к деплою!

Проект полностью настроен для работы на Render. Все необходимые конфигурации выполнены.

## 📋 Быстрый деплой

### 1. Подготовка репозитория
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. Создание сервиса на Render
1. Зайдите на [render.com](https://render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Выберите ветку `main`

### 3. Настройки сервиса
- **Name**: `nauchi-tutoring-platform`
- **Environment**: `Node`
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`
- **Plan**: `Free`

### 4. Деплой
Нажмите **"Create Web Service"** и дождитесь завершения.

## 🔍 Проверка работы

После деплоя проверьте:
- **Health check**: `https://na-uchi.onrender.com/api/health`
- **API status**: `https://na-uchi.onrender.com/api/status`
- **Frontend**: `https://na-uchi.onrender.com/`

## 📁 Что настроено

✅ **package.json** - добавлены скрипты для Render  
✅ **render.yaml** - конфигурация деплоя  
✅ **production-server.cjs** - сервер для production  
✅ **CORS** - настроен для доменов Render  
✅ **Health check** - endpoint `/api/health`  
✅ **Статические файлы** - обслуживание из папки `dist`  
✅ **Socket.IO** - настроен для работы в production  

## 🛠️ Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск production сервера локально
npm start
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все файлы закоммичены
3. Проверьте настройки сервиса на Render
4. Обратитесь к документации Render

---

**Проект готов к работе на Render! 🎉**

