# 🚀 Быстрое развертывание NAUCHI на Render

## ⚡ Быстрый старт (3 шага)

### 1️⃣ Проверка готовности
```bash
./scripts/check-nauchi-ready.sh
```

### 2️⃣ Развертывание
```bash
./scripts/deploy-nauchi.sh
```

### 3️⃣ Создание сервиса на Render
1. Откройте [Render Dashboard](https://dashboard.render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Render автоматически создаст сервис "nauchi"

## 🎯 Результат

После выполнения всех шагов ваш сервис будет доступен по адресу:
**https://nauchi.onrender.com**

## 🔍 Проверка работоспособности

- **Статус**: https://nauchi.onrender.com/api/status
- **Health**: https://nauchi.onrender.com/api/health
- **Socket.IO**: https://nauchi.onrender.com/api/socket-test

## 📋 Что включено

✅ **Frontend**: React + TypeScript + Tailwind CSS  
✅ **Backend**: Node.js + Express + Socket.IO  
✅ **Функции**: Регистрация, чаты, расписание, уроки  
✅ **Автоматизация**: Скрипты развертывания и проверки  

## 🆘 Если что-то пошло не так

1. Проверьте логи в Render Dashboard
2. Убедитесь, что репозиторий публичный
3. Проверьте, что все зависимости установлены
4. Обратитесь к полной инструкции: `NAUCHI_RENDER_DEPLOYMENT_GUIDE.md`

---

**🎉 Готово! Ваш NAUCHI развернут на Render!**
