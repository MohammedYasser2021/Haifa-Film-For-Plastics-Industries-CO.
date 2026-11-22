import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import logo from "../assets/logo.jpeg";
import { Spinner } from "./Spinner";
import { COMPANY_SHORT, COMPANY_SUB } from "../lib/utils";

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
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end"><LanguageSwitch /></div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-3 pb-2">
            <img src={logo} alt="Haifa Film" className="h-20 w-auto max-w-[220px] object-contain" />
            <div className="text-center"><h1 className="text-xl font-bold text-slate-900">{COMPANY_SHORT}</h1><p className="text-xs text-slate-500">{COMPANY_SUB}</p><p className="mt-3 text-sm font-medium text-slate-600">{t("title")}</p></div>
          </div>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("email")}</span>
            <input type="email" required autoFocus className={inp} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("password")}</span>
            <input type="password" required className={inp} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-600">{t("loginError")}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? <Spinner size={18} /> : t("signIn")}</button>
        </form>
      </div>
    </div>
  );
}
