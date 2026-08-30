"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { RingBadge } from "./RingBadge";
import { StatusBadge } from "./StatusBadge";
import { SexBadge } from "./SexBadge";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { SearchInput } from "../ui/SearchInput";
import { Eye, GitFork, Edit, Trash2, Tag } from "lucide-react";
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

export function PigeonTable({
  pigeons,
  pairs = [],
  initialStatusFilter = "ALL",
  onRefresh,
}: PigeonTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sexFilter, setSexFilter] = useState("ALL");
  const [breedFilter, setBreedFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("hatchDate_desc");
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

  const activePairMap = React.useMemo(() => {
    const map = new Map<string, string>();
    pairs.forEach((pr) => {
      if (pr.status === "ACTIVE") {
        map.set(pr.maleId, pr.id);
        map.set(pr.femaleId, pr.id);
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

  // Filter & search (memoized)
  const sorted = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const parsedYear = yearFilter !== "ALL" ? parseInt(yearFilter, 10) : null;

    const filtered = pigeons.filter((p) => {
      // Search match
      if (q) {
        const ringCompact = formatCompactRing(p).toLowerCase();
        const ringFull = `${p.ringYear} ${p.ringSerial}`.toLowerCase();
        const breed = (p.breed || "").toLowerCase();
        const subtype = (p.breedSubtype || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        const matches =
          ringCompact.includes(q) ||
          ringFull.includes(q) ||
          breed.includes(q) ||
          subtype.includes(q) ||
          notes.includes(q);
        if (!matches) return false;
      }

      if (statusFilter === "FOR_SALE") {
        if (!(p.status === "ACTIVE" && p.isForSale === true)) return false;
      } else if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      if (sexFilter !== "ALL" && p.sex !== sexFilter) return false;
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
  }, [pigeons, search, statusFilter, sexFilter, breedFilter, yearFilter, sortBy]);

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
              onChange={(e) => setStatusFilter(e.target.value)}
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sex:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {["ALL", "MALE", "FEMALE", "UNKNOWN"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSexFilter(s)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    sexFilter === s
                      ? "bg-white text-emerald-700 shadow-2xs font-semibold"
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
                      <span>Baby / Unk</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium">
              Showing <strong className="text-slate-800">{sorted.length}</strong> of {pigeons.length} pigeons
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
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
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
              {selectedIds.size}
            </span>
            <div className="text-xs">
              <strong className="text-white">{selectedIds.size} pigeon{selectedIds.size > 1 ? "s" : ""} selected</strong>
              <span className="text-slate-400 ml-1.5 hidden sm:inline">
                ({selectedIds.size} of {pigeons.length} total)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!allFilteredSelected && sorted.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors cursor-pointer"
              >
                Select all {sorted.length} filtered
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                {/* Bulk Select Checkbox Column */}
                <th className="py-3 pl-4 pr-2 w-10 text-center">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                    title={allFilteredSelected ? "Deselect all filtered" : "Select all filtered"}
                  />
                </th>
                <th className="py-3 px-3">Unique ID / Ring</th>
                <th className="py-3 px-4">Sex</th>
                <th className="py-3 px-4">Breed & Subtype</th>
                <th className="py-3 px-4">Hatch Date / Age</th>
                <th className="py-3 px-4">Status & Sale</th>
                <th className="py-3 px-4">Father</th>
                <th className="py-3 px-4">Mother</th>
                <th className="py-3 px-4">Current Pair</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
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
                  const pairId = activePairMap.get(pigeon.id);
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
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPigeon(pigeon.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Ring & Unique ID */}
                      <td className="py-3.5 px-3 font-mono font-medium">
                        <div className="flex items-center gap-2.5">
                          {pigeon.photoUrl && (
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
                          )}
                          <div>
                            <RingBadge pigeon={pigeon} size="sm" />
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                              {pigeon.ringYear} | {pigeon.farmName || "Himel Agro"} | {String(pigeon.ringSerial).padStart(2, "0")}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sex */}
                      <td className="py-3.5 px-4">
                        <SexBadge sex={pigeon.sex} />
                      </td>

                      {/* Breed */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {pigeon.breedSubtype || pigeon.breed}
                        </div>
                        {pigeon.breedSubtype && (
                          <div className="text-[11px] text-slate-400">
                            {pigeon.breed}
                          </div>
                        )}
                      </td>

                      {/* Hatch Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{formatDate(pigeon.hatchDate)}</div>
                        <div className="text-[10px] text-slate-400">
                          {calculateAge(pigeon.hatchDate)}
                        </div>
                      </td>

                      {/* Status & Available for Sale Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={pigeon.status} size="sm" />
                          {pigeon.status === "ACTIVE" && pigeon.isForSale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                              <Tag className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{pigeon.askingPrice ? `৳${pigeon.askingPrice}` : "For Sale"}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Father */}
                      <td className="py-3.5 px-4">
                        {father ? (
                          <Link
                            href={`/pigeons/${father.id}`}
                            className="font-mono text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            {formatCompactRing(father)}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Unknown
                          </span>
                        )}
                      </td>

                      {/* Mother */}
                      <td className="py-3.5 px-4">
                        {mother ? (
                          <Link
                            href={`/pigeons/${mother.id}`}
                            className="font-mono text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                            {formatCompactRing(mother)}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Unknown
                          </span>
                        )}
                      </td>

                      {/* Pair */}
                      <td className="py-3.5 px-4">
                        {pairId ? (
                          <Link
                            href={`/breeding/pairs`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline bg-emerald-50 px-2 py-0.5 rounded-md"
                          >
                            <GitFork className="w-3 h-3" />
                            {pairId}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Record Sale Button for Active Pigeons */}
                          {pigeon.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => setSelectedPigeonForSale(pigeon)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title={pigeon.isForSale ? `Record Sale (${pigeon.askingPrice ? '৳' + pigeon.askingPrice : 'Available'})` : "Sell Pigeon"}
                            >
                              <TakaIcon className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/pigeons/${pigeon.id}`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/pigeons/${pigeon.id}/pedigree`}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Pedigree Bloodline"
                          >
                            <GitFork className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/pigeons/${pigeon.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
