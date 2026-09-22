import {
  Transaction,
  TransactionType,
  MonthlyFinancialSummary,
} from "@/types/finance";
import { notifyDataChanged, fetchWithCache } from "./storageAdapter";

export async function getTransactions(filter?: {
  type?: TransactionType | "ALL";
  month?: string; // YYYY-MM or ALL
  category?: string;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filter?.type && filter.type !== "ALL") params.set("type", filter.type);
  if (filter?.month && filter.month !== "ALL") params.set("month", filter.month);
  if (filter?.category && filter.category !== "ALL")
    params.set("category", filter.category);

  const queryStr = params.toString();
  const cacheKey = `transactions_${queryStr || "all"}`;

  return fetchWithCache(cacheKey, async () => {
    const url = `/api/transactions${queryStr ? `?${queryStr}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
  });
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  if (data.amount <= 0) {
    throw new Error("Transaction amount must be greater than 0.");
  }

  const id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newTxn: Transaction = {
    id,
    ...data,
    createdAt: now,
  };

  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newTxn, _id: id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create transaction");
  }

  const created: Transaction = await res.json();
  notifyDataChanged();
  return created;
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  notifyDataChanged();
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getMonthlySummaries(): Promise<MonthlyFinancialSummary[]> {
  const transactions = await getTransactions();
  const map = new Map<
    string,
    {
      year: number;
      month: number;
      income: number;
      expense: number;
      count: number;
    }
  >();

  transactions.forEach((txn) => {
    if (!txn.date) return;
    const [yearStr, monthStr] = txn.date.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (!year || !month) return;

    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const existing = map.get(monthKey) || {
      year,
      month,
      income: 0,
      expense: 0,
      count: 0,
    };

    if (txn.type === "INCOME") {
      existing.income += txn.amount || 0;
    } else if (txn.type === "EXPENSE") {
      existing.expense += txn.amount || 0;
    }
    existing.count += 1;
    map.set(monthKey, existing);
  });

  const summaries: MonthlyFinancialSummary[] = [];

  map.forEach((val, monthKey) => {
    const monthLabel =
      val.year === 2025
        ? "2019–2025 Historical Setup"
        : `${MONTH_NAMES[val.month - 1]} ${val.year}`;
    summaries.push({
      year: val.year,
      month: val.month,
      monthKey,
      monthLabel,
      totalIncome: val.income,
      totalExpense: val.expense,
      profitLoss: val.income - val.expense,
      transactionCount: val.count,
    });
  });

  // Sort by monthKey descending
  summaries.sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  // Cumulative all-time summary placed first for immediate full-ledger overview
  const totalIncome = summaries.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalExpense = summaries.reduce((sum, s) => sum + s.totalExpense, 0);
  const totalCount = summaries.reduce((sum, s) => sum + s.transactionCount, 0);

  summaries.unshift({
    year: 2026,
    month: 0,
    monthKey: "ALL",
    monthLabel: "All Time / Full Ledger (Sheet Total)",
    totalIncome,
    totalExpense,
    profitLoss: totalIncome - totalExpense,
    transactionCount: totalCount,
  });

  return summaries;
}

export async function getFinancialSummaryForMonth(
  monthKey: string
): Promise<MonthlyFinancialSummary> {
  if (monthKey === "ALL") {
    const txns = await getTransactions();
    const totalIncome = txns
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = txns
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      year: 2026,
      month: 0,
      monthKey: "ALL",
      monthLabel: "All Time (Cumulative)",
      totalIncome,
      totalExpense,
      profitLoss: totalIncome - totalExpense,
      transactionCount: txns.length,
    };
  }

  const [yearStr, monthStr] = monthKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const txns = await getTransactions({ month: monthKey });
  const totalIncome = txns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = txns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const monthLabel =
    year === 2025
      ? "2019–2025 Historical Setup"
      : `${MONTH_NAMES[month - 1] || "Month"} ${year}`;

  return {
    year,
    month,
    monthKey,
    monthLabel,
    totalIncome,
    totalExpense,
    profitLoss: totalIncome - totalExpense,
    transactionCount: txns.length,
  };
}
