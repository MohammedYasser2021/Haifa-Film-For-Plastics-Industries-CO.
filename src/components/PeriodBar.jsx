import React from "react";
import { useI18n } from "../lib/i18n";

export default function PeriodBar({ list, value, onChange }) {
  const { t, m } = useI18n();
  const years = [...new Set(list.map((d) => d.date.slice(0, 4)))].sort().reverse();
  const inYear = list.filter((d) => !value.year || d.date.startsWith(value.year));
  const counts = Array(12).fill(0);
  inYear.forEach((d) => counts[+d.date.slice(5, 7) - 1]++);
  const chip = (active, disabled) =>
    `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${active ? "bg-sky-600 text-white shadow-sm" : disabled ? "bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <select value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:w-40">
        <option value="">{t("allYears")}</option>
        {years.map((y) => <option key={y}>{y}</option>)}
      </select>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button className={chip(!value.month)} onClick={() => onChange({ ...value, month: "" })}>{t("allMonths")} <span className="opacity-70">({inYear.length})</span></button>
        {counts.map((n, i) => (
          <button key={i} disabled={!n} className={chip(+value.month === i + 1, !n)} onClick={() => onChange({ ...value, month: String(i + 1) })}>
            {m(i + 1)} {n > 0 && <span className="opacity-70">({n})</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
