import React, { useState } from "react";
import { useI18n } from "../lib/i18n";
import { currenciesIn } from "../lib/reports";
import PeriodReport from "./PeriodReport";
import BuyersReport from "./BuyersReport";

export default function Reports({ list }) {
  const { t, c } = useI18n();
  const [tab, setTab] = useState("period");
  const [curSel, setCur] = useState("");
  const currencies = currenciesIn(list);
  const cur = currencies.includes(curSel) ? curSel : currencies[0] || "EGP";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
          {[["period", "periodReport"], ["buyers", "buyersReport"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 font-medium ${tab === k ? "bg-white shadow-sm" : "text-slate-500"}`}>{t(l)}</button>)}
        </div>
        {currencies.length > 1 && (
          <select value={cur} onChange={(e) => setCur(e.target.value)} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
            {currencies.map((x) => <option key={x} value={x}>{t("currency")}: {c(x)}</option>)}
          </select>
        )}
      </div>
      {tab === "period" ? <PeriodReport list={list} cur={cur} /> : <BuyersReport list={list} cur={cur} />}
    </div>
  );
}
