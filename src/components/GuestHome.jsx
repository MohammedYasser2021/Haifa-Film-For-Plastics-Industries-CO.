import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import logo from "../assets/logo.jpeg";

export default function GuestHome() {
  const { email, signOut } = useAuth();
  const { t } = useI18n();
  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
        <img src={logo} alt="Haifa Film" className="h-10 w-auto object-contain" />
        <div className="flex items-center gap-3 text-xs text-slate-500"><LanguageSwitch /><span className="hidden md:inline">{email}</span>
          <button title={t("signOut")} onClick={signOut} className="rounded p-1.5 hover:bg-slate-100"><LogOut size={18} /></button></div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t("guestWelcome")}</h1>
        <p className="mt-3 text-slate-500">{t("guestSoon")}</p>
      </main>
    </div>
  );
}
