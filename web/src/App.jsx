import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Games from "./pages/Games";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import BankHome from "./pages/bank/BankHome";
import BankInvest from "./pages/bank/BankInvest";
import BankTasks from "./pages/bank/BankTasks";
import BankQr from "./pages/bank/BankQr";
import CrashGame from "./games/CrashGame";
import CoinGame from "./games/CoinGame";

function Private({ children }) {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p className="shimmer" style={{ padding: 20 }}>
          Загрузка Nebula…
        </p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Private>
            <Layout>
              <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/games" element={<Games />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bank" element={<BankHome />} />
                <Route path="/bank/invest" element={<BankInvest />} />
                <Route path="/bank/tasks" element={<BankTasks />} />
                <Route path="/bank/qr" element={<BankQr />} />
                <Route path="/play/coin" element={<CoinGame />} />
                <Route path="/play/rush" element={<CrashGame gameId="rush" />} />
                <Route path="/play/krush" element={<CrashGame gameId="krush" />} />
                <Route path="/play/jetx" element={<CrashGame gameId="jetx" />} />
                <Route path="/play/aviamasters" element={<CrashGame gameId="aviamasters" />} />
                <Route path="/play/aviamasters2" element={<CrashGame gameId="aviamasters2" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Private>
        }
      />
    </Routes>
  );
}
