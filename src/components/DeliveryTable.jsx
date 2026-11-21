import React from "react";
import { Eye, Pencil, Trash2, FileSpreadsheet, FileText, Inbox } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { totals, plain, money } from "../lib/utils";

const Btn = ({ title, onClick, cls, children }) => (
  <button title={title} onClick={onClick} className={`rounded-lg p-2 transition ${cls}`}>{children}</button>
);

export default function DeliveryTable({ list, onView, onEdit, onDelete, onExcel, onPdf }) {
  const { t } = useI18n();
  const th = "px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500";
  if (!list.length)
    return <div className="flex flex-col items-center gap-2 p-16 text-slate-400"><Inbox size={40} /><p>{t("empty")}</p></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>{["buyer", "orderNo", "date", "qty", "sqm", "total", "actions"].map((k) => <th key={k} className={th}>{t(k)}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {list.map((d) => {
            const T = totals(d);
            return (
              <tr key={d.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-4 font-medium text-slate-900">{d.buyer}</td>
                <td className="px-5 py-4"><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{d.orderNo}</span></td>
                <td className="px-5 py-4 text-slate-600">{d.date}</td>
                <td className="px-5 py-4 text-slate-700">{plain(T.qty)}</td>
                <td className="px-5 py-4 text-slate-700">{plain(T.sqm)}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{d.currency} {money(T.total)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <Btn title={t("view")} onClick={() => onView(d)} cls="text-slate-500 hover:bg-sky-50 hover:text-sky-600"><Eye size={18} /></Btn>
                  <Btn title={t("edit")} onClick={() => onEdit(d)} cls="text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Pencil size={18} /></Btn>
                  {onDelete && <Btn title={t("delete")} onClick={() => onDelete(d)} cls="text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></Btn>}
                  <span className="mx-1 inline-block h-5 w-px bg-slate-200 align-middle" />
                  <Btn title={t("excel")} onClick={() => onExcel(d)} cls="text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><FileSpreadsheet size={18} /></Btn>
                  <Btn title={t("pdf")} onClick={() => onPdf(d)} cls="text-slate-500 hover:bg-rose-50 hover:text-rose-700"><FileText size={18} /></Btn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
