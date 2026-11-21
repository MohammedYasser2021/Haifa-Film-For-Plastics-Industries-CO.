import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Truck, LogOut, Users } from "lucide-react";
import { useAuth } from "./lib/auth";
import { fetchDeliveries, saveDelivery, deleteDelivery } from "./lib/api";
import { useI18n } from "./lib/i18n";
import { emptyDelivery } from "./lib/utils";
import { exportExcel } from "./lib/exportExcel";
import { exportPdf } from "./lib/exportPdf";
import LanguageSwitch from "./components/LanguageSwitch";
import Filters, { applyFilters, emptyFilters } from "./components/Filters";
import DeliveryTable from "./components/DeliveryTable";
import DeliveryForm from "./components/DeliveryForm";
import DeliverySheet from "./components/DeliverySheet";
import Stats from "./components/Stats";
import Modal from "./components/Modal";
import UsersManager from "./components/UsersManager";


export default function App() {
  const { t } = useI18n();
  const { role, email, signOut } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [modal, setModal] = useState(null); // {type:"view"|"form", delivery}
  const reload = useCallback(async () => {
    try { setList(await fetchDeliveries()); setMsg(""); } catch { setMsg(t("loadError")); }
    setLoading(false);
  }, [t]);
  useEffect(() => {
    reload();
    window.addEventListener("focus", reload); // pick up other people's changes
    return () => window.removeEventListener("focus", reload);
  }, [reload]);
  const shown = useMemo(() => applyFilters(list, filters), [list, filters]);
  const close = useCallback(() => setModal(null), []);

  const isNew = modal?.type === "form" && !list.some((x) => x.id === modal.delivery.id);
  const save = async (d) => {
    try { await saveDelivery(d, !list.some((x) => x.id === d.id)); await reload(); close(); }
    catch (e) { setMsg(e.message === "CONFLICT" ? t("conflict") : t("saveError")); }
  };
  const remove = async (d) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try { await deleteDelivery(d.id); await reload(); } catch (e) { setMsg(e.message === "DENIED" ? t("onlyAdmin") : t("saveError")); }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white"><Truck size={22} /></div>
            <div><h1 className="text-lg font-bold leading-tight text-slate-900">{t("title")}</h1><p className="hidden text-xs text-slate-500 sm:block">{t("subtitle")}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 text-xs text-slate-500 md:flex">
              <span>{email}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">{t(role)}</span>
              <button title={t("signOut")} onClick={signOut} className="rounded p-1.5 hover:bg-slate-100 hover:text-slate-800"><LogOut size={16} /></button>
            </div>
            {role === "owner" && <button onClick={() => setModal({ type: "users" })} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Users size={16} />{t("users")}</button>}
            <button onClick={() => setModal({ type: "form", delivery: emptyDelivery() })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"><Plus size={16} />{t("newDelivery")}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {msg && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</div>}
        <Stats list={shown} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Filters value={filters} onChange={setFilters} />
          <DeliveryTable list={shown}
            onView={(d) => setModal({ type: "view", delivery: d })}
            onEdit={(d) => setModal({ type: "form", delivery: d })}
            onDelete={["owner", "admin"].includes(role) ? remove : null} onExcel={exportExcel} onPdf={exportPdf} />
        </div>
      </main>

      {modal?.type === "users" && <Modal size="max-w-4xl" title={t("users")} onClose={close}><UsersManager /></Modal>}
      {modal?.type === "form" && (
        <Modal size="max-w-4xl" title={isNew ? t("newDelivery") : t("editTitle")} subtitle={modal.delivery.orderNo} onClose={close}>
          <DeliveryForm initial={modal.delivery} onSave={save} onCancel={close} />
        </Modal>
      )}
      {modal?.type === "view" && (
        <Modal size="max-w-6xl" title={t("details")} subtitle={modal.delivery.orderNo} onClose={close}>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-6"><div className="mx-auto w-fit shadow-sm"><DeliverySheet delivery={modal.delivery} /></div></div>
          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-3">
            <button onClick={() => exportExcel(modal.delivery)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("excel")}</button>
            <button onClick={() => exportPdf(modal.delivery)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t("pdf")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
