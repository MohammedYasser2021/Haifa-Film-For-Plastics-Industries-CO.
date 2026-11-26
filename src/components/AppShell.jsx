import React, { useEffect, useState } from "react";
import { List, BarChart3, Building2, Users, Download, Upload, MoreHorizontal, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useI18n } from "../lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import logo from "../assets/logo.png";
import { COMPANY_SHORT, COMPANY_SUB } from "../lib/utils";

const NAV = [
  { k: "deliveries", icon: List, label: "navDeliveries" },
  { k: "reports", icon: BarChart3, label: "reports" },
  { k: "customers", icon: Building2, label: "customers" },
  { k: "import", icon: Upload, label: "navImport", roles: ["owner", "admin"] },
  { k: "users", icon: Users, label: "users", roles: ["owner"] },
  { k: "backup", icon: Download, label: "backup", roles: ["owner"] },
];

export default function AppShell({ page, onPage, role, email, onSignOut, children }) {
  const { t, lang, setLang } = useI18n();
  const [more, setMore] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar") === "collapsed");
  useEffect(() => localStorage.setItem("sidebar", collapsed ? "collapsed" : "open"), [collapsed]);

  const items = NAV.filter((n) => !n.roles || n.roles.includes(role));
  const current = NAV.find((n) => n.k === page);
  const initial = (email || "?")[0].toUpperCase();
  const go = (k) => { onPage(k); setMore(false); window.scrollTo({ top: 0 }); };
  const toggle = (
    <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? t("expandMenu") : t("collapseMenu")} aria-label={collapsed ? t("expandMenu") : t("collapseMenu")}
      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
      {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* ---------- desktop sidebar (can be collapsed) ---------- */}
      <aside className={`fixed inset-y-0 start-0 z-30 hidden flex-col border-e border-slate-200 bg-white transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-64"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 px-2 py-4">
            <img src={logo} alt="Haifa Film" className="h-11 w-auto max-w-[56px] object-contain" />
            {toggle}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-5">
            <img src={logo} alt="Haifa Film" className="h-14 w-auto max-w-[96px] shrink-0 object-contain" />
            <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[15px] font-bold text-slate-900">{COMPANY_SHORT}</p><p className="text-[11px] text-slate-500">{COMPANY_SUB}</p></div>
            {toggle}
          </div>
        )}

        <nav className={`flex-1 space-y-1 ${collapsed ? "px-3" : "px-3"}`}>
          {items.map(({ k, icon: Icon, label }) => (
            <button key={k} onClick={() => go(k)} title={t(label)}
              className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition ${collapsed ? "justify-center" : "gap-3 px-3"} ${page === k ? "border-s-[3px] border-amber-400 bg-sky-50 text-sky-700" : "border-s-[3px] border-transparent text-slate-600 hover:bg-slate-100"}`}>
              <Icon size={20} />{!collapsed && t(label)}
            </button>
          ))}
        </nav>

        {collapsed ? (
          <div className="flex flex-col items-center gap-2 border-t border-slate-100 py-4">
            <button onClick={() => setLang(lang === "en" ? "zh" : "en")} title={t("language")} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200">{lang === "en" ? "中" : "EN"}</button>
            <div title={email} className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{initial}</div>
            <button title={t("signOut")} onClick={onSignOut} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><LogOut size={18} /></button>
          </div>
        ) : (
          <div className="space-y-3 border-t border-slate-100 p-4">
            <LanguageSwitch />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{initial}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{email}</p><p className="text-xs text-slate-500">{t(role)}</p></div>
              <button title={t("signOut")} onClick={onSignOut} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"><LogOut size={18} /></button>
            </div>
          </div>
        )}
      </aside>

      {/* ---------- mobile top bar ---------- */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="Haifa Film" className="h-10 w-auto shrink-0 object-contain" />
          <div className="min-w-0 leading-tight"><p className="truncate text-[11px] text-slate-500">{COMPANY_SHORT} {COMPANY_SUB}</p><p className="truncate text-base font-semibold text-slate-900">{current ? t(current.label) : ""}</p></div>
        </div>
        <LanguageSwitch />
      </header>

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:ps-[76px]" : "lg:ps-64"}`}>
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      </div>

      {/* ---------- mobile bottom bar ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {items.slice(0, 3).map(({ k, icon: Icon, label }) => (
          <button key={k} onClick={() => go(k)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${page === k ? "text-sky-600" : "text-slate-500"}`}>
            <Icon size={22} />{t(label)}
          </button>
        ))}
        <button onClick={() => setMore(true)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${["users", "backup"].includes(page) ? "text-sky-600" : "text-slate-500"}`}>
          <MoreHorizontal size={22} />{t("more")}
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 lg:hidden" onClick={() => setMore(false)}>
          <div className="w-full rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">{initial}</div>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{email}</p><p className="text-xs text-slate-500">{t(role)}</p></div>
            </div>
            {items.slice(3).map(({ k, icon: Icon, label }) => (
              <button key={k} onClick={() => go(k)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-start text-base font-medium text-slate-700 active:bg-slate-100"><Icon size={20} className="text-slate-500" />{t(label)}</button>
            ))}
            <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-start text-base font-medium text-red-600 active:bg-red-50"><LogOut size={20} />{t("signOut")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
