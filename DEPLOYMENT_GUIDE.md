# 🚀 Инструкция по развертыванию

## Локальное развертывание

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка конфигурации
```bash
cp src/config.example.ts src/config.ts
```

### 3. Запуск в режиме разработки
```bash
# Терминал 1: Запуск сервера
node backend/server.cjs

# Терминал 2: Запуск клиента
npm run dev
```

### 4. Сборка для продакшена
```bash
npm run build
```

### 5. Запуск продакшн сервера
```bash
npm start
```

## Облачное развертывание

### Vercel (Рекомендуется для статических файлов)

1. **Установите Vercel CLI:**
```bash
npm i -g vercel
```

2. **Соберите проект:**
```bash
npm run build
```

3. **Разверните:**
```bash
vercel
```

4. **Настройте переменные окружения в Vercel Dashboard:**
```
SERVER_URL=https://your-backend-domain.com
WEBSOCKET_URL=https://your-backend-domain.com
```

### Render (Полный стек)

1. **Создайте аккаунт на [Render.com](https://render.com)**

2. **Подключите GitHub репозиторий**

3. **Создайте Web Service:**
   - **Name**: tutoring-platform
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: 10000

4. **Настройте переменные окружения:**
```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
```

### Heroku

1. **Установите Heroku CLI:**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Скачайте с https://devcenter.heroku.com/articles/heroku-cli
```

2. **Создайте приложение:**
```bash
heroku create your-app-name
```

3. **Настройте переменные окружения:**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=10000
```

4. **Разверните:**
```bash
git push heroku main
```

### Netlify

1. **Создайте аккаунт на [Netlify.com](https://netlify.com)**

2. **Подключите GitHub репозиторий**

3. **Настройте сборку:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **Настройте переменные окружения:**
```
SERVER_URL=https://your-backend-domain.com
WEBSOCKET_URL=https://your-backend-domain.com
```

## Настройка домена

### 1. Покупка домена
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google)

### 2. Настройка DNS
```
A     @      your-server-ip
CNAME www    your-domain.com
```

### 3. SSL сертификат
- **Let's Encrypt** (бесплатно)
- **Cloudflare** (бесплатно)
- **Vercel/Netlify** (автоматически)

## Мониторинг и логи

### 1. Логирование
```bash
# Просмотр логов в реальном времени
tail -f logs/app.log

# Просмотр ошибок
grep ERROR logs/app.log
```

### 2. Мониторинг производительности
- **New Relic** - мониторинг приложений
- **DataDog** - мониторинг инфраструктуры
- **Sentry** - отслеживание ошибок

### 3. Аналитика
- **Google Analytics** - веб-аналитика
- **Mixpanel** - аналитика событий
- **Hotjar** - анализ поведения пользователей

## Безопасность

### 1. Переменные окружения
```bash
# Никогда не коммитьте секреты в Git
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

### 2. HTTPS
```bash
# Принудительное перенаправление на HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. CORS настройки
```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## Резервное копирование

### 1. База данных
```bash
# Создание резервной копии
cp backend/server_data.json backup/server_data_$(date +%Y%m%d_%H%M%S).json

# Автоматическое резервное копирование (cron)
0 2 * * * /path/to/backup-script.sh
```

### 2. Файлы приложения
```bash
# Создание архива
tar -czf backup/app_$(date +%Y%m%d_%H%M%S).tar.gz .

# Загрузка в облачное хранилище
aws s3 cp backup/app_*.tar.gz s3://your-backup-bucket/
```

## Масштабирование

### 1. Горизонтальное масштабирование
```bash
# Использование PM2 для кластеризации
npm install -g pm2
pm2 start backend/server.cjs -i max
```

### 2. Балансировка нагрузки
- **Nginx** - обратный прокси
- **HAProxy** - балансировщик нагрузки
- **Cloudflare** - CDN и балансировка

### 3. Кэширование
```javascript
// Redis для кэширования
const redis = require('redis');
const client = redis.createClient();

// Кэширование данных пользователей
app.get('/api/users/:id', async (req, res) => {
  const cached = await client.get(`user:${req.params.id}`);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  // ... получение данных из БД
  await client.setex(`user:${req.params.id}`, 3600, JSON.stringify(user));
  res.json(user);
});
```

## Поддержка

### 1. Документация API
- [Swagger](https://swagger.io/) - документация API
- [Postman](https://postman.com/) - тестирование API

### 2. Мониторинг
- [UptimeRobot](https://uptimerobot.com/) - мониторинг доступности
- [Pingdom](https://pingdom.com/) - мониторинг производительности

### 3. Логирование
- [Loggly](https://loggly.com/) - централизованное логирование
- [Papertrail](https://papertrailapp.com/) - логи в облаке

---

**Успешного развертывания! 🎉** 