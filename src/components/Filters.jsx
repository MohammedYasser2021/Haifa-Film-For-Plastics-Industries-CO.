import React, { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import PeriodBar from "./PeriodBar";
import SearchSelect from "./SearchSelect";
import { useI18n } from "../lib/i18n";
import { COLORS, CURRENCIES, LOGOS, VISCOSITIES, num, logoBase } from "../lib/utils";

export const emptyFilters = { q: "", customer: "", year: "", month: "", from: "", to: "", currency: "", color: "", thick: "", width: "", length: "", visc: "", logo: "" };

export function applyFilters(list, f, customers = []) {
  const q = f.q.trim().toLowerCase();
  const byId = new Map(customers.map((c) => [c.id, c]));
  const names = (d) => { const c = byId.get(d.customerId); return c ? `${c.nameEn} ${c.nameZh} ${c.code}`.toLowerCase() : ""; };
  return list.filter((d) =>
    (!q || d.buyer.toLowerCase().includes(q) || d.orderNo.toLowerCase().includes(q) || names(d).includes(q)) &&
    (!f.customer || (f.customer.startsWith("b:") ? !d.customerId && d.buyer.trim().toLowerCase() === f.customer.slice(2) : d.customerId === f.customer)) &&
    (!f.year || d.date.slice(0, 4) === f.year) && (!f.month || +d.date.slice(5, 7) === +f.month) &&
    (!f.from || d.date >= f.from) && (!f.to || d.date <= f.to) &&
    (!f.currency || d.currency === f.currency) &&
    d.items.some((i) =>
      (!f.color || i.color === f.color) && (!f.visc || i.viscosity === f.visc) && (!f.logo || logoBase(i.logo) === f.logo) &&
      (!f.thick || num(i.thickness) === num(f.thick)) && (!f.width || Math.abs(num(i.width) - num(f.width)) < 1e-9) &&
      (!f.length || num(i.length) === num(f.length))));
}

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
function Label({ text, children }) {
  return <label className="block text-xs font-medium text-slate-500">{text}<div className="mt-1">{children}</div></label>;
}
const PANEL_KEYS = ["year", "month", "from", "to", "currency", "color", "thick", "width", "length", "visc", "logo"];

export default function Filters({ value, onChange, customers = [], list = [] }) {
  const { t, o, c, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const cname = (x) => (lang === "zh" ? x.nameZh || x.nameEn : x.nameEn);
  const loose = [...new Map(list.filter((d) => !d.customerId).map((d) => [d.buyer.trim().toLowerCase(), d.buyer.trim()])).entries()];
  const active = PANEL_KEYS.filter((k) => value[k]).length + (value.customer ? 1 : 0);
  const dirty = JSON.stringify(value) !== JSON.stringify(emptyFilters);
  const customerOptions = [
    { value: "", label: t("allCustomers") },
    ...customers.map((x) => ({ value: x.id, label: cname(x), sub: lang === "zh" ? x.nameEn : x.nameZh })),
    ...loose.map(([k, name]) => ({ value: `b:${k}`, label: name })),
  ];
  const customerSelect = (className) => (
    <SearchSelect className={className} value={value.customer} onChange={(v) => onChange({ ...value, customer: v })}
      options={customerOptions} placeholder={`${t("customer")}: ${t("allCustomers")}`} />
  );

  return (
    <div className="border-b border-slate-100">
      <div className="flex items-center gap-2 p-3 sm:p-4">
        <div className="relative min-w-[8rem] flex-1">
          <Search size={17} className="absolute start-3 top-3 text-slate-400" />
          <input className={`${inp} pe-3`} style={{ paddingInlineStart: 40 }} placeholder={t("search")} value={value.q} onChange={set("q")} />
        </div>
        {customerSelect("hidden w-60 shrink-0 sm:block")}
        <button onClick={() => setOpen(!open)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${open || active ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <SlidersHorizontal size={17} /><span className="hidden sm:inline">{t("filters")}</span>
          {active > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs text-white">{active}</span>}
        </button>
      </div>

      {open && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
          <PeriodBar list={list} value={value} onChange={onChange} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 sm:hidden"><span className="mb-1 block text-xs font-medium text-slate-500">{t("customer")}</span>{customerSelect("")}</div>
            <Label text={t("from")}><input type="date" className={inp} value={value.from} onChange={set("from")} /></Label>
            <Label text={t("to")}><input type="date" className={inp} value={value.to} onChange={set("to")} /></Label>
            <Label text={t("currency")}><select className={inp} value={value.currency} onChange={set("currency")}><option value="">{t("all")}</option>{CURRENCIES.map((x) => <option key={x} value={x}>{c(x)}</option>)}</select></Label>
            <Label text={t("color")}><select className={inp} value={value.color} onChange={set("color")}><option value="">{t("all")}</option>{COLORS.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select></Label>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{t("advanced")}</p>
            <p className="mb-3 text-xs text-slate-400">{t("advHint")}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Label text={t("thickness")}><input type="number" step="any" className={inp} value={value.thick} onChange={set("thick")} /></Label>
              <Label text={t("width")}><input type="number" step="any" className={inp} value={value.width} onChange={set("width")} /></Label>
              <Label text={t("length")}><input type="number" step="any" className={inp} value={value.length} onChange={set("length")} /></Label>
              <Label text={t("viscosity")}><select className={inp} value={value.visc} onChange={set("visc")}><option value="">{t("any")}</option>{VISCOSITIES.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select></Label>
              <Label text={t("logo")}><select className={inp} value={value.logo} onChange={set("logo")}><option value="">{t("any")}</option>{LOGOS.map((x) => <option key={x} value={x}>{o(x)}</option>)}</select></Label>
            </div>
          </div>
          {dirty && <button onClick={() => onChange(emptyFilters)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"><X size={15} />{t("clear")}</button>}
        </div>
      )}
    </div>
  );
}
