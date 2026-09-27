"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { useSector } from "@/components/context/SectorContext";
import { AnimalSectorConfig } from "@/types/sector";
import {
  LayoutDashboard,
  Feather,
  GitFork,
  HeartHandshake,
  Activity,
  Wheat,
  Settings,
  X,
  PlusCircle,
  MapPin,
  FileSpreadsheet,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { TakaIcon } from "../ui/icons";
import {
  DEFAULT_PIGEONS_SHEET_URL,
  DEFAULT_FINANCE_SHEET_URL,
  DEFAULT_MEDICINE_GUIDE_DOC_URL,
} from "@/types/googleSheets";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const {
    activeSectors,
    isSectorActive,
    toggleSector,
    setAllSectors,
    allConfigs,
    isCombinedMode,
  } = useSector();

  const [pigeonsSheetUrl, setPigeonsSheetUrl] = React.useState(DEFAULT_PIGEONS_SHEET_URL);
  const [financeSheetUrl, setFinanceSheetUrl] = React.useState(DEFAULT_FINANCE_SHEET_URL);
  const [medicineDocUrl, setMedicineDocUrl] = React.useState(DEFAULT_MEDICINE_GUIDE_DOC_URL);
  const [isDocsDropdownOpen, setIsDocsDropdownOpen] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/sync/google-sheets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pigeonsSheetUrl) setPigeonsSheetUrl(data.pigeonsSheetUrl);
        if (data?.financeSheetUrl) setFinanceSheetUrl(data.financeSheetUrl);
        if (data?.medicineDocUrl) setMedicineDocUrl(data.medicineDocUrl);
      })
      .catch(() => {});
  }, []);

  const showPigeon = isSectorActive("PIGEON");
  const showGoat = isSectorActive("GOAT");

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Brand Logo Container */}
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full flex items-center justify-center bg-emerald-950/90 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-slate-900 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all overflow-hidden">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={`${SITE_CONFIG.farmName} Logo`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                unoptimized
                priority
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-white text-sm sm:text-base tracking-tight leading-tight truncate">
              {SITE_CONFIG.farmName}
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              Multi-Sector Agro ERP
            </p>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Global Farming Sector Selector */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
            Farming Sectors
          </span>
          <button
            type="button"
            onClick={setAllSectors}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
              isCombinedMode
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Combined View
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {allConfigs
            .filter((c: AnimalSectorConfig) => c.enabled)
            .map((cfg: AnimalSectorConfig) => {
              const active = isSectorActive(cfg.id);
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => toggleSector(cfg.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    active
                      ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/60 shadow-xs"
                      : "bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                  title={`Toggle ${cfg.name} sector`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm shrink-0">{cfg.icon}</span>
                    <span className="truncate font-bold">{cfg.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    readOnly
                    className="w-3.5 h-3.5 rounded accent-emerald-500 shrink-0 pointer-events-none"
                  />
                </button>
              );
            })}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 space-y-1.5">
        {showPigeon && !showGoat && (
          <Link
            href="/pigeons/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Pigeon</span>
          </Link>
        )}

        {showGoat && !showPigeon && (
          <Link
            href="/goats/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Goat</span>
          </Link>
        )}

        {showPigeon && showGoat && (
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/pigeons/new"
              onClick={onClose}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-all"
            >
              <span>+ 🕊️ Pigeon</span>
            </Link>
            <Link
              href="/goats/new"
              onClick={onClose}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] shadow-sm transition-all"
            >
              <span>+ 🐐 Goat</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-3 overflow-y-auto">
        {/* Core Executive Dashboard */}
        <div className="space-y-0.5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Pigeon Sector Section */}
        {showPigeon && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🕊️</span>
              <span>Pigeon Sector</span>
            </div>
            {[
              { href: "/pigeons", label: "Pigeon Registry", icon: Feather },
              { href: "/breeding/pairs", label: "Breeding Pairs", icon: GitFork },
              { href: "/breeding", label: "Breeding Rounds", icon: HeartHandshake },
              { href: "/health", label: "Health & Medicine", icon: Activity },
              { href: "/feed", label: "Feed & Inventory", icon: Wheat },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-emerald-300" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Goat Sector Section */}
        {showGoat && (
          <div className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🐐</span>
              <span>Goat Sector</span>
            </div>
            {[
              { href: "/goats", label: "Goat Herd Registry", icon: Layers },
              { href: "/goats/breeding", label: "Breeding & Mating", icon: GitFork },
              { href: "/goats/health", label: "Health & Vaccines", icon: Activity },
              { href: "/goats/feed", label: "Feed & Forage", icon: Wheat },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/goats" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-emerald-300" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Shared Operations */}
        <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>🏡</span>
            <span>Shared Operations</span>
          </div>
          {[
            { href: "/finance", label: "Finance & Accounts", icon: TakaIcon },
            { href: "/settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-emerald-300" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Connected Google Sheets & Docs Dropdown Menu */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsDocsDropdownOpen((prev) => !prev)}
              aria-expanded={isDocsDropdownOpen}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0" />
                <span className="truncate font-bold text-slate-200 group-hover:text-white">
                  Google Sheets & Docs
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                    isDocsDropdownOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </div>
            </button>

            {/* Collapsible Dropdown Menu Items */}
            {isDocsDropdownOpen && (
              <div className="mt-1 pl-2.5 space-y-1 ml-2.5 border-l-2 border-emerald-500/30 animate-in fade-in slide-in-from-top-1 duration-150">
                <a
                  href={pigeonsSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60 transition-all group"
                  title="Open Pigeon Flock Registry Google Sheet"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">🕊️</span>
                    <div className="truncate">
                      <span className="block truncate text-slate-200 group-hover:text-emerald-300 transition-colors font-medium">
                        Pigeon Registry Sheet
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        Flock & Ring Master
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1 transition-colors" />
                </a>

                <a
                  href={financeSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60 transition-all group"
                  title="Open Farm Finances & Accounts Google Sheet"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">💰</span>
                    <div className="truncate">
                      <span className="block truncate text-slate-200 group-hover:text-emerald-300 transition-colors font-medium">
                        Finance & Accounts Sheet
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        Ledger & Expenses
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1 transition-colors" />
                </a>

                <a
                  href={medicineDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60 transition-all group"
                  title="Open Pigeon Monthly Medicine Course & Usage Guidelines Google Doc"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📋</span>
                    <div className="truncate">
                      <span className="block truncate text-slate-200 group-hover:text-emerald-300 transition-colors font-medium">
                        Medicine Course Guide
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        মাসিক ঔষধের কোর্স
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1 transition-colors" />
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* PWA Install Button */}
      <div className="px-3 pt-2">
        <PwaInstallButton variant="sidebar" />
      </div>

      {/* Social, WhatsApp & Location Quick Links */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="grid grid-cols-3 gap-1">
          <a
            href={SITE_CONFIG.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-[10px] font-medium border border-blue-700/40 transition-colors"
            title="Facebook Page"
          >
            <span className="font-bold text-blue-400">f</span>
            <span>FB</span>
          </a>
          <a
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-[10px] font-medium border border-emerald-600/40 transition-colors"
            title={`WhatsApp: ${SITE_CONFIG.whatsappNumber}`}
          >
            <span className="font-bold text-emerald-400">WA</span>
            <span>Chat</span>
          </a>
          <a
            href={SITE_CONFIG.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition-colors"
            title="Google Maps Location"
          >
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>Map</span>
          </a>
        </div>

        {/* Farm Status Badge Footer */}
        <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">{SITE_CONFIG.farmName}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Contact:</span>
            <a
              href={SITE_CONFIG.telUrl}
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
            >
              {SITE_CONFIG.contactNumber}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
