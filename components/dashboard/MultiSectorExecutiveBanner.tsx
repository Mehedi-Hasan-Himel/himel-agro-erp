"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ArrowRight, ShieldCheck, PieChart, Layers, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";

interface MultiSectorExecutiveBannerProps {
  totalPigeons: number;
  activePigeons: number;
  pigeonPairsCount: number;
  totalGoats: number;
  activeGoats: number;
  pregnantGoatsCount: number;
  operationalProfit: number;
  onSyncClick?: () => void;
  isSyncing?: boolean;
}

export function MultiSectorExecutiveBanner({
  totalPigeons,
  activePigeons,
  pigeonPairsCount,
  totalGoats,
  activeGoats,
  pregnantGoatsCount,
  operationalProfit,
  onSyncClick,
  isSyncing,
}: MultiSectorExecutiveBannerProps) {
  const totalLivestock = activePigeons + activeGoats;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/40">
                Multi-Animal Farming Enterprise
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Combined Executive Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Himel Agro ERP Operations
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Consolidated livestock inventory, pedigree genetics, nutrition stores, and accounts across both <strong>Pigeon Loft</strong> and <strong>Goat Farming</strong> divisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onSyncClick && (
              <button
                type="button"
                onClick={onSyncClick}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Sheets"}</span>
              </button>
            )}

            <Link
              href="/pigeons/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>+ 🕊️ Pigeon</span>
            </Link>

            <Link
              href="/goats/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>+ 🐐 Goat</span>
            </Link>
          </div>
        </div>

        {/* Macro Cross-Sector Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Total Active Livestock
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {totalLivestock} Animals
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {activePigeons} Pigeons + {activeGoats} Goats
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Breeding Units
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {pigeonPairsCount + pregnantGoatsCount}
            </div>
            <span className="text-[11px] text-pink-400 font-medium">
              {pigeonPairsCount} Pairs + {pregnantGoatsCount} Pregnant Does
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Active Sectors
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              2 Sectors
            </div>
            <span className="text-[11px] text-amber-400 font-medium">
              🕊️ Pigeon • 🐐 Goat
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Combined Net Margin
            </span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {formatCurrency(operationalProfit)}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              Across all farm cost centers
            </span>
          </div>
        </div>
      </div>

      {/* Sector Quick Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pigeon Division Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕊️</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pigeon Loft Division</h3>
                <p className="text-[11px] text-slate-500">Breeding lines, rings & pedigree records</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {activePigeons} Birds Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Active Pairs</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{pigeonPairsCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Flock</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{totalPigeons}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Ring Records</span>
              <span className="font-bold text-slate-800 font-mono text-sm">100% Synced</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/pigeons"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore Pigeon Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/breeding/pairs"
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Breeding Pairs →
            </Link>
          </div>
        </div>

        {/* Goat Division Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐐</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Goat Farming Division</h3>
                <p className="text-[11px] text-slate-500">Black Bengal, Jamunapari & maternity log</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {activeGoats} Goats Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Pregnant Does</span>
              <span className="font-bold text-pink-700 font-mono text-sm">{pregnantGoatsCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Herd</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{totalGoats}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Gestation</span>
              <span className="font-bold text-slate-800 font-mono text-sm">150 Days</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/goats"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Explore Goat Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/goats/breeding"
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Maternity Calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
