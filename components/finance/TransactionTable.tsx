"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Transaction, TransactionType } from "@/types/finance";
import { formatCurrency } from "@/lib/formatters/currencyFormatter";
import { formatDate } from "@/lib/formatters/dateFormatter";
import { SearchInput } from "../ui/SearchInput";
import { ArrowUpRight, ArrowDownRight, Tag } from "lucide-react";

export interface TransactionTableProps {
  transactions: Transaction[];
  onAddTransaction?: () => void;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = Array.from(
    new Set(transactions.map((t) => t.category))
  ).sort();

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const cat = (t.category || "").toLowerCase();
      const notes = (t.notes || "").toLowerCase();
      const pigeonId = (t.pigeonId || "").toLowerCase();
      if (
        !desc.includes(q) &&
        !cat.includes(q) &&
        !notes.includes(q) &&
        !pigeonId.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search description, supplier, notes..."
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TransactionType | "ALL")
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Types (Income & Expenses)</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expenses Only</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description & Reference</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No financial transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => {
                  const isIncome = txn.type === "INCOME";

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {txn.type}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {txn.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {txn.description || "General Transaction"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          {txn.pigeonId && (
                            <Link
                              href={`/pigeons/${txn.pigeonId}`}
                              className="text-emerald-700 hover:underline font-mono"
                            >
                              Pigeon: {txn.pigeonId}
                            </Link>
                          )}
                          {txn.notes && (
                            <span className="text-slate-400 italic">
                              ({txn.notes})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono text-sm font-black ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
