import React, { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useFeedback } from "./Feedback";
import { buildSalesRows, exportSalesSheet, exportIntoWorkbook, sheetHead } from "../lib/exportSalesSheet";

const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function SalesSheet({ list, customers }) {
  const { t, m, lang } = useI18n();
  const { success, error } = useFeedback();
  const years = useMemo(() => [...new Set([...list.map((d) => d.date.slice(0, 4)), String(new Date().getFullYear())])].sort().reverse(), [list]);
  const latest = list.map((d) => d.date).sort().at(-1) || new Date().toISOString().slice(0, 10);
  const [year, setYear] = useState(latest.slice(0, 4));
  const [month, setMonth] = useState(+latest.slice(5, 7));
  const [busy, setBusy] = useState(false);
  const file = useRef(null);

  const rows = useMemo(() => buildSalesRows(list, customers, year, month, lang), [list, customers, year, month, lang]);
  const count = list.filter((d) => d.date.startsWith(`${year}-${String(month).padStart(2, "0")}`)).length;
  const run = async (fn) => {
    setBusy(true);
    try { await fn(); success(t("downloaded")); }
    catch (e) { error(e.message === "NO_SHEET" ? t("noSheetFound") : t("exportError")); }
    setBusy(false);
  };
  const th = "border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600";
  const td = "border border-slate-200 px-2 py-1 text-center text-xs";

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="font-semibold text-slate-900">{t("salesSheetTitle")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("salesSheetSub")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select>
        <select className={sel} value={month} onChange={(e) => setMonth(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{m(i + 1)}</option>)}</select>
        <span className="text-sm text-slate-500">{t("sheetDeliveries")}: <b className="text-slate-800">{count}</b> · {t("sheetRows")}: <b className="text-slate-800">{rows.length}</b></span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button disabled={busy || !rows.length} onClick={() => run(() => exportSalesSheet(list, customers, year, month, lang))}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"><FileSpreadsheet size={16} />{t("downloadSheet")}</button>
          <button disabled={busy || !rows.length} onClick={() => file.current?.click()} title={t("fillWorkbookHint")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Upload size={16} />{t("fillWorkbook")}</button>
          <input ref={file} type="file" accept=".xlsx" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (f) run(() => exportIntoWorkbook(f, list, customers, year, month, lang));
          }} />
        </div>
      </div>
      {!rows.length ? <p className="py-6 text-center text-sm text-slate-400">{t("noRowsMonth")}</p> : (
        <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse" style={{ fontFamily: '"宋体","SimSun",serif' }}>
            <thead className="sticky top-0"><tr>{sheetHead(lang).map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={td}>{r.date}</td><td className={td}>{r.cust}</td><td className={td}>{r.order}</td><td className={td}>{r.product}</td>
                  <td className={td}>{r.spec}</td><td className={td}>{r.visc}</td><td className={td}>{r.rolls}</td>
                  {r.span > 0 && <td className={td} rowSpan={r.span}>{r.sqm}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
