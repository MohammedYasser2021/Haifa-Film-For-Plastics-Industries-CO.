import React from "react";
import { Eye, Pencil, Trash2, Copy, FileSpreadsheet, FileText, Inbox, ChevronUp, ChevronDown } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { totals, plain, money, isOther, otherLabel } from "../lib/utils";

const measureText = (d, T) => `${plain(T.other)} ${otherLabel(d)}`.trim();

const Btn = ({ title, onClick, cls, size = "p-2", children }) => (
  <button title={title} aria-label={title} onClick={onClick} className={`rounded-lg transition ${size} ${cls}`}>{children}</button>
);

function Actions({ d, t, p, mobile }) {
  const size = mobile ? "p-2.5" : "p-2";
  return (
    <>
      {!mobile && <Btn size={size} title={t("view")} onClick={() => p.onView(d)} cls="text-slate-500 hover:bg-sky-50 hover:text-sky-600"><Eye size={18} /></Btn>}
      <Btn size={size} title={t("edit")} onClick={() => p.onEdit(d)} cls="text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Pencil size={18} /></Btn>
      <Btn size={size} title={t("duplicate")} onClick={() => p.onDuplicate(d)} cls="text-slate-500 hover:bg-violet-50 hover:text-violet-600"><Copy size={18} /></Btn>
      <Btn size={size} title={t("excel")} onClick={() => p.onExcel(d)} cls="text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><FileSpreadsheet size={18} /></Btn>
      <Btn size={size} title={t("pdf")} onClick={() => p.onPdf(d)} cls="text-slate-500 hover:bg-rose-50 hover:text-rose-700"><FileText size={18} /></Btn>
      {p.onDelete && <Btn size={size} title={t("delete")} onClick={() => p.onDelete(d)} cls="text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></Btn>}
    </>
  );
}

export default function DeliveryTable(props) {
  const { list, sort, onSort, label, selected, onToggle, onTogglePage } = props;
  const { t } = useI18n();
  const selectable = !!(selected && onToggle);                       // checkboxes only for people who may delete
  const allOnPage = selectable && list.length > 0 && list.every((d) => selected.has(d.id));
  const Box = ({ d }) => <input type="checkbox" className="h-4 w-4 cursor-pointer accent-indigo-600" checked={selected.has(d.id)} onChange={() => onToggle(d.id)} aria-label={t("selectedN")} />;
  if (!list.length) return <div className="flex flex-col items-center gap-2 p-16 text-slate-400"><Inbox size={40} /><p>{t("empty")}</p></div>;

  const Head = ({ k, label: text }) => {
    const active = sort.key === k;
    return (
      <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
        <button onClick={() => onSort({ key: k, dir: active && sort.dir === "asc" ? "desc" : "asc" })} className={`flex items-center gap-1 uppercase hover:text-slate-900 ${active ? "text-indigo-700" : ""}`}>
          {text}{active ? (sort.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-20" />}
        </button>
      </th>
    );
  };

  return (
    <>
      {/* tablet / desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {selectable && <th className="w-10 px-3 py-3"><input type="checkbox" className="h-4 w-4 cursor-pointer accent-indigo-600" checked={allOnPage} onChange={() => onTogglePage(list.map((d) => d.id), !allOnPage)} title={t("selectAllPage")} aria-label={t("selectAllPage")} /></th>}
              <Head k="buyer" label={t("buyer")} /><Head k="orderNo" label={t("orderNo")} /><Head k="date" label={t("date")} />
              <Head k="qty" label={t("qty")} /><Head k="sqm" label={t("sqm")} /><Head k="total" label={t("total")} />
              <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((d) => {
              const T = totals(d);
              return (
                <tr key={d.id} className={`transition hover:bg-slate-50/70 ${selectable && selected.has(d.id) ? "bg-indigo-50/60" : ""}`}>
                  {selectable && <td className="w-10 px-3 py-4"><Box d={d} /></td>}
                  <td className="px-5 py-4 font-medium text-slate-900">{label(d)}</td>
                  <td className="px-5 py-4">{d.orderNo ? <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{d.orderNo}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4 text-slate-600">{d.date}</td>
                  <td className="px-5 py-4 text-slate-700">{plain(T.qty)}</td>
                  <td className="px-5 py-4 text-slate-700">{isOther(d) ? measureText(d, T) : plain(T.sqm)}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{money(T.total)} {d.currency}</td>
                  <td className="whitespace-nowrap px-3 py-2"><Actions d={d} t={t} p={props} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* phones: tap a card to open it */}
      <div className="divide-y divide-slate-100 md:hidden">
        {list.map((d) => {
          const T = totals(d);
          return (
            <div key={d.id} onClick={() => props.onView(d)} className="cursor-pointer px-4 pt-4 active:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                {selectable && <div className="pt-1" onClick={(e) => e.stopPropagation()}><Box d={d} /></div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-900">{label(d)}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{d.orderNo || "—"}</p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-base font-bold text-slate-900">{money(T.total)} <span className="text-xs font-medium text-slate-500">{d.currency}</span></p>
                  <p className="text-xs text-slate-400">{d.date}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{plain(T.qty)} {t("roll")} · {isOther(d) ? measureText(d, T) : `${plain(T.sqm)} m²`}</p>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 py-1.5" onClick={(e) => e.stopPropagation()}>
                <Actions d={d} t={t} p={props} mobile />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
