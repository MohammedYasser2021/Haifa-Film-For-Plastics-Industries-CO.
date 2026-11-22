import React, { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { saveCustomer, deleteCustomer } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useFeedback } from "./Feedback";
import { Spinner } from "./Spinner";

const inp = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
export default function CustomersManager({ customers, list, canDelete, onChanged }) {
  const { t } = useI18n();
  const { success, error: toastError, confirm } = useFeedback();
  const [form, setForm] = useState(null); // {id?, nameEn, nameZh, code}
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const count = (id) => list.filter((d) => d.customerId === id).length;
  const shown = customers.filter((c) => !q || [c.nameEn, c.nameZh, c.code].some((x) => x.toLowerCase().includes(q.toLowerCase())));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await saveCustomer(form); setForm(null); await onChanged(); success(t("customerSaved")); }
    catch (e2) { toastError(e2.message === "EXISTS" ? t("customerExists") : t("saveError")); }
    setBusy(false);
  };
  const remove = async (c) => {
    const ok = await confirm({ title: t("deleteCustomerTitle"), message: c.nameEn, confirmText: t("yesDelete"), danger: true });
    if (!ok) return;
    try { await deleteCustomer(c.id); await onChanged(); success(t("customerDeleted")); } catch { toastError(t("saveError")); }
  };

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input className={`${inp} pl-9`} placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button onClick={() => setForm({ nameEn: "", nameZh: "", code: "" })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Plus size={16} />{t("addCustomer")}</button>
      </div>
      {err && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {form && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:grid-cols-3">
          <h3 className="text-sm font-semibold text-slate-800 sm:col-span-3">{form.id ? t("editCustomer") : t("addCustomer")}</h3>
          <label className="block text-xs font-medium text-slate-500">{t("nameEn")}<input required className={`${inp} mt-1`} value={form.nameEn} onChange={set("nameEn")} /></label>
          <label className="block text-xs font-medium text-slate-500">{t("nameZh")}<input className={`${inp} mt-1`} value={form.nameZh} onChange={set("nameZh")} /></label>
          <label className="block text-xs font-medium text-slate-500">{t("code")}<input className={`${inp} mt-1 font-mono uppercase`} value={form.code} onChange={set("code")} placeholder="TBB" /></label>
          <div className="flex justify-end gap-2 sm:col-span-3">
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">{t("cancel")}</button>
            <button disabled={busy} className="flex min-w-[5.5rem] items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{busy ? <Spinner size={18} /> : t("save")}</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{["nameEn", "nameZh", "code", "count", "actions"].map((k) => <th key={k} className="px-4 py-3 text-start font-semibold">{k === "count" ? t("deliveriesWord") : t(k)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">{t("noCustomers")}</td></tr>}
            {shown.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-900">{c.nameEn}</td>
                <td className="px-4 py-3 text-slate-700">{c.nameZh || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.code || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{count(c.id)}</td>
                <td className="whitespace-nowrap px-2 py-1">
                  <button title={t("edit")} onClick={() => setForm({ ...c })} className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Pencil size={18} /></button>
                  {canDelete && <button title={t("delete")} onClick={() => remove(c)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
