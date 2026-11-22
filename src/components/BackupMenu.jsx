import React, { useState } from "react";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { exportAllExcel, exportJson } from "../lib/exportAll";

export default function BackupMenu({ list, customers }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const item = "flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50";
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button onClick={() => setOpen(!open)} title={t("backup")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Download size={16} /><span className="hidden lg:inline">{t("backup")}</span></button>
      {open && (
        <div className="absolute end-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <button className={item} onClick={() => { exportAllExcel(list, customers); setOpen(false); }}><FileSpreadsheet size={16} className="text-emerald-600" />{t("backupExcel")}</button>
          <button className={item} onClick={() => { exportJson(list, customers); setOpen(false); }}><FileJson size={16} className="text-amber-600" />{t("backupJson")}</button>
        </div>
      )}
    </div>
  );
}
