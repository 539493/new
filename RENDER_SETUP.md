# Создание проекта на Render

## Шаг 1: Подготовка репозитория

1. **Создайте новый репозиторий на GitHub**
   - Перейдите на https://github.com
   - Нажмите "New repository"
   - Назовите репозиторий: `tutoring-platform`
   - Сделайте его публичным
   - НЕ инициализируйте с README

2. **Загрузите код в репозиторий**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Tutoring Platform with real-time features"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tutoring-platform.git
   git push -u origin main
   ```

## Шаг 2: Создание проекта на Render

1. **Перейдите на Render**
   - Откройте https://render.com
   - Войдите в аккаунт или создайте новый

2. **Создайте новый Web Service**
   - Нажмите "New +" в правом верхнем углу
   - Выберите "Web Service"
   - Подключите ваш GitHub аккаунт (если еще не подключен)

3. **Настройте подключение к репозиторию**
   - Выберите репозиторий `tutoring-platform`
   - Нажмите "Connect"

## Шаг 3: Конфигурация сервиса

### Основные настройки:
- **Name**: `tutoring-platform`
- **Environment**: `Node`
- **Region**: Выберите ближайший к вам регион
- **Branch**: `main`

### Build & Deploy настройки:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node backend/production-server.cjs`
- **Health Check Path**: `/api/health`

### Переменные окружения:
- `NODE_ENV`: `production`
- `PORT`: оставьте пустым (Render назначит автоматически)

## Шаг 4: Деплой

1. **Нажмите "Create Web Service"**
2. **Дождитесь завершения деплоя** (5-10 минут)
3. **Проверьте логи** в случае ошибок

## Шаг 5: Проверка работы

После успешного деплоя проверьте:

1. **Основная страница**: `https://your-app-name.onrender.com`
2. **Health check**: `https://your-app-name.onrender.com/api/health`
3. **WebSocket**: автоматически подключается к тому же домену

## Real-time функции для учеников

✅ **Мгновенное отображение слотов** - ученики видят доступные слоты в реальном времени
✅ **Real-time бронирование** - мгновенное обновление при бронировании уроков
✅ **Чат с преподавателями** - обмен сообщениями в реальном времени
✅ **Уведомления о уроках** - мгновенные уведомления о новых уроках
✅ **Синхронизация профилей** - обновления профилей между устройствами
✅ **WebRTC поддержка** - готово для видеозвонков

## Структура файлов для деплоя

```
tutoring-platform/
├── backend/
│   ├── production-server.cjs    # Основной сервер (WebSocket + статика)
│   ├── server.cjs              # Сервер для разработки
│   └── server_data.json        # Данные (создается автоматически)
├── src/                        # React исходный код
├── dist/                       # Собранные файлы (создается при build)
├── package.json                # Зависимости и скрипты
├── render.yaml                 # Конфигурация Render
├── vite.config.ts              # Конфигурация Vite
└── DEPLOY.md                   # Инструкции по деплою
```

## Возможные проблемы и решения

### Проблема: Build fails
**Решение**: Проверьте, что все зависимости указаны в `package.json`

### Проблема: Server not starting
**Решение**: Проверьте логи в Render Dashboard, убедитесь что `startCommand` правильный

### Проблема: WebSocket не подключается
**Решение**: Убедитесь, что в `src/config.ts` правильно настроен URL для продакшена

### Проблема: Статические файлы не загружаются
**Решение**: Проверьте, что папка `dist` создается при build

## Локальное тестирование

Перед деплоем протестируйте локально:

```bash
# Сборка проекта
npm run build

# Запуск продакшн сервера
node backend/production-server.cjs

# Проверка health check
curl http://localhost:3000/api/health
```

## Следующие шаги после деплоя

1. **Настройте домен** (опционально)
2. **Добавьте SSL сертификат** (автоматически на Render)
3. **Настройте мониторинг** в Render Dashboard
4. **Настройте автоматические деплои** при push в main ветку

## Поддержка

Если возникли проблемы:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все файлы загружены в репозиторий
3. Проверьте, что build проходит локально
4. Обратитесь к документации Render: https://render.com/docs 