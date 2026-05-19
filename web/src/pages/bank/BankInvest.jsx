import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { api } from "../../api";

export default function BankInvest() {
  const { user, stocks, refresh, showToast } = useUser();
  const [shares, setShares] = useState(1);
  const [selected, setSelected] = useState(null);

  const buy = async (stockId) => {
    if (!user) return;
    try {
      await api.buyStock(user.id, stockId, shares);
      await refresh();
      showToast(`Куплено ${shares} акций`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const sell = async (stockId) => {
    if (!user) return;
    const owned = user.portfolio?.[stockId] || 0;
    if (!owned) return showToast("Нет акций", "error");
    try {
      await api.sellStock(user.id, stockId, Math.min(shares, owned));
      await refresh();
      showToast("Продано", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <h1 style={{ fontFamily: "Unbounded", marginBottom: 8 }}>📈 Акции</h1>
      <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: 13 }}>
        Цены обновляются каждые 8 сек. Начни с 100 ₽ — зарабатывай и депай в казино.
      </p>
      <input
        className="input"
        type="number"
        value={shares}
        onChange={(e) => setShares(Number(e.target.value))}
        min={1}
        style={{ marginBottom: 16 }}
      />
      <div className="stocks">
        {stocks.map((s, i) => (
          <motion.div
            key={s.id}
            className={`stock-row glass ${selected === s.id ? "sel" : ""}`}
            onClick={() => setSelected(s.id)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div>
              <strong>{s.name}</strong>
              <p>В портфеле: {user?.portfolio?.[s.id] || 0} шт.</p>
            </div>
            <div className="price">
              <span>{s.price.toLocaleString("ru")} ₽</span>
              <span className={s.change >= 0 ? "up" : "down"}>
                {s.change >= 0 ? "+" : ""}
                {s.change}%
              </span>
            </div>
            {selected === s.id && (
              <div className="btns">
                <button type="button" className="btn btn-primary" onClick={() => buy(s.id)}>
                  Купить
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => sell(s.id)}>
                  Продать
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <style>{`
        .stocks { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
        .stock-row { padding: 16px; cursor: pointer; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        .stock-row.sel { border-color: var(--bank-green); }
        .stock-row p { font-size: 12px; color: var(--muted); margin-top: 4px; }
        .price { margin-left: auto; text-align: right; }
        .price span { display: block; font-weight: 700; }
        .up { color: #00e5a0; font-size: 12px; }
        .down { color: var(--danger); font-size: 12px; }
        .btns { width: 100%; display: flex; gap: 8px; margin-top: 8px; }
        .btns button { flex: 1; }
      `}</style>
    </div>
  );
}
