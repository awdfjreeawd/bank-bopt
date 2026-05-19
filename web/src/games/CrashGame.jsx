import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../api";
import { useCrashGame } from "../hooks/useCrashGame";

const THEMES = {
  rush: { title: "RUSH", emoji: "⚡", color: "#7c5cff", vehicle: "rocket" },
  krush: { title: "KRUSH", emoji: "💥", color: "#ff4d6d", vehicle: "meteor" },
  jetx: { title: "JETX", emoji: "✈️", color: "#00b4d8", vehicle: "jet" },
  aviamasters: { title: "AVIAMASTERS", emoji: "🛩️", color: "#f5c451", vehicle: "plane" },
  aviamasters2: { title: "AVIAMASTERS 2", emoji: "🚀", color: "#ff6b9d", vehicle: "plane2" },
};

export default function CrashGame({ gameId }) {
  const theme = THEMES[gameId] || THEMES.rush;
  const { user, refresh, showToast } = useUser();
  const [bet, setBet] = useState(50);
  const [activeBet, setActiveBet] = useState(0);
  const [lastWin, setLastWin] = useState(null);
  const { phase, multiplier, startRound, reset, cashOut } = useCrashGame({
    onCrash: () => showToast(`Краш! Ставка ${activeBet} ₽ сгорела`, "error"),
  });

  const placeBet = async () => {
    if (!user) return;
    if (phase === "running") return;
    if (user.casinoBalance < bet) {
      showToast("Недостаточно баланса. Пополни через банк!", "error");
      return;
    }
    try {
      await api.bet(user.id, bet, false, 1);
      await refresh();
      setActiveBet(bet);
      setLastWin(null);
      reset();
      startRound();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleCashOut = async () => {
    const m = cashOut();
    if (!m || !user) return;
    try {
      const res = await api.cashout(user.id, activeBet || bet, m);
      await refresh();
      setLastWin(res.payout);
      showToast(`Забрал x${m} → +${res.payout} ₽`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  useEffect(() => {
    if (phase === "crashed") refresh();
  }, [phase, refresh]);

  const progress = Math.min((multiplier - 1) / 8, 1) * 100;

  return (
    <div className="game-page">
      <header className="game-header">
        <Link to="/games" className="btn btn-ghost">
          ← Назад
        </Link>
        <h1>
          {theme.emoji} {theme.title}
        </h1>
        <span className="balance-chip">{user?.casinoBalance?.toLocaleString("ru")} ₽</span>
      </header>

      <div className="game-stage glass" style={{ "--game-color": theme.color }}>
        <div className="sky" />
        <motion.div
          className={`vehicle ${theme.vehicle}`}
          animate={{
            x: phase === "running" ? `${progress * 2}%` : 0,
            y: phase === "crashed" ? 120 : -progress * 0.8,
            rotate: phase === "running" ? -8 : phase === "crashed" ? 90 : 0,
          }}
          transition={{ type: "spring", stiffness: 80 }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={phase + multiplier}
            className={`mult-display ${phase === "crashed" ? "crashed" : ""}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
          >
            x{multiplier.toFixed(2)}
          </motion.div>
        </AnimatePresence>

        {phase === "crashed" && (
          <motion.p className="crash-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            КРАШ!
          </motion.p>
        )}
      </div>

      <div className="bet-panel glass">
        <label>Ставка</label>
        <div className="bet-row">
          <input
            className="input"
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            min={10}
          />
          {[50, 100, 500, 1000].map((v) => (
            <button key={v} className="btn btn-ghost" type="button" onClick={() => setBet(v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="actions">
          {phase === "running" ? (
            <button className="btn btn-gold btn-lg" type="button" onClick={handleCashOut}>
              Забрать x{multiplier.toFixed(2)}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" type="button" onClick={placeBet}>
              {phase === "crashed" ? "Ещё раунд" : "СТАВКА"}
            </button>
          )}
        </div>
        {lastWin != null && <p className="win-msg">Выигрыш: +{lastWin} ₽</p>}
      </div>

      <style>{`
        .game-page { padding: 16px; max-width: 600px; margin: 0 auto; position: relative; z-index: 1; }
        .game-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 8px; }
        .game-header h1 { font-size: 16px; color: var(--game-color, var(--accent)); }
        .balance-chip { background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 20px; font-weight: 700; font-size: 13px; }
        .game-stage {
          height: 320px;
          position: relative;
          overflow: hidden;
          margin-bottom: 16px;
          border-color: color-mix(in srgb, var(--game-color) 40%, transparent);
        }
        .sky {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, #0a1628 0%, #1a0a2e 60%, #2d1b4e 100%);
        }
        .vehicle {
          position: absolute;
          left: 10%;
          bottom: 30%;
          font-size: 64px;
          filter: drop-shadow(0 0 20px var(--game-color));
          z-index: 2;
        }
        .vehicle.rocket::after { content: '🚀'; }
        .vehicle.meteor::after { content: '☄️'; }
        .vehicle.jet::after { content: '✈️'; }
        .vehicle.plane::after { content: '🛩️'; }
        .vehicle.plane2::after { content: '🛫'; }
        .mult-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: Unbounded, sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: var(--game-color);
          text-shadow: 0 0 40px var(--game-color);
          z-index: 3;
        }
        .mult-display.crashed { color: var(--danger); animation: shake 0.4s; }
        .crash-label { position: absolute; bottom: 20%; left: 50%; transform: translateX(-50%); color: var(--danger); font-weight: 800; font-size: 24px; }
        @keyframes shake {
          0%,100% { transform: translate(-50%,-50%); }
          25% { transform: translate(-48%,-50%); }
          75% { transform: translate(-52%,-50%); }
        }
        .bet-panel { padding: 20px; }
        .bet-panel label { display: block; margin-bottom: 8px; color: var(--muted); font-size: 13px; }
        .bet-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .bet-row .input { flex: 1; min-width: 100px; }
        .btn-lg { width: 100%; padding: 16px; font-size: 16px; }
        .win-msg { text-align: center; margin-top: 12px; color: var(--accent2); font-weight: 700; }
        .actions { display: flex; gap: 8px; }
      `}</style>
    </div>
  );
}
