"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair, BreedingRound } from "@/types/breeding";
import { FeedStockSummary } from "@/types/feed";
import { MedicineSchedule } from "@/types/health";
import { MonthlyFinancialSummary, Transaction } from "@/types/finance";

import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { getPairs, getBreedingRounds } from "@/lib/repositories/breedingRepository";
import { getFeedStockSummaries } from "@/lib/repositories/feedRepository";
import { getDueMedicineSchedules } from "@/lib/repositories/healthRepository";
import { getMonthlySummaries, getTransactions } from "@/lib/repositories/financeRepository";
import { calculatePigeonStats, FarmPigeonStats } from "@/lib/calculations/pigeonStats";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RingBadge } from "@/components/pigeons/RingBadge";
import { StatusBadge } from "@/components/pigeons/StatusBadge";
import { MedicineDueCard } from "@/components/health/MedicineDueCard";

import {
  Feather,
  GitFork,
  Wheat,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  Egg,
  Baby,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [stats, setStats] = useState<FarmPigeonStats | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [rounds, setRounds] = useState<BreedingRound[]>([]);
  const [feedSummaries, setFeedSummaries] = useState<FeedStockSummary[]>([]);
  const [dueMedicines, setDueMedicines] = useState<{
    dueToday: MedicineSchedule[];
    upcoming: MedicineSchedule[];
  }>({ dueToday: [], upcoming: [] });
  const [monthlySummaries, setMonthlySummaries] = useState<
    MonthlyFinancialSummary[]
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [
        allPigeons,
        allPairs,
        allRounds,
        allFeed,
        meds,
        financialMonths,
        txns,
      ] = await Promise.all([
        getPigeons(),
        getPairs(),
        getBreedingRounds(),
        getFeedStockSummaries(),
        getDueMedicineSchedules("2026-08-25"),
        getMonthlySummaries(),
        getTransactions(),
      ]);

      setPigeons(allPigeons);
      setStats(calculatePigeonStats(allPigeons));
      setPairs(allPairs);
      setRounds(allRounds);
      setFeedSummaries(allFeed);
      setDueMedicines(meds);
      setMonthlySummaries(financialMonths);
      setRecentTransactions(txns.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleDataChange = () => {
      loadDashboardData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  // Latest month financial summary (August 2026)
  const currentMonthSummary =
    monthlySummaries.length > 0
      ? monthlySummaries[0]
      : {
          year: 2026,
          month: 8,
          monthKey: "2026-08",
          monthLabel: "August 2026",
          totalIncome: 0,
          totalExpense: 0,
          profitLoss: 0,
          transactionCount: 0,
        };

  // Low feed stock items
  const lowFeedItems = feedSummaries.filter(
    (f) => f.status === "LOW" || f.status === "OUT_OF_STOCK"
  );

  // Recent sales
  const recentSales = pigeons.filter((p) => p.status === "SOLD").slice(0, 3);

  // Recent rounds
  const recentBreedingRounds = rounds.slice(0, 3);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3" />
        <span>Loading Himel Agro Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Feather className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Himel Agro ERP • Live Loft Status
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Himel Agro Pigeon Farm
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 leading-relaxed">
            Managing <strong>{stats.totalActive} Active Pigeons</strong> across{" "}
            {Object.keys(stats.breedDistribution).length} breed lines with complete
            genealogy and multi-generational performance tracking.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/pigeons/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Register New Pigeon
            </Link>
            <Link
              href="/breeding/pairs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all"
            >
              <GitFork className="w-4 h-4" /> Form Breeding Pair
            </Link>
          </div>
        </div>
      </div>

      {/* Pigeon KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Flock Population & Inventory (Live)
          </h2>
          <Link
            href="/pigeons"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            View All Pigeons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Pigeons */}
          <Card className="bg-white border-slate-200/80 hover:border-emerald-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">Total Active</span>
                <Feather className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.totalActive}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {stats.totalHistorical} total recorded in ERP
              </span>
            </CardContent>
          </Card>

          {/* Active Males */}
          <Card className="bg-white border-slate-200/80 hover:border-sky-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">Male (Cocks)</span>
                <span className="text-sky-600 font-bold text-sm">♂</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-700">
                {stats.activeMales}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Breeding & racing cocks
              </span>
            </CardContent>
          </Card>

          {/* Active Females */}
          <Card className="bg-white border-slate-200/80 hover:border-pink-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">Female (Hens)</span>
                <span className="text-pink-600 font-bold text-sm">♀</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-700">
                {stats.activeFemales}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Breeding & racing hens
              </span>
            </CardContent>
          </Card>

          {/* Babies / Squabs */}
          <Card className="bg-white border-slate-200/80 hover:border-emerald-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">Babies (Squabs)</span>
                <Baby className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {stats.activeBabies}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nursery & young squabs
              </span>
            </CardContent>
          </Card>

          {/* Available for Sale */}
          <Card className="bg-white border-slate-200/80 hover:border-blue-300 transition-all col-span-2 sm:col-span-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">Available Sale</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700">
                {stats.availableForSale}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ready for enthusiasts
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Monthly Financial Overview ({currentMonthSummary.monthLabel})</span>
            </h3>
          </div>
          <Link
            href="/finance"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Financial Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Monthly Income */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Monthly Income
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatCurrency(currentMonthSummary.totalIncome)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                From pigeon sales
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Monthly Expense
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {formatCurrency(currentMonthSummary.totalExpense)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Feed, medicine, ring tags
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Profit / Loss */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              currentMonthSummary.profitLoss >= 0
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <div>
              <span className="text-[11px] font-bold uppercase block text-slate-700">
                {currentMonthSummary.profitLoss >= 0
                  ? "Monthly Net Profit"
                  : "Monthly Net Loss"}
              </span>
              <span
                className={`text-xl sm:text-2xl font-black ${
                  currentMonthSummary.profitLoss >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatCurrency(currentMonthSummary.profitLoss)}
              </span>
              <span className="text-[10px] text-slate-600 block mt-0.5">
                Profit = Income - Expense
              </span>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentMonthSummary.profitLoss >= 0
                  ? "bg-emerald-200 text-emerald-800"
                  : "bg-rose-200 text-rose-800"
              }`}
            >
              {currentMonthSummary.profitLoss >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Grid: Medicine Due & Low Feed Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine Due Widget */}
        <MedicineDueCard
          dueToday={dueMedicines.dueToday}
          upcoming={dueMedicines.upcoming}
        />

        {/* Feed Stock & Inventory Alerts Widget */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-600" />
              <span>Feed Inventory & Low Stock Alerts</span>
            </CardTitle>
            <Link
              href="/feed"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Manage Feed →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {lowFeedItems.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Low Feed Stock Alert:</span>
                </div>
                {lowFeedItems.map((item) => (
                  <div
                    key={item.feedType}
                    className="flex items-center justify-between text-xs text-amber-900"
                  >
                    <span>{item.feedType}</span>
                    <span className="font-bold">
                      Only {item.currentStockKg}kg left in stock!
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick stock status list */}
            <div className="space-y-2">
              {feedSummaries.slice(0, 4).map((f) => (
                <div
                  key={f.feedType}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800">
                      {f.feedType}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {f.currentStockKg} kg
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Used: {f.totalUsedKg}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid: Breeding & Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Breeding Activity */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Egg className="w-4 h-4 text-emerald-600" />
              <span>Recent Breeding Clutches</span>
            </CardTitle>
            <Link
              href="/breeding"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Breeding Center →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {recentBreedingRounds.map((rnd) => (
              <div
                key={rnd.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 block">
                    {rnd.pairId} — Round #{rnd.roundNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Laid: {formatDate(rnd.date)} • Hatched:{" "}
                    {formatDate(rnd.hatchDate)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">
                    {rnd.babiesHatched} / {rnd.eggsLaid} Hatched
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {rnd.babyPigeonIds.length > 0
                      ? `${rnd.babyPigeonIds.length} Ringed`
                      : "Pending registration"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Pigeon Sales */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Preserved Sale Records</span>
            </CardTitle>
            <Link
              href="/pigeons?status=SOLD"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All Sold Birds →
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No sold pigeons recorded yet.
              </p>
            ) : (
              recentSales.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-blue-50/30 rounded-xl border border-blue-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <RingBadge pigeon={s} size="sm" />
                      <span className="font-bold text-slate-900">
                        {s.breedSubtype || s.breed}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Sold to: <strong>{s.buyer || "Enthusiast"}</strong> on{" "}
                      {formatDate(s.saleDate)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-sm block">
                      +{formatCurrency(s.salePrice || 0)}
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold">
                      Full History Preserved
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
