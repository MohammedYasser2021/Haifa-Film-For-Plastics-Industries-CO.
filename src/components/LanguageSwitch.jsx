import React from "react";
import { useI18n } from "../lib/i18n";
export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
      {[["en", "EN"], ["zh", "中文"]].map(([k, l]) => (
        <button key={k} onClick={() => setLang(k)} className={`rounded-md px-3 py-1 font-medium transition ${lang === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{l}</button>
      ))}
    </div>
  );
}
