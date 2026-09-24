"use client";

import React, { useState, useEffect } from "react";
import { Transaction, MonthlyFinancialSummary } from "@/types/finance";
import {
  getTransactions,
  getMonthlySummaries,
  getFinancialSummaryForMonth,
} from "@/lib/repositories/financeRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { MonthlyProfitLossCard } from "@/components/finance/MonthlyProfitLossCard";
import { TransactionTable } from "@/components/finance/TransactionTable";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { Button } from "@/components/ui/Button";
import { PlusCircle, TrendingUp, TrendingDown, Tag, RefreshCw, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useGoogleSheetSync } from "@/lib/hooks/useGoogleSheetSync";
import { FinanceSkeleton } from "@/components/ui/Skeleton";

export default function FinanceManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<
    MonthlyFinancialSummary[]
  >([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("ALL");
  const [activeMonthSummary, setActiveMonthSummary] =
    useState<MonthlyFinancialSummary | null>(null);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [defaultTxnType, setDefaultTxnType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );
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

  const loadData = async (monthKey?: string) => {
    try {
      const [allTxns, allMonths] = await Promise.all([
        getTransactions(),
        getMonthlySummaries(),
      ]);
      setTransactions(allTxns);
      setMonthlySummaries(allMonths);

      const targetMonth = monthKey || "ALL";
      setSelectedMonthKey(targetMonth);

      const summary = await getFinancialSummaryForMonth(targetMonth);
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
      loadData(selectedMonthKey);
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  const handleMonthChange = async (newMonthKey: string) => {
    setSelectedMonthKey(newMonthKey);
    const summary = await getFinancialSummaryForMonth(newMonthKey);
    setActiveMonthSummary(summary);
  };

  const handleOpenNewTransaction = (type: "INCOME" | "EXPENSE") => {
    setDefaultTxnType(type);
    setIsTxnModalOpen(true);
  };

  if (isLoading) {
    return <FinanceSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Farm Finances & Monthly Accounting
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Currency: BDT (৳)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track bird sales, acquisitions, feed, medicines, equipment, and net
            profit/loss (Profit = Income - Expenses).
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

      {/* Monthly & Period Financial Performance Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Monthly & Period Financial Performance
          </h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            Financial Balance
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Period-specific cash breakdown showing income from pigeon sales, operational expenditures, and net margin (Net = Income - Expenses).
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
                Complete Financial Transaction Ledger ({transactions.length} Records)
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                Audit Trail
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all farm incomes and expenses, detailing transaction date, category, amount, payment method, and description.
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
          onSuccess={() => loadData(selectedMonthKey)}
          defaultType={defaultTxnType}
        />
      )}
    </div>
  );
}
