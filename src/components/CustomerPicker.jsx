import React, { useState } from "react";
import { useI18n } from "../lib/i18n";

// type freely OR pick from the customer list (matches English name, Chinese name or code)
export default function CustomerPicker({ customers, buyer, customerId, onChange, inputClass }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const q = buyer.trim().toLowerCase();
  const matches = customers.filter((c) => !q || [c.nameEn, c.nameZh, c.code].some((x) => x.toLowerCase().includes(q)));
  const label = (c) => (lang === "zh" ? c.nameZh || c.nameEn : c.nameEn);
  const other = (c) => (lang === "zh" ? (c.nameZh ? c.nameEn : "") : c.nameZh);

  const type = (text) => {
    const exact = customers.find((c) => c.nameEn.toLowerCase() === text.trim().toLowerCase());
    onChange(exact ? { buyer: exact.nameEn, customerId: exact.id } : { buyer: text, customerId: null });
  };
  return (
    <div className="relative">
      <input className={inputClass} value={buyer} placeholder={t("searchCustomer")} autoComplete="off"
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={(e) => { type(e.target.value); setOpen(true); }} />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {matches.map((c) => (
            <li key={c.id}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); onChange({ buyer: c.nameEn, customerId: c.id }); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm hover:bg-indigo-50 ${c.id === customerId ? "bg-indigo-50" : ""}`}>
                <span className="truncate font-medium text-slate-800">{label(c)}</span>
                <span className="shrink-0 text-xs text-slate-400">{other(c)}{c.code ? ` · ${c.code}` : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {buyer.trim() && !customerId && <p className="mt-1 text-xs text-amber-600">{t("newCustomerHint")}</p>}
    </div>
  );
}
