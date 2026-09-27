"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Goat, FarmGoatStats, GoatBreedingRecord, GoatHealthRecord, GoatFeedStock } from "@/types/goat";
import {
  getGoats,
  getFarmGoatStats,
  getGoatBreedingRecords,
  getGoatHealthRecords,
  getGoatFeedStock,
} from "@/lib/repositories/goatRepository";
import { formatDate } from "@/lib/formatters/dateFormatter";
import {
  Layers,
  GitFork,
  Activity,
  Wheat,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

export function GoatDashboardView() {
  const [goats, setGoats] = useState<Goat[]>([]);
  const [stats, setStats] = useState<FarmGoatStats | null>(null);
  const [breeding, setBreeding] = useState<GoatBreedingRecord[]>([]);
  const [health, setHealth] = useState<GoatHealthRecord[]>([]);
  const [feed, setFeed] = useState<GoatFeedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGoats(),
      getFarmGoatStats(),
      getGoatBreedingRecords(),
      getGoatHealthRecords(),
      getGoatFeedStock(),
    ]).then(([gList, st, br, hl, fd]) => {
      setGoats(gList);
      setStats(st);
      setBreeding(br);
      setHealth(hl);
      setFeed(fd);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="py-16 text-center text-slate-400">
        Loading Goat Sector Operations...
      </div>
    );
  }

  const pregnantRecords = breeding.filter((b) => b.status === "CONFIRMED_PREGNANT");
  const lowFeedItems = feed.filter((f) => f.status === "LOW");

  return (
    <div className="space-y-6">
      {/* Goat Operations Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-800/80 border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-lg shadow-amber-950/60 shrink-0">
              🐐
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Caprine Livestock Sector
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ● Herd Healthy
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Goat Farm Operations & Herd Dashboard
              </h1>
              <p className="text-xs text-amber-200/70 mt-1 max-w-xl">
                Real-time tracking of Black Bengal fecundity lines, Jamunapari long-ear dairy traits, 150-day gestation schedules, and Napier green roughage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/goats/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Goat</span>
            </Link>
            <Link
              href="/goats"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition-all"
            >
              <span>Herd Roster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Herd
          </span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.activeHerd}</div>
          <span className="text-[10px] text-slate-500 font-medium">{stats.totalGoats} total registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Breeding Bucks
          </span>
          <div className="text-2xl font-black text-blue-700 mt-0.5">{stats.bucksCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Active stud sires</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
            Breeding Does
          </span>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{stats.doesCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Foundation dams</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
            Pregnant Does
          </span>
          <div className="text-2xl font-black text-pink-600 mt-0.5">{stats.pregnantCount}</div>
          <span className="text-[10px] text-pink-700 font-medium">In gestation paddock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Offspring / Kids
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{stats.kidsCount}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Under 6 months</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Sold / Realized
          </span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{stats.soldCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Commercial sales</span>
        </div>
      </div>

      {/* Main Grid: Gestation & Breeding on Left, Nutrition & Health on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Gestation & Maternity Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gestation Calendar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Gestation Calendar & Maternity Alerts (~150 Days)
                </h2>
              </div>
              <Link
                href="/goats/breeding"
                className="text-xs font-semibold text-pink-700 hover:underline"
              >
                View All Breeding Logs →
              </Link>
            </div>

            {pregnantRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active confirmed pregnancies at this time.
              </div>
            ) : (
              <div className="space-y-3">
                {pregnantRecords.map((rec) => {
                  const due = new Date(rec.expectedKiddingDate).getTime();
                  const diffDays = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-pink-50/50 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.doeTagNumber} (Dam)
                          </span>
                          <span className="text-xs text-slate-500">
                            x Sire {rec.buckTagNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mated: {formatDate(rec.matingDate)} • Ultrasound verified
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Expected Kidding Due Date
                        </span>
                        <div className="font-bold text-pink-700 font-mono text-sm">
                          {formatDate(rec.expectedKiddingDate)}
                        </div>
                        <div className="text-[11px] font-bold text-pink-600">
                          {diffDays > 0 ? `In ~${diffDays} days` : "Due Any Day!"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Herd Roster Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Featured Active Herd Members ({goats.length} Goats)
                </h2>
              </div>
              <Link
                href="/goats"
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Complete Registry Table →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goats.slice(0, 4).map((g) => (
                <Link
                  key={g.id}
                  href={`/goats/${g.id}`}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🐐</span>
                    <div>
                      <div className="font-bold text-slate-900">{g.name || g.tagNumber}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {g.tagNumber} • {g.breed}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-slate-700">
                    {g.weightKg ? `${g.weightKg} kg` : "—"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Nutrition Stock & Health Protocols */}
        <div className="space-y-6">
          {/* Nutrition & Forage Stock */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Feed & Forage Stock
                </h2>
              </div>
              <Link
                href="/goats/feed"
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                Feed Details →
              </Link>
            </div>

            <div className="space-y-2.5">
              {feed.map((f) => (
                <div
                  key={f.feedType}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{f.feedType}</div>
                    <span className="text-[10px] text-slate-400">
                      Reorder at: {f.reorderLevelKg} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-slate-900">
                      {f.currentStockKg} kg
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        f.status === "LOW" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Herd Health & Prevention */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Health & Vaccine Protocol
                </h2>
              </div>
              <Link
                href="/goats/health"
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                Health Log →
              </Link>
            </div>

            <div className="space-y-2">
              {health.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">{h.name}</span>
                    <span className="text-[10px] text-purple-700 font-mono">
                      {formatDate(h.date)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Target: {h.targetTagNumber || "Herd"} • {h.dosage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
