# 🚀 Руководство по развертыванию

## Локальное развертывание

### 1. Клонирование репозитория
```bash
git clone https://github.com/539493/new.git
cd new
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка конфигурации
```bash
cp src/config.example.ts src/config.ts
```

Отредактируйте `src/config.ts`:
```typescript
export const SERVER_URL = 'http://localhost:3001';
export const WEBSOCKET_URL = 'http://localhost:3001';
```

### 4. Запуск сервера
```bash
cd backend
node server.cjs
```

### 5. Запуск клиента
```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3002`

## Облачное развертывание

### Render.com

1. **Создайте новый Web Service**
2. **Подключите GitHub репозиторий**
3. **Настройте переменные окружения:**
   ```
   NODE_ENV=production
   PORT=3001
   HOST=0.0.0.0
   ```
4. **Настройте команды сборки:**
   ```
   Build Command: npm install && npm run build
   Start Command: node backend/server.cjs
   ```

### Vercel

1. **Подключите репозиторий к Vercel**
2. **Настройте переменные окружения**
3. **Укажите корневую папку: `./`**
4. **Настройте команды:**
   ```
   Build Command: npm run build
   Output Directory: dist
   ```

### Heroku

1. **Создайте приложение на Heroku**
2. **Подключите GitHub репозиторий**
3. **Настройте переменные окружения**
4. **Добавьте файл `Procfile`:**
   ```
   web: node backend/server.cjs
   ```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
VITE_SERVER_URL=https://your-domain.com
VITE_WEBSOCKET_URL=https://your-domain.com
```

## Настройка CORS

В `backend/server.cjs` настройте разрешенные домены:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://your-domain.com',
  'https://*.vercel.app',
  'https://*.onrender.com'
];
```

## Проверка развертывания

1. **Проверьте доступность сервера:**
   ```
   GET https://your-domain.com/
   ```

2. **Проверьте API endpoints:**
   ```
   GET https://your-domain.com/api/users
   GET https://your-domain.com/api/teachers
   ```

3. **Проверьте WebSocket соединение:**
   - Откройте приложение
   - Проверьте статус подключения в интерфейсе

## Мониторинг

### Логи сервера
```bash
# Локально
node backend/server.cjs

# На сервере
pm2 logs
```

### Проверка состояния
```bash
# Статус процесса
pm2 status

# Перезапуск
pm2 restart all
```

## Безопасность

1. **Настройте HTTPS** для продакшена
2. **Ограничьте CORS** только нужными доменами
3. **Используйте переменные окружения** для секретов
4. **Настройте rate limiting** для API

## Масштабирование

### Горизонтальное масштабирование
1. **Используйте Redis** для хранения сессий
2. **Настройте балансировщик нагрузки**
3. **Используйте CDN** для статических файлов

### Вертикальное масштабирование
1. **Увеличьте ресурсы сервера**
2. **Оптимизируйте базу данных**
3. **Настройте кэширование**

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте настройки CORS
4. Создайте Issue в репозитории 