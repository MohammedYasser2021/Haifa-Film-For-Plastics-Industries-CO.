import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, LogOut, Users, List, BarChart3 } from "lucide-react";
import { useAuth } from "./lib/auth";
import { useI18n } from "./lib/i18n";
import { fetchDeliveries, saveDelivery, deleteDelivery } from "./lib/api";
import { emptyDelivery, sortList, duplicateDelivery } from "./lib/utils";
import { exportExcel } from "./lib/exportExcel";
import { exportPdf } from "./lib/exportPdf";
import LanguageSwitch from "./components/LanguageSwitch";
import Filters, { applyFilters, emptyFilters } from "./components/Filters";
import PeriodBar from "./components/PeriodBar";
import SortBar from "./components/SortBar";
import Pager from "./components/Pager";
import Reports from "./components/Reports";
import DeliveryTable from "./components/DeliveryTable";
import DeliveryForm from "./components/DeliveryForm";
import DeliverySheet, { SHEET_WIDTH } from "./components/DeliverySheet";
import FitSheet from "./components/FitSheet";
import UsersManager from "./components/UsersManager";
import Stats from "./components/Stats";
import Modal from "./components/Modal";
import logo from "./assets/logo.jpeg";

export default function App() {
  const { t } = useI18n();
  const { role, email, signOut } = useAuth();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState("deliveries");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [pg, setPg] = useState(1);
  const [size, setSize] = useState(25);
  const [modal, setModal] = useState(null); // {type:"view"|"form"|"users", delivery}

  const reload = useCallback(async () => {
    try { setList(await fetchDeliveries()); setMsg(""); } catch { setMsg(t("loadError")); }
  }, [t]);
  useEffect(() => {
    reload();
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload]);

  const filtered = useMemo(() => applyFilters(list, filters), [list, filters]);
  const sorted = useMemo(() => sortList(filtered, sort), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const curPage = Math.min(pg, pages);
  const shown = sorted.slice((curPage - 1) * size, curPage * size);
  useEffect(() => setPg(1), [filters, sort, size]);
  const close = useCallback(() => setModal(null), []);
  const isNew = modal?.type === "form" && !list.some((x) => x.id === modal.delivery.id);
  const canDelete = ["owner", "admin"].includes(role);

  const save = async (d) => {
    try { await saveDelivery(d, !list.some((x) => x.id === d.id)); await reload(); close(); }
    catch (e) { setMsg(e.message === "CONFLICT" ? t("conflict") : t("saveError")); }
  };
  const remove = async (d) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try { await deleteDelivery(d.id); await reload(); } catch (e) { setMsg(e.message === "DENIED" ? t("onlyAdmin") : t("saveError")); }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Haifa Film" className="h-9 w-auto shrink-0 object-contain sm:h-11" />
            <div className="hidden min-w-0 sm:block"><h1 className="truncate text-lg font-bold leading-tight text-slate-900">{t("title")}</h1><p className="truncate text-xs text-slate-500">{t("subtitle")}</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            {role === "owner" && <button onClick={() => setModal({ type: "users" })} title={t("users")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Users size={16} /><span className="hidden md:inline">{t("users")}</span></button>}
            <button onClick={() => setModal({ type: "form", delivery: emptyDelivery() })} title={t("newDelivery")} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:px-4"><Plus size={16} /><span className="hidden sm:inline">{t("newDelivery")}</span></button>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 text-xs text-slate-500 sm:pl-3">
              <span className="hidden lg:inline">{email}</span>
              <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 md:inline">{t(role)}</span>
              <button title={t("signOut")} onClick={signOut} className="rounded p-1.5 hover:bg-slate-100 hover:text-slate-800"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-8 sm:py-6">
        {msg && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</div>}
        <div className="mb-4 inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {[["deliveries", "navDeliveries", List], ["reports", "reports", BarChart3]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => setPage(k)} className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition ${page === k ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={16} />{t(l)}</button>
          ))}
        </div>
        {page === "reports" ? <Reports list={list} /> : <>
        <Stats list={filtered} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <PeriodBar list={list} value={filters} onChange={setFilters} />
          <Filters value={filters} onChange={setFilters} />
          <SortBar sort={sort} onSort={setSort} size={size} onSize={setSize} total={sorted.length} />
          <DeliveryTable list={shown} sort={sort} onSort={setSort}
            onDuplicate={(d) => setModal({ type: "form", delivery: duplicateDelivery(d) })}
            onView={(d) => setModal({ type: "view", delivery: d })}
            onEdit={(d) => setModal({ type: "form", delivery: d })}
            onDelete={canDelete ? remove : null} onExcel={exportExcel} onPdf={exportPdf} />
          <Pager page={curPage} pages={pages} total={sorted.length} size={size} onPage={setPg} />
        </div>
        </>}
      </main>

      {modal?.type === "users" && <Modal size="max-w-4xl" title={t("users")} onClose={close}><UsersManager /></Modal>}
      {modal?.type === "form" && (
        <Modal size="max-w-4xl" title={isNew ? t("newDelivery") : t("editTitle")} subtitle={modal.delivery.orderNo} onClose={close}>
          <DeliveryForm initial={modal.delivery} onSave={save} onCancel={close} />
        </Modal>
      )}
      {modal?.type === "view" && (
        <Modal size="max-w-6xl" title={t("details")} subtitle={modal.delivery.orderNo} onClose={close}>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-6">
            <FitSheet width={SHEET_WIDTH}><DeliverySheet delivery={modal.delivery} /></FitSheet>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-6">
            <button onClick={() => exportExcel(modal.delivery)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("excel")}</button>
            <button onClick={() => exportPdf(modal.delivery)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t("pdf")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
