import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../lib/i18n";

export default function Pager({ page, pages, total, size, onPage }) {
  const { t } = useI18n();
  if (total === 0) return null;
  const a = (page - 1) * size + 1, b = Math.min(page * size, total);
  const btn = "flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>{a}–{b} / {total}</span>
      <div className="flex items-center gap-2">
        <button className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /><span className="hidden sm:inline">{t("prev")}</span></button>
        <span className="px-1">{page} / {pages}</span>
        <button className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}><span className="hidden sm:inline">{t("next")}</span><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
