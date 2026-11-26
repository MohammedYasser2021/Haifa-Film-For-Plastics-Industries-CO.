import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useI18n } from "../lib/i18n";
import { useFeedback } from "./Feedback";
import { Spinner } from "./Spinner";

async function call(action, payload = {}) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  console.log("Current user:", user?.email);
  console.log("Current user ID:", user?.id);
  console.log("Auth error:", authError);

  const { data, error } = await supabase.functions.invoke(
    "manage-users",
    {
      body: { action, ...payload },
    }
  );

  if (error) {
    let msg = error.message;

    try {
      const response = await error.context.json();

      console.error("Full Edge Function Error:", response);

      msg = response.details || response.error || msg;
    } catch {}

    console.error("Function error:", msg);
    throw new Error(msg);
  }

  return data;
}

const ROLES = ["admin", "editor", "guest"];
const inp = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100";
const badge = { owner: "bg-purple-100 text-purple-700", admin: "bg-sky-100 text-sky-700", editor: "bg-sky-100 text-sky-700", guest: "bg-slate-100 text-slate-600" };

export default function UsersManager() {
  const { t } = useI18n();
  const { success, error: toastError, confirm } = useFeedback();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(null); // {id?, email, full_name, role, password}
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setUsers((await call("list")).users); setErr(""); } catch (e) { setErr(e.message); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      if (form.id) await call("update", { id: form.id, role: form.role, full_name: form.full_name, password: form.password || undefined });
      else await call("create", { email: form.email.trim(), full_name: form.full_name, role: form.role, password: form.password });
      success(form.id ? t("userUpdated") : t("userCreated"));
      setForm(null); await load();
    } catch (e2) { toastError(e2.message); }
    setBusy(false);
  };
  const remove = async (u) => {
    const ok = await confirm({ title: t("deleteUserTitle"), message: u.email, confirmText: t("yesDelete"), danger: true });
    if (!ok) return;
    try { await call("delete", { id: u.id }); await load(); success(t("userDeleted")); } catch (e) { toastError(e.message); }
  };
  const [copied, setCopied] = useState(false);
  const gen = () => {
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const a = crypto.getRandomValues(new Uint32Array(12));
    setForm((f) => ({ ...f, password: Array.from(a, (x) => ch[x % ch.length]).join("") }));
  };
  const copy = async () => { await navigator.clipboard.writeText(form.password); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} {t("users")}</p>
        <button onClick={() => setForm({ email: "", full_name: "", role: "editor", password: "" })} className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"><UserPlus size={16} />{t("addUser")}</button>
      </div>
      {err && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {form && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/40 p-4 sm:grid-cols-2">
          <h3 className="text-sm font-semibold text-slate-800 sm:col-span-2">{form.id ? t("editUser") : t("addUser")}</h3>
          <label className="block text-xs font-medium text-slate-500">{t("email")}<input type="email" required disabled={!!form.id} className={`${inp} mt-1`} value={form.email} onChange={set("email")} /></label>
          <label className="block text-xs font-medium text-slate-500">{t("fullName")}<input className={`${inp} mt-1`} value={form.full_name} onChange={set("full_name")} /></label>
          <label className="block text-xs font-medium text-slate-500">{t("role")}
            <select className={`${inp} mt-1`} value={form.role} onChange={set("role")}>{ROLES.map((r) => <option key={r} value={r}>{t(r)}</option>)}</select></label>
          <div className="sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500">{form.id ? t("newPassword") : t("passwordMin")}</span>
            <div className="mt-1 flex gap-2">
              <input type="text" minLength={8} required={!form.id} autoComplete="off" placeholder={form.id ? "••••••••" : ""} className={inp} value={form.password} onChange={set("password")} />
              <button type="button" onClick={gen} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">{t("generate")}</button>
              <button type="button" onClick={copy} disabled={!form.password} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40">{copied ? t("copied") : t("copy")}</button>
            </div>
            {form.id && <p className="mt-1 text-xs text-slate-400">{t("pwHint")}</p>}
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">{t("cancel")}</button>
            <button disabled={busy} className="flex min-w-[5.5rem] items-center justify-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60">{busy ? <Spinner size={18} /> : t("save")}</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{["fullName", "email", "role", "lastLogin", "actions"].map((k) => <th key={k} className={`px-4 py-3 text-start font-semibold ${k === "lastLogin" ? "hidden sm:table-cell" : ""}`}>{t(k)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="py-10 text-center"><Spinner size={30} className="mx-auto text-sky-600" /></td></tr>}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-900">{u.full_name || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${badge[u.role]}`}>{t(u.role)}</span></td>
                <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{u.last_sign_in_at ? u.last_sign_in_at.slice(0, 10) : t("never")}</td>
                <td className="whitespace-nowrap px-2 py-1">
                  {u.role !== "owner" && <>
                    <button title={t("edit")} onClick={() => setForm({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, password: "" })} className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"><Pencil size={18} /></button>
                    <button title={t("delete")} onClick={() => remove(u)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
