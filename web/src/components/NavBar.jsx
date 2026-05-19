import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const casinoLinks = [
  { to: "/", label: "Лобби", icon: "🏠" },
  { to: "/games", label: "Игры", icon: "🎮" },
  { to: "/wallet", label: "Кошелёк", icon: "💎" },
  { to: "/profile", label: "Профиль", icon: "👤" },
];

const bankLinks = [
  { to: "/bank", label: "Главная", icon: "🏦" },
  { to: "/bank/invest", label: "Акции", icon: "📈" },
  { to: "/bank/tasks", label: "Задания", icon: "✅" },
  { to: "/bank/qr", label: "QR", icon: "📱" },
];

export default function NavBar() {
  const loc = useLocation();
  const isBank = loc.pathname.startsWith("/bank");
  const links = isBank ? bankLinks : casinoLinks;

  return (
    <nav className={`bottom-nav ${isBank ? "bank-nav" : ""}`}>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.to === "/" || l.to === "/bank"} className="nav-item">
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="nav-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          padding: 8px 12px 16px;
          background: rgba(7, 6, 13, 0.92);
          border-top: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          z-index: 100;
        }
        .bank-nav { background: rgba(10, 18, 14, 0.95); }
        .nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }
        .nav-item.active { color: var(--text); }
        .nav-pill {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: rgba(124, 92, 255, 0.2);
          border: 1px solid rgba(124, 92, 255, 0.35);
        }
        .bank-nav .nav-pill {
          background: rgba(33, 160, 56, 0.2);
          border-color: rgba(33, 160, 56, 0.4);
        }
        .nav-icon { font-size: 20px; z-index: 1; }
        .nav-label { z-index: 1; }
      `}</style>
    </nav>
  );
}
