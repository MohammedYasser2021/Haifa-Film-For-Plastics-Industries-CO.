import React from "react";
import { Package, Layers, Ruler, Wallet } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { totals, plain, money } from "../lib/utils";

export default function Stats({ list }) {
  const { t } = useI18n();
  const rows = list.map(totals);
  const byCur = list.reduce((o, d, i) => ((o[d.currency] = (o[d.currency] || 0) + rows[i].total), o), {});
  const cards = [
    [Package, t("count"), list.length, "bg-indigo-50 text-indigo-600"],
    [Layers, t("qty"), plain(rows.reduce((s, r) => s + r.qty, 0)), "bg-sky-50 text-sky-600"],
    [Ruler, t("sqm"), plain(rows.reduce((s, r) => s + r.sqm, 0)), "bg-amber-50 text-amber-600"],
    [Wallet, t("total"), Object.keys(byCur).length ? Object.entries(byCur).map(([c, v]) => `${money(v)} ${c}`).join(" · ") : "—", "bg-emerald-50 text-emerald-600"],
  ];
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(([Icon, label, value, tone]) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
          <div className={`rounded-xl p-2 sm:p-3 ${tone}`}><Icon size={22} /></div>
          <div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="truncate text-base font-semibold sm:text-lg text-slate-900">{value}</p></div>
        </div>
      ))}
    </div>
  );
}
