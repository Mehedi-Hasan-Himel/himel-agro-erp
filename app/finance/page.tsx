"use client";

import React, { useState, useEffect } from "react";
import { Transaction, MonthlyFinancialSummary, SectorFinancialComparison } from "@/types/finance";
import {
  getTransactions,
  getMonthlySummaries,
  getFinancialSummaryForMonth,
  getSectorFinancialComparison,
} from "@/lib/repositories/financeRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { MonthlyProfitLossCard } from "@/components/finance/MonthlyProfitLossCard";
import { TransactionTable } from "@/components/finance/TransactionTable";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  PieChart,
  Layers,
  Sparkles,
} from "lucide-react";
import { useGoogleSheetSync } from "@/lib/hooks/useGoogleSheetSync";
import { FinanceSkeleton } from "@/components/ui/Skeleton";

export default function FinanceManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyFinancialSummary[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [sectorComparisons, setSectorComparisons] = useState<SectorFinancialComparison[]>([]);
  const [activeMonthSummary, setActiveMonthSummary] = useState<MonthlyFinancialSummary | null>(null);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [defaultTxnType, setDefaultTxnType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isLoading, setIsLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const { isSyncing, syncNow } = useGoogleSheetSync();

  const handleSyncClick = async () => {
    const res = await syncNow();
    if (res?.success) {
      setSyncNotice("Synced financial records and pigeons from Google Sheets!");
      setTimeout(() => setSyncNotice(null), 4000);
    } else if (res?.message) {
      setSyncNotice(`Sync notice: ${res.message}`);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const loadData = async (monthKey?: string, sector?: string) => {
    try {
      const activeSector = sector !== undefined ? sector : selectedSector;
      const targetMonth = monthKey || selectedMonthKey || "ALL";

      const [allTxns, allMonths, comparisons] = await Promise.all([
        getTransactions({ sectorId: activeSector }),
        getMonthlySummaries(activeSector),
        getSectorFinancialComparison(),
      ]);

      setTransactions(allTxns);
      setMonthlySummaries(allMonths);
      setSectorComparisons(comparisons);
      setSelectedMonthKey(targetMonth);

      const summary = await getFinancialSummaryForMonth(targetMonth, activeSector);
      setActiveMonthSummary(summary);
    } catch (err) {
      console.error("Error loading financial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData(selectedMonthKey, selectedSector);
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  const handleMonthChange = async (newMonthKey: string) => {
    setSelectedMonthKey(newMonthKey);
    const summary = await getFinancialSummaryForMonth(newMonthKey, selectedSector);
    setActiveMonthSummary(summary);
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    loadData(selectedMonthKey, sector);
  };

  const handleOpenNewTransaction = (type: "INCOME" | "EXPENSE") => {
    setDefaultTxnType(type);
    setIsTxnModalOpen(true);
  };

  if (isLoading) {
    return <FinanceSkeleton />;
  }

  const grandTotalIncome = sectorComparisons.reduce((sum, s) => sum + s.totalIncome, 0);
  const grandTotalExpense = sectorComparisons.reduce((sum, s) => sum + s.totalExpense, 0);
  const grandNetProfit = grandTotalIncome - grandTotalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Farm Finances & Multi-Sector Accounting
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Currency: BDT (৳)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track revenues, operational overhead, feed/medicines, and net margins across all farming sectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isSyncing
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 opacity-80"
                : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100"
            }`}
            title="Synchronize latest transactions from Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Sheet"}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenNewTransaction("EXPENSE")}
            className="gap-1.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            + Add Expense
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenNewTransaction("INCOME")}
            className="gap-1.5 text-xs"
          >
            + Add Income
          </Button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sector Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        {[
          { id: "ALL", label: "All Sectors (Combined)", icon: "🌐" },
          { id: "PIGEON", label: "Pigeon Loft", icon: "🕊️" },
          { id: "GOAT", label: "Goat Farm", icon: "🐐" },
          { id: "SHARED", label: "Shared Overhead", icon: "🏡" },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => handleSectorChange(sec.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedSector === sec.id
                ? "bg-white text-emerald-800 shadow-xs border border-emerald-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Cross-Sector Financial Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Cross-Sector Financial Contribution & Performance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side comparison of income generation, direct expenses, and operational margins.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Farm Profitability:{" "}
              <strong className={grandNetProfit >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {grandNetProfit >= 0 ? "+" : ""}{formatCurrency(grandNetProfit)}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectorComparisons.map((sec) => {
            const isProfit = sec.profitLoss >= 0;
            const isSelected = selectedSector === sec.sectorId;

            return (
              <div
                key={sec.sectorId}
                onClick={() => handleSectorChange(sec.sectorId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/40 border-emerald-500 shadow-xs"
                    : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sec.icon}</span>
                    <span className="text-xs font-bold text-slate-800">{sec.sectorName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {sec.transactionCount} records
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Income</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {formatCurrency(sec.totalIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Expense</span>
                    <span className="font-bold text-rose-700 font-mono">
                      {formatCurrency(sec.totalExpense)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Net Margin:</span>
                  <div className="flex items-center gap-1 font-bold font-mono">
                    {isProfit ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span className={isProfit ? "text-emerald-700" : "text-rose-700"}>
                      {isProfit ? "+" : ""}{formatCurrency(sec.profitLoss)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly & Period Financial Performance Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {selectedSector === "ALL"
              ? "All Sectors"
              : selectedSector === "PIGEON"
              ? "Pigeon Loft"
              : selectedSector === "GOAT"
              ? "Goat Farm"
              : "Shared Overhead"}{" "}
            • Monthly Performance
          </h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            Financial Balance
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Period cash flow breakdown showing income, operational expenditures, and net margin.
        </p>
      </div>

      {/* Monthly KPI Overview Card */}
      {activeMonthSummary && (
        <MonthlyProfitLossCard
          summary={activeMonthSummary}
          allMonths={monthlySummaries}
          selectedMonthKey={selectedMonthKey}
          onMonthChange={handleMonthChange}
        />
      )}

      {/* Transactions Ledger */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transaction Ledger ({transactions.length} Records)
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                Audit Trail
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all farm incomes and expenses across sectors.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            Loading transaction ledger...
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>

      {/* Transaction Modal */}
      {isTxnModalOpen && (
        <TransactionModal
          isOpen={isTxnModalOpen}
          onClose={() => setIsTxnModalOpen(false)}
          onSuccess={() => loadData(selectedMonthKey, selectedSector)}
          defaultType={defaultTxnType}
        />
      )}
    </div>
  );
}
