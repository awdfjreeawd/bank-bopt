export default function DesktopBar() {
  if (!window.electronAPI?.isDesktop) return null;
  return (
    <div className="desktop-bar">
      <span className="logo-mini">NEBULA</span>
      <div className="win-btns">
        <button type="button" onClick={() => window.electronAPI.minimize()} title="Свернуть">
          ─
        </button>
        <button type="button" className="close" onClick={() => window.electronAPI.close()} title="Закрыть">
          ✕
        </button>
      </div>
      <style>{`
        .desktop-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          background: rgba(7, 6, 13, 0.95);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 10000;
          -webkit-app-region: drag;
        }
        .logo-mini { font-family: Unbounded; font-size: 11px; color: var(--gold); }
        .win-btns { display: flex; gap: 4px; -webkit-app-region: no-drag; }
        .win-btns button {
          width: 36px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          color: var(--text);
          font-size: 14px;
        }
        .win-btns .close:hover { background: var(--danger); }
        .app-shell { padding-top: 36px; }
      `}</style>
    </div>
  );
}
