import React, { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { COLORS, CURRENCIES, LOGOS, VISCOSITIES, num } from "../lib/utils";

export const emptyFilters = { q: "", year: "", month: "", from: "", to: "", currency: "", color: "", thick: "", width: "", length: "", visc: "", logo: "" };

export function applyFilters(list, f) {
  const q = f.q.trim().toLowerCase();
  return list.filter((d) =>
    (!q || d.buyer.toLowerCase().includes(q) || d.orderNo.toLowerCase().includes(q)) &&
    (!f.year || d.date.slice(0, 4) === f.year) && (!f.month || +d.date.slice(5, 7) === +f.month) &&
    (!f.from || d.date >= f.from) && (!f.to || d.date <= f.to) &&
    (!f.currency || d.currency === f.currency) &&
    d.items.some((i) =>
      (!f.color || i.color === f.color) && (!f.visc || i.viscosity === f.visc) && (!f.logo || i.logo === f.logo) &&
      (!f.thick || num(i.thickness) === num(f.thick)) && (!f.width || Math.abs(num(i.width) - num(f.width)) < 1e-9) &&
      (!f.length || num(i.length) === num(f.length))));
}

const inp = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
export default function Filters({ value, onChange }) {
  const { t, o, c } = useI18n();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const [open, setOpen] = useState(false);
  const advCount = ["thick", "width", "length", "visc", "logo"].filter((k) => value[k]).length;
  const dirty = JSON.stringify(value) !== JSON.stringify(emptyFilters);
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-4 sm:flex sm:flex-wrap sm:items-center">
      <div className="relative col-span-2 sm:min-w-[220px] sm:flex-1">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input className={`${inp} pl-9`} placeholder={t("search")} value={value.q} onChange={set("q")} />
      </div>
      <input type="date" title={t("from")} className={`${inp} sm:w-auto`} value={value.from} onChange={set("from")} />
      <input type="date" title={t("to")} className={`${inp} sm:w-auto`} value={value.to} onChange={set("to")} />
      <select className={`${inp} sm:w-auto`} value={value.currency} onChange={set("currency")}><option value="">{t("currency")}: {t("all")}</option>{CURRENCIES.map((x) => <option key={x} value={x}>{c(x)}</option>)}</select>
      <select className={`${inp} sm:w-auto`} value={value.color} onChange={set("color")}><option value="">{t("color")}: {t("all")}</option>{COLORS.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select>
      <button onClick={() => setOpen(!open)} className={`col-span-2 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium sm:col-span-1 ${open || advCount ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
        <SlidersHorizontal size={16} />{t("advanced")}{advCount > 0 && <span className="rounded-full bg-indigo-600 px-1.5 text-xs text-white">{advCount}</span>}
      </button>
      {open && (
        <div className="col-span-2 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 sm:basis-full sm:grid-cols-5">
          <p className="col-span-2 text-xs text-slate-400 sm:col-span-5">{t("advHint")}</p>
          <label className="text-xs text-slate-500">{t("thickness")}<input type="number" step="any" className={`${inp} mt-1`} value={value.thick} onChange={set("thick")} /></label>
          <label className="text-xs text-slate-500">{t("width")}<input type="number" step="any" className={`${inp} mt-1`} value={value.width} onChange={set("width")} /></label>
          <label className="text-xs text-slate-500">{t("length")}<input type="number" step="any" className={`${inp} mt-1`} value={value.length} onChange={set("length")} /></label>
          <label className="text-xs text-slate-500">{t("viscosity")}<select className={`${inp} mt-1`} value={value.visc} onChange={set("visc")}><option value="">{t("any")}</option>{VISCOSITIES.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select></label>
          <label className="text-xs text-slate-500">{t("logo")}<select className={`${inp} mt-1`} value={value.logo} onChange={set("logo")}><option value="">{t("any")}</option>{LOGOS.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select></label>
        </div>
      )}
      {dirty && <button onClick={() => onChange(emptyFilters)} className="col-span-2 flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-900 sm:col-span-1"><X size={14} />{t("clear")}</button>}
    </div>
  );
}
