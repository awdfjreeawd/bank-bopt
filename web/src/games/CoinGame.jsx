import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../api";

export default function CoinGame() {
  const { user, refresh, showToast } = useUser();
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);

  const flip = async (side) => {
    if (!user || flipping) return;
    if (user.casinoBalance < bet) {
      showToast("Недостаточно баланса", "error");
      return;
    }
    setChoice(side);
    setFlipping(true);
    setResult(null);
    const winSide = Math.random() < 0.48 ? side : side === "heads" ? "tails" : "heads";
    await new Promise((r) => setTimeout(r, 1800));
    const win = winSide === side;
    try {
      await api.bet(user.id, bet, win, 2);
      await refresh();
      setResult({ winSide, win });
      showToast(win ? `Победа! +${bet} ₽` : "Проигрыш", win ? "success" : "error");
    } catch (e) {
      showToast(e.message, "error");
    }
    setFlipping(false);
  };

  return (
    <div className="game-page coin-page">
      <header className="game-header">
        <Link to="/games" className="btn btn-ghost">
          ← Назад
        </Link>
        <h1>🪙 МОНЕТКА</h1>
        <span className="balance-chip">{user?.casinoBalance?.toLocaleString("ru")} ₽</span>
      </header>

      <motion.div
        className="coin-stage glass"
        animate={{ rotateY: flipping ? 720 : result ? (result.winSide === "heads" ? 0 : 180) : 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      >
        <div className={`coin-face ${result?.win ? "win" : result ? "lose" : ""}`}>
          {flipping ? "?" : result ? (result.winSide === "heads" ? "ОРЁЛ" : "РЕШКА") : "—"}
        </div>
      </motion.div>

      <div className="bet-panel glass">
        <label>Ставка</label>
        <input className="input" type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} />
        <div className="coin-btns">
          <motion.button
            className="btn btn-gold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={flipping}
            onClick={() => flip("heads")}
          >
            🦅 Орёл x2
          </motion.button>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={flipping}
            onClick={() => flip("tails")}
          >
            🌿 Решка x2
          </motion.button>
        </div>
      </div>

      <style>{`
        .coin-page { max-width: 480px; margin: 0 auto; padding: 16px; position: relative; z-index: 1; }
        .coin-stage {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
          perspective: 800px;
        }
        .coin-face {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: linear-gradient(145deg, #f5c451, #c9a227);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Unbounded, sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #2a1f00;
          box-shadow: 0 12px 40px rgba(245, 196, 81, 0.5);
        }
        .coin-face.win { box-shadow: 0 0 50px #00e5a0; }
        .coin-face.lose { box-shadow: 0 0 50px #ff4d6d; }
        .coin-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
        .bet-panel { padding: 20px; }
      `}</style>
    </div>
  );
}
