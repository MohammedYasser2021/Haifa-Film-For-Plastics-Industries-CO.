import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "./lib/auth";
import { useI18n } from "./lib/i18n";
import { fetchDeliveries, fetchCustomers, saveDelivery, deleteDelivery } from "./lib/api";
import { emptyDelivery, sortList, duplicateDelivery } from "./lib/utils";
import { exportExcel } from "./lib/exportExcel";
import { exportPdf } from "./lib/exportPdf";
import { useFeedback } from "./components/Feedback";
import { PageLoader } from "./components/Spinner";
import AppShell from "./components/AppShell";
import Filters, { applyFilters, emptyFilters } from "./components/Filters";
import SortBar from "./components/SortBar";
import Pager from "./components/Pager";
import Stats from "./components/Stats";
import DeliveryTable from "./components/DeliveryTable";
import DeliveryForm from "./components/DeliveryForm";
import DeliverySheet, { SHEET_WIDTH } from "./components/DeliverySheet";
import FitSheet from "./components/FitSheet";
import Reports from "./components/Reports";
import CustomersManager from "./components/CustomersManager";
import UsersManager from "./components/UsersManager";
import BackupPage from "./components/BackupPage";
import Modal from "./components/Modal";

const TITLES = { deliveries: ["navDeliveries", "deliveriesSub"], reports: ["reports", "reportsSub"], customers: ["customers", "customersSub"], users: ["users", "usersSub"], backup: ["backup", "backupSub"] };
const card = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

export default function App() {
  const { t, lang } = useI18n();
  const { role, email, signOut } = useAuth();
  const { success, error, confirm } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [msg, setMsg] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState("deliveries");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [pg, setPg] = useState(1);
  const [size, setSize] = useState(25);
  const [modal, setModal] = useState(null); // {type:"view"|"form", delivery}

  const reload = useCallback(async () => {
    try { const [d, c] = await Promise.all([fetchDeliveries(), fetchCustomers()]); setList(d); setCustomers(c); setMsg(""); }
    catch { setMsg(t("loadError")); }
    setLoading(false);
  }, [t]);
  useEffect(() => {
    reload();
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload]);

  const custMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const label = useCallback((d) => {
    const c = custMap.get(d.customerId);
    return c ? (lang === "zh" ? c.nameZh || c.nameEn : c.nameEn) : d.buyer;
  }, [custMap, lang]);
  const filtered = useMemo(() => applyFilters(list, filters, customers), [list, filters, customers]);
  const sorted = useMemo(() => sortList(filtered, sort), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const curPage = Math.min(pg, pages);
  const shown = sorted.slice((curPage - 1) * size, curPage * size);
  useEffect(() => setPg(1), [filters, sort, size]);

  const close = useCallback(() => setModal(null), []);
  const canDelete = ["owner", "admin"].includes(role);
  const isNew = modal?.type === "form" && !list.some((x) => x.id === modal.delivery.id);
  const newDelivery = () => setModal({ type: "form", delivery: emptyDelivery() });

  const save = async (d) => {
    try { await saveDelivery(d, !list.some((x) => x.id === d.id)); await reload(); close(); success(t("savedOk")); }
    catch (e) { error(e.message === "CONFLICT" ? t("conflict") : t("saveError")); }
  };
  const remove = async (d) => {
    const ok = await confirm({ title: t("deleteTitle"), message: `${t("confirmDelete")}  ${d.orderNo}`, confirmText: t("yesDelete"), danger: true });
    if (!ok) return;
    try { await deleteDelivery(d.id); await reload(); success(t("deletedOk")); }
    catch (e) { error(e.message === "DENIED" ? t("onlyAdmin") : t("saveError")); }
  };
  const download = (fn) => async (d) => {
    try { await fn(d); success(t("downloaded")); } catch { error(t("exportError")); }
  };
  const doExcel = download(exportExcel);
  const doPdf = download(exportPdf);

  // a page the role may not open falls back to deliveries
  const allowed = ["users", "backup"].includes(page) ? role === "owner" : true;
  const current = allowed ? page : "deliveries";
  const [title, sub] = TITLES[current];

  return (
    <AppShell page={current} onPage={setPage} role={role} email={email} onSignOut={signOut}>
      {/* page heading (desktop) */}
      <div className="mb-6 hidden items-end justify-between gap-4 lg:flex">
        <div><h1 className="text-2xl font-bold text-slate-900">{t(title)}</h1><p className="mt-1 text-sm text-slate-500">{t(sub)}</p></div>
        {current === "deliveries" && (
          <button onClick={newDelivery} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"><Plus size={18} />{t("newDelivery")}</button>
        )}
      </div>

      {msg && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</div>}

      {loading && ["deliveries", "reports", "customers"].includes(current) && <PageLoader />}
      {!loading && current === "deliveries" && (
        <>
          <Stats list={filtered} />
          <div className={card}>
            <Filters value={filters} onChange={setFilters} customers={customers} list={list} />
            <SortBar sort={sort} onSort={setSort} size={size} onSize={setSize} total={sorted.length} />
            <DeliveryTable list={shown} sort={sort} onSort={setSort} label={label}
              onView={(d) => setModal({ type: "view", delivery: d })}
              onEdit={(d) => setModal({ type: "form", delivery: d })}
              onDuplicate={(d) => setModal({ type: "form", delivery: duplicateDelivery(d) })}
              onDelete={canDelete ? remove : null} onExcel={doExcel} onPdf={doPdf} />
            <Pager page={curPage} pages={pages} total={sorted.length} size={size} onPage={setPg} />
          </div>
          {/* floating "new delivery" button on phones / tablets */}
          <button onClick={newDelivery} aria-label={t("newDelivery")}
            className="fixed bottom-20 end-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 lg:hidden"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}><Plus size={26} /></button>
        </>
      )}
      {!loading && current === "reports" && <Reports list={list} label={label} customers={customers} />}
      {!loading && current === "customers" && <div className={card}><CustomersManager customers={customers} list={list} canDelete={canDelete} onChanged={reload} /></div>}
      {current === "users" && <div className={card}><UsersManager /></div>}
      {current === "backup" && <BackupPage list={list} customers={customers} />}

      {modal?.type === "form" && (
        <Modal size="max-w-4xl" title={isNew ? t("newDelivery") : t("editTitle")} subtitle={modal.delivery.orderNo} onClose={close}>
          <DeliveryForm initial={modal.delivery} onSave={save} onCancel={close} customers={customers} />
        </Modal>
      )}
      {modal?.type === "view" && (
        <Modal size="max-w-6xl" title={t("details")} subtitle={modal.delivery.orderNo} onClose={close}>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-6">
            <FitSheet width={SHEET_WIDTH}><DeliverySheet delivery={modal.delivery} /></FitSheet>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-6">
            <button onClick={() => doExcel(modal.delivery)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("excel")}</button>
            <button onClick={() => doPdf(modal.delivery)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t("pdf")}</button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
