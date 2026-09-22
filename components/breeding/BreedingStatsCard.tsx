import React from "react";
import { HatchingStats } from "@/types/breeding";
import { Card, CardContent } from "../ui/Card";
import { Egg, RefreshCw } from "lucide-react";
import { SquabIcon } from "../ui/icons/SquabIcon";

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
  const hasData = stats.totalRounds > 0 && stats.totalEggs > 0;
  const isHighRate = stats.hatchingRate >= 80;
  const isModerateRate = stats.hatchingRate >= 60 && stats.hatchingRate < 80;

  return (
    <Card className="bg-gradient-to-br from-white via-white to-emerald-50/30 border-emerald-200/80 shadow-xs w-full max-w-full min-w-0 overflow-hidden">
      <CardContent className="p-3.5 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3.5 sm:mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <SquabIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 hidden xl:inline">
              Hatch Rate:
            </span>
            <span
              className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl border font-mono shadow-2xs ${
                !hasData
                  ? "bg-slate-100 text-slate-600 border-slate-200"
                  : isHighRate
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isModerateRate
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {hasData ? `${stats.hatchingRate}%` : "No rounds"}
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Total Rounds */}
          <div className="bg-white/95 p-2 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 text-[10px] sm:text-xs mb-1 min-w-0">
              <RefreshCw className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-600 truncate">Rounds</span>
            </div>
            <div className="text-base sm:text-xl font-black text-slate-900 font-mono tracking-tight">
              {stats.totalRounds}
            </div>
          </div>

          {/* Total Eggs Laid */}
          <div className="bg-white/95 p-2 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 text-[10px] sm:text-xs mb-1 min-w-0">
              <Egg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-600 truncate">Eggs</span>
            </div>
            <div className="text-base sm:text-xl font-black text-slate-900 font-mono tracking-tight">
              {stats.totalEggs}
            </div>
          </div>

          {/* Total Babies Hatched */}
          <div className="bg-white/95 p-2 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 text-[10px] sm:text-xs mb-1 min-w-0">
              <SquabIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-700 shrink-0" />
              <span className="font-semibold text-slate-600 truncate">Hatched</span>
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-800 font-mono tracking-tight">
              {stats.totalHatched}
            </div>
          </div>
        </div>

        {/* Progress Bar & Efficiency */}
        <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500 mb-1.5 font-medium">
            <span className="truncate">Hatching Success Efficiency</span>
            <span className="font-mono font-semibold text-slate-700 shrink-0">
              {hasData ? (
                `${stats.totalHatched} of ${stats.totalEggs} eggs (${stats.hatchingRate}%)`
              ) : (
                "No eggs recorded yet"
              )}
            </span>
          </div>
          <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                !hasData
                  ? "bg-slate-300"
                  : isHighRate
                  ? "bg-emerald-500"
                  : isModerateRate
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{
                width: `${hasData ? Math.min(100, Math.max(0, stats.hatchingRate)) : 0}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
