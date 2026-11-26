import React, { useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { fmt, money } from "../lib/utils";
import { periodRows, yearsIn } from "../lib/reports";
import { exportTable } from "../lib/exportReport";
import BarChart from "./BarChart";

const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
export default function PeriodReport({ list, cur }) {
  const { t, m } = useI18n();
  const years = yearsIn(list);
  const [mode, setMode] = useState("monthly");
  const [yearSel, setYear] = useState("");
  const [metric, setMetric] = useState("sqm");
  const year = years.includes(yearSel) ? yearSel : years.at(-1) || "";
  if (!years.length) return <p className="p-10 text-center text-slate-400">{t("noData")}</p>;

  const rows = periodRows(list, mode, year, cur);
  const label = (r) => (mode === "monthly" ? m(r.key) : r.key);
  const tot = rows.reduce((a, r) => ({ count: a.count + r.count, qty: a.qty + r.qty, sqm: a.sqm + r.sqm, amount: a.amount + r.amount }), { count: 0, qty: 0, sqm: 0, amount: 0 });
  const metricFmt = metric === "amount" ? (v) => `${money(v)} ${cur}` : fmt;
  const delta = (i) => {
    const prev = rows[i - 1]?.[metric], now = rows[i][metric];
    if (!prev || !now) return null;
    return ((now - prev) / prev) * 100;
  };
  const doExport = () => exportTable({
    filename: `report-${mode}-${mode === "monthly" ? year : "all"}.xlsx`, title: `${t("periodReport")} — ${mode === "monthly" ? year : t("yearly")}`, currency: cur,
    headers: [t("period"), t("nDeliveries"), t("qty"), t("sqm"), `${t("total")} (${cur})`],
    rows: rows.map((r) => [mode === "monthly" ? `${year}-${String(r.key).padStart(2, "0")}` : String(r.key), r.count, r.qty, r.sqm, r.amount]),
    kinds: ["text", "int", "num", "num", "money"], sumCols: [1, 2, 3, 4],
  });

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
          {["monthly", "yearly"].map((k) => <button key={k} onClick={() => setMode(k)} className={`rounded-md px-3 py-1 font-medium ${mode === k ? "bg-white shadow-sm" : "text-slate-500"}`}>{t(k)}</button>)}
        </div>
        {mode === "monthly" && <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select>}
        <select className={sel} value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="sqm">{t("metric")}: {t("metricSqm")}</option><option value="qty">{t("metric")}: {t("metricQty")}</option><option value="amount">{t("metric")}: {t("metricTotal")} ({cur})</option>
        </select>
        <button onClick={doExport} className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download size={16} />{t("exportReport")}</button>
      </div>

      <div className="rounded-xl border border-slate-200 p-3"><BarChart data={rows.map((r) => ({ label: label(r), value: r[metric] }))} fmt={metricFmt} /></div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{["period", "nDeliveries", "qty", "sqm", "total", "change"].map((k) => <th key={k} className="px-4 py-3 text-start font-semibold">{t(k)}{k === "total" ? ` (${cur})` : ""}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const dl = delta(i);
              return (
                <tr key={r.key} className={r.count ? "" : "text-slate-300"}>
                  <td className="px-4 py-3 font-medium">{mode === "monthly" ? `${label(r)} ${year}` : label(r)}</td>
                  <td className="px-4 py-3">{r.count}</td><td className="px-4 py-3">{fmt(r.qty)}</td><td className="px-4 py-3">{fmt(r.sqm)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{money(r.amount)}</td>
                  <td className="px-4 py-3">{dl === null ? "—" : <span className={`inline-flex items-center gap-1 font-medium ${dl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{dl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{Math.abs(dl).toFixed(1)}%</span>}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-bold text-slate-900">
            <tr><td className="px-4 py-3">{t("total")}</td><td className="px-4 py-3">{tot.count}</td><td className="px-4 py-3">{fmt(tot.qty)}</td><td className="px-4 py-3">{fmt(tot.sqm)}</td><td className="whitespace-nowrap px-4 py-3">{money(tot.amount)}</td><td /></tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-400">{t("currencyNote")}</p>
    </div>
  );
}
