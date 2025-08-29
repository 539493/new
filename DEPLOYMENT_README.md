# 🚀 Автоматический деплой на Render

## Быстрый старт

### 1. Настройка в Render Dashboard

1. Перейдите на https://dashboard.render.com
2. Найдите сервис `na-uchi`
3. В настройках включите **Auto-Deploy**
4. Убедитесь, что выбран branch `main`

### 2. Проверка настройки

```bash
# Проверить статус деплоя
npm run deploy:check

# Протестировать автоматический деплой
npm run deploy:test
```

### 3. Как это работает

- ✅ Каждый `git push origin main` автоматически запускает деплой
- ✅ GitHub Actions собирает проект и уведомляет Render
- ✅ Render автоматически обновляет приложение
- ✅ Приложение доступно на https://na-uchi.onrender.com

## Полезные команды

```bash
# Проверить статус
npm run deploy:check

# Тест деплоя
npm run deploy:test

# Локальная сборка
npm run build

# Локальный запуск
npm start
```

## Ссылки

- 🌐 **Приложение:** https://na-uchi.onrender.com
- 📊 **Render Dashboard:** https://dashboard.render.com
- 🔗 **GitHub Actions:** https://github.com/539493/new/actions
- 📦 **GitHub Repo:** https://github.com/539493/new

## Устранение неполадок

### Деплой не запускается
1. Проверьте, что Auto-Deploy включен в Render
2. Убедитесь, что репозиторий подключен
3. Проверьте права доступа

### Ошибки сборки
1. Проверьте `npm run build` локально
2. Убедитесь, что все зависимости установлены
3. Проверьте логи в Render Dashboard

---

**Теперь каждый push в main автоматически обновляет приложение! 🎉**
