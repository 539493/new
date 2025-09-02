# ⚡ Техническая сводка для деплоя

## 🔑 Ключевые параметры

### Сервис
- **Имя:** `tutoring-platform-1756666331`
- **Тип:** Web Service
- **Среда:** Node.js >=20.0.0

### Сеть
- **Порт:** 10000
- **Протокол:** HTTPS
- **Домен:** `*.onrender.com`
- **Health Check:** `/api/health`

### Переменные окружения
```bash
NODE_ENV=production
PORT=10000
```

## 🚀 Команды деплоя

### Build Command
```bash
npm install --legacy-peer-deps && npm run build
```

### Start Command
```bash
npm start
```

## 📁 Критические файлы

- `render.yaml` - конфигурация Render
- `backend/production-server.cjs` - продакшн сервер
- `package.json` - зависимости и скрипты
- `backend/server_data.json` - данные сервера

## 🌐 CORS домены

```javascript
"https://tutoring-platform-1756666331.onrender.com"
"https://*.onrender.com"
"https://*.vercel.app"
```

## 📊 Health Check

**URL:** `/api/health`
**Ожидаемый ответ:** `{"status":"ok"}`

## ⏱️ Время выполнения

- **Build:** 3-5 минут
- **Start:** 1-2 минуты
- **Total:** 5-10 минут

## 🔗 Результат

**URL сервиса:** `https://tutoring-platform-1756666331.onrender.com`

---

**📖 Полная инструкция:** `DETAILED_DEPLOYMENT_GUIDE.md`
