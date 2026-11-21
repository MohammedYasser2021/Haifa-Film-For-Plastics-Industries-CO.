import React from "react";
import { LogOut, Truck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";

export default function GuestHome() {
  const { email, signOut } = useAuth();
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-600 p-2.5 text-white"><Truck size={22} /></div><span className="font-bold text-slate-900">Haifa Film</span></div>
        <div className="flex items-center gap-3 text-xs text-slate-500"><LanguageSwitch /><span>{email}</span>
          <button title={t("signOut")} onClick={signOut} className="rounded p-1.5 hover:bg-slate-100"><LogOut size={16} /></button></div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{t("guestWelcome")}</h1>
        <p className="mt-3 text-slate-500">{t("guestSoon")}</p>
      </main>
    </div>
  );
}
