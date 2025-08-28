# 🚀 Деплой на Render

## 📋 Подготовка к деплою

### 1. Создайте аккаунт на Render
- Перейдите на [render.com](https://render.com)
- Зарегистрируйтесь или войдите в аккаунт

### 2. Подключите GitHub репозиторий
- Нажмите "New +" → "Web Service"
- Выберите ваш GitHub репозиторий: `https://github.com/539493/new.git`

## ⚙️ Настройка Web Service

### Основные настройки:
```
Name: nauchi-platform
Environment: Node
Region: Frankfurt (EU Central)
Branch: main
Root Directory: (оставьте пустым)
```

### Build & Deploy настройки:
```
Build Command: npm install
Start Command: npm start
```

### Environment Variables:
```
NODE_ENV = production
PORT = 10000
HOST = 0.0.0.0
```

## 🔧 Автоматический деплой

### Вариант 1: Через render.yaml (рекомендуется)
1. Файл `render.yaml` уже создан в репозитории
2. Render автоматически обнаружит его
3. Нажмите "Create Web Service"

### Вариант 2: Ручная настройка
Если автоматический деплой не работает:

1. **Build Command:**
```bash
npm install
```

2. **Start Command:**
```bash
npm start
```

3. **Environment Variables:**
```
NODE_ENV = production
PORT = 10000
HOST = 0.0.0.0
```

## 📁 Структура файлов для деплоя

```
проект/
├── render.yaml              # Конфигурация Render
├── package.json             # Зависимости и скрипты
├── backend/
│   ├── production-server.cjs # Production сервер
│   ├── server_data.json     # Данные приложения
│   └── initial-data.json    # Начальные данные
├── src/                     # React приложение
├── dist/                    # Собранное приложение (создается автоматически)
└── README.md               # Документация
```

## 🚀 Процесс деплоя

### 1. Автоматический деплой
- При каждом push в ветку `main` Render автоматически:
  - Клонирует репозиторий
  - Устанавливает зависимости (`npm install`)
  - Собирает приложение (`npm run build`)
  - Запускает сервер (`npm start`)

### 2. Мониторинг деплоя
- В Render Dashboard вы увидите:
  - Статус сборки
  - Логи процесса
  - URL вашего приложения

## 🔗 Получение URL

После успешного деплоя вы получите URL вида:
```
https://nauchi-platform.onrender.com
```

## 🧪 Тестирование

### 1. Health Check
```
GET https://your-app-name.onrender.com/health
```

### 2. Основное приложение
```
GET https://your-app-name.onrender.com
```

## 🔧 Troubleshooting

### Проблема: Build fails
**Решение:**
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все зависимости в package.json
3. Проверьте, что Node.js версия >= 18

### Проблема: App doesn't start
**Решение:**
1. Проверьте Start Command в настройках
2. Убедитесь, что порт 10000 доступен
3. Проверьте environment variables

### Проблема: Socket.IO не работает
**Решение:**
1. Убедитесь, что CORS настроен правильно
2. Проверьте WebSocket URL в клиенте
3. Обновите SOCKET_URL в environment variables

## 📊 Мониторинг

### Логи
- В Render Dashboard → Logs
- Реальные логи в реальном времени

### Метрики
- CPU и Memory usage
- Response times
- Error rates

## 🔄 Обновления

### Автоматические обновления
- Каждый push в `main` автоматически деплоит новую версию

### Ручной деплой
- В Render Dashboard → Manual Deploy

## 💰 Стоимость

### Free Tier
- 750 часов в месяц
- Автоматическое засыпание после 15 минут неактивности
- Подходит для тестирования и небольших проектов

### Paid Plans
- От $7/месяц за постоянную работу
- Больше ресурсов и функций

## 🎯 Готово!

После успешного деплоя ваше приложение будет доступно по URL:
```
https://nauchi-platform.onrender.com
```

Все функции будут работать:
- ✅ Регистрация и авторизация
- ✅ Профили преподавателей и учеников
- ✅ Система записей
- ✅ WebSocket соединения
- ✅ Поиск и бронирование уроков 