import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { login, loading } = useUser();
  const [phone, setPhone] = useState("+7");
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await login({ phone: phone.trim(), name: name.trim() || undefined });
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card glass"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="logo-big">NEBULA</h1>
        <p className="sub">Казино + Банк · только фейк-деньги</p>
        <form onSubmit={submit}>
          <label>Телефон (для банка)</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+79991234567"
          />
          <p className="hint">Для +79999999999 — бесконечный баланс в банке</p>
          <label style={{ marginTop: 12 }}>Имя</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Игрок" />
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} disabled={loading}>
            {loading ? "Загрузка…" : "Войти"}
          </button>
        </form>
      </motion.div>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          z-index: 1;
        }
        .login-card { padding: 32px; max-width: 400px; width: 100%; }
        .logo-big {
          font-family: Unbounded, sans-serif;
          font-size: 36px;
          background: linear-gradient(135deg, var(--gold), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }
        .sub { text-align: center; color: var(--muted); margin: 8px 0 24px; font-size: 14px; }
        label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--muted); }
        .hint { font-size: 12px; color: var(--accent2); margin-top: 6px; }
      `}</style>
    </div>
  );
}
