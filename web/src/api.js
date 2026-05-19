const API = import.meta.env.VITE_API_URL || "";

async function req(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export const api = {
  auth: (body) => req("/api/auth", { method: "POST", body: JSON.stringify(body) }),
  getUser: (id) => req(`/api/user/${id}`),
  updateUser: (id, body) =>
    req(`/api/user/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  depositCasino: (userId, amount) =>
    req("/api/casino/deposit", { method: "POST", body: JSON.stringify({ userId, amount }) }),
  bet: (userId, amount, win, multiplier) =>
    req("/api/casino/bet", {
      method: "POST",
      body: JSON.stringify({ userId, amount, win, multiplier }),
    }),
  cashout: (userId, amount, multiplier) =>
    req("/api/casino/bet", {
      method: "POST",
      body: JSON.stringify({ userId, amount, multiplier, action: "cashout" }),
    }),
  buyStock: (userId, stockId, shares) =>
    req("/api/stocks/buy", { method: "POST", body: JSON.stringify({ userId, stockId, shares }) }),
  sellStock: (userId, stockId, shares) =>
    req("/api/stocks/sell", { method: "POST", body: JSON.stringify({ userId, stockId, shares }) }),
  completeTask: (userId, taskId) =>
    req("/api/tasks/complete", { method: "POST", body: JSON.stringify({ userId, taskId }) }),
  createQr: (userId, amount, purpose) =>
    req("/api/qr/create", { method: "POST", body: JSON.stringify({ userId, amount, purpose }) }),
  payQr: (userId, token) =>
    req("/api/qr/pay", { method: "POST", body: JSON.stringify({ userId, token }) }),
  transfer: (fromUserId, toPhone, amount) =>
    req("/api/transfer", { method: "POST", body: JSON.stringify({ fromUserId, toPhone, amount }) }),
};
