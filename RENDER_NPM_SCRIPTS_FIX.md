# 🔧 Переход на npm скрипты для Render

## ❌ Проблема
Render продолжал использовать старую команду сборки `npm install && npm run build` вместо нашего скрипта `./build.sh`.

## 🔍 Анализ
Проблема заключалась в том, что:
1. Render может кэшировать конфигурацию из `render.yaml`
2. Bash скрипты могут не работать в некоторых окружениях
3. Лучше использовать npm скрипты для совместимости

## ✅ Решение

### 1. Добавлены новые npm скрипты
В `package.json` добавлены:
```json
"render:build": "npm install --legacy-peer-deps && npm run build",
"render:start": "cd backend && node production-server.cjs"
```

### 2. Обновлен `render.yaml`
```yaml
services:
  - type: web
    name: tutoring-platform-am88
    env: node
    buildCommand: npm run render:build
    startCommand: npm run render:start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 3. Добавлен файл `.nvmrc`
Создан файл `.nvmrc` с версией Node.js:
```
20.11.0
```

## 📋 Изменения

### Обновленные файлы:
- `package.json` - добавлены скрипты `render:build` и `render:start`
- `render.yaml` - использует npm скрипты вместо bash
- `.nvmrc` - указана версия Node.js

### Преимущества npm скриптов:
1. **Лучшая совместимость** - npm скрипты работают везде
2. **Автоматическое использование .npmrc** - флаг `--legacy-peer-deps` применяется автоматически
3. **Простота отладки** - легче отслеживать ошибки
4. **Стандартный подход** - Render рекомендует npm скрипты

## 🚀 Как работают новые скрипты

### render:build
```bash
npm install --legacy-peer-deps && npm run build
```
- Устанавливает зависимости с флагом `--legacy-peer-deps`
- Собирает фронтенд через Vite

### render:start
```bash
cd backend && node production-server.cjs
```
- Переходит в папку backend
- Запускает production сервер

## 📈 Следующие шаги

1. Render автоматически перезапустит развертывание
2. Используются npm скрипты вместо bash
3. Должна решиться проблема с `vite: not found`
4. Приложение должно успешно развернуться

## 🔍 Что изменилось

- **buildCommand**: `npm run render:build` (вместо `./build.sh`)
- **startCommand**: `npm run render:start` (вместо `cd backend && node production-server.cjs`)
- **Добавлены файлы**: `.nvmrc` для указания версии Node.js
- **Улучшена совместимость**: npm скрипты работают лучше в Render

---
*Отчет создан: $(date)*
*Статус: ✅ Обновлено*
