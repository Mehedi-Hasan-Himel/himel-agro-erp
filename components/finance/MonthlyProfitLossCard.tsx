import React from "react";
import { MonthlyFinancialSummary } from "@/types/finance";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { Card, CardContent } from "../ui/Card";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface MonthlyProfitLossCardProps {
  summary: MonthlyFinancialSummary;
  allMonths: MonthlyFinancialSummary[];
  selectedMonthKey: string;
  onMonthChange: (monthKey: string) => void;
}

export function MonthlyProfitLossCard({
  summary,
  allMonths,
  selectedMonthKey,
  onMonthChange,
}: MonthlyProfitLossCardProps) {
  const isProfit = summary.profitLoss >= 0;

  return (
    <Card className="bg-linear-to-br from-white to-slate-50/50 border-slate-200 shadow-xs">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Monthly Financial Overview</span>
            </h3>
            <p className="text-xs text-slate-500">
              Income, expenses, and net profit/loss for selected period
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Period:
            </label>
            <select
              value={selectedMonthKey}
              onChange={(e) => onMonthChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {allMonths.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Income */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-600">Total Income</span>
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pigeon sales & services
            </span>
          </div>

          {/* Expense */}
          <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-600">Total Expense</span>
              <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(summary.totalExpense)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Feed, medicine, loft costs
            </span>
          </div>

          {/* Net Profit / Loss */}
          <div
            className={`p-4 rounded-xl border shadow-2xs ${
              isProfit
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-rose-50/50 border-rose-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-bold">
                {isProfit ? "Net Profit" : "Net Loss"}
              </span>
              <span
                className={`p-1 rounded-md ${
                  isProfit
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {isProfit ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </span>
            </div>
            <div
              className={`text-2xl font-black ${
                isProfit ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {formatCurrency(summary.profitLoss)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {summary.transactionCount} transactions recorded
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
