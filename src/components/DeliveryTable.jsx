import React from "react";
import { Eye, Pencil, Trash2, Copy, FileSpreadsheet, FileText, Inbox, ChevronUp, ChevronDown } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { totals, plain, money } from "../lib/utils";

const Btn = ({ title, onClick, cls, children }) => (
  <button title={title} onClick={onClick} className={`rounded-lg p-2 transition ${cls}`}>{children}</button>
);

function Actions({ d, t, p }) {
  return (
    <>
      <Btn title={t("view")} onClick={() => p.onView(d)} cls="text-slate-500 hover:bg-sky-50 hover:text-sky-600"><Eye size={18} /></Btn>
      <Btn title={t("edit")} onClick={() => p.onEdit(d)} cls="text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Pencil size={18} /></Btn>
      <Btn title={t("duplicate")} onClick={() => p.onDuplicate(d)} cls="text-slate-500 hover:bg-violet-50 hover:text-violet-600"><Copy size={18} /></Btn>
      {p.onDelete && <Btn title={t("delete")} onClick={() => p.onDelete(d)} cls="text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></Btn>}
      <span className="mx-1 inline-block h-5 w-px bg-slate-200 align-middle" />
      <Btn title={t("excel")} onClick={() => p.onExcel(d)} cls="text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><FileSpreadsheet size={18} /></Btn>
      <Btn title={t("pdf")} onClick={() => p.onPdf(d)} cls="text-slate-500 hover:bg-rose-50 hover:text-rose-700"><FileText size={18} /></Btn>
    </>
  );
}

export default function DeliveryTable(props) {
  const { list, sort, onSort } = props;
  const { t } = useI18n();
  if (!list.length) return <div className="flex flex-col items-center gap-2 p-16 text-slate-400"><Inbox size={40} /><p>{t("empty")}</p></div>;

  const Head = ({ k, label }) => {
    const active = sort.key === k;
    return (
      <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
        <button onClick={() => onSort({ key: k, dir: active && sort.dir === "asc" ? "desc" : "asc" })} className={`flex items-center gap-1 uppercase hover:text-slate-900 ${active ? "text-indigo-700" : ""}`}>
          {label}{active ? (sort.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-20" />}
        </button>
      </th>
    );
  };

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Head k="buyer" label={t("buyer")} /><Head k="orderNo" label={t("orderNo")} /><Head k="date" label={t("date")} />
              <Head k="qty" label={t("qty")} /><Head k="sqm" label={t("sqm")} /><Head k="total" label={t("total")} />
              <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">{t("actions")}</th>
            </tr>
          </thead>
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
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{money(T.total)} {d.currency}</td>
                  <td className="whitespace-nowrap px-3 py-2"><Actions d={d} t={t} p={props} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {list.map((d) => {
          const T = totals(d);
          return (
            <div key={d.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{d.buyer}</p>
                  <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">{d.orderNo}</span></div>
                <span className="shrink-0 text-xs text-slate-500">{d.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-400">{t("qty")}</p><p className="font-semibold text-slate-800">{plain(T.qty)}</p></div>
                <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-400">{t("sqm")}</p><p className="font-semibold text-slate-800">{plain(T.sqm)}</p></div>
                <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-400">{t("total")}</p><p className="font-semibold text-slate-800">{money(T.total)} {d.currency}</p></div>
              </div>
              <div className="flex flex-wrap justify-end"><Actions d={d} t={t} p={props} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
