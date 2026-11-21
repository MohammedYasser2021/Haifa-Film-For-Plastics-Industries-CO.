import React from "react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import Login from "./Login";
import GuestHome from "./GuestHome";

export default function AuthGate({ children }) {
  const { session, role, roleError, signOut } = useAuth();
  const { t } = useI18n();
  if (session === undefined || (session && role === null))
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">{t("loading")}</div>;
  if (!session) return <Login />;
  if (role === "none")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
        <p className="text-slate-700">{t("noAccess")}</p>
        {roleError && <p className="max-w-md break-words rounded bg-slate-200 p-2 font-mono text-xs text-slate-600">{roleError}</p>}
        <button onClick={signOut} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">{t("signOut")}</button>
      </div>
    );
  if (role === "guest") return <GuestHome />;
  return children;
}
