import React from "react";
import { useI18n } from "../lib/i18n";
import logo from "../assets/logo.jpeg";

export function Spinner({ size = 20, className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" role="status" aria-label="loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Spinner size={38} className="text-indigo-600" />
      <p className="text-sm">{t("loading")}</p>
    </div>
  );
}

export function ScreenLoader() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-slate-100">
      <img src={logo} alt="" className="h-16 w-auto object-contain" />
      <Spinner size={34} className="text-indigo-600" />
    </div>
  );
}
