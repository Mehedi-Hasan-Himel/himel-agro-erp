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

import { RingBadge } from "@/components/pigeons/RingBadge";
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
  Pill,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoadError(null);
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
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setLoadError(err?.message || "Failed to load dashboard data. Please try again.");
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

  // 1. Latest month financial summary for current active month (e.g. September 2026)
  const currentMonthSummary =
    monthlySummaries.find(
      (m) => m.monthKey !== "ALL" && m.monthKey.startsWith("2026-")
    ) ||
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

  // 2. Current Year Financial Summary (all active operational months of 2026)
  const currentYearSummary = useMemo(() => {
    const months2026 = monthlySummaries.filter(
      (m) => m.year === 2026 && m.monthKey !== "ALL"
    );
    const totalIncome = months2026.reduce((sum, m) => sum + m.totalIncome, 0);
    const totalExpense = months2026.reduce((sum, m) => sum + m.totalExpense, 0);
    const transactionCount = months2026.reduce(
      (sum, m) => sum + m.transactionCount,
      0
    );
    return {
      year: 2026,
      yearLabel: "Year 2026",
      totalIncome,
      totalExpense,
      profitLoss: totalIncome - totalExpense,
      transactionCount,
      activeMonthsCount: months2026.length,
    };
  }, [monthlySummaries]);

  // 3. Cumulative all-time financial summary across all records (2019–Present)
  const totalFinancialSummary =
    monthlySummaries.find((m) => m.monthKey === "ALL") || {
      year: 2026,
      month: 0,
      monthKey: "ALL",
      monthLabel: "All Time (Cumulative)",
      totalIncome: monthlySummaries.reduce(
        (sum, m) => sum + (m.monthKey !== "ALL" ? m.totalIncome : 0),
        0
      ),
      totalExpense: monthlySummaries.reduce(
        (sum, m) => sum + (m.monthKey !== "ALL" ? m.totalExpense : 0),
        0
      ),
      profitLoss: monthlySummaries.reduce(
        (sum, m) => sum + (m.monthKey !== "ALL" ? m.profitLoss : 0),
        0
      ),
      transactionCount: monthlySummaries.reduce(
        (sum, m) => sum + (m.monthKey !== "ALL" ? m.transactionCount : 0),
        0
      ),
    };

  const historicalExpense =
    monthlySummaries.find((m) => m.monthKey === "2025-12")?.totalExpense || 100000;
  const operationalExpense2026 = currentYearSummary.totalExpense;
  const operationalNet2026 = currentYearSummary.profitLoss;

  // Low feed stock items
  const lowFeedItems = feedSummaries.filter(
    (f) => f.status === "LOW" || f.status === "OUT_OF_STOCK"
  );

  // Recent sales
  const recentSales = pigeons.filter((p) => p.status === "SOLD").slice(0, 3);

  // Recent rounds
  const recentBreedingRounds = rounds.slice(0, 3);
  const activeSerialMap = useMemo(() => getActivePairSerialMap(pairs), [pairs]);

  // Error State Display
  if (loadError && !stats) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Unable to Load Dashboard</h3>
        <p className="text-xs text-slate-500 mb-4">{loadError}</p>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  if (isLoading || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Modern Enterprise Dashboard Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Farm Identity & Status */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200/80 bg-slate-50/50 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              <Image
                src={SITE_CONFIG.logoUrl}
                alt={SITE_CONFIG.farmName}
                width={64}
                height={64}
                className="w-full h-full object-contain"
                unoptimized
                priority
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  Live Loft Census
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {stats.keptBirds} Kept Birds
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {SITE_CONFIG.farmName}
              </h1>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>{SITE_CONFIG.ownerName}</span>
                <span>•</span>
                <span>{SITE_CONFIG.contactNumber}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">Racing Homer & Giribaz Highflyer Loft</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & External Links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
            {/* Primary: Register Pigeon */}
            <Link
              href="/pigeons/new"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Pigeon</span>
            </Link>

            {/* Secondary: Form Pair */}
            <Link
              href="/breeding/pairs"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              <span>Form Pair</span>
            </Link>

            {/* Contact Channels */}
            <div className="flex items-center gap-1.5">
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
                title={`WhatsApp: ${SITE_CONFIG.whatsappNumber}`}
              >
                <span className="font-bold text-[10px] text-emerald-600 bg-emerald-100/70 px-1 py-0.2 rounded">WA</span>
                <span className="hidden sm:inline">WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={SITE_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
                title="Facebook Page"
              >
                <span className="font-bold text-[10px] text-blue-600 bg-blue-100/70 px-1 py-0.2 rounded">FB</span>
                <span className="hidden sm:inline">Facebook</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={SITE_CONFIG.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
                title="Loft Location on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Loft</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Sub-strip: Operational Scope Summary */}
        <div className="pt-3.5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <p className="leading-relaxed">
            Managing <strong className="text-slate-800">{stats.keptBirds} Kept Pigeons</strong> ({stats.racersCount} Racing Homers, {stats.giribazCount} Giribaz Tumblers) across 15 allocated ring bands with 2-way Google Sheet live sync.
          </p>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <span>{stats.activeFemales} Hens</span> • <span>{stats.activeMales} Cocks</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
              <span>{stats.lostCount} Lost</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI / Overview Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Flock Registry Census
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              Live Registry
            </span>
          </div>
          <Link
            href="/pigeons"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
          >
            <span>View All Pigeons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Kept Birds */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Kept Birds</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FlockPigeonIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.keptBirds}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Active in loft • {stats.totalHistorical} rings
            </span>
          </div>

          {/* 2. Racers */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Racers</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.racersCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Racing Homer lines
            </span>
          </div>

          {/* 3. Giribaz */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Giribaz</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Feather className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.giribazCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Highflyers & tumblers
            </span>
          </div>

          {/* 4. Active Females */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Hens</span>
              <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
                <HenPigeonIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.activeFemales}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Breeding & racing hens
            </span>
          </div>

          {/* 5. Active Males */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Cocks</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CockPigeonIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.activeMales}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Breeding & racing cocks
            </span>
          </div>

          {/* 6. Lost Rings */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Lost Rings</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.lostCount}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              Rings 04 & 14 allocated
            </span>
          </div>
        </div>
      </div>

      {/* 3. Centerpiece Table: Live Google Sheet Flock Registry & Loft Roster Widget */}
      <LiveFlockRegistryWidget
        pigeons={pigeons}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* 4. Financial Analytics Suite: Three Sequenced Sections */}
      {/* 4.1 Current Monthly Financial Overview */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TakaIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Current Monthly Financial Overview ({currentMonthSummary.monthLabel})</span>
              </h3>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                Active Month
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating income from bird sales, ongoing feed and medication costs, and net margin for {currentMonthSummary.monthLabel} • {currentMonthSummary.transactionCount} transactions recorded
            </p>
          </div>
          <Link
            href="/finance"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
          >
            <span>Financial Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Monthly Income */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Monthly Income
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
                {formatCurrency(currentMonthSummary.totalIncome)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                From bird sales & services
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Monthly Expense
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-700 tabular-nums">
                {formatCurrency(currentMonthSummary.totalExpense)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Feed, medicine, flock care
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          {/* Monthly Profit / Loss */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between ${
              currentMonthSummary.profitLoss >= 0
                ? "bg-emerald-50/40 border-emerald-200/80"
                : "bg-rose-50/40 border-rose-200/80"
            }`}
          >
            <div>
              <span className="text-xs font-medium text-slate-600 block">
                {currentMonthSummary.profitLoss >= 0
                  ? "Monthly Net Profit"
                  : "Monthly Net Loss"}
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
                  currentMonthSummary.profitLoss >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatCurrency(currentMonthSummary.profitLoss)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Net = Monthly Income - Monthly Expense
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentMonthSummary.profitLoss >= 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {currentMonthSummary.profitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4.2 Current Year Financial Overview */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TakaIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Current Year Financial Overview ({currentYearSummary.yearLabel})</span>
              </h3>
              <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full">
                Calendar Year 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual operational summary tracking all bird sales revenue, feed, medication, and upkeep expenses across {currentYearSummary.activeMonthsCount} operational months of {currentYearSummary.year} • {currentYearSummary.transactionCount} transactions recorded
            </p>
          </div>
          <Link
            href="/finance"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
          >
            <span>2026 Financial Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Yearly Income */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Year-to-Date Revenue
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
                {formatCurrency(currentYearSummary.totalIncome)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Total 2026 bird sales & earnings
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Yearly Expense */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Year-to-Date Operational Expenses
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-700 tabular-nums">
                {formatCurrency(currentYearSummary.totalExpense)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                2026 feeding, health, loft upkeep
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          {/* Yearly Profit / Loss */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between ${
              currentYearSummary.profitLoss >= 0
                ? "bg-emerald-50/40 border-emerald-200/80"
                : "bg-rose-50/40 border-rose-200/80"
            }`}
          >
            <div>
              <span className="text-xs font-medium text-slate-600 block">
                {currentYearSummary.profitLoss >= 0
                  ? "2026 Operating Net Profit"
                  : "2026 Operating Net Balance"}
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
                  currentYearSummary.profitLoss >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatCurrency(currentYearSummary.profitLoss)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Annual Balance = 2026 Sales - 2026 Ops
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentYearSummary.profitLoss >= 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {currentYearSummary.profitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* 2026 Operations Sub-strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Active Operational Months:</span>
            <span className="font-mono font-semibold text-slate-700">{currentYearSummary.activeMonthsCount} Months (Jan – Sep 2026)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Monthly Avg Operational Cost:</span>
            <span className="font-mono font-semibold text-rose-700">
              {formatCurrency(Math.round(currentYearSummary.totalExpense / (currentYearSummary.activeMonthsCount || 1)))} / mo
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">2026 Operating Cash Margin:</span>
            <span className={`font-mono font-semibold ${currentYearSummary.profitLoss >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatCurrency(currentYearSummary.profitLoss)}
            </span>
          </div>
        </div>
      </div>

      {/* 4.3 From Beginning to Today Date Financial Overview */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TakaIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>From Beginning to Today Date Financial Overview (Cumulative 2019 – Present)</span>
              </h3>
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                2019 – Present
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive lifetime financial ledger from loft founding (2019) through today, capturing initial infrastructure setup investment alongside cumulative operational transactions • {totalFinancialSummary.transactionCount} total records
            </p>
          </div>
          <Link
            href="/finance"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
          >
            <span>Full Financial Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Cumulative Income */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Total Cumulative Income
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
                {formatCurrency(totalFinancialSummary.totalIncome)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                All bird sales & farm earnings
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Total Cumulative Expenses */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Total Farm Expenses
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-700 tabular-nums">
                {formatCurrency(totalFinancialSummary.totalExpense)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Setup ({formatCurrency(historicalExpense)}) + 2026 Ops ({formatCurrency(operationalExpense2026)})
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          {/* Cumulative Net Position */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between ${
              totalFinancialSummary.profitLoss >= 0
                ? "bg-emerald-50/40 border-emerald-200/80"
                : "bg-rose-50/40 border-rose-200/80"
            }`}
          >
            <div>
              <span className="text-xs font-medium text-slate-600 block">
                {totalFinancialSummary.profitLoss >= 0
                  ? "Total Net Profit"
                  : "Cumulative Net Position"}
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
                  totalFinancialSummary.profitLoss >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatCurrency(totalFinancialSummary.profitLoss)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Total Balance = Lifetime Income - All Expenses
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                totalFinancialSummary.profitLoss >= 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {totalFinancialSummary.profitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Sub-strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Historical Setup (2019–2025):</span>
            <span className="font-mono font-semibold text-slate-700">{formatCurrency(historicalExpense)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">2026 Operational Expenses:</span>
            <span className="font-mono font-semibold text-rose-700">{formatCurrency(operationalExpense2026)}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">2026 Operating Net (Sales - Ops):</span>
            <span className={`font-mono font-semibold ${operationalNet2026 >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatCurrency(operationalNet2026)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Daily Operations & Inventory Management */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily Operations & Inventory Management
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              Loft Care
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Critical daily health protocols, due medication doses, vaccine schedules, and warehouse grain inventory thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Medicine & Treatment Protocol */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Medicine & Treatment Protocol</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active healthcare courses and pending doses.
                </p>
              </div>
              <Link
                href="/health"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Health Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Due Today */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-md mb-2.5 inline-flex">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Due Today for Administration</span>
                </div>

                {dueMedicines.dueToday.length === 0 ? (
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No medications due today. Flock is in healthy state!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dueMedicines.dueToday.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-amber-50/30 rounded-lg border border-amber-200/60 text-xs space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-slate-900 text-xs">
                            {item.medicineName}
                          </h5>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {item.targetType === "FLOCK"
                              ? "Whole Flock"
                              : `Pigeon ${item.pigeonId}`}
                          </span>
                        </div>
                        {item.dose && (
                          <p className="text-[11px] text-slate-600">
                            <span className="font-medium text-slate-700">Dose:</span> {item.dose}
                          </p>
                        )}
                        {item.purpose && (
                          <p className="text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700">Purpose:</span> {item.purpose}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono">
                          Schedule: {formatDate(item.startDate)} – {formatDate(item.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Courses */}
              {dueMedicines.upcoming.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider block mb-2">
                    Upcoming Planned Courses
                  </span>
                  <div className="space-y-2">
                    {dueMedicines.upcoming.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium text-slate-900">{item.medicineName}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Starts {formatDate(item.startDate)}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                          {item.targetType === "FLOCK" ? "Flock" : "Single Bird"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feed Stock & Inventory Alerts */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-emerald-600" />
                  <span>Feed Inventory & Low Stock Alerts</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Warehouse grain levels, reorder warnings, and usage velocity.
                </p>
              </div>
              <Link
                href="/feed"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Manage Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {lowFeedItems.length > 0 && (
                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Low Feed Stock Alert:</span>
                  </div>
                  {lowFeedItems.map((item) => (
                    <div
                      key={item.feedType}
                      className="flex items-center justify-between text-xs text-amber-900"
                    >
                      <span>{item.feedType}</span>
                      <span className="font-semibold font-mono">
                        Only {item.currentStockKg}kg left in stock!
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Feed Stock Status List */}
              <div className="space-y-2">
                {feedSummaries.slice(0, 4).map((f) => (
                  <div
                    key={f.feedType}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-800 block">
                          {f.feedType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Total used: {f.totalUsedKg}kg
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 font-mono text-sm block">
                        {f.currentStockKg} kg
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        In Warehouse
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Activity & Commercial Records */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent Activity & Commercial Records
            </h2>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
              Loft History
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Active egg clutches, incubation milestones, squab hatchings, and verified buyer sales records.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Recent Breeding Activity */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Egg className="w-4 h-4 text-emerald-600" />
                  <span>Recent Breeding Clutches & Hatching Activity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active nesting rounds, clutch fertility rates, and hatchings.
                </p>
              </div>
              <Link
                href="/breeding"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Breeding Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {recentBreedingRounds.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No recent breeding clutches recorded.
                </div>
              ) : (
                recentBreedingRounds.map((rnd) => (
                  <div
                    key={rnd.id}
                    className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        {activeSerialMap.get(rnd.pairId) && (
                          <span className="font-mono text-[10px] bg-slate-800 text-white px-1.5 py-0.2 rounded font-semibold">
                            #{activeSerialMap.get(rnd.pairId)}
                          </span>
                        )}
                        <span className="font-mono">{rnd.pairId}</span>
                        <span className="text-slate-400 font-normal text-xs">— Round #{rnd.roundNumber}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Laid: {formatDate(rnd.date)} • Hatched:{" "}
                        {formatDate(rnd.hatchDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-700 block font-mono">
                        {rnd.babiesHatched} / {rnd.eggsLaid} Hatched
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rnd.babyPigeonIds.length > 0
                          ? `${rnd.babyPigeonIds.length} Ringed`
                          : "Pending registration"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Pigeon Sales */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <TakaIcon className="w-4 h-4 text-emerald-600" />
                  <span>Preserved Pigeon Sale Records</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Commercial sales with buyer identities and preserved history.
                </p>
              </div>
              <Link
                href="/pigeons?status=SOLD"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>All Sold Birds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {recentSales.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No sold pigeons recorded yet.
                </div>
              ) : (
                recentSales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <RingBadge pigeon={s} size="sm" />
                        <span className="font-semibold text-slate-900">
                          {s.breedSubtype || s.breed}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Sold to: <strong className="text-slate-700">{s.buyer || "Enthusiast"}</strong> on{" "}
                        {formatDate(s.saleDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 text-sm block">
                        +{formatCurrency(s.salePrice || 0)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Preserved History
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
