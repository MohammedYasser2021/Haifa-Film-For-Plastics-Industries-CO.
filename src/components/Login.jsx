import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import logo from "../assets/logo.png";
import { Spinner } from "./Spinner";
import { Gear } from "./Gear";
import { FactoryScene } from "./FactoryArt";
import { photo } from "../lib/photos";
import { COMPANY_SHORT, COMPANY_SUB } from "../lib/utils";

const inp = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
export default function Login() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const hero = photo("hero");
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(false);
    const { error } = await signIn(email.trim(), password);
    if (error) setError(true);
    setBusy(false);
  };
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden brand-bg p-4">
      {hero && <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <Gear size={420} teeth={16} className="gear-slow pointer-events-none absolute -start-28 -top-28 text-white/[0.05]" />
      <Gear size={340} teeth={14} className="gear-slow-rev pointer-events-none absolute -bottom-24 -end-20 text-white/[0.05]" />
      <div className="dots pointer-events-none absolute inset-0" />
      <div className="absolute end-4 top-4 z-10"><LanguageSwitch /></div>
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden text-white lg:block">
          <h2 className="text-4xl font-bold leading-tight">{COMPANY_SHORT}<span className="block text-xl font-medium text-sky-200">{COMPANY_SUB}</span></h2>
          <p className="mt-3 max-w-md text-sky-100/80">{t("guestTag")}</p>
          <FactoryScene className="mt-6 w-full drop-shadow-2xl" />
        </div>
        <form onSubmit={submit} className="rise-in mx-auto w-full max-w-sm space-y-4 rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col items-center gap-3 pb-2">
            <img src={logo} alt="Haifa Film" className="h-32 w-auto object-contain sm:h-36" />
            <div className="text-center"><h1 className="text-xl font-bold text-slate-900">{COMPANY_SHORT}</h1><p className="text-xs text-slate-500">{COMPANY_SUB}</p><p className="mt-3 text-sm font-medium text-slate-600">{t("title")}</p></div>
          </div>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("email")}</span>
            <input type="email" required autoFocus className={inp} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{t("password")}</span>
            <input type="password" required className={inp} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="text-sm text-red-600">{t("loginError")}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-700 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60">{busy ? <Spinner size={20} /> : t("signIn")}</button>
        </form>
      </div>
    </div>
  );
}
