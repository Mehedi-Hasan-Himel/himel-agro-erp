"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { getPairs } from "@/lib/repositories/breedingRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { PigeonTable } from "@/components/pigeons/PigeonTable";
import { PigeonGrid } from "@/components/pigeons/PigeonGrid";
import { PlusCircle, LayoutGrid, List, RefreshCw, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useGoogleSheetSync } from "@/lib/hooks/useGoogleSheetSync";

function PigeonsListContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get("status") || "ALL";

  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [isLoading, setIsLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const { isSyncing, syncNow } = useGoogleSheetSync();

  const handleSyncClick = async () => {
    const res = await syncNow();
    if (res?.success) {
      setSyncNotice(`Synced ${res.totalRows} pigeons from Google Sheet`);
      setTimeout(() => setSyncNotice(null), 4000);
    } else if (res?.message) {
      setSyncNotice(`Sync notice: ${res.message}`);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const loadData = async () => {
    try {
      const [allPigeons, allPairs] = await Promise.all([
        getPigeons(),
        getPairs(),
      ]);
      setPigeons(allPigeons);
      setPairs(allPairs);
    } catch (err) {
      console.error("Failed to load pigeons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pigeon Flock Registry
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {pigeons.filter((p) => p.status === "ACTIVE").length} Active Pigeons
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {pigeons.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent identity, genealogy, physical ring records, commercial listings, and current statuses.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white shadow-2xs shrink-0">
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "TABLE"
                  ? "bg-slate-100 text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-slate-100 text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Google Sheets Live Sync Button */}
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isSyncing
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 opacity-80"
                : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100"
            }`}
            title="Synchronize latest changes from Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Sheet"}</span>
            <span className="sm:hidden">{isSyncing ? "..." : "Sync"}</span>
          </button>

          <Link
            href="/pigeons/new"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Register New Pigeon</span>
          </Link>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600 mr-3" />
          <span>Loading pigeon directory...</span>
        </div>
      ) : viewMode === "TABLE" ? (
        <PigeonTable
          pigeons={pigeons}
          pairs={pairs}
          initialStatusFilter={initialStatus}
          onRefresh={loadData}
        />
      ) : (
        <PigeonGrid
          pigeons={pigeons}
          pairs={pairs}
          initialStatusFilter={initialStatus}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

export default function PigeonsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600 mr-3" />
          <span>Loading pigeon directory...</span>
        </div>
      }
    >
      <PigeonsListContent />
    </Suspense>
  );
}
