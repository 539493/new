# ⚡ Быстрая настройка автоматического деплоя

## Что нужно сделать СЕЙЧАС:

### 1. Включить Auto-Deploy в Render Dashboard

1. **Перейдите на:** https://dashboard.render.com
2. **Найдите сервис:** `na-uchi`
3. **Нажмите на сервис** для редактирования
4. **В разделе "Settings" → "Build & Deploy":**
   - ✅ Включите **Auto-Deploy**
   - ✅ Убедитесь, что выбран **Branch: main**
   - ✅ Проверьте **Build Command:** `npm install && npm run build`
   - ✅ Проверьте **Start Command:** `npm start`

### 2. Протестировать автоматический деплой

```bash
# Проверить текущий статус
npm run deploy:check

# Протестировать деплой (добавит тестовое изменение)
npm run deploy:test
```

### 3. Проверить результат

- 🌐 **Приложение:** https://na-uchi.onrender.com
- 📊 **Render Dashboard:** https://dashboard.render.com
- 🔗 **GitHub Actions:** https://github.com/539493/new/actions

## Что произойдет после настройки:

✅ **Каждый `git push origin main` автоматически:**
- Запустит сборку на Render
- Обновит приложение
- Сделает изменения доступными на https://na-uchi.onrender.com

## Полезные команды:

```bash
# Проверить статус деплоя
npm run deploy:check

# Тест автоматического деплоя
npm run deploy:test

# Локальная сборка
npm run build

# Локальный запуск
npm start
```

## Если что-то не работает:

1. **Проверьте логи в Render Dashboard**
2. **Убедитесь, что Auto-Deploy включен**
3. **Проверьте, что репозиторий подключен**
4. **Убедитесь, что выбран правильный branch (main)**

---

**🎉 После настройки Auto-Deploy ваш проект будет автоматически обновляться при каждом push!**


