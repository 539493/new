# 🚀 Руководство по развертыванию на Render

## 📋 **Структура проекта**

Проект состоит из двух частей:
- **Backend** - Node.js сервер с API
- **Frontend** - React приложение

## 🔧 **Шаг 1: Создание бэкенд сервиса**

### На Render.com:

1. **New +** → **Web Service**
2. **Connect GitHub** → выберите репозиторий `539493/new`
3. **Настройки:**
   ```
   Name: na-uchi-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: (пустое)
   Build Command: npm install
   Start Command: node production-server.cjs
   ```
4. **Create Web Service**

### После создания получите URL бэкенда (например: `https://na-uchi-backend.onrender.com`)

## 🎨 **Шаг 2: Создание фронтенд сервиса**

### На Render.com:

1. **New +** → **Static Site**
2. **Connect GitHub** → выберите репозиторий `539493/new`
3. **Настройки:**
   ```
   Name: nauchii
   Environment: Static Site
   Region: Oregon (US West)
   Branch: main
   Root Directory: (пустое)
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Create Static Site**

## 🔗 **Шаг 3: Обновление конфигурации**

После создания бэкенда, обновите URL в `src/config.ts`:

```typescript
export const SERVER_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://YOUR-BACKEND-URL.onrender.com'; // Замените на реальный URL

export const WEBSOCKET_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://YOUR-BACKEND-URL.onrender.com'; // Замените на реальный URL
```

## 📁 **Шаг 4: Структура файлов**

### Для бэкенда (в корне репозитория):
```
/
├── production-server.cjs    # Основной сервер
├── server_data.json         # Данные сервера
├── package.json            # Зависимости бэкенда
├── package-lock.json       # Lock файл
└── assets/                 # Статические файлы фронтенда
```

### Для фронтенда (в папке frontend-build/):
```
frontend-build/
├── src/                    # Исходный код React
├── package.json           # Зависимости фронтенда
├── vite.config.ts         # Конфигурация Vite
└── dist/                  # Собранные файлы (создается при сборке)
```

## ✅ **Проверка развертывания**

### Бэкенд:
- URL: `https://na-uchi-backend.onrender.com`
- Тест: `https://na-uchi-backend.onrender.com/api/test`
- Должен показать информацию о сервере

### Фронтенд:
- URL: `https://nauchii.onrender.com`
- Должен загружаться без ошибок
- Преподаватели должны отображаться

## 🔧 **Устранение проблем**

### Если CORS ошибки:
1. Проверьте URL в `src/config.ts`
2. Убедитесь, что бэкенд запущен
3. Проверьте логи бэкенда на Render

### Если 404 ошибки:
1. Проверьте, что статические файлы скопированы в корень
2. Убедитесь, что `production-server.cjs` правильно настроен

### Если преподаватели не отображаются:
1. Проверьте `server_data.json` содержит данные
2. Проверьте логи бэкенда на загрузку данных
3. Проверьте консоль браузера на ошибки API
