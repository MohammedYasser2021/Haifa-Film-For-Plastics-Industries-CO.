import React, { useState } from "react";
import { Truck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";

const inp = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
export default function Login() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(false);
    const { error } = await signIn(email.trim(), password);
    if (error) setError(true);
    setBusy(false);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end"><LanguageSwitch /></div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="rounded-xl bg-indigo-600 p-3 text-white"><Truck size={26} /></div>
            <h1 className="text-xl font-bold text-slate-900">{t("title")}</h1>
          </div>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("email")}</span>
            <input type="email" required autoFocus className={inp} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("password")}</span>
            <input type="password" required className={inp} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-600">{t("loginError")}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? t("loading") : t("signIn")}</button>
        </form>
      </div>
    </div>
  );
}
