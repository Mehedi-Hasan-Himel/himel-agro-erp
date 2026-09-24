"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { getActivePairSerialMap } from "@/lib/repositories/breedingRepository";
import { getActivePigeonSerialMap } from "@/lib/repositories/pigeonRepository";
import { RingBadge } from "./RingBadge";
import { StatusBadge } from "./StatusBadge";
import { SexBadge } from "./SexBadge";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { SearchInput } from "../ui/SearchInput";
import { Eye, GitFork, Edit, Trash2, Tag, Feather, AlertCircle, Compass } from "lucide-react";
import { DeletePigeonModal } from "./DeletePigeonModal";
import { BulkDeletePigeonsModal } from "./BulkDeletePigeonsModal";
import { SaleModal } from "./SaleModal";
import { TakaIcon, CockPigeonIcon, HenPigeonIcon, SquabIcon } from "@/components/ui/icons";

export interface PigeonTableProps {
  pigeons: Pigeon[];
  pairs?: Pair[];
  initialStatusFilter?: string;
  onAddPigeon?: () => void;
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
    id: "RING_LOST",
    label: "Ring Lost",
    icon: AlertCircle,
    iconClass: "text-amber-600",
    activeColor: "bg-white text-amber-800 shadow-2xs font-semibold",
    badgeActive: "bg-amber-100 text-amber-800",
  },
  {
    id: "PIGEON_LOST",
    label: "Pigeon Lost",
    icon: Compass,
    iconClass: "text-orange-600",
    activeColor: "bg-white text-orange-800 shadow-2xs font-semibold",
    badgeActive: "bg-orange-100 text-orange-800",
  },
] as const;

export const isRingLostPigeon = (p: Pigeon) =>
  (p.breedSubtype || "").toLowerCase().includes("ring lost") ||
  (p.notes || "").toLowerCase().includes("ring lost") ||
  (p.lostNotes || "").toLowerCase().includes("ring lost");

export const isPigeonLostPigeon = (p: Pigeon) =>
  !isRingLostPigeon(p) && (
    p.status === "LOST" ||
    (p.breedSubtype || "").toLowerCase().includes("pigeon lost") ||
    (p.notes || "").toLowerCase().includes("pigeon lost") ||
    (p.notes || "").toLowerCase().includes("lost in flight") ||
    (p.lostNotes || "").toLowerCase().includes("pigeon lost") ||
    (p.lostNotes || "").toLowerCase().includes("lost in flight")
  );

export const isAnyLostPigeon = (p: Pigeon) =>
  isRingLostPigeon(p) || isPigeonLostPigeon(p);

export function PigeonTable({
  pigeons,
  pairs = [],
  initialStatusFilter = "ALL",
  onRefresh,
}: PigeonTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState(
    initialStatusFilter === "LOST" ? "RING_LOST" : "ALL"
  );
  const [breedFilter, setBreedFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("ring_asc");
  const [selectedPigeonForDelete, setSelectedPigeonForDelete] = useState<Pigeon | null>(null);
  const [selectedPigeonForSale, setSelectedPigeonForSale] = useState<Pigeon | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Clear selections if pigeons change significantly or on refresh
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(pigeons.map((p) => p.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [pigeons]);

  // Create lookup maps for fast parent & pair retrieval (O(N) memoized)
  const pigeonMap = React.useMemo(() => {
    const map = new Map<string, Pigeon>();
    pigeons.forEach((p) => map.set(p.id, p));
    return map;
  }, [pigeons]);

  const activePigeonSerialMap = React.useMemo(() => {
    return getActivePigeonSerialMap(pigeons);
  }, [pigeons]);

  const activePairMap = React.useMemo(() => {
    const serialMap = getActivePairSerialMap(pairs);
    const map = new Map<string, { id: string; serial: string }>();
    pairs.forEach((pr) => {
      if (pr.status === "ACTIVE") {
        const serial = serialMap.get(pr.id) || "";
        map.set(pr.maleId, { id: pr.id, serial });
        map.set(pr.femaleId, { id: pr.id, serial });
      }
    });
    return map;
  }, [pairs]);

  // Extract unique filter options (memoized)
  const years = React.useMemo(() => {
    return Array.from(new Set(pigeons.map((p) => p.ringYear))).sort((a, b) => b - a);
  }, [pigeons]);

  const breeds = React.useMemo(() => {
    return Array.from(new Set(pigeons.map((p) => p.breed))).sort();
  }, [pigeons]);

  const categoryCounts = React.useMemo(() => {
    let all = 0;
    let male = 0;
    let female = 0;
    let baby = 0;
    let ringLost = 0;
    let pigeonLost = 0;

    pigeons.forEach((p) => {
      if (isRingLostPigeon(p)) {
        ringLost += 1;
        return;
      }
      if (isPigeonLostPigeon(p)) {
        pigeonLost += 1;
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

    return {
      ALL: all,
      MALE: male,
      FEMALE: female,
      BABY: baby,
      RING_LOST: ringLost,
      PIGEON_LOST: pigeonLost,
    };
  }, [pigeons]);

  const handleCategoryClick = (cat: string) => {
    setCategoryFilter(cat);
    if (cat === "RING_LOST" || cat === "PIGEON_LOST") {
      if (statusFilter !== "ALL" && statusFilter !== "LOST") {
        setStatusFilter("ALL");
      }
    } else {
      if (statusFilter === "LOST") {
        setStatusFilter("ALL");
      }
    }
  };

  // Filter & search (memoized)
  const sorted = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const parsedYear = yearFilter !== "ALL" ? parseInt(yearFilter, 10) : null;

    const filtered = pigeons.filter((p) => {
      // Search match
      if (q) {
        const ringCompact = formatCompactRing(p).toLowerCase();
        const ringFull = `${p.ringYear} ${p.ringSerial}`.toLowerCase();
        const official = (p.officialRingNumber || "").toLowerCase();
        const breed = (p.breed || "").toLowerCase();
        const subtype = (p.breedSubtype || "").toLowerCase();
        const color = (p.colorPattern || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        const father = (p.fatherDetails || "").toLowerCase();
        const mother = (p.motherDetails || "").toLowerCase();
        const matches =
          ringCompact.includes(q) ||
          ringFull.includes(q) ||
          official.includes(q) ||
          breed.includes(q) ||
          subtype.includes(q) ||
          color.includes(q) ||
          notes.includes(q) ||
          father.includes(q) ||
          mother.includes(q);
        if (!matches) return false;
      }

      if (statusFilter === "FOR_SALE") {
        if (!(p.status === "ACTIVE" && p.isForSale === true)) return false;
      } else if (statusFilter === "LOST") {
        if (!isAnyLostPigeon(p)) return false;
      } else if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      if (categoryFilter === "RING_LOST") {
        if (!isRingLostPigeon(p)) return false;
      } else if (categoryFilter === "PIGEON_LOST") {
        if (!isPigeonLostPigeon(p)) return false;
      } else if (categoryFilter === "MALE") {
        if (p.sex !== "MALE" || isAnyLostPigeon(p)) return false;
      } else if (categoryFilter === "FEMALE") {
        if (p.sex !== "FEMALE" || isAnyLostPigeon(p)) return false;
      } else if (categoryFilter === "BABY") {
        if (p.sex === "MALE" || p.sex === "FEMALE" || isAnyLostPigeon(p)) return false;
      } else {
        // "ALL": only available pigeons (lost pigeon or lost ring should not be counted as all)
        if (isAnyLostPigeon(p)) return false;
      }

      if (breedFilter !== "ALL" && p.breed !== breedFilter) return false;
      if (parsedYear !== null && p.ringYear !== parsedYear) return false;

      return true;
    });

    // Sort
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

  // Bulk selection helper logic
  const allFilteredSelected =
    sorted.length > 0 && sorted.every((p) => selectedIds.has(p.id));
  const someFilteredSelected =
    sorted.some((p) => selectedIds.has(p.id)) && !allFilteredSelected;

  // Sync indeterminate state of master checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someFilteredSelected;
    }
  }, [someFilteredSelected]);

  const toggleSelectAllFiltered = React.useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        sorted.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        sorted.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }, [allFilteredSelected, sorted]);

  const toggleSelectPigeon = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedPigeonsList = pigeons.filter((p) => selectedIds.has(p.id));

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by ring, breed, subtype, serial..."
            />
          </div>

          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
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
                  if (categoryFilter !== "RING_LOST" && categoryFilter !== "PIGEON_LOST") {
                    setCategoryFilter(categoryCounts.RING_LOST > 0 ? "RING_LOST" : "PIGEON_LOST");
                  }
                } else if (categoryFilter === "RING_LOST" || categoryFilter === "PIGEON_LOST") {
                  setCategoryFilter("ALL");
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none font-medium"
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

        {/* Secondary filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-semibold text-slate-700 shrink-0">Category:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0">
              {CATEGORY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = categoryFilter === opt.id;
                const count = categoryCounts[opt.id as keyof typeof categoryCounts] ?? 0;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleCategoryClick(opt.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-[11px] sm:text-xs transition-colors cursor-pointer ${
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

          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="font-medium text-slate-500 text-[11px] sm:text-xs truncate">
              Showing <strong className="text-slate-800">{sorted.length}</strong> of {pigeons.length}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none shrink-0 cursor-pointer"
            >
              <option value="hatchDate_desc">Newest Hatch First</option>
              <option value="hatchDate_asc">Oldest Hatch First</option>
              <option value="ring_desc">Ring Serial (High to Low)</option>
              <option value="ring_asc">Ring Serial (Low to High)</option>
              <option value="breed">Breed (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                {selectedIds.size}
              </span>
              <div className="text-xs">
                <strong className="text-white">{selectedIds.size} pigeon{selectedIds.size > 1 ? "s" : ""} selected</strong>
                <span className="text-slate-400 ml-1.5 hidden sm:inline">
                  ({selectedIds.size} of {pigeons.length} total)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="sm:hidden px-2.5 py-1 rounded-lg bg-white/10 text-xs text-slate-300 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            {!allFilteredSelected && sorted.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors cursor-pointer flex-1 sm:flex-initial text-center"
              >
                Select all {sorted.length}
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Card List View (< lg) */}
      <div className="block lg:hidden space-y-3">
        {/* Mobile Bulk Select All Header */}
        {sorted.length > 0 && (
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAllFiltered}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-700">Select All ({sorted.length})</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-[11px] font-bold text-emerald-700">
                {selectedIds.size} selected
              </span>
            )}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No pigeons found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((pigeon) => {
              const father = pigeon.fatherId ? pigeonMap.get(pigeon.fatherId) : null;
              const mother = pigeon.motherId ? pigeonMap.get(pigeon.motherId) : null;
              const activePair = activePairMap.get(pigeon.id);
              const isSelected = selectedIds.has(pigeon.id);

              return (
                <div
                  key={pigeon.id}
                  className={`bg-white rounded-2xl border transition-all p-3.5 space-y-3 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/30 shadow-xs ring-1 ring-emerald-500/30"
                      : "border-slate-200 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectPigeon(pigeon.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer mt-0.5 shrink-0"
                      />
                      {pigeon.status === "ACTIVE" ? (
                        <span
                          title={`Active Pigeon #${activePigeonSerialMap.get(pigeon.id) || "--"}`}
                          className="inline-flex items-center justify-center min-w-[26px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-black shadow-2xs shrink-0"
                        >
                          #{activePigeonSerialMap.get(pigeon.id) || "--"}
                        </span>
                      ) : (
                        <span
                          title={`${pigeon.status} Pigeon`}
                          className="inline-flex items-center justify-center min-w-[26px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 font-mono text-[11px] font-semibold border border-slate-200/80 shrink-0"
                        >
                          --
                        </span>
                      )}
                      <RingBadge pigeon={pigeon} size="md" className="hover:opacity-80 transition-opacity min-w-0" />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={pigeon.status} size="sm" />
                      <SexBadge sex={pigeon.sex} />
                    </div>
                  </div>

                  {/* Visual Identity & Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        Breed
                      </span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {pigeon.breedSubtype || pigeon.breed}
                      </span>
                      {pigeon.breedSubtype && (
                        <span className="text-[11px] text-slate-500 truncate block">
                          {pigeon.breed}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        Age / Hatched
                      </span>
                      <span className="font-semibold text-slate-800 block">
                        {calculateAge(pigeon.hatchDate)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {formatDate(pigeon.hatchDate)}
                      </span>
                    </div>
                  </div>

                  {/* Pedigree & Pair Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                    <div className="flex items-center gap-1">
                      {father ? (
                        <Link
                          href={`/pigeons/${father.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200/60 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          ♂ {formatCompactRing(father)}
                        </Link>
                      ) : (
                        <span className="text-slate-400">♂ Unknown</span>
                      )}
                      <span className="text-slate-300">×</span>
                      {mother ? (
                        <Link
                          href={`/pigeons/${mother.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200/60 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                          ♀ {formatCompactRing(mother)}
                        </Link>
                      ) : (
                        <span className="text-slate-400">♀ Unknown</span>
                      )}
                    </div>

                    {activePair && (
                      <Link
                        href="/breeding/pairs"
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60 transition-colors"
                      >
                        {activePair.serial && (
                          <span className="font-mono text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded font-black shadow-2xs">
                            #{activePair.serial}
                          </span>
                        )}
                        <GitFork className="w-3 h-3" />
                        <span className="font-mono">{activePair.id}</span>
                      </Link>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                    {pigeon.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => setSelectedPigeonForSale(pigeon)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        title="Sell Pigeon"
                      >
                        <TakaIcon className="w-3.5 h-3.5" />
                        <span>{pigeon.isForSale ? "For Sale" : "Sell"}</span>
                      </button>
                    )}
                    <Link
                      href={`/pigeons/${pigeon.id}`}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/pigeons/${pigeon.id}/pedigree`}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Pedigree"
                    >
                      <GitFork className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/pigeons/${pigeon.id}/edit`}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Pigeon"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedPigeonForDelete(pigeon)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Pigeon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table Display (hidden lg:block) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                {/* Bulk Select Checkbox Column */}
                <th className="py-3 pl-3.5 pr-2 w-9 text-center">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                    title={allFilteredSelected ? "Deselect all filtered" : "Select all filtered"}
                  />
                </th>
                <th className="py-3 px-3"># / Unique ID / Ring</th>
                <th className="py-3 px-2 text-center">Sex</th>
                <th className="py-3 px-3">Breed</th>
                <th className="py-3 px-3">Hatch Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 hidden xl:table-cell">Parents (Sire × Dam)</th>
                <th className="py-3 px-3 hidden 2xl:table-cell">Pair</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No pigeons found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((pigeon) => {
                  const father = pigeon.fatherId
                    ? pigeonMap.get(pigeon.fatherId)
                    : null;
                  const mother = pigeon.motherId
                    ? pigeonMap.get(pigeon.motherId)
                    : null;
                  const activePair = activePairMap.get(pigeon.id);
                  const isSelected = selectedIds.has(pigeon.id);

                  return (
                    <tr
                      key={pigeon.id}
                      className={`transition-colors group ${
                        isSelected
                          ? "bg-emerald-50/60 hover:bg-emerald-50/90"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Bulk Selection Checkbox */}
                      <td className="py-3 pl-3.5 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPigeon(pigeon.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Ring & Unique ID */}
                      <td className="py-3 px-3 font-mono font-medium">
                        <div className="flex items-center gap-2">
                          {pigeon.status === "ACTIVE" ? (
                            <span
                              title={`Active Pigeon #${activePigeonSerialMap.get(pigeon.id) || "--"}`}
                              className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-xs font-black shadow-2xs shrink-0"
                            >
                              #{activePigeonSerialMap.get(pigeon.id) || "--"}
                            </span>
                          ) : (
                            <span
                              title={`${pigeon.status} Pigeon`}
                              className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 font-mono text-xs font-semibold border border-slate-200/80 shrink-0"
                            >
                              --
                            </span>
                          )}
                          {pigeon.photoUrl ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img
                                src={pigeon.photoUrl}
                                alt={pigeon.id}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Feather className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <RingBadge pigeon={pigeon} size="sm" />
                            <div
                              className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px] sm:max-w-[190px]"
                              title={`${pigeon.ringYear} | ${String(pigeon.ringSerial).padStart(2, "0")} | ${pigeon.farmName || "Himel's Pet House"}`}
                            >
                              {pigeon.ringYear} | {String(pigeon.ringSerial).padStart(2, "0")} | {pigeon.farmName || "Himel's Pet House"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sex */}
                      <td className="py-3 px-2 text-center">
                        <SexBadge sex={pigeon.sex} />
                      </td>

                      {/* Breed */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {pigeon.breedSubtype || pigeon.breed}
                        </div>
                        {pigeon.breedSubtype && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {pigeon.breed}
                          </div>
                        )}
                      </td>

                      {/* Hatch Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium">{formatDate(pigeon.hatchDate)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {calculateAge(pigeon.hatchDate)}
                        </div>
                      </td>

                      {/* Status & Available for Sale Badge */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={pigeon.status} size="sm" />
                          {pigeon.status === "ACTIVE" && pigeon.isForSale && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                              <Tag className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                              <span>{pigeon.askingPrice ? `৳${pigeon.askingPrice}` : "For Sale"}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Parents (Sire × Dam) */}
                      <td className="py-3 px-3 hidden xl:table-cell">
                        <div className="flex flex-col gap-0.5 text-[11px] font-mono">
                          <div className="flex items-center gap-1">
                            <span className="text-sky-600 font-bold shrink-0">♂</span>
                            {father ? (
                              <Link
                                href={`/pigeons/${father.id}`}
                                className="text-emerald-700 hover:underline truncate max-w-[110px]"
                              >
                                {formatCompactRing(father)}
                              </Link>
                            ) : (
                              <span className="text-slate-400">Unknown</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-pink-600 font-bold shrink-0">♀</span>
                            {mother ? (
                              <Link
                                href={`/pigeons/${mother.id}`}
                                className="text-emerald-700 hover:underline truncate max-w-[110px]"
                              >
                                {formatCompactRing(mother)}
                              </Link>
                            ) : (
                              <span className="text-slate-400">Unknown</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Current Pair */}
                      <td className="py-3 px-3 hidden 2xl:table-cell">
                        {activePair ? (
                          <Link
                            href="/breeding/pairs"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60 transition-colors"
                          >
                            {activePair.serial && (
                              <span className="font-mono text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black shadow-2xs">
                                #{activePair.serial}
                              </span>
                            )}
                            <GitFork className="w-3 h-3" />
                            <span className="font-mono">{activePair.id}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Record Sale Button for Active Pigeons */}
                          {pigeon.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => setSelectedPigeonForSale(pigeon)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title={pigeon.isForSale ? `Record Sale (${pigeon.askingPrice ? '৳' + pigeon.askingPrice : 'Available'})` : "Sell Pigeon"}
                            >
                              <TakaIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            href={`/pigeons/${pigeon.id}`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/pigeons/${pigeon.id}/pedigree`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Pedigree Bloodline"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/pigeons/${pigeon.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Pigeon"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedPigeonForDelete(pigeon)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Pigeon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Delete Pigeon Modal */}
      {selectedPigeonForDelete && (
        <DeletePigeonModal
          pigeon={selectedPigeonForDelete}
          isOpen={!!selectedPigeonForDelete}
          onClose={() => setSelectedPigeonForDelete(null)}
          onDeleted={() => {
            setSelectedPigeonForDelete(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && selectedPigeonsList.length > 0 && (
        <BulkDeletePigeonsModal
          pigeons={selectedPigeonsList}
          isOpen={isBulkDeleteOpen}
          onClose={() => setIsBulkDeleteOpen(false)}
          onDeleted={() => {
            setIsBulkDeleteOpen(false);
            setSelectedIds(new Set());
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Sell Pigeon Modal */}
      {selectedPigeonForSale && (
        <SaleModal
          pigeon={selectedPigeonForSale}
          isOpen={!!selectedPigeonForSale}
          onClose={() => setSelectedPigeonForSale(null)}
          onSuccess={() => {
            setSelectedPigeonForSale(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

export default PigeonTable;
