import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { useI18n } from "../lib/i18n";

const Ctx = createContext();
export const useFeedback = () => useContext(Ctx);

export function FeedbackProvider({ children }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState([]);
  const [dlg, setDlg] = useState(null);

  const dismiss = useCallback((id) => setToasts((p) => p.filter((x) => x.id !== id)), []);
  const push = useCallback((type, text) => {
    const id = crypto.randomUUID();
    setToasts((p) => [...p.slice(-3), { id, type, text }]);
    setTimeout(() => dismiss(id), type === "error" ? 6500 : 3500);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    confirm: (opts) => new Promise((resolve) => setDlg({ ...opts, resolve })),
  }), [push]);

  const answer = (v) => { dlg.resolve(v); setDlg(null); };
  useEffect(() => {
    if (!dlg) return;
    const onKey = (e) => e.key === "Escape" && (dlg.resolve(false), setDlg(null));
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dlg]);

  const tone = { success: ["bg-emerald-50 text-emerald-600", CheckCircle2], error: ["bg-red-50 text-red-600", XCircle] };
  return (
    <Ctx.Provider value={api}>
      {children}

      {/* toasts */}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[70] flex flex-col gap-2 sm:inset-x-auto sm:end-4 sm:top-4 sm:w-96">
        {toasts.map(({ id, type, text }) => {
          const [cls, Icon] = tone[type];
          return (
            <div key={id} role="status" className="toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={20} /></span>
              <p className="flex-1 self-center text-sm font-medium text-slate-800">{text}</p>
              <button onClick={() => dismiss(id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
            </div>
          );
        })}
      </div>

      {/* confirm dialog */}
      {dlg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && answer(false)}>
          <div className="pop-in w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${dlg.danger ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"}`}><AlertTriangle size={28} /></div>
            <h3 className="text-lg font-semibold text-slate-900">{dlg.title || t("confirmTitle")}</h3>
            {dlg.message && <p className="mt-2 break-words text-sm text-slate-500">{dlg.message}</p>}
            <p className="mt-1 text-xs text-slate-400">{t("confirmHint")}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => answer(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">{t("cancel")}</button>
              <button autoFocus onClick={() => answer(true)} className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white ${dlg.danger ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>{dlg.confirmText || t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
