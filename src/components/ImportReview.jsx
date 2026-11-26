import React, { useState } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useFeedback } from "./Feedback";
import { Spinner } from "./Spinner";
import Modal from "./Modal";
import DeliveryForm from "./DeliveryForm";
import { saveDelivery } from "../lib/api";

// Review table of the import: shows what was found, lets the person fix a delivery with the normal form, and saves the chosen ones.
const BADGE = { ok: "bg-emerald-50 text-emerald-700", review: "bg-amber-50 text-amber-700", error: "bg-red-50 text-red-700", dup: "bg-slate-100 text-slate-600", saved: "bg-indigo-50 text-indigo-700" };
const fill = (s, args) => args.reduce((x, a, i) => x.replaceAll(`{${i}}`, String(a)), s);

export default function ImportReview({ built, customers, onSaved }) {
  const { t } = useI18n();
  const { success, error } = useFeedback();
  const [rows, setRows] = useState(built.rows);
  const [chosen, setChosen] = useState(() => new Set(built.rows.filter((r) => r.status === "ok" || r.status === "review").map((r) => r.id)));
  const [state, setState] = useState({});              // row id -> saving | saved | failed
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectable = (r) => r.status !== "error" && r.status !== "dup" && state[r.id] !== "saved";
  const status = (r) => (state[r.id] === "saved" ? "saved" : r.status);
  const toggle = (id) => setChosen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const pick = rows.filter(selectable);
  const allOn = pick.length > 0 && pick.every((r) => chosen.has(r.id));

  const saveRow = async (row, delivery) => {
    setState((p) => ({ ...p, [row.id]: "saving" }));
    try { await saveDelivery(delivery, true); setState((p) => ({ ...p, [row.id]: "saved" })); return true; }
    catch { setState((p) => ({ ...p, [row.id]: "failed" })); return false; }
  };
  const saveChosen = async () => {
    setSaving(true);
    let ok = 0, bad = 0;
    for (const r of rows.filter((x) => chosen.has(x.id) && selectable(x))) (await saveRow(r, r.delivery)) ? ok++ : bad++;
    setChosen(new Set());
    setSaving(false);
    await onSaved();
    bad ? error(`${t("importSavedN")}: ${ok} · ${t("importFailedN")}: ${bad}`) : success(`${t("importSavedN")}: ${ok}`);
  };
  const saveEdited = async (d) => {
    const row = editing;
    if (await saveRow(row, d)) { setRows((rs) => rs.map((x) => (x.id === row.id ? { ...x, delivery: d } : x))); setEditing(null); await onSaved(); success(t("savedOk")); }
    else error(t("saveError"));
  };

  const count = (f) => rows.filter(f).length;
  const th = "border-b border-slate-200 bg-slate-50 px-3 py-2 text-start text-xs font-semibold text-slate-500";
  const td = "border-b border-slate-100 px-3 py-2 align-top text-sm";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 px-5 py-4 text-sm">
        <b className="text-slate-900">{rows.length} {t("importFound")}</b>
        <span className="text-emerald-700">{count((r) => r.status === "ok")} {t("statusOk")}</span>
        <span className="text-amber-700">{count((r) => ["review", "error"].includes(r.status))} {t("statusReview")}</span>
        {count((r) => r.status === "dup") > 0 && <span className="text-slate-500">{count((r) => r.status === "dup")} {t("statusDup")}</span>}
        <button disabled={saving || !chosen.size} onClick={saveChosen} className="ms-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {saving && <Spinner size={14} />}{t("importSaveSel")} ({chosen.size})</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr>
            <th className={th}><input type="checkbox" checked={allOn} onChange={() => setChosen(allOn ? new Set() : new Set(pick.map((r) => r.id)))} /></th>
            {["date", "buyer", "orderNo", "qty", "sqm", "colStatus"].map((k) => <th key={k} className={th}>{t(k)}</th>)}<th className={th} />
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const st = status(r);
              return (
                <tr key={r.id} className={st === "saved" ? "opacity-60" : ""}>
                  <td className={td}><input type="checkbox" disabled={!selectable(r)} checked={chosen.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className={`${td} whitespace-nowrap`}>{r.delivery.date}</td>
                  <td className={td}>{r.delivery.buyer || "—"}</td>
                  <td className={`${td} font-mono text-xs`}>{r.delivery.orderNo || "—"}</td>
                  <td className={td}>{r.rolls}</td>
                  <td className={`${td} whitespace-nowrap`}>{r.sqm}{r.paperSqm != null && Math.abs(r.paperSqm - r.sqm) > 0.3 && <span className="text-xs text-red-600"> ({t("paperTotal")} {r.paperSqm})</span>}</td>
                  <td className={td}>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[st]}`}>{st === "saved" && <CheckCircle2 size={12} />}{t(`status_${st}`)}</span>
                    {state[r.id] === "failed" && <span className="ms-2 text-xs text-red-600">{t("saveError")}</span>}
                    {state[r.id] === "saving" && <Spinner size={12} />}
                    {st !== "saved" && r.issues.length > 0 && <ul className="mt-1 space-y-0.5 text-xs text-slate-500">{r.issues.map((i, k) => <li key={k}>• {fill(t(`iss_${i.code}`), i.args)}</li>)}</ul>}
                  </td>
                  <td className={td}>{st !== "saved" && <button onClick={() => setEditing(r)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil size={12} />{t("edit")}</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal size="max-w-4xl" title={t("editTitle")} subtitle={`${editing.delivery.date} · ${editing.delivery.orderNo || ""}`} onClose={() => setEditing(null)}>
          <DeliveryForm initial={editing.delivery} onSave={saveEdited} onCancel={() => setEditing(null)} customers={customers} />
        </Modal>
      )}
    </section>
  );
}
