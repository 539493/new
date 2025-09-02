# 🔧 Подробная техническая инструкция по деплою на Render

## 📋 Технические характеристики сервиса

### Основные параметры
- **Тип сервиса:** Web Service
- **Среда выполнения:** Node.js
- **Версия Node.js:** >=20.0.0
- **Версия npm:** >=8.0.0

### Сетевые настройки
- **Порт приложения:** 10000
- **Протокол:** HTTPS
- **Домен:** *.onrender.com
- **Health Check Path:** `/api/health`

## ⚙️ Конфигурация render.yaml

```yaml
services:
  - type: web
    name: tutoring-platform-1756666331
    env: node
    buildCommand: npm install --legacy-peer-deps && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health
```

## 🔑 Переменные окружения

### Обязательные переменные
```bash
NODE_ENV=production
PORT=10000
```

### Дополнительные переменные (опционально)
```bash
# Для отладки
DEBUG=app:*
LOG_LEVEL=info

# Для мониторинга
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
```

## 📁 Структура проекта для деплоя

```
/
├── render.yaml                    # Конфигурация Render
├── package.json                   # Зависимости и скрипты
├── package-lock.json             # Фиксированные версии
├── backend/                      # Серверная часть
│   ├── production-server.cjs     # Продакшн сервер
│   ├── server.cjs               # Разработочный сервер
│   ├── server_data.json         # Данные сервера
│   └── uploads/                 # Загруженные файлы
├── src/                         # Клиентская часть
│   ├── main.tsx                # Точка входа React
│   ├── App.tsx                 # Главный компонент
│   └── components/             # Компоненты приложения
├── public/                      # Статические файлы
├── dist/                        # Собранное приложение (создается при build)
└── scripts/                     # Скрипты деплоя
```

## 🚀 Процесс деплоя

### 1. Подготовка репозитория
```bash
# Проверка статуса
git status

# Добавление всех изменений
git add .

# Коммит изменений
git commit -m "Подготовка к деплою"

# Отправка в репозиторий
git push origin main
```

### 2. Создание сервиса на Render
1. **Dashboard:** https://dashboard.render.com
2. **New +** → **Web Service**
3. **Connect GitHub** → Выбрать репозиторий `539493/new`
4. **Create Web Service**

### 3. Автоматическая настройка
Render автоматически:
- ✅ Обнаружит `render.yaml`
- ✅ Настроит переменные окружения
- ✅ Установит команды сборки и запуска
- ✅ Настроит health check

## 🔍 Детали сборки

### Build Command
```bash
npm install --legacy-peer-deps && npm run build
```

**Что происходит:**
1. `npm install --legacy-peer-deps` - установка зависимостей
2. `npm run build` - сборка клиентской части

**Время выполнения:** 3-5 минут

### Start Command
```bash
npm start
```

**Что происходит:**
1. Переход в папку `backend/`
2. Запуск `production-server.cjs`
3. Запуск сервера на порту 10000

**Время выполнения:** 1-2 минуты

## 🌐 Настройки CORS

### Разрешенные домены
```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:4173",
  "https://*.vercel.app",
  "https://*.onrender.com",
  "https://na-uchi.onrender.com",
  "https://tutoring-platform.vercel.app",
  "https://tutoring-platform.onrender.com",
  "https://tutoring-platform-*.onrender.com",
  "https://tutoring-platform-1756666331.onrender.com"
];
```

### CORS настройки
```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
```

## 📊 Health Check

### Endpoint
```
GET /api/health
```

### Ожидаемый ответ
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Настройка в Render
- **Path:** `/api/health`
- **Timeout:** 30 секунд
- **Interval:** 30 секунд

## 🔒 Безопасность

### HTTPS
- ✅ Автоматически включен на Render
- ✅ SSL сертификат Let's Encrypt
- ✅ Принудительное перенаправление с HTTP на HTTPS

### Заголовки безопасности
```javascript
// В production-server.cjs
app.use(helmet()); // Защитные заголовки
app.use(express.json({ limit: '10mb' })); // Лимит размера запросов
```

## 📈 Мониторинг и логи

### Логи в Render Dashboard
- **Build Logs** - логи сборки
- **Runtime Logs** - логи выполнения
- **Deploy Logs** - логи развертывания

### Уровни логирования
```javascript
console.log('📊 Загружены данные:');
console.log(`👨‍🏫 Преподавателей: ${Object.keys(data.teacherProfiles || {}).length}`);
console.log(`👨‍🎓 Студентов: ${Object.keys(data.studentProfiles || {}).length}`);
console.log(`📅 Слотов: ${(data.timeSlots || []).length}`);
console.log(`📚 Уроков: ${(data.lessons || []).length}`);
```

## 🚨 Устранение неполадок

### Build Failed
**Причины:**
- Несовместимость версий Node.js
- Отсутствующие зависимости
- Ошибки в коде

**Решение:**
```bash
# Локальная проверка
npm install --legacy-peer-deps
npm run build

# Проверка версии Node.js
node --version  # Должно быть >=20.0.0
npm --version   # Должно быть >=8.0.0
```

### Service Not Starting
**Причины:**
- Неправильная команда запуска
- Занятый порт
- Ошибки в коде сервера

**Решение:**
```bash
# Локальная проверка
cd backend
node production-server.cjs

# Проверка порта
lsof -i :10000
```

### CORS Errors
**Причины:**
- Домен не добавлен в allowedOrigins
- Неправильные настройки CORS

**Решение:**
1. Добавить домен в `allowedOrigins`
2. Перезапустить сервис
3. Проверить настройки в браузере

## 📱 Тестирование после деплоя

### 1. Health Check
```bash
curl https://tutoring-platform-1756666331.onrender.com/api/health
```

### 2. Основные функции
- ✅ Регистрация пользователя
- ✅ Создание профиля преподавателя
- ✅ Создание профиля студента
- ✅ Бронирование слота
- ✅ Отправка сообщения

### 3. Загрузка файлов
- ✅ Загрузка аватара
- ✅ Проверка сохранения в `uploads/avatars/`

## 🔄 Обновление сервиса

### Автоматическое обновление
1. Внесите изменения в код
2. Закоммитьте и отправьте в GitHub
3. Render автоматически пересоберет и перезапустит сервис

### Ручное обновление
1. В Render Dashboard
2. **Manual Deploy** → **Clear build cache & deploy**

## 📞 Поддержка

### Полезные команды
```bash
# Создание нового сервиса
npm run render:new

# Проверка статуса
npm run deploy:check

# Принудительное развертывание
npm run deploy:force
```

### Документация
- **Render Docs:** https://render.com/docs
- **Node.js Docs:** https://nodejs.org/docs
- **Express Docs:** https://expressjs.com/

---

**🎯 Готово к деплою!** Все технические детали указаны выше.
