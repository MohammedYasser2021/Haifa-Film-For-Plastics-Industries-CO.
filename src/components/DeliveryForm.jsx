import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Lock, Zap } from "lucide-react";
import { useI18n } from "../lib/i18n";
import CustomerPicker from "./CustomerPicker";
import { Spinner } from "./Spinner";
import { COLORS, LOGOS, VISCOSITY_OPTIONS, CURRENCIES, SUPPLIER, emptyItem, itemSqm, itemTotal, totals, plain, money, num, logoBase, isOther, otherLabel } from "../lib/utils";
import { parseQuickLines } from "../lib/checks";

const base = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

// NOTE: these are defined OUTSIDE the form component so they keep their identity between renders (fixes the focus-loss bug)
function Field({ label, children, className = "" }) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>{children}</label>;
}
function Select({ value, options, onChange, render = (x) => x }) {
  return <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x} value={x}>{render(x)}</option>)}</select>;
}
function NumInput({ value, onChange, suffix, placeholder, field }) {
  return (
    <div className="relative">
      <input type="number" min="0" step="any" inputMode="decimal" data-field={field} className={`${base} ${suffix ? "pr-12" : ""}`} value={value} placeholder={placeholder}
        onWheel={(e) => e.currentTarget.blur()} onChange={(e) => onChange(e.target.value)} />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">{suffix}</span>}
    </div>
  );
}

const untouched = (d) => d.items.length === 1 && !num(d.items[0].width) && !num(d.items[0].length) && !num(d.items[0].qty);

export default function DeliveryForm({ initial, onSave, onCancel, customers = [] }) {
  const { t, o, c } = useI18n();
  const [d, setD] = useState(() => {
    const c = structuredClone(initial);
    c.items = c.items.map((i) => ({ ...i, logo: logoBase(i.logo) }));   // brand names were removed: "Logo:Brand" -> "Logo"
    const code = customers.find((x) => x.id === c.customerId)?.code;
    if (!c.orderNo && code) c.orderNo = `HF${code}`;   // e.g. duplicated delivery keeps its prefix
    return c;
  });
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [quick, setQuick] = useState("");
  const [quickBad, setQuickBad] = useState([]);
  const T = totals(d);
  const listRef = useRef(null);       // the scrolling area of the form
  const scrollToId = useRef(null);    // id of the row that "Add row" just created
  // color, logo, viscosity, thickness and unit price are usually the same for the whole invoice: one field that fills every row
  const common = (k) => (d.items.length && d.items.every((i) => String(i[k]) === String(d.items[0][k])) ? d.items[0][k] : "");
  const setAll = (k, v) => setD((p) => ({ ...p, items: p.items.map((i) => ({ ...i, [k]: v })) }));
  // choosing a customer fills "HF" + its code; whatever the user typed after the prefix (the date) is kept
  const pickCustomer = (v) => setD((p) => {
    const next = { ...p, ...v };
    const code = customers.find((x) => x.id === v.customerId)?.code;
    if (code) {
      const oldCode = customers.find((x) => x.id === p.customerId)?.code;
      const oldPrefix = oldCode ? `HF${oldCode}` : "";
      const prefix = `HF${code}`;
      const cur = p.orderNo || "";
      if (!cur || cur === "HF") next.orderNo = prefix;
      else if (oldPrefix && cur.startsWith(oldPrefix)) next.orderNo = prefix + cur.slice(oldPrefix.length);
    }
    return next;
  });
  const up = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const upItem = (id, k, v) => setD((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, [k]: v } : i)) }));
  const delItem = (id) => setD((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  const addItem = () => {
    const row = emptyItem();
    scrollToId.current = row.id;
    setD((p) => {
      const l = p.items.at(-1);
      return { ...p, items: [...p.items, { ...row, ...(l && { color: l.color, logo: l.logo, viscosity: l.viscosity, thickness: l.thickness, price: l.price }) }] };
    });
  };
  // after "Add row": scroll down to the new row and put the cursor in its Width field, ready to type
  useEffect(() => {
    const id = scrollToId.current;
    if (!id) return;
    scrollToId.current = null;
    const el = listRef.current?.querySelector(`[data-item="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.querySelector('[data-field="width"]')?.focus({ preventScroll: true });
  }, [d.items.length]);
  // 4) "1295x1000 14" lines -> rows; they take thickness / price / color / ... from the last row
  const addQuick = () => {
    const { items, bad } = parseQuickLines(quick);
    setQuickBad(bad);
    setQuick(bad.join("\n"));
    if (!items.length) return;
    setD((p) => {
      const l = p.items.at(-1);
      const spec = l ? { color: l.color, logo: l.logo, viscosity: l.viscosity, thickness: l.thickness, price: l.price } : {};
      const made = items.map((x) => ({ ...emptyItem(), ...spec, ...x }));
      return { ...p, items: untouched(p) ? made : [...p.items, ...made] };
    });
  };
  const submit = async () => {
    const ok = d.buyer.trim() && d.orderNo.trim() && d.items.length && d.items.every((i) => num(i.width) && num(i.length) && num(i.qty));
    if (!ok) return setErr(true);
    setBusy(true);
    try { await onSave({ ...d, buyer: d.buyer.trim(), orderNo: d.orderNo.trim().toUpperCase() }); } finally { setBusy(false); }
  };

  return (
    <>
      <div ref={listRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50/60 px-4 py-4 sm:px-6 sm:py-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t("supplier")} className="lg:col-span-2">
              <div className="relative"><input className={`${base} bg-slate-100 pr-9 text-slate-500`} value={SUPPLIER} disabled /><Lock size={14} className="absolute right-3 top-3 text-slate-400" /></div>
            </Field>
            <Field label={t("date")}><input type="date" className={base} value={d.date} onChange={(e) => up("date", e.target.value)} /></Field>
            <Field label={t("currency")}><Select value={d.currency} options={CURRENCIES} render={c} onChange={(v) => up("currency", v)} /></Field>
            <div className="lg:col-span-2"><span className="mb-1 block text-xs font-medium text-slate-500">{t("buyer")}</span><CustomerPicker customers={customers} buyer={d.buyer} customerId={d.customerId} onChange={pickCustomer} inputClass={base} /></div>
            <Field label={t("orderNo")} className="lg:col-span-2"><input className={`${base} font-mono tracking-wide`} value={d.orderNo} onChange={(e) => up("orderNo", e.target.value.toUpperCase())} placeholder="HFTBB20261101" /></Field>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("orderHint")}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">{t("allRowsTitle")}</h3>
          <p className="mb-3 mt-1 text-xs text-slate-400">{t("allRowsHint")}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t("color")}><Select value={common("color")} options={common("color") === "" ? ["", ...COLORS] : COLORS} render={(x) => (x ? o(x) : t("mixed"))} onChange={(v) => setAll("color", v)} /></Field>
            <Field label={t("logo")}><Select value={common("logo") === "" ? "" : logoBase(common("logo"))} options={common("logo") === "" ? ["", ...LOGOS] : LOGOS} render={(x) => (x ? o(x) : t("mixed"))} onChange={(v) => setAll("logo", v)} /></Field>
            <Field label={t("viscosity")}><Select value={common("viscosity")} options={VISCOSITY_OPTIONS} render={(x) => (x ? o(x) : "—")} onChange={(v) => setAll("viscosity", v)} /></Field>
            <Field label={t("thickness")}><NumInput value={common("thickness")} suffix="mic" placeholder="35" onChange={(v) => setAll("thickness", v)} /></Field>
            <Field label={t("price")}><NumInput value={common("price")} suffix={d.currency} onChange={(v) => setAll("price", v)} /></Field>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("unitLabel")}><Select value={d.measure || "m"} options={["m", "other"]} render={(x) => (x === "other" ? t("unitOther") : t("unitM"))} onChange={(v) => up("measure", v)} /></Field>
              {isOther(d) && <Field label={t("unitName")}><input className={base} value={d.unitName || ""} placeholder="kg" onChange={(e) => up("unitName", e.target.value)} /></Field>}
            </div>
            <p className="mt-2 text-xs text-slate-400">{t("otherHint")}</p>
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-800"><Zap size={15} />{t("quickTitle")}</h3>
          <p className="mb-2 text-xs text-slate-500">{t("quickHint")}</p>
          <div className="flex items-start gap-2">
            <textarea rows={2} className={`${base} font-mono`} value={quick} placeholder={t("quickPlaceholder")}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addQuick(); } }} />
            <button type="button" onClick={addQuick} className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t("quickAdd")}</button>
          </div>
          {quickBad.length > 0 && <p className="mt-2 text-xs text-red-600">{t("quickBad")}: {quickBad.join(" | ")}</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">{t("rows")}</h3>
            <button onClick={addItem} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"><Plus size={16} />{t("addRow")}</button>
          </div>
          {d.items.map((i, idx) => (
            <div key={i.id} data-item={i.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("item")} {idx + 1}</span>
                {d.items.length > 1 && <button onClick={() => delItem(i.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label={t("color")}><Select value={i.color} options={COLORS} render={o} onChange={(v) => upItem(i.id, "color", v)} /></Field>
                <Field label={t("logo")}><Select value={logoBase(i.logo)} options={LOGOS} render={o} onChange={(v) => upItem(i.id, "logo", v)} /></Field>
                <Field label={t("viscosity")}><Select value={i.viscosity} options={VISCOSITY_OPTIONS} render={(x) => (x ? o(x) : "—")} onChange={(v) => upItem(i.id, "viscosity", v)} /></Field>
                <Field label={t("thickness")}><NumInput value={i.thickness} suffix="mic" placeholder="35" onChange={(v) => upItem(i.id, "thickness", v)} /></Field>
                <Field label={t("width")}><NumInput field="width" value={i.width} suffix={t("meter")} onChange={(v) => upItem(i.id, "width", v)} /></Field>
                <Field label={t("length")}><NumInput value={i.length} suffix={t("meter")} onChange={(v) => upItem(i.id, "length", v)} /></Field>
                <Field label={t("qty")}><NumInput value={i.qty} suffix={t("roll")} onChange={(v) => upItem(i.id, "qty", v)} /></Field>
                <Field label={t("price")}><NumInput value={i.price} suffix={d.currency} onChange={(v) => upItem(i.id, "price", v)} /></Field>
              </div>
              <div className="mt-3 flex justify-end gap-6 border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">{t("sqm")}: <b className="text-slate-800">{plain(itemSqm(i))}</b></span>
                <span className="text-slate-500">{t("total")}: <b className="text-slate-800">{money(itemTotal(i))} {d.currency}</b></span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <Field label={t("notes")}><textarea rows={3} className={base} value={d.notes} onChange={(e) => up("notes", e.target.value)} /></Field>
          <Field label={t("receiver")}><input className={base} value={d.receiver} onChange={(e) => up("receiver", e.target.value)} /></Field>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-slate-500">{t("qty")}: <b className="text-slate-900">{plain(T.qty)}</b></span>
          <span className="text-slate-500">{isOther(d) ? otherLabel(d) || "—" : t("sqm")}: <b className="text-slate-900">{isOther(d) ? plain(T.other) : plain(T.sqm)}</b></span>
          <span className="text-slate-500">{t("total")}: <b className="text-red-700">{money(T.total, 3)} {d.currency}</b></span>
        </div>
        <div className="flex items-center gap-2">
          {err && <span className="mr-2 text-sm text-red-600">{t("required")}</span>}
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">{t("cancel")}</button>
          <button onClick={submit} disabled={busy} className="flex min-w-[5.5rem] items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70">{busy ? <Spinner size={18} /> : t("save")}</button>
        </div>
      </div>
    </>
  );
}
