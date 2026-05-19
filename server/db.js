import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

const INFINITE_PHONE = "+79999999999";
const INFINITE_BALANCE = 9_999_999_999_999;
const START_BANK = 100;

const DEFAULT_STOCKS = [
  { id: "nebula", name: "Nebula Tech", price: 124.5, change: 2.1 },
  { id: "rush", name: "Rush Gaming", price: 89.2, change: -0.8 },
  { id: "jet", name: "JetX Aero", price: 210.0, change: 4.5 },
  { id: "crypto", name: "FakeCoin", price: 0.42, change: 12.3 },
  { id: "gold", name: "Золото РФ", price: 5840, change: 0.3 },
];

function defaultUser(overrides = {}) {
  const phone = overrides.phone || "";
  const infinite = phone === INFINITE_PHONE;
  return {
    id: overrides.id || nanoid(10),
    phone,
    name: overrides.name || "Игрок",
    avatar: overrides.avatar || "🎰",
    telegramId: overrides.telegramId || null,
    bankBalance: infinite ? INFINITE_BALANCE : START_BANK,
    casinoBalance: overrides.casinoBalance ?? 0,
    portfolio: {},
    tasksDone: [],
    lastDaily: null,
    createdAt: Date.now(),
    ...overrides,
  };
}

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch {
    /* fresh */
  }
  return {
    users: {},
    stocks: DEFAULT_STOCKS.map((s) => ({ ...s })),
    qrPending: {},
    history: [],
  };
}

let data = load();

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getStocks() {
  return data.stocks;
}

export function tickStocks() {
  data.stocks = data.stocks.map((s) => {
    const drift = (Math.random() - 0.48) * 3;
    const price = Math.max(0.01, +(s.price * (1 + drift / 100)).toFixed(2));
    const change = +((price - s.price) / s.price * 100).toFixed(2);
    return { ...s, price, change };
  });
  save();
  return data.stocks;
}

function applyInfinite(user) {
  if (user.phone === INFINITE_PHONE) {
    user.bankBalance = INFINITE_BALANCE;
  }
  return user;
}

export function findUser({ phone, telegramId, id }) {
  const users = Object.values(data.users);
  if (id) return users.find((u) => u.id === id) || null;
  if (phone) return users.find((u) => u.phone === phone) || null;
  if (telegramId) return users.find((u) => u.telegramId === String(telegramId)) || null;
  return null;
}

export function getOrCreateUser({ phone, telegramId, name }) {
  let user =
    findUser({ phone, telegramId }) ||
    (phone ? null : findUser({ id: "guest" }));

  if (!user) {
    user = defaultUser({
      phone: phone || "",
      telegramId: telegramId ? String(telegramId) : null,
      name: name || (phone ? `Клиент ${phone.slice(-4)}` : "Гость"),
    });
    data.users[user.id] = user;
    save();
  } else if (phone && !user.phone) {
    user.phone = phone;
    applyInfinite(user);
    save();
  }
  if (name) user.name = name;
  applyInfinite(user);
  save();
  return { ...user };
}

export function updateUser(id, patch) {
  const user = data.users[id];
  if (!user) return null;
  Object.assign(user, patch);
  applyInfinite(user);
  save();
  return { ...user };
}

export function addHistory(entry) {
  data.history.unshift({ id: nanoid(8), at: Date.now(), ...entry });
  data.history = data.history.slice(0, 200);
  save();
}

export function getHistory(userId, limit = 30) {
  return data.history.filter((h) => h.userId === userId).slice(0, limit);
}

export function bankToCasino(userId, amount) {
  const user = data.users[userId];
  if (!user || amount <= 0) return { error: "Неверная сумма" };
  applyInfinite(user);
  if (user.phone !== INFINITE_PHONE && user.bankBalance < amount) {
    return { error: "Недостаточно средств в банке" };
  }
  if (user.phone !== INFINITE_PHONE) user.bankBalance -= amount;
  user.casinoBalance += amount;
  addHistory({
    userId,
    type: "deposit_casino",
    amount,
    text: `Пополнение казино +${amount} ₽`,
  });
  save();
  return { user: { ...user } };
}

export function casinoAdjust(userId, delta) {
  const user = data.users[userId];
  if (!user) return { error: "Пользователь не найден" };
  user.casinoBalance = Math.max(0, user.casinoBalance + delta);
  save();
  return { user: { ...user } };
}

export function bankAdjust(userId, delta) {
  const user = data.users[userId];
  if (!user) return { error: "Пользователь не найден" };
  applyInfinite(user);
  if (user.phone !== INFINITE_PHONE) {
    user.bankBalance = Math.max(0, user.bankBalance + delta);
  }
  save();
  return { user: { ...user } };
}

export function buyStock(userId, stockId, shares) {
  const user = data.users[userId];
  const stock = data.stocks.find((s) => s.id === stockId);
  if (!user || !stock || shares <= 0) return { error: "Ошибка покупки" };
  const cost = +(stock.price * shares).toFixed(2);
  applyInfinite(user);
  if (user.phone !== INFINITE_PHONE && user.bankBalance < cost) {
    return { error: "Недостаточно средств" };
  }
  if (user.phone !== INFINITE_PHONE) user.bankBalance -= cost;
  user.portfolio[stockId] = (user.portfolio[stockId] || 0) + shares;
  addHistory({
    userId,
    type: "stock_buy",
    amount: -cost,
    text: `Покупка ${shares} × ${stock.name}`,
  });
  save();
  return { user: { ...user }, stock };
}

export function sellStock(userId, stockId, shares) {
  const user = data.users[userId];
  const stock = data.stocks.find((s) => s.id === stockId);
  const owned = user?.portfolio[stockId] || 0;
  if (!user || !stock || shares <= 0 || shares > owned) {
    return { error: "Недостаточно акций" };
  }
  const revenue = +(stock.price * shares).toFixed(2);
  user.portfolio[stockId] = owned - shares;
  if (user.portfolio[stockId] === 0) delete user.portfolio[stockId];
  user.bankBalance += revenue;
  applyInfinite(user);
  addHistory({
    userId,
    type: "stock_sell",
    amount: revenue,
    text: `Продажа ${shares} × ${stock.name}`,
  });
  save();
  return { user: { ...user }, stock };
}

const TASKS = [
  { id: "welcome", title: "Добро пожаловать", reward: 50, desc: "Завершить онбординг" },
  { id: "card", title: "Оформить карту", reward: 30, desc: "Виртуальная карта Nebula" },
  { id: "invest", title: "Первая инвестиция", reward: 40, desc: "Купить любую акцию" },
  { id: "daily", title: "Ежедневный бонус", reward: 20, desc: "Раз в сутки" },
  { id: "casino_link", title: "Связать с казино", reward: 25, desc: "Пополнить баланс казино" },
];

export function getTasks(userId) {
  const user = data.users[userId];
  if (!user) return [];
  const today = new Date().toISOString().slice(0, 10);
  return TASKS.map((t) => {
    let done = user.tasksDone.includes(t.id);
    if (t.id === "daily" && user.lastDaily === today) done = true;
    return { ...t, done };
  });
}

export function completeTask(userId, taskId) {
  const user = data.users[userId];
  const task = TASKS.find((t) => t.id === taskId);
  if (!user || !task) return { error: "Задание не найдено" };
  const today = new Date().toISOString().slice(0, 10);
  if (taskId === "daily") {
    if (user.lastDaily === today) return { error: "Уже получено сегодня" };
    user.lastDaily = today;
  } else if (user.tasksDone.includes(taskId)) {
    return { error: "Уже выполнено" };
  } else {
    user.tasksDone.push(taskId);
  }
  user.bankBalance += task.reward;
  applyInfinite(user);
  addHistory({
    userId,
    type: "task",
    amount: task.reward,
    text: `Задание: ${task.title}`,
  });
  save();
  return { user: { ...user }, reward: task.reward };
}

export function createQrPayment(userId, amount, purpose) {
  const token = nanoid(12);
  data.qrPending[token] = {
    userId,
    amount,
    purpose: purpose || "Оплата",
    createdAt: Date.now(),
    paid: false,
  };
  save();
  return token;
}

export function payQr(token, fromUserId) {
  const qr = data.qrPending[token];
  if (!qr || qr.paid) return { error: "QR недействителен" };
  const payer = data.users[fromUserId];
  const receiver = data.users[qr.userId];
  if (!payer || !receiver) return { error: "Пользователь не найден" };
  applyInfinite(payer);
  if (payer.phone !== INFINITE_PHONE && payer.bankBalance < qr.amount) {
    return { error: "Недостаточно средств" };
  }
  if (payer.phone !== INFINITE_PHONE) payer.bankBalance -= qr.amount;
  if (receiver.phone !== INFINITE_PHONE) receiver.bankBalance += qr.amount;
  else receiver.bankBalance = INFINITE_BALANCE;
  qr.paid = true;
  addHistory({
    userId: fromUserId,
    type: "qr_pay",
    amount: -qr.amount,
    text: `Оплата по QR: ${qr.purpose}`,
  });
  addHistory({
    userId: qr.userId,
    type: "qr_receive",
    amount: qr.amount,
    text: `Получено по QR: ${qr.purpose}`,
  });
  save();
  return { payer: { ...payer }, receiver: { ...receiver } };
}

export function transferBank(fromId, toPhone, amount) {
  const from = data.users[fromId];
  const to = findUser({ phone: toPhone }) || defaultUser({ phone: toPhone });
  if (!data.users[to.id]) data.users[to.id] = to;
  if (!from || amount <= 0) return { error: "Ошибка перевода" };
  applyInfinite(from);
  applyInfinite(to);
  if (from.phone !== INFINITE_PHONE && from.bankBalance < amount) {
    return { error: "Недостаточно средств" };
  }
  if (from.phone !== INFINITE_PHONE) from.bankBalance -= amount;
  if (to.phone !== INFINITE_PHONE) to.bankBalance += amount;
  addHistory({
    userId: fromId,
    type: "transfer",
    amount: -amount,
    text: `Перевод на ${toPhone}`,
  });
  save();
  return { from: { ...from }, to: { ...to } };
}

export { INFINITE_PHONE };
