import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

const GAMES_PREVIEW = [
  { id: "rush", name: "RUSH", icon: "⚡", hot: true },
  { id: "coin", name: "Монетка", icon: "🪙" },
  { id: "jetx", name: "JETX", icon: "✈️", hot: true },
  { id: "krush", name: "KRUSH", icon: "💥" },
  { id: "aviamasters", name: "Aviamasters", icon: "🛩️" },
  { id: "aviamasters2", name: "Aviamasters 2", icon: "🚀" },
];

export default function Lobby() {
  const { user } = useUser();

  return (
    <div className="page lobby">
      <header className="hero">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="eyebrow">Добро пожаловать</p>
          <h1 className="logo">NEBULA CASINO</h1>
          <p className="tagline">Фейк-казино · без реальных денег</p>
        </motion.div>
        <motion.div className="balance-hero glass" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <span className="label">Баланс казино</span>
          <span className="amount shimmer-text">
            {(user?.casinoBalance ?? 0).toLocaleString("ru")} ₽
          </span>
          <Link to="/wallet" className="btn btn-gold" style={{ marginTop: 12 }}>
            Пополнить через банк
          </Link>
        </motion.div>
      </header>

      <section>
        <h2 className="section-title">🔥 Популярное</h2>
        <div className="game-grid">
          {GAMES_PREVIEW.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={g.id === "coin" ? "/play/coin" : `/play/${g.id}`} className="game-card glass">
                {g.hot && <span className="hot">HOT</span>}
                <span className="g-icon">{g.icon}</span>
                <span className="g-name">{g.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Link to="/bank" className="bank-banner glass">
        <span>🏦</span>
        <div>
          <strong>Nebula Банк</strong>
          <p>Заработай на акциях → пополни казино</p>
        </div>
        <span>→</span>
      </Link>

      <style>{`
        .lobby { position: relative; z-index: 1; }
        .hero { display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; margin-bottom: 28px; align-items: flex-start; }
        .eyebrow { color: var(--accent2); font-size: 13px; font-weight: 600; }
        .tagline { color: var(--muted); margin-top: 4px; }
        .balance-hero { padding: 20px; min-width: 200px; text-align: center; animation: pulse-glow 3s infinite; }
        .balance-hero .label { font-size: 12px; color: var(--muted); }
        .balance-hero .amount { display: block; font-family: Unbounded; font-size: 28px; margin-top: 4px; color: var(--gold); }
        .section-title { font-size: 18px; margin-bottom: 16px; }
        .game-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
        .game-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          position: relative;
          transition: transform 0.2s, border-color 0.2s;
        }
        .game-card:hover { transform: translateY(-4px); border-color: var(--accent); }
        .g-icon { font-size: 40px; margin-bottom: 8px; }
        .g-name { font-weight: 700; font-size: 14px; }
        .hot {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--danger);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 8px;
          font-weight: 800;
        }
        .bank-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          margin-top: 24px;
          border-color: rgba(33, 160, 56, 0.4);
        }
        .bank-banner span:first-child { font-size: 36px; }
        .bank-banner p { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .bank-banner > span:last-child { margin-left: auto; font-size: 24px; }
      `}</style>
    </div>
  );
}
