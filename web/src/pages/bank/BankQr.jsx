import { useState } from "react";
import { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { api } from "../../api";

export default function BankQr() {
  const { user, refresh, showToast } = useUser();
  const [tab, setTab] = useState("create");
  const [amount, setAmount] = useState(100);
  const [purpose, setPurpose] = useState("Оплата");
  const [qr, setQr] = useState(null);
  const [token, setToken] = useState("");
  const [payToken, setPayToken] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qrParam = params.get("qr");
      if (qrParam) {
        setTab("pay");
        setPayToken(qrParam);
      }
    } catch (e) {}
  }, []);

  const create = async () => {
    if (!user) return;
    try {
      const res = await api.createQr(user.id, amount, purpose);
      setQr(res);
      setToken(res.token);
      showToast("QR создан", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const pay = async () => {
    if (!user || !payToken) return;
    try {
      await api.payQr(user.id, payToken.trim());
      await refresh();
      showToast("Оплата прошла!", "success");
      setPayToken("");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <h1 style={{ fontFamily: "Unbounded", marginBottom: 16 }}>📱 QR оплата</h1>
      <div className="tabs">
        <button type="button" className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>
          Создать
        </button>
        <button type="button" className={tab === "pay" ? "active" : ""} onClick={() => setTab("pay")}>
          Оплатить
        </button>
      </div>

      {tab === "create" ? (
        <div className="glass" style={{ padding: 20, marginTop: 16 }}>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <input className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ marginTop: 8 }} placeholder="Назначение" />
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} type="button" onClick={create}>
            Сгенерировать QR
          </button>
          {qr && (
            <div className="qr-box">
              <img src={qr.qr} alt="QR" />
              <p className="token">Токен: {token}</p>
              {/** Если сервер вернул deep-link для открытия бота — покажем его QR и ссылку */}
              {qr.deepLinkQr && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Сканируй телефоном, чтобы открыть Mini App в Telegram</p>
                  <img src={qr.deepLinkQr} alt="DeepLink QR" style={{ maxWidth: 180, borderRadius: 8 }} />
                  <p className="token" style={{ marginTop: 8 }}>
                    <a href={qr.deepLink} target="_blank" rel="noreferrer">Открыть в Telegram</a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass" style={{ padding: 20, marginTop: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
            Вставь токен из QR (для демо — скопируй при создании)
          </p>
          <input className="input" value={payToken} onChange={(e) => setPayToken(e.target.value)} placeholder="токен QR" />
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} type="button" onClick={pay}>
            Оплатить по QR
          </button>
        </div>
      )}

      <style>{`
        .tabs { display: flex; gap: 8px; position: relative; z-index: 1; }
        .tabs button {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          color: var(--muted);
          font-weight: 600;
        }
        .tabs button.active { background: var(--bank-green); color: white; }
        .qr-box { text-align: center; margin-top: 20px; }
        .qr-box img { max-width: 240px; border-radius: 12px; }
        .token { font-size: 11px; color: var(--muted); margin-top: 8px; word-break: break-all; }
      `}</style>
    </div>
  );
}
