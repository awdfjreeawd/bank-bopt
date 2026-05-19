import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const UserContext = createContext(null);

const STORAGE_KEY = "nebula_session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const refresh = useCallback(async (id) => {
    const uid = id || user?.id;
    if (!uid) return;
    const data = await api.getUser(uid);
    setUser(data.user);
    setStocks(data.stocks || []);
    setTasks(data.tasks || []);
    setHistory(data.history || []);
  }, [user?.id]);

  const login = async ({ phone = "", telegramId, name } = {}) => {
    setLoading(true);
    try {
      const data = await api.auth({ phone, telegramId, name });
      setUser(data.user);
      setStocks(data.stocks || []);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: data.user.id, phone }));
      const full = await api.getUser(data.user.id);
      setTasks(full.tasks || []);
      setHistory(full.history || []);
      showToast(`Добро пожаловать, ${data.user.name}!`, "success");
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const session = loadSession();
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser) {
          await login({
            telegramId: String(tgUser.id),
            name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" "),
            phone: session?.phone || "",
          });
          setLoading(false);
          return;
        }
      }
      if (session?.phone || session?.userId) {
        try {
          if (session.phone) await login({ phone: session.phone });
          else await refresh(session.userId);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const t = setInterval(() => refresh(), 8000);
    return () => clearInterval(t);
  }, [user?.id, refresh]);

  const value = {
    user,
    setUser,
    stocks,
    tasks,
    history,
    loading,
    login,
    refresh,
    showToast,
    toast,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
