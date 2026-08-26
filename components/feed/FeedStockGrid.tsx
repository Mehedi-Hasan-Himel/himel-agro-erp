import React from "react";
import { FeedStockSummary } from "@/types/feed";
import { Card, CardContent } from "../ui/Card";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { Wheat, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";

export interface FeedStockGridProps {
  summaries: FeedStockSummary[];
  onRecordUsage?: (feedType: string) => void;
  onRecordPurchase?: (feedType: string) => void;
}

export function FeedStockGrid({
  summaries,
  onRecordUsage,
  onRecordPurchase,
}: FeedStockGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaries.map((item) => {
        const isLow = item.status === "LOW";
        const isOut = item.status === "OUT_OF_STOCK";
        const usagePercent =
          item.totalPurchasedKg > 0
            ? Math.round((item.totalUsedKg / item.totalPurchasedKg) * 100)
            : 0;

        return (
          <Card
            key={item.feedType}
            className={`border transition-all duration-200 ${
              isOut
                ? "border-rose-300 bg-rose-50/20"
                : isLow
                ? "border-amber-300 bg-amber-50/20"
                : "border-slate-200/80 hover:border-emerald-300"
            }`}
          >
            <CardContent className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isOut
                        ? "bg-rose-100 text-rose-700"
                        : isLow
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.feedType}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Avg {formatCurrency(item.unitCostAvg)}/kg
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isOut
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : isLow
                      ? "bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                >
                  {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                  {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                </span>
              </div>

              {/* Stock Metric */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Available Stock
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {item.currentStockKg}{" "}
                    <span className="text-xs font-normal text-slate-500">kg</span>
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[10px]">
                    Purchased: {item.totalPurchasedKg}kg
                  </span>
                  <span className="text-slate-500 font-medium">
                    Used: {item.totalUsedKg}kg
                  </span>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Consumption Level</span>
                  <span>{usagePercent}% used</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      usagePercent >= 90
                        ? "bg-rose-500"
                        : usagePercent >= 75
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                {onRecordUsage && (
                  <button
                    onClick={() => onRecordUsage(item.feedType)}
                    disabled={item.currentStockKg <= 0}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Record Usage
                  </button>
                )}
                {onRecordPurchase && (
                  <button
                    onClick={() => onRecordPurchase(item.feedType)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition-colors cursor-pointer"
                  >
                    + Restock
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
