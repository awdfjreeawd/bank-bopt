import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Particles from "./Particles";
import NavBar from "./NavBar";
import DesktopBar from "./DesktopBar";

export default function Layout({ children }) {
  const { toast } = useUser();
  const loc = useLocation();
  const isBank = loc.pathname.startsWith("/bank");
  const hideNav = loc.pathname.includes("/play/");

  return (
    <div className={`app-shell ${isBank ? "bank-theme" : ""}`}>
      <DesktopBar />
      <Particles count={isBank ? 8 : 20} />
      {children}
      {!hideNav && <NavBar />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <style>{`.toast { z-index: 9999; }`}</style>
    </div>
  );
}
