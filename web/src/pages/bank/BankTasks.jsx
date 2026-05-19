import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { api } from "../../api";

export default function BankTasks() {
  const { user, tasks, refresh, showToast } = useUser();

  const complete = async (taskId) => {
    if (!user) return;
    try {
      const res = await api.completeTask(user.id, taskId);
      await refresh();
      showToast(`+${res.reward} ₽ на карту!`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <h1 style={{ fontFamily: "Unbounded", marginBottom: 16 }}>✅ Задания</h1>
      <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: 14 }}>
        Выполняй задания — пополняй карту. Старт: 100 ₽ на счёте.
      </p>
      <div className="tasks">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            className="task glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div>
              <strong>{t.title}</strong>
              <p>{t.desc}</p>
              <span className="reward">+{t.reward} ₽</span>
            </div>
            <button
              type="button"
              className={`btn ${t.done ? "btn-ghost" : "btn-primary"}`}
              disabled={t.done}
              onClick={() => complete(t.id)}
            >
              {t.done ? "Готово" : "Забрать"}
            </button>
          </motion.div>
        ))}
      </div>
      <style>{`
        .tasks { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
        .task { padding: 16px; display: flex; align-items: center; gap: 16px; }
        .task p { color: var(--muted); font-size: 13px; margin: 4px 0; }
        .reward { color: var(--bank-green); font-weight: 700; font-size: 14px; }
        .task .btn { flex-shrink: 0; }
      `}</style>
    </div>
  );
}
