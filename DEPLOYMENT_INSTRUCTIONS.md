# 🚀 Инструкция по развертыванию на Render

## 📋 **Структура проекта**

```
/
├── production-server.cjs    # Бэкенд сервер
├── server_data.json         # Данные сервера
├── package.json            # Зависимости бэкенда
├── package-lock.json       # Lock файл бэкенда
├── frontend/               # Папка с фронтендом
│   ├── src/                # Исходный код React
│   ├── package.json        # Зависимости фронтенда
│   └── dist/               # Собранные файлы (создается при сборке)
└── assets/                 # Статические файлы фронтенда (в корне для бэкенда)
```

## 🔧 **Настройки для бэкенд веб-сервиса**

### На Render.com:
1. **Environment:** Web Service
2. **Build Command:** `npm install`
3. **Start Command:** `node production-server.cjs`
4. **Root Directory:** (оставьте пустым)

## 🎨 **Настройки для фронтенд Static Site**

### На Render.com:
1. **Environment:** Static Site
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`

## ✅ **Проверка после развертывания**

### Бэкенд:
- URL: `https://ваш-бэкенд-url.onrender.com`
- Тест: `https://ваш-бэкенд-url.onrender.com/api/test`
- Должен показать информацию о сервере

### Фронтенд:
- URL: `https://ваш-фронтенд-url.onrender.com`
- Должен загружаться без ошибок
- Преподаватели должны отображаться
