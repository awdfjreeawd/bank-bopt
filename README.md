# Nebula — фейк-казино + банк + Telegram Mini App

**Только демо.** Никаких реальных денег, платежей и азартных игр на деньги.

## Что внутри

- **Десктоп (Electron)** — красивое казино с анимациями
- **Игры:** RUSH, Монетка, JETX, KRUSH, Aviamasters, Aviamasters 2
- **Nebula Банк** — стиль Сбер/Т-Банк: карта, переводы, QR, акции, задания
- **Связка:** пополнение казино с банковского счёта
- **Telegram бот** + **Mini App** (Web App кнопка)

### Особый номер

`+79999999999` — **бесконечный** баланс в банке (для тестов).

Обычный пользователь стартует с **100 ₽** на карте → задания и акции → депозит в казино.

## Быстрый старт

### 1. Установка

```bash
cd nebula
npm install
cd server && npm install
cd ../web && npm install
cd ../desktop && npm install
cd ../bot && npm install
```

### 2. Запуск (веб + API)

Терминал 1:

```bash
cd nebula/server
npm run dev
```

Терминал 2:

```bash
cd nebula/web
npm run dev
```

Открой: http://localhost:5173

### 3. Десктоп

```bash
cd nebula/desktop
npm start
```

(Нужны запущенные server + web на портах 3847 и 5173.)

### 4. Telegram Mini App

1. Создай бота у [@BotFather](https://t.me/BotFather), получи `BOT_TOKEN`.
2. Подними публичный HTTPS URL на фронт (ngrok, cloudflare tunnel и т.д.):

   ```bash
   ngrok http 5173
   ```

3. В BotFather: `/newapp` → привяжи URL к боту.
5. Скопируй `nebula/bot/.env.example` → `nebula/bot/.env` и заполни:

   ```
   BOT_TOKEN=...
   WEBAPP_URL=https://xxxx.ngrok-free.app
   BOT_USERNAME=your_bot_username_without_at
   ```

6. Запуск бота:

   ```bash
   cd nebula/bot
   npm start
   ```

7. В `web/index.html` для Telegram можно добавить скрипт (уже поддерживается через `window.Telegram.WebApp` при открытии из TG).

## Деплой бота бесплатно на Replit

1. Создай аккаунт на https://replit.com и залогинься.
2. Нажми "Create" → "Import from GitHub" → вставь URL репозитория и нажми "Import from GitHub".
3. В проекте открой вкладку "Secrets" (или "Environment Variables").
4. Добавь переменные:

   - `BOT_TOKEN` — токен бота от @BotFather
   - `WEBAPP_URL` — публичный HTTPS URL вашего Mini App (из GitHub Pages или ngrok)
   - `BOT_USERNAME` — имя бота без `@`

5. В Shell Replit запусти:

   ```bash
   cd bot
   npm install
   npm start
   ```

6. Если Replit попросит указать порт, используй стандартный Node-порт или просто запусти как есть — Telegraf работает без веб-порта.
7. После запуска бот должен появиться в логах. Проверь его в Telegram, написав `/start`.

### Как получить `WEBAPP_URL` бесплатно

- Самый простой вариант: использовать GitHub Pages для фронтенда.
- Если вы уже запустили workflow, URL будет как `https://<username>.github.io/<repo>/`.
- Вместо GitHub Pages можно временно использовать `ngrok http 5173` и взять HTTPS адрес.

### Проверка

1. Открой Telegram на телефоне.
2. Найди бота по имени `@<BOT_USERNAME>`.
3. Напиши `/start` или отсканируй deep-link QR.
4. Бот должен отправить кнопку Mini App, которая откроет `WEBAPP_URL`.

> Replit бесплатно работает для теста, но лучше использовать его только как временное решение.

Добавь в `index.html` перед `</body>`:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

## Структура

```
nebula/
  server/     API + data.json
  web/        React UI
  desktop/    Electron
  bot/        Telegraf
```

## Важно

Это учебный/развлекательный прототип. Не используй для реального гемблинга или финансовых услуг.
