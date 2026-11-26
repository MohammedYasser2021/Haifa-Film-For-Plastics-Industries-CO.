import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import logo from "../assets/logo.png";
import { Gear } from "./Gear";
import { FactoryScene, MachineArt, RollsArt, QualityArt } from "./FactoryArt";
import { photo } from "../lib/photos";
import { COMPANY_SHORT, COMPANY_SUB } from "../lib/utils";

const CARDS = [
  { key: "machines", Art: MachineArt, t: "guestC1T", d: "guestC1D" },
  { key: "rolls", Art: RollsArt, t: "guestC2T", d: "guestC2D" },
  { key: "quality", Art: QualityArt, t: "guestC3T", d: "guestC3D" },
];

export default function GuestHome() {
  const { email, signOut } = useAuth();
  const { t } = useI18n();
  const hero = photo("hero");
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <section className="relative overflow-hidden brand-bg text-white">
        <div className="dots pointer-events-none absolute inset-0" />
        {hero && <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <Gear size={460} teeth={16} className="gear-slow pointer-events-none absolute -start-32 -top-32 text-white/[0.05]" />
        <header className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-white p-1.5 shadow-lg"><img src={logo} alt="Haifa Film" className="h-12 w-auto object-contain" /></div>
            <div className="leading-tight"><p className="text-sm font-bold">{COMPANY_SHORT}</p><p className="text-[11px] text-sky-200">{COMPANY_SUB}</p></div></div>
          <div className="flex items-center gap-3 text-xs text-sky-100"><LanguageSwitch /><span className="hidden md:inline">{email}</span>
            <button title={t("signOut")} onClick={signOut} className="rounded p-1.5 hover:bg-white/10"><LogOut size={18} /></button></div>
        </header>
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-6 pb-28 pt-8 lg:grid-cols-2 lg:pt-14">
          <div className="rise-in text-center lg:text-start">
            <div className="mx-auto inline-flex rounded-3xl bg-white p-3 shadow-2xl ring-4 ring-amber-400/80 lg:mx-0"><img src={logo} alt="" className="float-y h-32 w-auto object-contain sm:h-40" /></div>
            <h1 className="mt-6 text-3xl font-bold sm:text-5xl">{t("guestWelcome")} <span className="gold-grad">{COMPANY_SHORT}</span></h1>
            <p className="mt-3 text-lg text-sky-100">{t("guestTag")}</p>
            <p className="mt-2 text-sm text-sky-200/70">{t("guestSoon")}</p>
          </div>
          {photo("machines") ? <img src={photo("machines")} alt="" className="h-72 w-full rounded-3xl object-cover shadow-2xl" /> : <FactoryScene className="w-full drop-shadow-2xl" />}
        </div>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full text-slate-50" fill="currentColor"><path d="M0 60V30C240 0 480 0 720 25S1200 55 1440 20V60Z" /></svg>
      </section>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 pt-6 md:grid-cols-3">
        {CARDS.map(({ key, Art, t: tt, d }, i) => (
          <article key={key} style={{ animationDelay: `${i * 120}ms` }} className="rise-in group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
            {photo(key) ? <img src={photo(key)} alt="" loading="lazy" className="h-44 w-full object-cover" /> : <Art className="h-44 w-full object-cover" />}
            <div className="border-t-4 border-amber-400 p-5"><h3 className="font-bold text-slate-900">{t(tt)}</h3><p className="mt-1 text-sm text-slate-500">{t(d)}</p></div>
          </article>
        ))}
      </main>
    </div>
  );
}
