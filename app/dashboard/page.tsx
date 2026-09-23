"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { Pigeon } from "@/types/pigeon";
import { Pair, BreedingRound } from "@/types/breeding";
import { FeedStockSummary } from "@/types/feed";
import { MedicineSchedule } from "@/types/health";
import { MonthlyFinancialSummary, Transaction } from "@/types/finance";

import { getPigeons } from "@/lib/repositories/pigeonRepository";
import {
  getPairs,
  getBreedingRounds,
  getActivePairSerialMap,
} from "@/lib/repositories/breedingRepository";
import { getFeedStockSummaries } from "@/lib/repositories/feedRepository";
import { getDueMedicineSchedules } from "@/lib/repositories/healthRepository";
import { getMonthlySummaries, getTransactions } from "@/lib/repositories/financeRepository";
import { calculatePigeonStats, FarmPigeonStats } from "@/lib/calculations/pigeonStats";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RingBadge } from "@/components/pigeons/RingBadge";
import { StatusBadge } from "@/components/pigeons/StatusBadge";
import { MedicineDueCard } from "@/components/health/MedicineDueCard";
import { LiveFlockRegistryWidget } from "@/components/dashboard/LiveFlockRegistryWidget";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

import {
  Feather,
  GitFork,
  Wheat,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  Egg,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Award,
} from "lucide-react";
import {
  SquabIcon,
  CockPigeonIcon,
  HenPigeonIcon,
  FlockPigeonIcon,
  TakaIcon,
} from "@/components/ui/icons";

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
      // Fast path: Try consolidated dashboard endpoint
      const dashRes = await fetch("/api/dashboard").catch(() => null);
      if (dashRes && dashRes.ok) {
        const data = await dashRes.json();
        if (data && Array.isArray(data.pigeons)) {
          const [allFeed, meds, financialMonths] = await Promise.all([
            getFeedStockSummaries(),
            getDueMedicineSchedules(),
            getMonthlySummaries(),
          ]);

          setPigeons(data.pigeons);
          setStats(data.stats || calculatePigeonStats(data.pigeons));
          setPairs(data.pairs || []);
          setRounds(data.rounds || []);
          setFeedSummaries(allFeed);
          setDueMedicines(meds);
          setMonthlySummaries(financialMonths);
          setRecentTransactions((data.transactions || []).slice(0, 5));
          return;
        }
      }

      // Fallback path
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
        getDueMedicineSchedules(),
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

  // Latest month financial summary for current active month (e.g. September 2026)
  const currentMonthSummary =
    monthlySummaries.find((m) => m.monthKey !== "ALL") || {
      year: 2026,
      month: 9,
      monthKey: "2026-09",
      monthLabel: "September 2026",
      totalIncome: 0,
      totalExpense: 0,
      profitLoss: 0,
      transactionCount: 0,
    };

  // Cumulative all-time financial summary across all records (2019–Present)
  const totalFinancialSummary =
    monthlySummaries.find((m) => m.monthKey === "ALL") || {
      year: 2026,
      month: 0,
      monthKey: "ALL",
      monthLabel: "All Time (Cumulative)",
      totalIncome: monthlySummaries.reduce((sum, m) => sum + (m.monthKey !== "ALL" ? m.totalIncome : 0), 0),
      totalExpense: monthlySummaries.reduce((sum, m) => sum + (m.monthKey !== "ALL" ? m.totalExpense : 0), 0),
      profitLoss: monthlySummaries.reduce((sum, m) => sum + (m.monthKey !== "ALL" ? m.profitLoss : 0), 0),
      transactionCount: monthlySummaries.reduce((sum, m) => sum + (m.monthKey !== "ALL" ? m.transactionCount : 0), 0),
    };

  const historicalExpense =
    monthlySummaries.find((m) => m.monthKey === "2025-12")?.totalExpense || 100000;
  const operationalExpense2026 =
    Math.max(0, totalFinancialSummary.totalExpense - historicalExpense);
  const operationalNet2026 =
    totalFinancialSummary.totalIncome - operationalExpense2026;

  // Low feed stock items
  const lowFeedItems = feedSummaries.filter(
    (f) => f.status === "LOW" || f.status === "OUT_OF_STOCK"
  );

  // Recent sales
  const recentSales = pigeons.filter((p) => p.status === "SOLD").slice(0, 3);

  // Recent rounds
  const recentBreedingRounds = rounds.slice(0, 3);
  const activeSerialMap = useMemo(() => getActivePairSerialMap(pairs), [pairs]);

  if (isLoading || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm relative overflow-hidden w-full max-w-full min-w-0">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 min-w-0 w-full">
          {/* Main Brand & Info Area */}
          <div className="flex flex-col gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
            {/* Top Row: Glowing Logo on Left, Live Title + Status on Right */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full">
              {/* Radiant Green Light Glowing Logo Container */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-950/90 ring-4 ring-emerald-400 ring-offset-2 sm:ring-offset-4 ring-offset-emerald-950 shadow-xl sm:shadow-2xl shadow-emerald-400/50 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src={SITE_CONFIG.logoUrl}
                  alt={SITE_CONFIG.farmName}
                  width={240}
                  height={240}
                  className="w-full h-full object-cover"
                  unoptimized
                  priority
                />
              </div>

              {/* Title & Live Status on Right of Logo */}
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1.5 shadow-2xs max-w-full">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="truncate">Live Loft • {stats.keptBirds} Kept Birds</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight break-words">
                  {SITE_CONFIG.farmName}
                </h1>
                <p className="text-emerald-200/90 text-xs sm:text-sm flex items-center gap-2 mt-1 truncate">
                  <span>{SITE_CONFIG.ownerName}</span>
                  <span>•</span>
                  <span>{SITE_CONFIG.contactNumber}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed break-words mt-1 max-w-2xl">
              Managing <strong>{stats.keptBirds} Kept Pigeons</strong> ({stats.racersCount} Racers,{" "}
              {stats.giribazCount} Giribaz) across 15 allocated ring bands with full Google Sheet live sync and genealogy tracking.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/pigeons/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex-1 sm:flex-initial text-center cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Register Pigeon</span>
              </Link>
              <Link
                href="/breeding/pairs"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all flex-1 sm:flex-initial text-center cursor-pointer"
              >
                <GitFork className="w-4 h-4 shrink-0" />
                <span>Form Pair</span>
              </Link>
            </div>
          </div>

          {/* Contact / Social Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-2.5 w-full lg:w-48 xl:w-56 shrink-0 pt-4 lg:pt-0 border-t border-emerald-700/40 lg:border-t-0 mt-2 lg:mt-0">
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition-all w-full text-center"
            >
              <span className="font-black text-sm">WA</span>
              <span className="truncate">WhatsApp ({SITE_CONFIG.whatsappNumber})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </a>
            <a
              href={SITE_CONFIG.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all border border-blue-400/30 w-full text-center"
            >
              <span className="font-black">f</span>
              <span>Facebook Page</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </a>
            <a
              href={SITE_CONFIG.googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shadow-sm transition-all border border-white/10 w-full text-center"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Loft Location</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Pigeon KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Loft Metrics & Flock Summary (Google Sheet)
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              Live Registry
            </span>
          </div>
          <Link
            href="/pigeons"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1"
          >
            View All Pigeons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Kept Birds */}
          <Card className="bg-white border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Kept Birds</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100/90 border border-emerald-200/70 flex items-center justify-center shadow-2xs">
                  <FlockPigeonIcon className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.keptBirds}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Active in loft • {stats.totalHistorical} rings
              </span>
            </CardContent>
          </Card>

          {/* 2. Racers */}
          <Card className="bg-white border-slate-200/80 hover:border-sky-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Racers</span>
                <div className="w-8 h-8 rounded-xl bg-sky-100/90 border border-sky-200/70 flex items-center justify-center shadow-2xs">
                  <Award className="w-4 h-4 text-sky-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-800">
                {stats.racersCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Racing Homer lines
              </span>
            </CardContent>
          </Card>

          {/* 3. Giribaz */}
          <Card className="bg-white border-slate-200/80 hover:border-teal-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Giribaz</span>
                <div className="w-8 h-8 rounded-xl bg-teal-100/90 border border-teal-200/70 flex items-center justify-center shadow-2xs">
                  <Feather className="w-4 h-4 text-teal-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-800">
                {stats.giribazCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Highflyers & tumblers
              </span>
            </CardContent>
          </Card>

          {/* 4. Active Females */}
          <Card className="bg-white border-slate-200/80 hover:border-pink-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Hens</span>
                <div className="w-8 h-8 rounded-xl bg-pink-100/90 border border-pink-200/70 flex items-center justify-center shadow-2xs">
                  <HenPigeonIcon className="w-5 h-5 text-pink-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-800">
                {stats.activeFemales}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Breeding & racing hens
              </span>
            </CardContent>
          </Card>

          {/* 5. Active Males */}
          <Card className="bg-white border-slate-200/80 hover:border-sky-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Cocks</span>
                <div className="w-8 h-8 rounded-xl bg-sky-100/90 border border-sky-200/70 flex items-center justify-center shadow-2xs">
                  <CockPigeonIcon className="w-5 h-5 text-sky-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-800">
                {stats.activeMales}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Breeding & racing cocks
              </span>
            </CardContent>
          </Card>

          {/* 6. Lost Rings */}
          <Card className="bg-white border-slate-200/80 hover:border-amber-300 transition-all shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Lost Rings</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200/70 flex items-center justify-center shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-800">
                {stats.lostCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Rings 04 & 14 allocated
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Centerpiece: Live Google Sheet Flock Registry & Loft Roster Widget */}
      <LiveFlockRegistryWidget
        pigeons={pigeons}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* 1. Monthly Financial Overview Section (Current Active Month) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TakaIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Monthly Financial Overview ({currentMonthSummary.monthLabel})</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                Active Month
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating income, expenses, and net performance for current month • {currentMonthSummary.transactionCount} transactions recorded
            </p>
          </div>
          <Link
            href="/finance"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Financial Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Monthly Income */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Monthly Income
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatCurrency(currentMonthSummary.totalIncome)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                From bird sales & services
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Monthly Expense
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {formatCurrency(currentMonthSummary.totalExpense)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Feed, medicine, flock care
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Profit / Loss */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${
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
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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

      {/* 2. Total Financial Overview Section (Cumulative All-Time) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TakaIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Total Financial Overview (Cumulative All-Time)</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                2019 – Present
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative farm ledger including initial setup & multi-year operations • {totalFinancialSummary.transactionCount} total records
            </p>
          </div>
          <Link
            href="/finance"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Full Financial Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Cumulative Income */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Total Cumulative Income
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatCurrency(totalFinancialSummary.totalIncome)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                All bird sales & farm earnings
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Total Cumulative Expenses */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase block">
                Total Farm Expenses
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {formatCurrency(totalFinancialSummary.totalExpense)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Setup ({formatCurrency(historicalExpense)}) + 2026 Ops ({formatCurrency(operationalExpense2026)})
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          {/* Cumulative Net Position */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${
              totalFinancialSummary.profitLoss >= 0
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <div>
              <span className="text-[11px] font-bold uppercase block text-slate-700">
                {totalFinancialSummary.profitLoss >= 0
                  ? "Total Net Profit"
                  : "Cumulative Net Position"}
              </span>
              <span
                className={`text-xl sm:text-2xl font-black ${
                  totalFinancialSummary.profitLoss >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatCurrency(totalFinancialSummary.profitLoss)}
              </span>
              <span className="text-[10px] text-slate-600 block mt-0.5">
                Total Balance = Income - All Expenses
              </span>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                totalFinancialSummary.profitLoss >= 0
                  ? "bg-emerald-200 text-emerald-800"
                  : "bg-rose-200 text-rose-800"
              }`}
            >
              {totalFinancialSummary.profitLoss >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Sub-strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Historical Setup (2019–2025):</span>
            <span className="font-mono font-bold text-slate-700">{formatCurrency(historicalExpense)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">2026 Operational Expenses:</span>
            <span className="font-mono font-bold text-rose-600">{formatCurrency(operationalExpense2026)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">2026 Operating Net (Sales - Ops):</span>
            <span className={`font-mono font-bold ${operationalNet2026 >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(operationalNet2026)}
            </span>
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
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    {activeSerialMap.get(rnd.pairId) && (
                      <span className="font-mono text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black shadow-2xs">
                        #{activeSerialMap.get(rnd.pairId)}
                      </span>
                    )}
                    <span>{rnd.pairId}</span>
                    <span className="text-slate-400 font-normal font-sans text-xs">— Round #{rnd.roundNumber}</span>
                  </div>
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
              <TakaIcon className="w-4 h-4 text-blue-600" />
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
