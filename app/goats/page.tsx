"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Goat, GoatStatus, GoatSex } from "@/types/goat";
import { getGoats, getFarmGoatStats } from "@/lib/repositories/goatRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { PlusCircle, LayoutGrid, List, Search, GitFork, ArrowUpRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/formatters/dateFormatter";

function GoatsRegistryContent() {
  const [goats, setGoats] = useState<Goat[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sexFilter, setSexFilter] = useState<string>("ALL");
  const [breedFilter, setBreedFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const allGoats = await getGoats();
      setGoats(allGoats);
    } catch (err) {
      console.error("Failed to load goats:", err);
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

  const activeCount = goats.filter((g) => g.status === "ACTIVE" || g.status === "PREGNANT" || g.status === "LACTATING").length;
  const pregnantCount = goats.filter((g) => g.status === "PREGNANT" || g.pregnancyStatus === "PREGNANT").length;
  const bucksCount = goats.filter((g) => g.sex === "MALE" && g.status !== "SOLD" && g.status !== "DEAD").length;
  const doesCount = goats.filter((g) => g.sex === "FEMALE" && g.status !== "SOLD" && g.status !== "DEAD").length;

  const filteredGoats = goats.filter((g) => {
    if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
    if (sexFilter !== "ALL" && g.sex !== sexFilter) return false;
    if (breedFilter !== "ALL" && !g.breed?.toLowerCase().includes(breedFilter.toLowerCase())) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const tag = (g.tagNumber || "").toLowerCase();
      const name = (g.name || "").toLowerCase();
      const breed = (g.breed || "").toLowerCase();
      const pen = (g.penLocation || "").toLowerCase();
      const notes = (g.notes || "").toLowerCase();
      if (!tag.includes(q) && !name.includes(q) && !breed.includes(q) && !pen.includes(q) && !notes.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Goat Herd Registry
            </h1>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {activeCount} Active Herd
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {goats.length} Total Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ear tag identity, pedigree lineage, reproductive state, weights, and paddock locations.
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

          <Link
            href="/goats/new"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Register New Goat</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Breeding Bucks</span>
            <span>🐐</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{bucksCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Sires & young males</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Breeding Does</span>
            <span>🐐</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{doesCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Dams & mature does</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pregnant Does</span>
            <span>💖</span>
          </div>
          <div className="text-2xl font-black text-pink-600">{pregnantCount}</div>
          <span className="text-[11px] text-pink-600 font-medium">In gestation paddock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Herd</span>
            <span>🌿</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">{goats.filter(g => g.status === 'SOLD').length} sold to date</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tag number, name, breed, pen..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Herd</option>
              <option value="PREGNANT">Pregnant</option>
              <option value="LACTATING">Lactating</option>
              <option value="SOLD">Sold</option>
              <option value="DEAD">Deceased</option>
            </select>
          </div>

          <div>
            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Bucks (Male)</option>
              <option value="FEMALE">Does (Female)</option>
              <option value="CASTRATED_MALE">Castrated Wethers</option>
            </select>
          </div>

          <div>
            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Breeds</option>
              <option value="Bengal">Black Bengal</option>
              <option value="Jamunapari">Jamunapari</option>
              <option value="Boer">Boer / Boer Cross</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List Display */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">Loading goat herd registry...</div>
      ) : filteredGoats.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <p className="text-slate-500 text-sm font-semibold">No goats found matching your filters.</p>
          <Link
            href="/goats/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" /> Register New Goat
          </Link>
        </div>
      ) : viewMode === "TABLE" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ear Tag</th>
                  <th className="py-3 px-4">Name & Breed</th>
                  <th className="py-3 px-4">Sex</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Pen Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGoats.map((goat) => {
                  const isPregnant = goat.status === "PREGNANT" || goat.pregnancyStatus === "PREGNANT";
                  const isLactating = goat.status === "LACTATING";
                  const isSold = goat.status === "SOLD";

                  return (
                    <tr key={goat.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tag Number */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                        <Link
                          href={`/goats/${goat.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                        >
                          <span>🏷️</span>
                          <span>{goat.tagNumber}</span>
                        </Link>
                      </td>

                      {/* Name & Breed */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">
                          {goat.name || "Unnamed"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {goat.breed} {goat.breedSubtype ? `• ${goat.breedSubtype}` : ""}
                        </div>
                      </td>

                      {/* Sex */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            goat.sex === "MALE"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : goat.sex === "FEMALE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {goat.sex === "MALE" ? "♂ Buck" : goat.sex === "FEMALE" ? "♀ Doe" : "Wether"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPregnant
                              ? "bg-pink-50 text-pink-700 border border-pink-200 animate-pulse"
                              : isLactating
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : isSold
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isPregnant ? "💖 Pregnant" : isLactating ? "🍼 Lactating" : isSold ? "🏷️ Sold" : "Active"}
                        </span>
                        {isPregnant && goat.expectedKiddingDate && (
                          <div className="text-[10px] text-pink-600 font-medium mt-0.5">
                            Due: {formatDate(goat.expectedKiddingDate)}
                          </div>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {goat.weightKg ? `${goat.weightKg} kg` : "—"}
                      </td>

                      {/* Pen Location */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {goat.penLocation || "General Shed"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/goats/${goat.id}/pedigree`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                            title="View Pedigree Tree"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/goats/${goat.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoats.map((goat) => {
            const isPregnant = goat.status === "PREGNANT" || goat.pregnancyStatus === "PREGNANT";
            return (
              <div
                key={goat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🐐</span>
                    <div>
                      <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                        {goat.tagNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{goat.name || "Unnamed"}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isPregnant
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {goat.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Breed</span>
                    <span className="font-semibold text-slate-700">{goat.breed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sex & Horns</span>
                    <span className="font-semibold text-slate-700">
                      {goat.sex === "MALE" ? "Buck" : "Doe"} • {goat.hornStatus || "Polled"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weight</span>
                    <span className="font-bold font-mono text-slate-800">
                      {goat.weightKg ? `${goat.weightKg} kg` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pen</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {goat.penLocation || "Main Shed"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/goats/${goat.id}/pedigree`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700"
                  >
                    <GitFork className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pedigree</span>
                  </Link>

                  <Link
                    href={`/goats/${goat.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    <span>View Dossier</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GoatsRegistryPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400">Loading Goats...</div>}>
      <GoatsRegistryContent />
    </Suspense>
  );
}
