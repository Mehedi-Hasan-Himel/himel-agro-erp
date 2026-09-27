"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GoatFeedStock } from "@/types/goat";
import { getGoatFeedStock } from "@/lib/repositories/goatRepository";
import { Wheat, ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp, Layers } from "lucide-react";

export default function GoatFeedPage() {
  const [feedStock, setFeedStock] = useState<GoatFeedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGoatFeedStock().then((stock) => {
      setFeedStock(stock);
      setIsLoading(false);
    });
  }, []);

  const totalStockKg = feedStock.reduce((sum, f) => sum + f.currentStockKg, 0);
  const totalUsedKg = feedStock.reduce((sum, f) => sum + f.totalUsedKg, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Goat Feed & Forage Inventory
            </h1>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Ruminant Nutrition
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Napier grass forage cultivation, dry roughage, concentrate grain mash, and mineral lick blocks.
          </p>
        </div>

        <Link
          href="/goats"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Herd Registry</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Feed In Stock</span>
            <span>🌾</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalStockKg} kg
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Across all feed categories</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Forage & Mash Used</span>
            <span>🥣</span>
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {totalUsedKg} kg
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Lifetime herd consumption</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Critical Reorder Alert</span>
            <span>⚠️</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {feedStock.filter((f) => f.status === "LOW").length} Items Low
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Concentrates need replenishment</span>
        </div>
      </div>

      {/* Feed Inventory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12 text-center text-slate-400">Loading feed stock...</div>
        ) : (
          feedStock.map((item) => {
            const isLow = item.status === "LOW";
            return (
              <div
                key={item.feedType}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-800 text-lg">🌾</span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.feedType}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isLow
                        ? "bg-amber-50 text-amber-800 border border-amber-300 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isLow ? "Low Stock" : "Optimal"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Stock</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {item.currentStockKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Consumed</span>
                    <span className="font-semibold text-slate-600 font-mono">
                      {item.totalUsedKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reorder At</span>
                    <span className="font-semibold text-slate-500 font-mono">
                      {item.reorderLevelKg} kg
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  {isLow ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Reorder required soon to maintain uninterrupted nutrition.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Feed reserves adequate for regular herd intake.
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ruminant Nutrition Best Practice Guide */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs space-y-2">
        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <span>🌿</span>
          <span>Himel Agro Caprine Nutrition Guidelines</span>
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Adult goats require roughage to concentrate ratio of 70:30 on a dry matter basis. Fresh Napier grass should be chopped to 2–3 inches to prevent selective feeding. Ensure free access to mineral salt blocks and clean drinking water 24/7.
        </p>
      </div>
    </div>
  );
}
