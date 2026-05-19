import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../api";

export default function Wallet() {
  const { user, refresh, showToast } = useUser();
  const [amount, setAmount] = useState(100);

  const deposit = async () => {
    if (!user) return;
    try {
      await api.depositCasino(user.id, amount);
      await refresh();
      showToast(`Пополнено ${amount} ₽ в казино`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <h1 style={{ fontFamily: "Unbounded", marginBottom: 20 }}>💎 Кошелёк</h1>
      <div className="wallet-cards">
        <div className="glass card-bal">
          <span>Казино</span>
          <strong>{(user?.casinoBalance ?? 0).toLocaleString("ru")} ₽</strong>
        </div>
        <div className="glass card-bal bank">
          <span>Nebula Банк</span>
          <strong>{(user?.bankBalance ?? 0).toLocaleString("ru")} ₽</strong>
        </div>
      </div>

      <div className="glass" style={{ padding: 20, marginTop: 20 }}>
        <h3>Пополнение из банка</h3>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "8px 0 16px" }}>
          Фейк-перевод: списание с карты банка → баланс казино
        </p>
        <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[50, 100, 500, 1000].map((v) => (
            <button key={v} type="button" className="btn btn-ghost" onClick={() => setAmount(v)}>
              {v}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} type="button" onClick={deposit}>
          Пополнить казино
        </button>
        <Link to="/bank" className="btn btn-ghost" style={{ width: "100%", marginTop: 8, display: "block", textAlign: "center" }}>
          Перейти в банк →
        </Link>
      </div>

      <style>{`
        .wallet-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; z-index: 1; }
        .card-bal { padding: 20px; }
        .card-bal span { font-size: 12px; color: var(--muted); }
        .card-bal strong { display: block; font-size: 22px; margin-top: 8px; font-family: Unbounded; color: var(--gold); }
        .card-bal.bank strong { color: var(--bank-green); }
      `}</style>
    </div>
  );
}
