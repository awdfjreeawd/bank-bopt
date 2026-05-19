import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ALL = [
  { id: "rush", name: "RUSH", desc: "Краш-ракета", icon: "⚡", color: "#7c5cff" },
  { id: "coin", name: "Монетка", desc: "Орёл / Решка x2", icon: "🪙", color: "#f5c451", path: "/play/coin" },
  { id: "jetx", name: "JETX", desc: "Самолёт в небо", icon: "✈️", color: "#00b4d8" },
  { id: "krush", name: "KRUSH", desc: "Метеоритный краш", icon: "💥", color: "#ff4d6d" },
  { id: "aviamasters", name: "Aviamasters", desc: "Как BGaming", icon: "🛩️", color: "#f5c451" },
  { id: "aviamasters2", name: "Aviamasters 2", desc: "Улучшенная версия", icon: "🚀", color: "#ff6b9d" },
];

export default function Games() {
  return (
    <div className="page">
      <h1 className="logo" style={{ fontSize: 22, marginBottom: 20 }}>
        Все игры
      </h1>
      <div className="list">
        {ALL.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={g.path || `/play/${g.id}`} className="game-row glass" style={{ borderLeftColor: g.color }}>
              <span className="icon">{g.icon}</span>
              <div>
                <strong>{g.name}</strong>
                <p>{g.desc}</p>
              </div>
              <span>▶</span>
            </Link>
          </motion.div>
        ))}
      </div>
      <style>{`
        .list { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
        .game-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-left: 4px solid;
          transition: transform 0.15s;
        }
        .game-row:hover { transform: translateX(4px); }
        .game-row .icon { font-size: 32px; }
        .game-row p { color: var(--muted); font-size: 13px; margin-top: 2px; }
        .game-row > span:last-child { margin-left: auto; opacity: 0.5; }
      `}</style>
    </div>
  );
}
