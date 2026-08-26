"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { RingBadge } from "./RingBadge";
import { StatusBadge } from "./StatusBadge";
import { SexBadge } from "./SexBadge";
import { formatDate, calculateAge } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { SearchInput } from "../ui/SearchInput";
import { Select } from "../ui/Select";
import { ArrowRight, Eye, GitFork, Plus, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";

export interface PigeonTableProps {
  pigeons: Pigeon[];
  pairs?: Pair[];
  onAddPigeon?: () => void;
}

export function PigeonTable({ pigeons, pairs = [] }: PigeonTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sexFilter, setSexFilter] = useState("ALL");
  const [breedFilter, setBreedFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("hatchDate_desc");

  // Create lookup maps for fast parent & pair retrieval
  const pigeonMap = new Map<string, Pigeon>();
  pigeons.forEach((p) => pigeonMap.set(p.id, p));

  const activePairMap = new Map<string, string>();
  pairs.forEach((pr) => {
    if (pr.status === "ACTIVE") {
      activePairMap.set(pr.maleId, pr.id);
      activePairMap.set(pr.femaleId, pr.id);
    }
  });

  // Extract unique filter options
  const years = Array.from(new Set(pigeons.map((p) => p.ringYear))).sort(
    (a, b) => b - a
  );
  const breeds = Array.from(new Set(pigeons.map((p) => p.breed))).sort();

  // Filter & search
  const filtered = pigeons.filter((p) => {
    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
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

    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (sexFilter !== "ALL" && p.sex !== sexFilter) return false;
    if (breedFilter !== "ALL" && p.breed !== breedFilter) return false;
    if (yearFilter !== "ALL" && p.ringYear !== parseInt(yearFilter, 10))
      return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
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
                  className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    sexFilter === s
                      ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s === "ALL"
                    ? "All"
                    : s === "MALE"
                    ? "Cock ♂"
                    : s === "FEMALE"
                    ? "Hen ♀"
                    : "Baby / Unk"}
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

      {/* Table Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ring Identity</th>
                <th className="py-3 px-4">Sex</th>
                <th className="py-3 px-4">Breed & Subtype</th>
                <th className="py-3 px-4">Hatch Date / Age</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Father</th>
                <th className="py-3 px-4">Mother</th>
                <th className="py-3 px-4">Current Pair</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  const pairId = activePairMap.get(pigeon.id);

                  return (
                    <tr
                      key={pigeon.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Ring */}
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <RingBadge pigeon={pigeon} size="sm" />
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

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={pigeon.status} size="sm" />
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
                        <div className="flex items-center justify-end gap-1.5">
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
    </div>
  );
}
