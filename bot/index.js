import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || "https://your-tunnel.example.com";

if (!token) {
  console.error("Укажи BOT_TOKEN в nebula/bot/.env");
  console.error("Пример: BOT_TOKEN=123:ABC WEBAPP_URL=https://xxxx.ngrok-free.app");
  process.exit(1);
}

const bot = new Telegraf(token);

const keyboard = Markup.keyboard([
  [Markup.button.webApp("🎰 Открыть Nebula", webAppUrl)],
  ["💰 Баланс", "🏦 Банк"],
]).resize();

bot.start((ctx) => {
  const payload = ctx.startPayload || null;
  if (payload) {
    const url = `${webAppUrl}?qr=${encodeURIComponent(payload)}`;
    ctx.reply(
      `Привет, ${ctx.from.first_name}! Открываю оплату...`,
      Markup.inlineKeyboard([Markup.button.webApp("Открыть оплату", url)])
    );
    return;
  }

  ctx.reply(
    `Привет, ${ctx.from.first_name}! 🌌\n\n` +
      `Nebula — фейк-казино и банк (без реальных денег).\n` +
      `Нажми кнопку ниже — откроется Mini App в Telegram.`,
    keyboard
  );
});

bot.hears("💰 Баланс", (ctx) => {
  ctx.reply("Баланс смотри в Mini App → раздел Кошелёк или Профиль.");
});

bot.hears("🏦 Банк", (ctx) => {
  ctx.reply("Банк Nebula — в Mini App вкладка «Банк». Старт: 100 ₽, задания и акции.");
});

bot.command("casino", (ctx) => {
  ctx.reply("Казино", Markup.inlineKeyboard([Markup.button.webApp("Играть", webAppUrl)]));
});

bot.launch().then(() => console.log("Nebula bot running"));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
