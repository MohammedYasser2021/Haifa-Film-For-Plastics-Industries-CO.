import React, { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useFeedback } from "./Feedback";
import { Spinner } from "./Spinner";
import ImportReview from "./ImportReview";
import { readOrganizedFile, buildExcelRows } from "../lib/importExcel";

// Import of the organized monthly sheets (one file per month, sheet "Deliveries") into the deliveries of the system.
export default function ImportPage({ list, customers, onSaved }) {
  const { t } = useI18n();
  const { error } = useFeedback();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [built, setBuilt] = useState(null);
  const [key, setKey] = useState(0);
  const input = useRef(null);

  const read = async () => {
    setBusy(true);
    try {
      const records = (await Promise.all(files.map(async (f) => (await readOrganizedFile(f)).map((r) => ({ ...r, ref: `${f.name.replace(/\.xlsx$/i, "")}·${r.ref}` }))))).flat();
      setBuilt(buildExcelRows(records, { customers, existing: list, source: files.map((f) => f.name).join(", ") }));
      setKey((k) => k + 1);
    } catch (e) { error(String(e.message || "").startsWith("NO_") ? t("excelBadFile") : t("importOpenError")); }
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">{t("excelIntro")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FileSpreadsheet size={16} />{t("excelPick")}</button>
          <input ref={input} type="file" multiple accept=".xlsx" className="hidden" onChange={(e) => { setFiles([...e.target.files]); setBuilt(null); e.target.value = ""; }} />
          <button type="button" disabled={!files.length || busy} onClick={read} className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">{busy ? <Spinner size={16} /> : <Upload size={16} />}{t("excelRead")}</button>
        </div>
        {files.length > 0 && <p className="mt-3 text-sm text-slate-600">{files.map((f) => f.name).join(" · ")}</p>}
      </section>
      {built && <ImportReview key={key} built={built} customers={customers} onSaved={onSaved} />}
    </div>
  );
}
