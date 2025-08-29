# 🚀 Настройка автоматического деплоя на Render

## Обзор
Этот документ описывает, как настроить автоматическое обновление проекта на Render при каждом push в GitHub.

## Методы автоматического деплоя

### Метод 1: Render Auto-Deploy (Рекомендуемый)

Render поддерживает автоматический деплой из GitHub репозитория. Это самый простой способ.

#### Настройка в Render Dashboard:

1. **Войдите в Render Dashboard**
   - Перейдите на https://dashboard.render.com
   - Войдите в свой аккаунт

2. **Найдите ваш сервис**
   - Найдите сервис `na-uchi` в списке
   - Нажмите на него для редактирования

3. **Настройте Auto-Deploy**
   - В разделе "Settings" найдите "Build & Deploy"
   - Убедитесь, что "Auto-Deploy" включен
   - Убедитесь, что выбран правильный branch (main)

4. **Проверьте настройки**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`

#### Настройка в GitHub:

1. **Убедитесь, что репозиторий подключен**
   - В Render Dashboard проверьте, что GitHub репозиторий подключен
   - Если нет, подключите его заново

2. **Проверьте права доступа**
   - Render должен иметь доступ к вашему GitHub репозиторию
   - Убедитесь, что репозиторий публичный или Render имеет доступ к приватному

### Метод 2: GitHub Actions + Webhook

Если нужно больше контроля над процессом деплоя.

#### Настройка в Render:

1. **Создайте Webhook**
   - В настройках сервиса найдите "Webhooks"
   - Создайте новый webhook
   - Скопируйте URL webhook

2. **Добавьте секреты в GitHub**
   - Перейдите в ваш GitHub репозиторий
   - Settings → Secrets and variables → Actions
   - Добавьте секрет `RENDER_WEBHOOK_URL` с URL вашего webhook

#### Настройка в GitHub:

1. **Создайте workflow файл**
   - Файл `.github/workflows/render-webhook.yml` уже создан
   - Он будет автоматически запускаться при push в main

2. **Проверьте настройки**
   - Убедитесь, что секрет `RENDER_WEBHOOK_URL` добавлен
   - Проверьте, что workflow файл находится в правильной папке

### Метод 3: GitHub Actions + Render CLI

Для полного контроля над процессом деплоя.

#### Настройка в Render:

1. **Создайте API Token**
   - В Render Dashboard перейдите в Account Settings
   - API Keys → Create API Key
   - Скопируйте токен

2. **Получите Service ID**
   - В настройках сервиса найдите Service ID
   - Скопируйте его

#### Настройка в GitHub:

1. **Добавьте секреты**
   - `RENDER_TOKEN` - ваш API токен
   - `RENDER_SERVICE_ID` - ID вашего сервиса

2. **Используйте workflow**
   - Файл `.github/workflows/deploy-to-render.yml` уже создан

## Проверка настройки

### Тест автоматического деплоя:

1. **Сделайте небольшое изменение в коде**
   ```bash
   # Добавьте комментарий в README.md
   echo "# Updated at $(date)" >> README.md
   ```

2. **Зафиксируйте и отправьте изменения**
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

3. **Проверьте деплой**
   - В GitHub: Actions → Deploy to Render
   - В Render: Dashboard → ваш сервис → Logs

### Ожидаемый результат:

- ✅ GitHub Actions запускается автоматически
- ✅ Render получает уведомление о новых изменениях
- ✅ Начинается автоматический деплой
- ✅ Приложение обновляется на https://na-uchi.onrender.com

## Устранение неполадок

### Проблема: Деплой не запускается

**Решение:**
1. Проверьте, что Auto-Deploy включен в Render
2. Убедитесь, что репозиторий подключен правильно
3. Проверьте права доступа Render к GitHub

### Проблема: Ошибки сборки

**Решение:**
1. Проверьте `package.json` - все зависимости указаны
2. Убедитесь, что `npm run build` работает локально
3. Проверьте логи сборки в Render Dashboard

### Проблема: Приложение не запускается

**Решение:**
1. Проверьте `npm start` команду
2. Убедитесь, что порт настроен правильно
3. Проверьте переменные окружения

## Мониторинг

### Полезные ссылки:

- **Render Dashboard:** https://dashboard.render.com
- **GitHub Actions:** https://github.com/[username]/[repo]/actions
- **Приложение:** https://na-uchi.onrender.com

### Логи и отладка:

- **Render Logs:** Dashboard → ваш сервис → Logs
- **GitHub Actions Logs:** Actions → Deploy to Render → View logs

## Заключение

После настройки автоматического деплоя:

- ✅ Каждый push в main автоматически обновляет приложение
- ✅ Не нужно вручную деплоить на Render
- ✅ Можно отслеживать статус деплоя в GitHub Actions
- ✅ Приложение всегда актуально

Теперь ваш проект будет автоматически обновляться на Render при каждом изменении в GitHub! 🚀
