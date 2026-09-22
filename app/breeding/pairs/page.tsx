"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pair, BreedingRound } from "@/types/breeding";
import { Pigeon } from "@/types/pigeon";
import { getPairs, getBreedingRounds } from "@/lib/repositories/breedingRepository";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { PairTable } from "@/components/breeding/PairTable";
import { PairFormModal } from "@/components/breeding/PairFormModal";
import { Button } from "@/components/ui/Button";
import { GitFork, PlusCircle, ArrowLeft } from "lucide-react";

export default function BreedingPairsPage() {
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
      console.error("Error loading pairs:", err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/breeding"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Breeding Center
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Breeding Pairs Management
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {pairs.filter((p) => p.status === "ACTIVE").length} Active Pairs
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {pairs.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active and historical pair pairings. Pigeons can have multiple historical partners.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsPairModalOpen(true)}
          className="gap-1.5 text-xs"
        >
          <PlusCircle className="w-4 h-4" /> Form New Pair
        </Button>
      </div>

      {/* Pairs Table */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading pairs...</div>
      ) : (
        <PairTable
          pairs={pairs}
          pigeons={pigeons}
          rounds={rounds}
          onDataChanged={loadData}
        />
      )}

      {/* Pair Form Modal */}
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
