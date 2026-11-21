import React from "react";
import { Search, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { COLORS, CURRENCIES } from "../lib/utils";

export const emptyFilters = { q: "", from: "", to: "", currency: "", color: "" };

export function applyFilters(list, f) {
  const q = f.q.trim().toLowerCase();
  return list.filter((d) =>
    (!q || d.buyer.toLowerCase().includes(q) || d.orderNo.toLowerCase().includes(q)) &&
    (!f.from || d.date >= f.from) && (!f.to || d.date <= f.to) &&
    (!f.currency || d.currency === f.currency) &&
    (!f.color || d.items.some((i) => i.color === f.color)));
}

const inp = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
export default function Filters({ value, onChange }) {
  const { t } = useI18n();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const dirty = JSON.stringify(value) !== JSON.stringify(emptyFilters);
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
      <div className="relative min-w-[220px] flex-1">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input className={`${inp} w-full pl-9`} placeholder={t("search")} value={value.q} onChange={set("q")} />
      </div>
      <input type="date" title={t("from")} className={inp} value={value.from} onChange={set("from")} />
      <span className="text-slate-300">→</span>
      <input type="date" title={t("to")} className={inp} value={value.to} onChange={set("to")} />
      <select className={inp} value={value.currency} onChange={set("currency")}><option value="">{t("currency")}: {t("all")}</option>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
      <select className={inp} value={value.color} onChange={set("color")}><option value="">{t("color")}: {t("all")}</option>{COLORS.map((c) => <option key={c}>{c}</option>)}</select>
      {dirty && <button onClick={() => onChange(emptyFilters)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><X size={14} />{t("clear")}</button>}
    </div>
  );
}
