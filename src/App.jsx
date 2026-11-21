import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Truck } from "lucide-react";
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

const load = () => { try { return JSON.parse(localStorage.getItem("deliveries")) || []; } catch { return []; } };

export default function App() {
  const { t } = useI18n();
  const [list, setList] = useState(load);
  const [filters, setFilters] = useState(emptyFilters);
  const [modal, setModal] = useState(null); // {type:"view"|"form", delivery}
  useEffect(() => localStorage.setItem("deliveries", JSON.stringify(list)), [list]);
  const shown = useMemo(() => applyFilters(list, filters), [list, filters]);
  const close = useCallback(() => setModal(null), []);

  const save = (d) => { setList((p) => (p.some((x) => x.id === d.id) ? p.map((x) => (x.id === d.id ? d : x)) : [d, ...p])); close(); };
  const remove = (d) => window.confirm(t("confirmDelete")) && setList((p) => p.filter((x) => x.id !== d.id));
  const isNew = modal?.type === "form" && !list.some((x) => x.id === modal.delivery.id);

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
            <button onClick={() => setModal({ type: "form", delivery: emptyDelivery() })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"><Plus size={16} />{t("newDelivery")}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <Stats list={shown} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Filters value={filters} onChange={setFilters} />
          <DeliveryTable list={shown}
            onView={(d) => setModal({ type: "view", delivery: d })}
            onEdit={(d) => setModal({ type: "form", delivery: d })}
            onDelete={remove} onExcel={exportExcel} onPdf={exportPdf} />
        </div>
      </main>

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
