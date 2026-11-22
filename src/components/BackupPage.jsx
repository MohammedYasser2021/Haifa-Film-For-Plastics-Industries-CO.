import React from "react";
import { FileSpreadsheet, FileJson, Download } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { exportAllExcel, exportJson } from "../lib/exportAll";

export default function BackupPage({ list, customers }) {
  const { t } = useI18n();
  const cards = [
    { icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600", title: t("backupExcel"), desc: t("backupExcelDesc"), run: () => exportAllExcel(list, customers) },
    { icon: FileJson, tone: "bg-amber-50 text-amber-600", title: t("backupJson"), desc: t("backupJsonDesc"), run: () => exportJson(list, customers) },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{list.length} {t("count")} · {customers.length} {t("customers")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, tone, title, desc, run }) => (
          <div key={title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon size={24} /></div>
            <div className="flex-1"><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{desc}</p></div>
            <button onClick={run} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"><Download size={16} />{t("download")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
