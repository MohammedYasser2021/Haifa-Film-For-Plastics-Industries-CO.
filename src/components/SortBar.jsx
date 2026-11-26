import React from "react";
import { ArrowUpDown } from "lucide-react";
import { useI18n } from "../lib/i18n";

const OPTIONS = [
  ["date:desc", "sort_newest"], ["date:asc", "sort_oldest"], ["added:desc", "sort_added_new"], ["added:asc", "sort_added_old"],
  ["buyer:asc", "sort_buyer_az"], ["buyer:desc", "sort_buyer_za"], ["orderNo:asc", "sort_order_az"], ["orderNo:desc", "sort_order_za"],
  ["total:desc", "sort_total_hi"], ["total:asc", "sort_total_lo"], ["sqm:desc", "sort_sqm_hi"], ["sqm:asc", "sort_sqm_lo"],
  ["qty:desc", "sort_qty_hi"], ["qty:asc", "sort_qty_lo"],
];
const sel = "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

export default function SortBar({ sort, onSort, size, onSize, total }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
      <span className="text-sm text-slate-500">{total} {t("results")}</span>
      <div className="flex flex-wrap items-center gap-2">
        <ArrowUpDown size={16} className="text-slate-400" />
        <select className={sel} value={`${sort.key}:${sort.dir}`} onChange={(e) => { const [key, dir] = e.target.value.split(":"); onSort({ key, dir }); }}>
          {OPTIONS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
        </select>
        <select className={`${sel} hidden sm:block`} value={size} onChange={(e) => onSize(+e.target.value)} title={t("perPage")}>
          {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / {t("pageWord")}</option>)}
        </select>
      </div>
    </div>
  );
}
