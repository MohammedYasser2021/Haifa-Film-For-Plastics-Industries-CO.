import React, { useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { fmt, money, totals } from "../lib/utils";
import { buyerRows, yearsIn } from "../lib/reports";
import { exportTable } from "../lib/exportReport";

const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
const th = "px-4 py-3 text-start font-semibold";
export default function BuyersReport({ list, cur, label }) {
  const { t } = useI18n();
  const [year, setYear] = useState("");
  const [open, setOpen] = useState(null);
  const rows = buyerRows(list, year, cur, label);
  const buyer = rows.find((b) => b.key === open);
  const Year = <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}><option value="">{t("allYears")}</option>{yearsIn(list).map((y) => <option key={y}>{y}</option>)}</select>;

  if (buyer) {
    const ds = [...buyer.ds].sort((a, b) => b.date.localeCompare(a.date));
    const doExport = () => exportTable({
      filename: `statement-${buyer.name}.xlsx`, title: `${t("statement")} — ${buyer.name}`, currency: cur,
      headers: [t("date"), t("orderNo"), t("qty"), t("sqm"), `${t("total")} (${cur})`],
      rows: ds.map((d) => { const T = totals(d); return [d.date, d.orderNo, T.qty, T.sqm, d.currency === cur ? T.total : 0]; }),
      kinds: ["text", "text", "num", "num", "money"], sumCols: [2, 3, 4],
    });
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setOpen(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />{t("back")}</button>
          <h3 className="text-lg font-semibold text-slate-900">{buyer.name}</h3>{Year}
          <button onClick={doExport} className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download size={16} />{t("exportReport")}</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["date", "orderNo", "qty", "sqm", "total"].map((k) => <th key={k} className={th}>{t(k)}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {ds.map((d) => { const T = totals(d); return (
                <tr key={d.id}><td className="px-4 py-3">{d.date}</td><td className="px-4 py-3 font-mono text-xs">{d.orderNo}</td><td className="px-4 py-3">{fmt(T.qty)}</td><td className="px-4 py-3">{fmt(T.sqm)}</td><td className="whitespace-nowrap px-4 py-3">{money(T.total)} {d.currency}</td></tr>
              ); })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold"><tr><td className="px-4 py-3" colSpan={2}>{t("total")}</td><td className="px-4 py-3">{fmt(buyer.qty)}</td><td className="px-4 py-3">{fmt(buyer.sqm)}</td><td className="whitespace-nowrap px-4 py-3">{money(buyer.amount)} {cur}</td></tr></tfoot>
          </table>
        </div>
        <p className="text-xs text-slate-400">{t("currencyNote")}</p>
      </div>
    );
  }

  const doExport = () => exportTable({
    filename: `buyers-${year || "all"}.xlsx`, title: `${t("buyersReport")} — ${year || t("allYears")}`, currency: cur,
    headers: [t("buyer"), t("nDeliveries"), t("qty"), t("sqm"), `${t("total")} (${cur})`, t("lastDelivery")],
    rows: rows.map((b) => [b.name, b.count, b.qty, b.sqm, b.amount, b.last]),
    kinds: ["text", "int", "num", "num", "money", "text"], sumCols: [1, 2, 3, 4],
  });
  if (!rows.length) return <p className="p-10 text-center text-slate-400">{t("noData")}</p>;
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">{Year}
        <button onClick={doExport} className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download size={16} />{t("exportReport")}</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["buyer", "nDeliveries", "qty", "sqm", "total", "lastDelivery"].map((k) => <th key={k} className={th}>{t(k)}{k === "total" ? ` (${cur})` : ""}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => (
              <tr key={b.key} onClick={() => setOpen(b.key)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-sky-700">{b.name}</td><td className="px-4 py-3">{b.count}</td><td className="px-4 py-3">{fmt(b.qty)}</td><td className="px-4 py-3">{fmt(b.sqm)}</td>
                <td className="whitespace-nowrap px-4 py-3">{money(b.amount)}</td><td className="px-4 py-3 text-slate-500">{b.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">{t("currencyNote")}</p>
    </div>
  );
}
