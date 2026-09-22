"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { getActivePigeonSerialMap } from "@/lib/repositories/pigeonRepository";
import { PigeonCard } from "./PigeonCard";
import { SearchInput } from "../ui/SearchInput";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import {
  CockPigeonIcon,
  HenPigeonIcon,
  SquabIcon,
  PigeonIcon,
} from "@/components/ui/icons";
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  PlusCircle,
} from "lucide-react";

export interface PigeonGridProps {
  pigeons: Pigeon[];
  pairs?: Pair[];
  initialStatusFilter?: string;
  onRefresh?: () => void;
}

export function PigeonGrid({
  pigeons,
  pairs = [],
  initialStatusFilter = "ALL",
  onRefresh,
}: PigeonGridProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sexFilter, setSexFilter] = useState("ALL");
  const [breedFilter, setBreedFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("hatchDate_desc");

  // Extract unique filter options (memoized)
  const years = useMemo(() => {
    return Array.from(new Set(pigeons.map((p) => p.ringYear))).sort((a, b) => b - a);
  }, [pigeons]);

  const breeds = useMemo(() => {
    return Array.from(new Set(pigeons.map((p) => p.breed))).sort();
  }, [pigeons]);

  const activePigeonSerialMap = useMemo(() => {
    return getActivePigeonSerialMap(pigeons);
  }, [pigeons]);

  // Filter & Search
  const filteredPigeons = useMemo(() => {
    const q = search.trim().toLowerCase();
    const parsedYear = yearFilter !== "ALL" ? parseInt(yearFilter, 10) : null;

    const filtered = pigeons.filter((p) => {
      // Search match
      if (q) {
        const ringCompact = formatCompactRing(p).toLowerCase();
        const ringFull = `${p.ringYear} ${p.ringSerial} ${p.farmName} ${p.contactNumber}`.toLowerCase();
        const id = p.id.toLowerCase();
        const official = (p.officialRingNumber || "").toLowerCase();
        const breed = (p.breed || "").toLowerCase();
        const subtype = (p.breedSubtype || "").toLowerCase();
        const color = (p.colorPattern || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        const father = (p.fatherDetails || "").toLowerCase();
        const mother = (p.motherDetails || "").toLowerCase();
        const clutch = (p.clutchId || "").toLowerCase();

        const matches =
          id.includes(q) ||
          official.includes(q) ||
          ringCompact.includes(q) ||
          ringFull.includes(q) ||
          breed.includes(q) ||
          subtype.includes(q) ||
          color.includes(q) ||
          notes.includes(q) ||
          father.includes(q) ||
          mother.includes(q) ||
          clutch.includes(q);

        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === "FOR_SALE") {
        if (!(p.status === "ACTIVE" && p.isForSale === true)) return false;
      } else if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      // Sex filter
      if (sexFilter !== "ALL" && p.sex !== sexFilter) return false;

      // Breed filter
      if (breedFilter !== "ALL" && p.breed !== breedFilter) return false;

      // Year filter
      if (parsedYear !== null && p.ringYear !== parsedYear) return false;

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "hatchDate_desc") {
        return (b.hatchDate || "").localeCompare(a.hatchDate || "");
      }
      if (sortBy === "hatchDate_asc") {
        return (a.hatchDate || "").localeCompare(b.hatchDate || "");
      }
      if (sortBy === "ring_desc") {
        return b.ringYear === a.ringYear
          ? b.ringSerial - a.ringSerial
          : b.ringYear - a.ringYear;
      }
      if (sortBy === "ring_asc") {
        return a.ringYear === b.ringYear
          ? a.ringSerial - b.ringSerial
          : a.ringYear - b.ringYear;
      }
      if (sortBy === "breed") {
        return (a.breedSubtype || a.breed).localeCompare(
          b.breedSubtype || b.breed
        );
      }
      return 0;
    });
  }, [pigeons, search, statusFilter, sexFilter, breedFilter, yearFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    sexFilter !== "ALL" ||
    breedFilter !== "ALL" ||
    yearFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSexFilter("ALL");
    setBreedFilter("ALL");
    setYearFilter("ALL");
    setSortBy("hatchDate_desc");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, ring, breed, subtype, clutch..."
            />
          </div>

          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="ALL">All Hatch Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="ALL">All Breeds</option>
              {breeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (All)</option>
              <option value="FOR_SALE">🏷️ Available for Sale</option>
              <option value="SOLD">Sold</option>
              <option value="DEAD">Dead</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter & Sort Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Sex Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 hidden sm:inline">Sex:</span>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50/80">
              {["ALL", "MALE", "FEMALE", "UNKNOWN"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSexFilter(s)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    sexFilter === s
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s === "ALL" ? (
                    "All"
                  ) : s === "MALE" ? (
                    <>
                      <CockPigeonIcon className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                      <span>Male</span>
                    </>
                  ) : s === "FEMALE" ? (
                    <>
                      <HenPigeonIcon className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                      <span>Female</span>
                    </>
                  ) : (
                    <>
                      <SquabIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Baby</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Result Count, Clear Filters & Sort Dropdown */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-slate-500 font-medium hidden md:inline">
              Showing <strong className="text-slate-900">{filteredPigeons.length}</strong> of {pigeons.length} pigeons ({pigeons.filter((p) => p.status === "ACTIVE").length} Active)
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold text-xs px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="hatchDate_desc">Newest Hatch First</option>
                <option value="hatchDate_asc">Oldest Hatch First</option>
                <option value="ring_desc">Ring Serial (High &rarr; Low)</option>
                <option value="ring_asc">Ring Serial (Low &rarr; High)</option>
                <option value="breed">Breed (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container or Empty State */}
      {filteredPigeons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredPigeons.map((pigeon) => (
            <PigeonCard
              key={pigeon.id}
              pigeon={pigeon}
              activeSerial={activePigeonSerialMap.get(pigeon.id)}
              allPigeons={pigeons}
              pairs={pairs}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 mb-4">
            <PigeonIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Pigeons Found</h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
            No flock members match your current search queries or active filter criteria.
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            ) : (
              <Link
                href="/pigeons/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Register New Pigeon</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PigeonGrid;
