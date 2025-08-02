# 🔧 Устранение проблем с CRM API

## ❌ Ошибка "Cannot GET"

### Причина
Ошибка "Cannot GET" возникает, когда:
1. CRM API сервер не запущен
2. Неправильный URL API
3. Проблемы с CORS
4. Неправильный порт

### ✅ Решение

#### 1. Запустите CRM API сервер

```bash
# Перейдите в папку CRM API
cd /Users/admin/Downloads/crm-api-server

# Установите зависимости (если не установлены)
npm install

# Запустите сервер
node server.cjs
```

**Ожидаемый результат:**
```
🚀 CRM API Server running on port 3001
📡 Server accessible at:
  - Local: http://localhost:3001
  - API Base: http://localhost:3001/api
  - Health Check: http://localhost:3001/api/health
  - API Key: crm_539493_2024_auth_token_secure_key
```

#### 2. Проверьте работу API

```bash
# Проверка здоровья API
curl http://localhost:3001/api/health

# Создание пользователя с паролем
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer crm_539493_2024_auth_token_secure_key" \
  -d '{
    "name": "Тестовый Пользователь",
    "email": "test@example.com",
    "password": "test123",
    "type": "student",
    "phone": "+7(999)123-45-67",
    "subjects": ["Математика"]
  }'
```

#### 3. Проверьте конфигурацию в основном приложении

В файле `src/services/crmService.ts` должно быть:

```typescript
const BASE_URL = process.env.CRM_API_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://crm-api-server.onrender.com/api' 
  : 'http://localhost:3001/api');
```

#### 4. Запустите основное приложение

```bash
# В папке основного проекта
cd /Users/admin/Downloads/проект
npm start
```

### 🧪 Тестирование

1. **Откройте тестовую страницу**: `test_crm_integration.html`
2. **Проверьте все функции**:
   - Проверка здоровья API
   - Создание пользователя с паролем
   - Получение списка пользователей
   - Создание тикета

### 🚀 Развертывание на Render

После того как локальное тестирование работает:

1. **Откройте**: https://render.com/dashboard
2. **Создайте Web Service** для репозитория `crm-api-server`
3. **Настройте**:
   - Name: `crm-api-server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

### 📞 Поддержка

Если проблемы остаются:
1. Проверьте логи сервера
2. Убедитесь, что порт 3001 свободен
3. Проверьте, что все зависимости установлены
4. Убедитесь, что CORS настроен правильно 