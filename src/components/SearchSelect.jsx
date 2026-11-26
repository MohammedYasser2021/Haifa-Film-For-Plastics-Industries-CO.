import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

// Dropdown that shows ~6 options and scrolls for the rest (+ a search box when the list is long)
export default function SearchSelect({ value, onChange, options, placeholder, className = "" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const hasValue = selected && selected.value !== "";
  const list = options.filter((o) => !q || `${o.label} ${o.sub || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => { setOpen(!open); setQ(""); }}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-start text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
        <span className={`truncate ${hasValue ? "text-slate-900" : "text-slate-500"}`}>{hasValue ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[15rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.length > 8 && (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search size={15} className="absolute start-2.5 top-2.5 text-slate-400" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingInlineStart: 32 }}
                  className="w-full rounded-lg border border-slate-200 py-2 pe-3 text-sm outline-none focus:border-sky-500" />
              </div>
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1">
            {list.map((o) => (
              <li key={o.value}>
                <button type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start text-sm hover:bg-sky-50 ${o.value === value ? "bg-sky-50 font-medium text-sky-700" : "text-slate-700"}`}>
                  <span className="truncate">{o.label}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">{o.sub}{o.value === value && <Check size={15} className="text-sky-600" />}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="px-3 py-3 text-center text-sm text-slate-400">—</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
