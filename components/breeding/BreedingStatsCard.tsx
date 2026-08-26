import React from "react";
import { HatchingStats } from "@/types/breeding";
import { Card, CardContent } from "../ui/Card";
import { Egg, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";

export interface BreedingStatsCardProps {
  stats: HatchingStats;
  title?: string;
  subtitle?: string;
}

export function BreedingStatsCard({
  stats,
  title = "Breeding & Fertility Performance",
  subtitle = "Dynamic Hatching Rate & Summary",
}: BreedingStatsCardProps) {
  const isHighRate = stats.hatchingRate >= 80;
  const isModerateRate = stats.hatchingRate >= 60 && stats.hatchingRate < 80;

  return (
    <Card className="bg-linear-to-br from-white to-emerald-50/30 border-emerald-200/80 shadow-xs">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Overall Hatch Rate:
            </span>
            <span
              className={`text-lg font-black px-3 py-1 rounded-xl border ${
                isHighRate
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isModerateRate
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {stats.hatchingRate}%
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Rounds */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Breeding Rounds</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.totalRounds}
            </div>
          </div>

          {/* Total Eggs Laid */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Egg className="w-3.5 h-3.5 text-amber-500" />
              <span>Total Eggs Laid</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.totalEggs}
            </div>
          </div>

          {/* Total Babies Hatched */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Babies Hatched</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-700">
              {stats.totalHatched}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Hatching Success Efficiency</span>
            <span>
              {stats.totalHatched} / {stats.totalEggs} eggs hatched
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isHighRate
                  ? "bg-emerald-500"
                  : isModerateRate
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, stats.hatchingRate))}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
