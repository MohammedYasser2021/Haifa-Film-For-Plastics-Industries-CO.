import React from "react";
import { useI18n } from "../lib/i18n";
import logo from "../assets/logo.png";
import { Gear, GearPair } from "./Gear";

// small spinning gear (used inside buttons and everywhere a spinner was used before)
export function Spinner({ size = 20, className = "" }) {
  return <Gear size={size} className={`gear-fast ${className}`} />;
}

export function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <GearPair size={96} className="text-sky-600" />
      <p className="text-sm">{t("loading")}</p>
    </div>
  );
}

export function ScreenLoader() {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-10 overflow-hidden brand-bg">
      <Gear size={460} teeth={16} className="gear-slow pointer-events-none absolute -start-32 -top-32 text-white/[0.04]" />
      <Gear size={380} teeth={14} className="gear-slow-rev pointer-events-none absolute -bottom-28 -end-24 text-white/[0.05]" />
      <div className="relative flex h-[300px] w-[300px] items-center justify-center">
        <div className="glow absolute inset-6 rounded-full bg-sky-400/30 blur-3xl" />
        {/* gold gear ring turning around the logo */}
        <Gear size={300} teeth={26} ro={48} ri={42} hole={35} className="gear-slow absolute inset-0 text-amber-400" />
        <div className="relative flex h-[210px] w-[210px] items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-sky-300/40">
          <img src={logo} alt="Haifa Film" className="h-40 w-auto object-contain" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 text-sky-300">
        <GearPair size={84} />
        <p className="text-sm tracking-widest text-sky-100/80">{t("loading")}</p>
      </div>
    </div>
  );
}
