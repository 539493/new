# ⚡ Быстрое развертывание на Render

## 🚀 Автоматическое развертывание

### Вариант 1: Через скрипт (рекомендуется)
```bash
npm run deploy:render
```

### Вариант 2: Вручную
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

## 🌐 Создание сервиса на Render

1. **Перейдите на [dashboard.render.com](https://dashboard.render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите GitHub репозиторий**: `https://github.com/539493/new`
4. **Настройте сервис**:
   - **Name**: `tutoring-platform`
   - **Environment**: `Node`
   - **Region**: `Oregon` (или ближайший)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. **Добавьте переменные окружения**:
   ```
   NODE_ENV=production
   PORT=10000
   HOST=0.0.0.0
   ```

6. **Нажмите "Create Web Service"**

## ⏱️ Время развертывания
- **Первое развертывание**: 5-10 минут
- **Последующие обновления**: 2-5 минут

## 🔗 URL после развертывания
```
https://tutoring-platform-xxxxx.onrender.com
```

## ✅ Проверка работоспособности

1. **Откройте URL** в браузере
2. **Проверьте регистрацию** пользователей
3. **Проверьте создание слотов** репетиторами
4. **Проверьте отображение** репетиторов у учеников

## 🚨 Если что-то не работает

1. **Проверьте логи** в Render Dashboard
2. **Убедитесь, что все файлы** загружены в GitHub
3. **Проверьте переменные окружения**
4. **Перезапустите сервис** если нужно

## 📞 Поддержка
- **Render Dashboard**: https://dashboard.render.com
- **GitHub репозиторий**: https://github.com/539493/new
- **Подробная инструкция**: `RENDER_DEPLOYMENT_GUIDE.md`
