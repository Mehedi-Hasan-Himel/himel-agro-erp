"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pigeon } from "@/types/pigeon";
import { Pair } from "@/types/breeding";
import { getPigeons } from "@/lib/repositories/pigeonRepository";
import { getPairs } from "@/lib/repositories/breedingRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { PigeonTable } from "@/components/pigeons/PigeonTable";
import { PigeonCard } from "@/components/pigeons/PigeonCard";
import { Button } from "@/components/ui/Button";
import { PlusCircle, LayoutGrid, List, Feather } from "lucide-react";

export default function PigeonsListPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [allPigeons, allPairs] = await Promise.all([
        getPigeons(),
        getPairs(),
      ]);
      setPigeons(allPigeons);
      setPairs(allPairs);
    } catch (err) {
      console.error("Failed to load pigeons:", err);
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Pigeon Flock Registry
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {pigeons.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent identity, genealogy, physical ring records, and current
            statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white shadow-2xs">
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
            href="/pigeons/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Register New Pigeon
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600 mr-3" />
          <span>Loading pigeon directory...</span>
        </div>
      ) : viewMode === "TABLE" ? (
        <PigeonTable pigeons={pigeons} pairs={pairs} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pigeons.map((pigeon) => (
            <PigeonCard key={pigeon.id} pigeon={pigeon} />
          ))}
        </div>
      )}
    </div>
  );
}
