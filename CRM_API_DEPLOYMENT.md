# 🚀 Развертывание CRM API на Render

## 📋 Проблема
При регистрации с других устройств данные не отправляются в CRM, потому что:
- Локальный CRM Mock Server недоступен с других устройств
- Продакшен CRM API недоступен

## 🔧 Решение
Создаем отдельный CRM API сервер и развертываем его на Render.

## 📁 Структура CRM API

### Файлы CRM API
```
crm-api/
├── package.json          # Зависимости
├── server.cjs           # Основной сервер
└── render.yaml          # Конфигурация Render
```

### Endpoints
- `POST /api/users` - создание пользователя
- `GET /api/users` - список пользователей
- `POST /api/tickets` - создание тикета
- `GET /api/tickets` - список тикетов
- `GET /api/users/stats` - статистика пользователей
- `GET /api/tickets/stats` - статистика тикетов
- `GET /api/health` - проверка работоспособности

## 🚀 Развертывание CRM API

### 1. Создание репозитория для CRM API
1. Создайте новый репозиторий на GitHub: `crm-api-server`
2. Скопируйте файлы из папки `crm-api/` в новый репозиторий
3. Отправьте код в GitHub

### 2. Развертывание на Render
1. Перейдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите репозиторий `crm-api-server`
4. Настройте параметры:
   - **Name**: `crm-api-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

### 3. Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `10000`

## 🔧 Обновление основного приложения

### 1. Обновление конфигурации
В `render.yaml` обновлен URL CRM API:
```yaml
- key: CRM_API_URL
  value: https://crm-api-server.onrender.com/api
```

### 2. Обновление CRM сервиса
В `src/services/crmService.ts` уже настроен правильный URL:
```typescript
const BASE_URL = process.env.CRM_API_URL || 'https://crm-api-server.onrender.com/api';
```

## 🧪 Тестирование

### 1. Локальное тестирование CRM API
```bash
cd crm-api
npm install
npm start
```

### 2. Проверка endpoints
```bash
# Проверка health
curl http://localhost:3001/api/health

# Создание пользователя
curl -X POST -H "Authorization: Bearer crm_539493_2024_auth_token_secure_key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@example.com","type":"student","phone":"+7(999)123-45-67","joinDate":"2025-08-01"}' \
  http://localhost:3001/api/users

# Получение пользователей
curl -H "Authorization: Bearer crm_539493_2024_auth_token_secure_key" \
  http://localhost:3001/api/users
```

### 3. Тестирование после развертывания
```bash
# Проверка продакшен CRM API
curl https://crm-api-server.onrender.com/api/health

# Создание пользователя в продакшене
curl -X POST -H "Authorization: Bearer crm_539493_2024_auth_token_secure_key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@example.com","type":"student","phone":"+7(999)123-45-67","joinDate":"2025-08-01"}' \
  https://crm-api-server.onrender.com/api/users
```

## 📊 Результат

### ✅ После развертывания CRM API
- **CRM API доступен** с любого устройства
- **Регистрация работает** с любых устройств
- **Данные отправляются** в CRM автоматически
- **Синхронизация работает** для всех пользователей

### ✅ URL после развертывания
- **CRM API**: `https://crm-api-server.onrender.com/api`
- **Health Check**: `https://crm-api-server.onrender.com/api/health`
- **Основное приложение**: `https://your-app-name.onrender.com`

## 🎯 Следующие шаги

### 1. Развертывание CRM API
1. Создайте репозиторий `crm-api-server`
2. Скопируйте файлы из `crm-api/`
3. Разверните на Render

### 2. Обновление основного приложения
1. Обновите `render.yaml` с новым URL
2. Разверните обновленное приложение

### 3. Тестирование
1. Проверьте регистрацию с разных устройств
2. Убедитесь, что данные отправляются в CRM
3. Проверьте синхронизацию пользователей

## 🎉 Готово!

После развертывания CRM API:
- ✅ **Регистрация работает** с любых устройств
- ✅ **Данные отправляются** в CRM автоматически
- ✅ **CRM система доступна** глобально
- ✅ **Синхронизация работает** для всех пользователей

**CRM API готов к развертыванию!** 🚀 