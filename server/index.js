import express from "express";
import cors from "cors";
import QRCode from "qrcode";
import {
  getOrCreateUser,
  findUser,
  updateUser,
  getStocks,
  tickStocks,
  buyStock,
  sellStock,
  bankToCasino,
  casinoAdjust,
  getTasks,
  completeTask,
  createQrPayment,
  payQr,
  transferBank,
  getHistory,
} from "./db.js";

const app = express();
const PORT = process.env.PORT || 3847;

app.use(cors());
app.use(express.json());

// Stock ticker every 8s
setInterval(() => tickStocks(), 8000);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.post("/api/auth", (req, res) => {
  const { phone, telegramId, name } = req.body;
  const user = getOrCreateUser({ phone, telegramId, name });
  res.json({ user, stocks: getStocks() });
});

app.get("/api/user/:id", (req, res) => {
  const user = findUser({ id: req.params.id });
  if (!user) return res.status(404).json({ error: "Не найден" });
  res.json({ user, stocks: getStocks(), tasks: getTasks(user.id), history: getHistory(user.id) });
});

app.patch("/api/user/:id", (req, res) => {
  const user = updateUser(req.params.id, req.body);
  if (!user) return res.status(404).json({ error: "Не найден" });
  res.json({ user });
});

app.get("/api/stocks", (_, res) => res.json({ stocks: getStocks() }));

app.post("/api/stocks/buy", (req, res) => {
  const { userId, stockId, shares } = req.body;
  const result = buyStock(userId, stockId, Number(shares));
  if (result.error) return res.status(400).json(result);
  if (!findUser({ id: userId })?.tasksDone.includes("invest")) {
    completeTask(userId, "invest");
  }
  res.json(result);
});

app.post("/api/stocks/sell", (req, res) => {
  const { userId, stockId, shares } = req.body;
  const result = sellStock(userId, stockId, Number(shares));
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/casino/deposit", (req, res) => {
  const { userId, amount } = req.body;
  const result = bankToCasino(userId, Number(amount));
  if (result.error) return res.status(400).json(result);
  if (!findUser({ id: userId })?.tasksDone.includes("casino_link")) {
    completeTask(userId, "casino_link");
  }
  res.json(result);
});

app.post("/api/casino/bet", (req, res) => {
  const { userId, amount, win, multiplier, action } = req.body;
  const user = findUser({ id: userId });
  if (!user) return res.status(404).json({ error: "Не найден" });
  const bet = Number(amount);

  if (action === "cashout") {
    const m = Number(multiplier) || 1;
    const payout = Math.floor(bet * m);
    casinoAdjust(userId, payout);
    const updated = findUser({ id: userId });
    return res.json({ user: updated, payout, profit: payout });
  }

  if (bet <= 0) return res.status(400).json({ error: "Неверная ставка" });
  if (user.casinoBalance < bet) return res.status(400).json({ error: "Недостаточно баланса" });
  casinoAdjust(userId, -bet);
  let payout = 0;
  if (win) {
    payout = Math.floor(bet * (multiplier || 2));
    casinoAdjust(userId, payout);
  }
  const updated = findUser({ id: userId });
  res.json({ user: updated, payout, profit: payout - bet });
});

app.get("/api/tasks/:userId", (req, res) => {
  res.json({ tasks: getTasks(req.params.userId) });
});

app.post("/api/tasks/complete", (req, res) => {
  const { userId, taskId } = req.body;
  const result = completeTask(userId, taskId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/qr/create", async (req, res) => {
  const { userId, amount, purpose } = req.body;
  const token = createQrPayment(userId, Number(amount), purpose);
  const payload = JSON.stringify({ type: "nebula_qr", token, amount });
  const dataUrl = await QRCode.toDataURL(payload, { margin: 2, width: 280 });

  // If BOT_USERNAME is set in env, also create a deep-link QR that opens the bot chat with start payload
  let deepLink = null;
  let deepLinkQr = null;
  const botUsername = process.env.BOT_USERNAME;
  if (botUsername) {
    deepLink = `https://t.me/${botUsername}?start=${encodeURIComponent(token)}`;
    deepLinkQr = await QRCode.toDataURL(deepLink, { margin: 2, width: 280 });
  }

  res.json({ token, qr: dataUrl, amount, deepLink, deepLinkQr });
});

app.post("/api/qr/pay", (req, res) => {
  const { token, userId } = req.body;
  const result = payQr(token, userId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/transfer", (req, res) => {
  const { fromUserId, toPhone, amount } = req.body;
  const result = transferBank(fromUserId, toPhone, Number(amount));
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Nebula API http://localhost:${PORT}`);
});
