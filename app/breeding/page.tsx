"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pair, BreedingRound, HatchingStats } from "@/types/breeding";
import { Pigeon } from "@/types/pigeon";
import { getPairs, getBreedingRounds, calculateHatchingStats } from "@/lib/repositories/breedingRepository";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { formatCompactRing } from "@/lib/formatters/ringFormatter";
import { BreedingStatsCard } from "@/components/breeding/BreedingStatsCard";
import { PairTable } from "@/components/breeding/PairTable";
import { PairFormModal } from "@/components/breeding/PairFormModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeartHandshake, GitFork, PlusCircle, ArrowRight } from "lucide-react";

export default function BreedingOverviewPage() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [rounds, setRounds] = useState<BreedingRound[]>([]);
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [allPairs, allRounds, allPigeons] = await Promise.all([
        getPairs(),
        getBreedingRounds(),
        getPigeons(),
      ]);
      setPairs(allPairs);
      setRounds(allRounds);
      setPigeons(allPigeons);
    } catch (err) {
      console.error("Error loading breeding data:", err);
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

  const overallStats = calculateHatchingStats(rounds);
  const activePairs = pairs.filter((p) => p.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Breeding Center & Fertility Hub
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {activePairs.length} Active Pairs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical pairing records, summary breeding rounds, and dynamic
            hatching rate calculations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/breeding/pairs">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <GitFork className="w-3.5 h-3.5" /> All Pairs
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPairModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Form New Pair
          </Button>
        </div>
      </div>

      {/* Breeding Stats KPI */}
      <BreedingStatsCard
        stats={overallStats}
        title="Farm-Wide Breeding & Hatching Output"
        subtitle="Dynamic summary of all recorded eggs and hatched squabs"
      />

      {/* Active Pairs Table Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Breeding Units & Lofts
          </h2>
          <Link
            href="/breeding/pairs"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Manage All Pairs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            Loading pairs data...
          </div>
        ) : (
          <PairTable
            pairs={pairs}
            pigeons={pigeons}
            rounds={rounds}
            onDataChanged={loadData}
          />
        )}
      </div>

      {/* Pair Modal */}
      {isPairModalOpen && (
        <PairFormModal
          pigeons={pigeons}
          isOpen={isPairModalOpen}
          onClose={() => setIsPairModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
