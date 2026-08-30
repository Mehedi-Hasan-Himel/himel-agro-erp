"use client";

import React, { useState } from "react";
import { Pair, BreedingRound } from "@/types/breeding";
import { Pigeon } from "@/types/pigeon";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { calculateHatchingStats } from "@/lib/repositories/breedingRepository";
import { endPair } from "@/lib/repositories/breedingRepository";
import { RingBadge } from "../pigeons/RingBadge";
import { Button } from "../ui/Button";
import { Plus, XCircle, Egg } from "lucide-react";
import { SquabIcon, CockPigeonIcon, HenPigeonIcon } from "../ui/icons";
import { BreedingRoundModal } from "./BreedingRoundModal";

export interface PairTableProps {
  pairs: Pair[];
  pigeons: Pigeon[];
  rounds: BreedingRound[];
  onDataChanged?: () => void;
}

export function PairTable({
  pairs,
  pigeons,
  rounds,
  onDataChanged,
}: PairTableProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ENDED">("ACTIVE");
  const [selectedPairForRound, setSelectedPairForRound] = useState<Pair | null>(
    null
  );

  const pigeonMap = new Map<string, Pigeon>();
  pigeons.forEach((p) => pigeonMap.set(p.id, p));

  const filteredPairs = pairs.filter((p) => {
    if (filter === "ACTIVE") return p.status === "ACTIVE";
    if (filter === "ENDED") return p.status === "ENDED";
    return true;
  });

  const handleEndPair = async (pairId: string) => {
    if (confirm("Are you sure you want to end this breeding pair relationship? Historical records will remain intact.")) {
      await endPair(pairId);
      if (onDataChanged) onDataChanged();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs">
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "ACTIVE"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Active Breeding Pairs ({pairs.filter((p) => p.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setFilter("ENDED")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "ENDED"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Historical Ended Pairs ({pairs.filter((p) => p.status === "ENDED").length})
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "ALL"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Pairs ({pairs.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Pair ID / Cage</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5">
                    <CockPigeonIcon className="w-3.5 h-3.5 text-sky-700" />
                    <span>Male (Sire)</span>
                  </span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5">
                    <HenPigeonIcon className="w-3.5 h-3.5 text-pink-700" />
                    <span>Female (Dam)</span>
                  </span>
                </th>
                <th className="py-3 px-4">Active Period</th>
                <th className="py-3 px-4">Rounds</th>
                <th className="py-3 px-4">Eggs / Hatched</th>
                <th className="py-3 px-4">Hatching Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No pairs found in this category.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair) => {
                  const male = pigeonMap.get(pair.maleId);
                  const female = pigeonMap.get(pair.femaleId);
                  const pairRounds = rounds.filter((r) => r.pairId === pair.id);
                  const stats = calculateHatchingStats(pairRounds);

                  return (
                    <tr
                      key={pair.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pair.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>{pair.id}</span>
                        </div>
                        {pair.cageNumber && (
                          <div className="text-[11px] font-sans font-normal text-slate-500">
                            {pair.cageNumber}
                          </div>
                        )}
                      </td>

                      {/* Male */}
                      <td className="py-3.5 px-4">
                        {male ? (
                          <div>
                            <RingBadge pigeon={male} size="sm" />
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {male.breedSubtype || male.breed}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">{pair.maleId}</span>
                        )}
                      </td>

                      {/* Female */}
                      <td className="py-3.5 px-4">
                        {female ? (
                          <div>
                            <RingBadge pigeon={female} size="sm" />
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {female.breedSubtype || female.breed}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">{pair.femaleId}</span>
                        )}
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>From {formatDate(pair.startDate)}</div>
                        <div className="text-[10px] text-slate-400">
                          {pair.endDate
                            ? `Ended ${formatDate(pair.endDate)}`
                            : "Ongoing Active"}
                        </div>
                      </td>

                      {/* Rounds */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {stats.totalRounds} rounds
                      </td>

                      {/* Eggs / Hatched */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 text-slate-800">
                            <Egg className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {stats.totalEggs}
                          </span>
                          <span className="text-slate-400 font-normal">/</span>
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                            <SquabIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            {stats.totalHatched}
                          </span>
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            stats.hatchingRate >= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : stats.hatchingRate >= 50
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {stats.hatchingRate}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pair.status === "ACTIVE" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPairForRound(pair)}
                                className="text-xs py-1 px-2 gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Round
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEndPair(pair.id)}
                                className="text-xs py-1 px-2 text-rose-600 hover:bg-rose-50"
                                title="End Pair Relationship"
                              >
                                <XCircle className="w-3.5 h-3.5" /> End
                              </Button>
                            </>
                          )}
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

      {/* Breeding Round Modal */}
      {selectedPairForRound && (
        <BreedingRoundModal
          pair={selectedPairForRound}
          isOpen={!!selectedPairForRound}
          onClose={() => setSelectedPairForRound(null)}
          onSuccess={() => {
            setSelectedPairForRound(null);
            if (onDataChanged) onDataChanged();
          }}
        />
      )}
    </div>
  );
}
