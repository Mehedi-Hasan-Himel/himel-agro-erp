"use client";

import React, { useState, useEffect } from "react";
import { FeedStockSummary, FeedPurchase, FeedUsage } from "@/types/feed";
import {
  getFeedStockSummaries,
  getFeedPurchases,
  getFeedUsages,
} from "@/lib/repositories/feedRepository";
import { DATA_CHANGE_EVENT } from "@/lib/repositories/storageAdapter";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { FeedStockGrid } from "@/components/feed/FeedStockGrid";
import { FeedPurchaseModal } from "@/components/feed/FeedPurchaseModal";
import { FeedUsageModal } from "@/components/feed/FeedUsageModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import {
  Wheat,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  History,
  Tag,
} from "lucide-react";

export default function FeedInventoryPage() {
  const [summaries, setSummaries] = useState<FeedStockSummary[]>([]);
  const [purchases, setPurchases] = useState<FeedPurchase[]>([]);
  const [usages, setUsages] = useState<FeedUsage[]>([]);
  const [activeTab, setActiveTab] = useState("stock");
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState<string>("Corn / Maize");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [allSummaries, allPurchases, allUsages] = await Promise.all([
        getFeedStockSummaries(),
        getFeedPurchases(),
        getFeedUsages(),
      ]);
      setSummaries(allSummaries);
      setPurchases(allPurchases);
      setUsages(allUsages);
    } catch (err) {
      console.error("Error loading feed data:", err);
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

  const totalStockKg = summaries.reduce(
    (sum, s) => sum + (s.currentStockKg || 0),
    0
  );
  const totalPurchasedKg = summaries.reduce(
    (sum, s) => sum + (s.totalPurchasedKg || 0),
    0
  );
  const totalUsedKg = summaries.reduce(
    (sum, s) => sum + (s.totalUsedKg || 0),
    0
  );
  const lowCount = summaries.filter(
    (s) => s.status === "LOW" || s.status === "OUT_OF_STOCK"
  ).length;

  const handleOpenPurchase = (feedType?: string) => {
    if (feedType) setSelectedFeedType(feedType);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenUsage = (feedType?: string) => {
    if (feedType) setSelectedFeedType(feedType);
    setIsUsageModalOpen(true);
  };

  const tabsConfig = [
    { id: "stock", label: "Stock Inventory", icon: Wheat, count: summaries.length },
    { id: "purchases", label: "Purchase Records", icon: ShoppingCart, count: purchases.length },
    { id: "usage", label: "Consumption History", icon: TrendingDown, count: usages.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Feed Inventory & Stock Tracker
            </h1>
            {lowCount > 0 && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {lowCount} Low Stock
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track seed purchases, daily usage, and dynamic stock balance (Stock =
            Purchased - Used).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUsage()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <TrendingDown className="w-4 h-4" /> Record Usage
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenPurchase()}
            className="gap-1.5 text-xs"
          >
            <ShoppingCart className="w-4 h-4" /> Record Purchase (+ Stock)
          </Button>
        </div>
      </div>

      {/* Top Aggregates KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200/80">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Available Grain Stock
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {Math.round(totalStockKg * 10) / 10}{" "}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Across {summaries.length} feed and seed varieties
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Purchased to Date
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {Math.round(totalPurchasedKg * 10) / 10}{" "}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Recorded in farm expense ledger
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Flock Consumption
            </span>
            <div className="text-2xl font-black text-slate-700 mt-0.5">
              {Math.round(totalUsedKg * 10) / 10}{" "}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Fed to active lofts & nursery squabs
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="bg-white rounded-2xl border border-slate-200 px-4 shadow-xs"
      />

      {/* Tab 1: Current Stock Grid */}
      {activeTab === "stock" && (
        <div>
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              Calculating feed inventory...
            </div>
          ) : (
            <FeedStockGrid
              summaries={summaries}
              onRecordPurchase={handleOpenPurchase}
              onRecordUsage={handleOpenUsage}
            />
          )}
        </div>
      )}

      {/* Tab 2: Purchase History */}
      {activeTab === "purchases" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Feed Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No feed purchase records logged yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.feedType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {p.quantityKg} kg
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {formatCurrency(p.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.supplier || "Wholesale Shop"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 italic text-[11px]">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Usage History */}
      {activeTab === "usage" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Feed Type</th>
                  <th className="py-3 px-4">Quantity Used</th>
                  <th className="py-3 px-4">Target / Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No consumption records logged yet.
                    </td>
                  </tr>
                ) : (
                  usages.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatDate(u.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {u.feedType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {u.quantityKg} kg
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.notes || "Flock Feeding"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <FeedPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSuccess={loadData}
          defaultFeedType={selectedFeedType}
        />
      )}

      {/* Usage Modal */}
      {isUsageModalOpen && (
        <FeedUsageModal
          isOpen={isUsageModalOpen}
          onClose={() => setIsUsageModalOpen(false)}
          onSuccess={loadData}
          summaries={summaries}
          defaultFeedType={selectedFeedType}
        />
      )}
    </div>
  );
}
