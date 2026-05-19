import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { api } from "../../api";

export default function BankHome() {
  const { user, refresh, showToast } = useUser();
  const [toPhone, setToPhone] = useState("");
  const [amount, setAmount] = useState(50);

  const transfer = async () => {
    if (!user || !toPhone) return;
    try {
      await api.transfer(user.id, toPhone, amount);
      await refresh();
      showToast(`Переведено ${amount} ₽`, "success");
      setToPhone("");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const infinite = user?.phone === "+79999999999";

  useEffect(() => {
    if (!user) return;
    (async () => {
      for (const id of ["welcome", "card"]) {
        try {
          await api.completeTask(user.id, id);
        } catch {
          /* already done */
        }
      }
      await refresh();
    })();
  }, [user?.id]);

  return (
    <div className="page bank-page">
      <div className="bank-header">
        <div>
          <p className="bank-brand">Nebula</p>
          <h1>Банк</h1>
        </div>
        <Link to="/" className="btn btn-ghost">
          🎰 Казино
        </Link>
      </div>

      <motion.div
        className="card-visual"
        initial={{ rotateY: -8 }}
        animate={{ rotateY: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="card-chip" />
        <p className="card-num">•••• •••• •••• 4242</p>
        <p className="card-holder">{user?.name}</p>
        <p className="card-bal">
          {infinite ? "∞" : (user?.bankBalance ?? 0).toLocaleString("ru")} ₽
        </p>
        {infinite && <span className="vip">VIP ∞</span>}
      </motion.div>

      <div className="quick-actions">
        <Link to="/bank/qr" className="action glass">
          <span>📱</span> QR
        </Link>
        <Link to="/bank/invest" className="action glass">
          <span>📈</span> Акции
        </Link>
        <Link to="/bank/tasks" className="action glass">
          <span>✅</span> Задания
        </Link>
        <Link to="/wallet" className="action glass">
          <span>🎰</span> В казино
        </Link>
      </div>

      <div className="glass transfer-box">
        <h3>Перевод по номеру</h3>
        <input className="input" placeholder="+79..." value={toPhone} onChange={(e) => setToPhone(e.target.value)} />
        <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ marginTop: 8 }} />
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} type="button" onClick={transfer}>
          Отправить
        </button>
      </div>

      <style>{`
        .bank-page { position: relative; z-index: 1; }
        .bank-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .bank-brand { color: var(--bank-yellow); font-weight: 800; font-size: 12px; letter-spacing: 2px; }
        .bank-header h1 { font-family: Unbounded; font-size: 28px; }
        .card-visual {
          background: linear-gradient(135deg, #21a038 0%, #0d5c24 50%, #1a1a2e 100%);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          position: relative;
          min-height: 180px;
          box-shadow: 0 20px 50px rgba(33, 160, 56, 0.3);
        }
        .card-chip {
          width: 40px;
          height: 28px;
          background: linear-gradient(135deg, #ffdd2d, #c9a227);
          border-radius: 6px;
          margin-bottom: 24px;
        }
        .card-num { font-size: 18px; letter-spacing: 2px; opacity: 0.9; }
        .card-holder { margin-top: 16px; font-size: 14px; opacity: 0.8; }
        .card-bal { font-family: Unbounded; font-size: 32px; margin-top: 8px; }
        .vip {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--bank-yellow);
          color: #0a120e;
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 11px;
        }
        .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
        .action {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 8px;
          font-size: 11px;
          font-weight: 600;
          gap: 6px;
        }
        .action span:first-child { font-size: 22px; }
        .transfer-box { padding: 20px; }
        .transfer-box h3 { margin-bottom: 12px; }
      `}</style>
    </div>
  );
}
