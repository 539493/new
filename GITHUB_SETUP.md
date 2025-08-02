# 🚀 Создание репозитория на GitHub

## Шаг 1: Создание репозитория на GitHub

1. Откройте https://github.com/new
2. Заполните форму:
   - **Repository name**: `crm-api-server`
   - **Description**: `CRM API Server for Tutoring Platform`
   - **Visibility**: Public
   - **НЕ** ставьте галочки на "Add a README file", "Add .gitignore", "Choose a license"
3. Нажмите "Create repository"

## Шаг 2: Подключение локального репозитория

После создания репозитория, выполните эти команды в терминале:

```bash
# Добавить удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/crm-api-server.git

# Отправить код
git branch -M main
git push -u origin main
```

## Шаг 3: Развертывание на Render

1. Откройте https://render.com/dashboard
2. Нажмите "New +" → "Web Service"
3. Подключите GitHub репозиторий `crm-api-server`
4. Настройте:
   - **Name**: `crm-api-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Нажмите "Create Web Service"

## Шаг 4: Обновление основного приложения

После развертывания обновите `render.yaml` в основном проекте:

```yaml
- key: CRM_API_URL
  value: https://YOUR_RENDER_URL.onrender.com/api
```

## Готово! 🎉

После этого CRM API будет доступен по адресу:
`https://YOUR_RENDER_URL.onrender.com/api` 