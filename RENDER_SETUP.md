# Настройка Render для развертывания

## 🔧 **КРИТИЧЕСКИ ВАЖНО: Настройки Render**

### **1. Build Command:**
```
npm install
```

### **2. Start Command:**
```
node production-server.cjs
```

### **3. Root Directory:**
```
(оставьте пустым)
```

### **4. Environment Variables:**
```
NODE_ENV=production
```

## 📁 **Структура файлов в корне проекта:**

```
/
├── package.json          # Зависимости для бэкенда
├── package-lock.json    # Lock файл
├── production-server.cjs # Основной сервер
├── server_data.json      # Данные сервера с преподавателями
├── dist/                 # Собранный фронтенд
└── ...
```

## 🚀 **Проверка после развертывания:**

1. **Логи должны показать:**
   ```
   ✅ Server data loaded successfully
   📊 Loaded: 1 teachers, 21 slots
   ```

2. **В приложении должен отображаться преподаватель**

3. **Консоль браузера не должна показывать критические ошибки**

## ❌ **НЕ ИСПОЛЬЗУЙТЕ эти настройки:**
- ❌ Build Command: `cd backend && npm install`
- ❌ Start Command: `cd backend && node production-server.cjs`
- ❌ Root Directory: `backend`

## ✅ **ИСПОЛЬЗУЙТЕ эти настройки:**
- ✅ Build Command: `npm install`
- ✅ Start Command: `node production-server.cjs`
- ✅ Root Directory: (пустое)
