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
  AlertCircle,
} from "lucide-react";

export interface PigeonGridProps {
  pigeons: Pigeon[];
  pairs?: Pair[];
  initialStatusFilter?: string;
  onRefresh?: () => void;
}

const CATEGORY_OPTIONS = [
  {
    id: "ALL",
    label: "All",
    icon: null,
    iconClass: "",
    activeColor: "bg-white text-emerald-800 shadow-2xs font-semibold",
    badgeActive: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "MALE",
    label: "Male",
    icon: CockPigeonIcon,
    iconClass: "text-sky-700",
    activeColor: "bg-white text-sky-800 shadow-2xs font-semibold",
    badgeActive: "bg-sky-100 text-sky-800",
  },
  {
    id: "FEMALE",
    label: "Female",
    icon: HenPigeonIcon,
    iconClass: "text-pink-700",
    activeColor: "bg-white text-pink-800 shadow-2xs font-semibold",
    badgeActive: "bg-pink-100 text-pink-800",
  },
  {
    id: "BABY",
    label: "Baby",
    icon: SquabIcon,
    iconClass: "text-emerald-700",
    activeColor: "bg-white text-emerald-800 shadow-2xs font-semibold",
    badgeActive: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "LOST",
    label: "Lost",
    icon: AlertCircle,
    iconClass: "text-amber-600",
    activeColor: "bg-white text-amber-800 shadow-2xs font-semibold",
    badgeActive: "bg-amber-100 text-amber-800",
  },
] as const;

const isLostPigeon = (p: Pigeon) =>
  p.status === "LOST" ||
  (p.notes || "").toLowerCase().includes("ring lost") ||
  (p.breedSubtype || "").toLowerCase().includes("ring lost");

export function PigeonGrid({
  pigeons,
  pairs = [],
  initialStatusFilter = "ALL",
  onRefresh,
}: PigeonGridProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState(
    initialStatusFilter === "LOST" ? "LOST" : "ALL"
  );
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

  const categoryCounts = useMemo(() => {
    let all = 0;
    let male = 0;
    let female = 0;
    let baby = 0;
    let lost = 0;

    pigeons.forEach((p) => {
      if (isLostPigeon(p)) {
        lost += 1;
        return;
      }
      all += 1;
      if (p.sex === "MALE") {
        male += 1;
      } else if (p.sex === "FEMALE") {
        female += 1;
      } else {
        baby += 1;
      }
    });

    return { ALL: all, MALE: male, FEMALE: female, BABY: baby, LOST: lost };
  }, [pigeons]);

  const handleCategoryClick = (cat: string) => {
    setCategoryFilter(cat);
    if (cat === "LOST") {
      if (statusFilter !== "ALL" && statusFilter !== "LOST") {
        setStatusFilter("ALL");
      }
    } else {
      if (statusFilter === "LOST") {
        setStatusFilter("ALL");
      }
    }
  };

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
      } else if (statusFilter === "LOST") {
        if (!isLostPigeon(p)) return false;
      } else if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      // Category filter (All, Male, Female, Baby, Lost)
      if (categoryFilter === "LOST") {
        if (!isLostPigeon(p)) return false;
      } else if (categoryFilter === "MALE") {
        if (p.sex !== "MALE" || isLostPigeon(p)) return false;
      } else if (categoryFilter === "FEMALE") {
        if (p.sex !== "FEMALE" || isLostPigeon(p)) return false;
      } else if (categoryFilter === "BABY") {
        if (p.sex === "MALE" || p.sex === "FEMALE" || isLostPigeon(p)) return false;
      } else {
        // "ALL": only available pigeons (lost pigeon or lost ring should not be counted or shown as all)
        if (isLostPigeon(p)) return false;
      }

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
  }, [pigeons, search, statusFilter, categoryFilter, breedFilter, yearFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    breedFilter !== "ALL" ||
    yearFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
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
              onChange={(e) => {
                const val = e.target.value;
                setStatusFilter(val);
                if (val === "LOST") {
                  setCategoryFilter("LOST");
                } else if (categoryFilter === "LOST") {
                  setCategoryFilter("ALL");
                }
              }}
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
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 hidden sm:inline">Category:</span>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50/80">
              {CATEGORY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = categoryFilter === opt.id;
                const count = categoryCounts[opt.id as keyof typeof categoryCounts] ?? 0;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleCategoryClick(opt.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? opt.activeColor
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${opt.iconClass} shrink-0`} />}
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                        isActive
                          ? opt.badgeActive
                          : "bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
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
