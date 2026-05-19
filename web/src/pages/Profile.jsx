import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function Profile() {
  const { user, refresh, showToast, login } = useUser();
  const [phone, setPhone] = useState(user?.phone || "");

  const savePhone = async () => {
    try {
      await login({ phone: phone.trim(), name: user?.name });
      await refresh();
      showToast("Профиль обновлён", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="glass profile-head" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>{user?.avatar || "🎰"}</div>
        <h2 style={{ marginTop: 12 }}>{user?.name}</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>ID: {user?.id}</p>
      </div>

      <div className="glass" style={{ padding: 20, marginTop: 16 }}>
        <label>Телефон банка</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }} type="button" onClick={savePhone}>
          Сохранить
        </button>
        <p style={{ fontSize: 12, color: "var(--accent2)", marginTop: 8 }}>
          +79999999999 = ∞ деньги в Nebula Банке
        </p>
      </div>

      <div className="stats glass" style={{ marginTop: 16, padding: 16 }}>
        <div>
          <span>Банк</span>
          <strong>{user?.bankBalance?.toLocaleString("ru")} ₽</strong>
        </div>
        <div>
          <span>Казино</span>
          <strong>{user?.casinoBalance?.toLocaleString("ru")} ₽</strong>
        </div>
      </div>
      <style>{`
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; position: relative; z-index: 1; }
        .stats span { display: block; font-size: 12px; color: var(--muted); }
        .stats strong { font-size: 18px; }
      `}</style>
    </div>
  );
}
