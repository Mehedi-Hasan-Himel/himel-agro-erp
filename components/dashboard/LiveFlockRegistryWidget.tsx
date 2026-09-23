"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { DEFAULT_PIGEONS_SHEET_URL } from "@/types/googleSheets";
import { useGoogleSheetSync } from "@/lib/hooks/useGoogleSheetSync";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { RingBadge } from "@/components/pigeons/RingBadge";
import { SexBadge } from "@/components/pigeons/SexBadge";
import { StatusBadge } from "@/components/pigeons/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  CockPigeonIcon,
  HenPigeonIcon,
  SquabIcon,
  FlockPigeonIcon,
} from "@/components/ui/icons";

interface LiveFlockRegistryWidgetProps {
  pigeons: Pigeon[];
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
}

type FilterTab = "ALL" | "KEPT" | "RACERS" | "GIRIBAZ" | "HENS" | "COCKS" | "LOST";

interface BloodlineTag {
  id: string;
  name: string;
  breed: "Racer" | "Giribaz";
  rings: string[];
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const BLOODLINES: BloodlineTag[] = [
  {
    id: "dhaka-blue-bar",
    name: "Dhaka Blue Bar Line",
    breed: "Racer",
    rings: ["03", "12", "13"],
    description: "Dhaka origin foundation Homer stock",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-800",
    badgeBorder: "border-sky-200",
  },
  {
    id: "sherpur-maxi",
    name: "Sherpur Maxi Line",
    breed: "Racer",
    rings: ["06", "09", "15"],
    description: "Sherpur origin speed & endurance stock",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-800",
    badgeBorder: "border-indigo-200",
  },
  {
    id: "chuina-kajkora",
    name: "Chuina Kajkora Line",
    breed: "Giribaz",
    rings: ["01", "02"],
    description: "Pure white eye ring & kajkora highflyers",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
  },
  {
    id: "musaldom",
    name: "Musaldom Highflyer Line",
    breed: "Giribaz",
    rings: ["10", "11"],
    description: "Full black & white tail endurance tumblers",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-800",
    badgeBorder: "border-purple-200",
  },
  {
    id: "chila-gola",
    name: "Chila & Gola Line",
    breed: "Giribaz",
    rings: ["05", "07", "08"],
    description: "Lal Chila, Sobuj Gola & Khoyra Gola performers",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
  },
];

export function LiveFlockRegistryWidget({
  pigeons,
  onRefresh,
  isLoading = false,
}: LiveFlockRegistryWidgetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedBloodline, setSelectedBloodline] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isSyncing, syncNow, syncResult, error } = useGoogleSheetSync({
    autoSyncOnMount: false,
    revalidateOnFocus: false,
  });

  const handleManualSync = async () => {
    await syncNow();
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Helper checks for each pigeon
  const isLost = (p: Pigeon) =>
    p.status === "LOST" ||
    (p.notes || "").toLowerCase().includes("ring lost") ||
    (p.breedSubtype || "").toLowerCase().includes("ring lost");

  const isRacer = (p: Pigeon) =>
    (p.breed || "").toLowerCase().includes("racer");

  const isGiribaz = (p: Pigeon) =>
    (p.breed || "").toLowerCase().includes("giribaz");

  // Dynamic counts
  const counts = useMemo(() => {
    let all = pigeons.length;
    let kept = 0;
    let racers = 0;
    let giribaz = 0;
    let hens = 0;
    let cocks = 0;
    let lost = 0;

    pigeons.forEach((p) => {
      if (isLost(p)) {
        lost += 1;
        return;
      }
      kept += 1;
      if (isRacer(p)) racers += 1;
      if (isGiribaz(p)) giribaz += 1;

      const sex = (p.sex || "").toUpperCase();
      if (sex === "FEMALE") hens += 1;
      else if (sex === "MALE") cocks += 1;
    });

    return { all, kept, racers, giribaz, hens, cocks, lost };
  }, [pigeons]);

  // Sorted and filtered list
  const filteredPigeons = useMemo(() => {
    // 1. Sort strictly by ring serial ascending (01 to 15)
    const sorted = [...pigeons].sort((a, b) => {
      const serialA = a.ringSerial ?? 999;
      const serialB = b.ringSerial ?? 999;
      return serialA - serialB;
    });

    return sorted.filter((p) => {
      const lost = isLost(p);

      // Filter Tab
      if (activeTab === "KEPT" && lost) return false;
      if (activeTab === "LOST" && !lost) return false;
      if (activeTab === "RACERS" && (!isRacer(p) || lost)) return false;
      if (activeTab === "GIRIBAZ" && (!isGiribaz(p) || lost)) return false;
      if (activeTab === "HENS" && ((p.sex || "").toUpperCase() !== "FEMALE" || lost)) return false;
      if (activeTab === "COCKS" && ((p.sex || "").toUpperCase() !== "MALE" || lost)) return false;

      // Bloodline Filter
      if (selectedBloodline) {
        const bl = BLOODLINES.find((b) => b.id === selectedBloodline);
        if (bl) {
          const serialStr = String(p.ringSerial ?? "").padStart(2, "0");
          if (!bl.rings.includes(serialStr)) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const serialStr = String(p.ringSerial ?? "").padStart(2, "0");
        const ringStr = (p.officialRingNumber || "").toLowerCase();
        const breedStr = (p.breed || "").toLowerCase();
        const subtypeStr = (p.breedSubtype || "").toLowerCase();
        const colorStr = (p.colorPattern || "").toLowerCase();
        const fatherStr = (p.fatherDetails || "").toLowerCase();
        const motherStr = (p.motherDetails || "").toLowerCase();
        const notesStr = (p.notes || "").toLowerCase();

        const matches =
          serialStr.includes(query) ||
          ringStr.includes(query) ||
          breedStr.includes(query) ||
          subtypeStr.includes(query) ||
          colorStr.includes(query) ||
          fatherStr.includes(query) ||
          motherStr.includes(query) ||
          notesStr.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [pigeons, activeTab, selectedBloodline, searchQuery]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      {/* 1. Live Header with Sheet Badge, Google Sheets Link & Manual Refresh */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold tracking-wide uppercase border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                Google Sheet Live Sync
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                <Layers className="w-3 h-3 text-slate-500" />
                Sheet 2: Flock Registry
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FlockPigeonIcon className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Flock Registry & Loft Roster</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Real-time synchronized roster of all banded birds (Rings 01–15) directly connected to the official Google Sheet.
            </p>
          </div>

          {/* Action Buttons: Sheet Link + Instant Sync Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <a
              href={DEFAULT_PIGEONS_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-colors shadow-2xs"
              title="Open Google Sheet in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Google Sheet</span>
            </a>

            <button
              onClick={handleManualSync}
              disabled={isSyncing || isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Sync live records from Google Sheet"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSyncing || isLoading ? "animate-spin text-emerald-400" : "text-white"
                }`}
              />
              <span>{isSyncing ? "Syncing..." : "Sync Sheet"}</span>
            </button>

            <Link
              href="/pigeons"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Full Manager</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Sync Status Banner (if synced or errored) */}
        {syncResult && (
          <div className="mt-3.5 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {syncResult.message || "Synced successfully with Google Sheet"} ({counts.all} pigeons recorded)
            </span>
          </div>
        )}
        {error && (
          <div className="mt-3.5 flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 2. Visual Bloodline Strip */}
      <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Foundation Bloodlines:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-x-auto pb-1 md:pb-0">
          {selectedBloodline && (
            <button
              onClick={() => setSelectedBloodline(null)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          )}
          {BLOODLINES.map((bl) => {
            const isSelected = selectedBloodline === bl.id;
            return (
              <button
                key={bl.id}
                onClick={() =>
                  setSelectedBloodline(isSelected ? null : bl.id)
                }
                title={`${bl.description} (Rings: ${bl.rings.join(", ")})`}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs ring-2 ring-emerald-500/20"
                    : `${bl.badgeBg} ${bl.badgeText} ${bl.badgeBorder} hover:brightness-95`
                }`}
              >
                <span>{bl.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-2xs"
                  }`}
                >
                  {bl.rings.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>All Rings</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("KEPT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "KEPT"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kept Birds</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "KEPT" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {counts.kept}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("RACERS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "RACERS"
                ? "bg-sky-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-sky-300" />
            <span>Racers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "RACERS" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800"
              }`}
            >
              {counts.racers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("GIRIBAZ")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "GIRIBAZ"
                ? "bg-teal-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Giribaz</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "GIRIBAZ" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"
              }`}
            >
              {counts.giribaz}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("HENS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "HENS"
                ? "bg-pink-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HenPigeonIcon className="w-3.5 h-3.5" />
            <span>Hens</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "HENS" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-800"
              }`}
            >
              {counts.hens}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COCKS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "COCKS"
                ? "bg-sky-800 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CockPigeonIcon className="w-3.5 h-3.5" />
            <span>Cocks</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "COCKS" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800"
              }`}
            >
              {counts.cocks}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("LOST")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "LOST"
                ? "bg-amber-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Lost Rings</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "LOST" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {counts.lost}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ring, breed, color..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Sequential Table View (01 to 15) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-28">Ring #</th>
              <th className="py-3 px-4">Breed & Subtype</th>
              <th className="py-3 px-4">Color / Pattern</th>
              <th className="py-3 px-3">Sex</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4">Hatch / Month</th>
              <th className="py-3 px-4">Lineage / Parent Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/40">
                  <td className="py-3.5 px-4"><Skeleton className="h-6 w-20 rounded-md" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 rounded" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                  <td className="py-3.5 px-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="py-3.5 px-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : filteredPigeons.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No pigeons match the selected filter or search query.
                </td>
              </tr>
            ) : (
              filteredPigeons.map((pigeon) => {
                const lost = isLost(pigeon);
                const serial = String(pigeon.ringSerial ?? "").padStart(2, "0");

                return (
                  <tr
                    key={pigeon.id || pigeon.officialRingNumber || serial}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      lost ? "bg-amber-50/30 opacity-75" : ""
                    }`}
                  >
                    {/* Ring # */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          #{serial}
                        </span>
                        <RingBadge pigeon={pigeon} size="sm" clickable={!lost} />
                      </div>
                    </td>

                    {/* Breed & Subtype */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              isRacer(pigeon) ? "text-sky-900" : "text-emerald-900"
                            }`}
                          >
                            {pigeon.breed || "Giribaz"}
                          </span>
                          {pigeon.breedSubtype && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                              {pigeon.breedSubtype}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Color / Pattern */}
                    <td className="py-3 px-4">
                      {pigeon.colorPattern ? (
                        <span className="text-slate-800 font-medium">
                          {pigeon.colorPattern}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* Sex */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <SexBadge sex={pigeon.sex} showIcon={true} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={pigeon.status} size="sm" />
                    </td>

                    {/* Hatch Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {pigeon.hatchDate ? formatDate(pigeon.hatchDate) : "—"}
                    </td>

                    {/* Lineage / Notes */}
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500">
                      {pigeon.fatherDetails || pigeon.motherDetails ? (
                        <div className="truncate" title={`Sire: ${pigeon.fatherDetails || "—"} | Dam: ${pigeon.motherDetails || "—"}`}>
                          <span className="font-semibold text-slate-700">P:</span>{" "}
                          {pigeon.fatherDetails ? pigeon.fatherDetails.slice(0, 28) : ""}
                          {pigeon.motherDetails ? ` / ${pigeon.motherDetails.slice(0, 28)}` : ""}
                        </div>
                      ) : pigeon.notes ? (
                        <span className="truncate">{pigeon.notes}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pure loft breeding</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/pigeons/${pigeon.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors shadow-2xs"
                          title="View Pigeon Dossier"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href={`/pigeons/${pigeon.id}/pedigree`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition-colors shadow-2xs"
                          title="View Pedigree Tree"
                        >
                          <GitFork className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">Tree</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Showing <strong>{filteredPigeons.length}</strong> of <strong>{pigeons.length}</strong> rings allocated in 2026.
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {counts.kept} Kept in Loft
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            {counts.lost} Lost Rings (04 & 14)
          </span>
        </div>
      </div>
    </div>
  );
}

export default LiveFlockRegistryWidget;
