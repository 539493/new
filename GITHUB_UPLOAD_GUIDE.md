# 📤 Инструкция по загрузке проекта на GitHub

## Шаги для загрузки проекта на GitHub:

### 1. Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com)
2. Войдите в свой аккаунт
3. Нажмите кнопку "+" в правом верхнем углу
4. Выберите "New repository"
5. Заполните форму:
   - **Repository name**: `tutoring-platform`
   - **Description**: `Современная платформа для репетиторства с синхронизацией в реальном времени`
   - **Visibility**: Public (или Private по вашему выбору)
   - **НЕ** ставьте галочки на "Add a README file", "Add .gitignore", "Choose a license" (у нас уже есть эти файлы)
6. Нажмите "Create repository"

### 2. Подключение локального репозитория к GitHub

После создания репозитория на GitHub, выполните следующие команды в терминале:

```bash
# Добавьте удаленный репозиторий (замените YOUR_USERNAME на ваше имя пользователя)
git remote add origin https://github.com/YOUR_USERNAME/tutoring-platform.git

# Переименуйте основную ветку в main (если нужно)
git branch -M main

# Отправьте код на GitHub
git push -u origin main
```

### 3. Альтернативный способ (если у вас настроен SSH)

Если у вас настроен SSH ключ для GitHub:

```bash
# Добавьте удаленный репозиторий через SSH
git remote add origin git@github.com:YOUR_USERNAME/tutoring-platform.git

# Переименуйте основную ветку в main
git branch -M main

# Отправьте код на GitHub
git push -u origin main
```

### 4. Проверка загрузки

После выполнения команд:

1. Перейдите на страницу вашего репозитория на GitHub
2. Убедитесь, что все файлы загружены
3. Проверьте, что README.md отображается корректно
4. Убедитесь, что файл .gitignore работает (node_modules не должен быть виден)

### 5. Настройка GitHub Pages (опционально)

Если хотите развернуть приложение на GitHub Pages:

1. Перейдите в Settings вашего репозитория
2. Прокрутите вниз до раздела "Pages"
3. В "Source" выберите "Deploy from a branch"
4. Выберите ветку "main" и папку "/ (root)"
5. Нажмите "Save"

### 6. Настройка Actions для автоматического развертывания (опционально)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🔗 Полезные ссылки

- [GitHub Guides](https://guides.github.com/)
- [GitHub Pages](https://pages.github.com/)
- [GitHub Actions](https://github.com/features/actions)

## 📝 Примечания

- Убедитесь, что файл `.gitignore` правильно настроен
- Проверьте, что все конфиденциальные данные (API ключи, пароли) не попали в репозиторий
- Убедитесь, что README.md содержит всю необходимую информацию для других разработчиков

## 🎉 Готово!

После выполнения всех шагов ваш проект будет доступен на GitHub и готов к использованию другими разработчиками!
